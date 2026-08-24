const { getFirestoreDb } = require('./firebase-admin-init');

// --- Helper: League Name to API-Football League ID Mapping ---
function getLeagueId(leagueName) {
  const name = leagueName.toLowerCase();
  if (name.includes("premier")) return 39;
  if (name.includes("la liga") || name.includes("laliga") || name.includes("spain")) return 140;
  if (name.includes("serie a") || name.includes("italy")) return 135;
  return 203; // Default to Süper Lig (Turkey)
}

// --- Helper: Search Team ID & Logo in Football API ---
async function searchTeam(teamName, headers, baseUrl) {
  if (!baseUrl || !headers) return null;
  try {
    const response = await fetch(`${baseUrl}/teams?name=${encodeURIComponent(teamName)}`, { headers });
    const data = await response.json();
    if (data && data.response && data.response.length > 0) {
      return {
        id: data.response[0].team.id,
        name: data.response[0].team.name,
        logo: data.response[0].team.logo,
        code: data.response[0].team.code || teamName.slice(0, 3).toUpperCase()
      };
    }
  } catch (err) {
    console.error(`Error searching team ${teamName}:`, err);
  }
  return null;
}

// --- Helper: Get Team Goals Stats from Football API ---
async function getTeamStats(teamId, leagueId, headers, baseUrl) {
  if (!baseUrl || !headers) return null;
  try {
    const currentYear = new Date().getFullYear() - 1; // API statistics usually fully populated for previous or current season
    const response = await fetch(`${baseUrl}/teams/statistics?league=${leagueId}&season=${currentYear}&team=${teamId}`, { headers });
    const data = await response.json();
    if (data && data.response) {
      const stats = data.response;
      return {
        goalsForHome: stats.goals.for.average.home || "1.5",
        goalsForAway: stats.goals.for.average.away || "1.2",
        goalsAgainstHome: stats.goals.against.average.home || "1.1",
        goalsAgainstAway: stats.goals.against.average.away || "1.3"
      };
    }
  } catch (err) {
    console.error(`Error getting stats for team ${teamId}:`, err);
  }
  return null;
}

// --- Helper: Get Head to Head Matches from Football API ---
async function getH2HMatches(homeId, awayId, headers, baseUrl) {
  if (!baseUrl || !headers) return [];
  try {
    const response = await fetch(`${baseUrl}/fixtures/h2h?h2h=${homeId}-${awayId}&last=3`, { headers });
    const data = await response.json();
    if (data && data.response) {
      return data.response.map(item => ({
        homeScore: item.goals.home,
        awayScore: item.goals.away,
        date: new Date(item.fixture.date).toLocaleDateString('tr-TR')
      }));
    }
  } catch (err) {
    console.error(`Error getting H2H between ${homeId} and ${awayId}:`, err);
  }
  return [];
}

// --- Poisson Mathematics Engine ---
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poissonProbability(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

function calculateMatchPredictions(homeScoredAvg, homeConcededAvg, awayScoredAvg, awayConcededAvg) {
  const lambdaHome = (homeScoredAvg + awayConcededAvg) / 2;
  const lambdaAway = (awayScoredAvg + homeConcededAvg) / 2;

  const maxGoals = 5;
  const homeProbabilities = [];
  const awayProbabilities = [];

  for (let g = 0; g <= maxGoals; g++) {
    homeProbabilities[g] = poissonProbability(g, lambdaHome);
    awayProbabilities[g] = poissonProbability(g, lambdaAway);
  }

  const homeSum = homeProbabilities.reduce((a, b) => a + b, 0);
  const awaySum = awayProbabilities.reduce((a, b) => a + b, 0);
  for (let g = 0; g <= maxGoals; g++) {
    homeProbabilities[g] /= homeSum;
    awayProbabilities[g] /= awaySum;
  }

  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  const scorelist = [];

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const prob = homeProbabilities[h] * awayProbabilities[a];
      
      if (h > a) {
        homeWinProb += prob;
      } else if (h === a) {
        drawProb += prob;
      } else {
        awayWinProb += prob;
      }

      scorelist.push({
        score: `${h} - ${a}`,
        probability: Math.round(prob * 1000) / 10
      });
    }
  }

  scorelist.sort((a, b) => b.probability - a.probability);

  return {
    probabilities: {
      homeWin: Math.round(homeWinProb * 100),
      draw: Math.round(drawProb * 100),
      awayWin: Math.round(awayWinProb * 100)
    },
    scorePredictions: scorelist.slice(0, 3)
  };
}

// --- Main Handler ---
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  const { matches } = req.body;
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    res.status(400).json({ error: "Invalid matches array payload." });
    return;
  }

  // Detect API configs from Environment Variables
  const apiKey = process.env.FOOTBALL_API_KEY;
  const apiUrl = process.env.FOOTBALL_API_URL;
  const apiHeader = process.env.FOOTBALL_API_HEADER || 'x-apisports-key';

  const headers = apiKey ? { [apiHeader]: apiKey } : null;

  try {
    const updatedMatches = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const leagueName = match.league || "Süper Lig";
      const leagueId = getLeagueId(leagueName);

      let homeTeamInfo = null;
      let awayTeamInfo = null;
      let h2h = [];

      // Call live API if keys are present
      if (headers && apiUrl) {
        homeTeamInfo = await searchTeam(match.homeTeam.name, headers, apiUrl);
        awayTeamInfo = await searchTeam(match.awayTeam.name, headers, apiUrl);
        if (homeTeamInfo && awayTeamInfo) {
          h2h = await getH2HMatches(homeTeamInfo.id, awayTeamInfo.id, headers, apiUrl);
        }
      }

      // 1. Establish Home Team data
      const homeTeam = {
        name: match.homeTeam.name,
        logo: homeTeamInfo ? homeTeamInfo.logo : match.homeTeam.logo,
        code: homeTeamInfo ? homeTeamInfo.code : (match.homeTeam.code || match.homeTeam.name.slice(0, 3).toUpperCase())
      };

      // 2. Establish Away Team data
      const awayTeam = {
        name: match.awayTeam.name,
        logo: awayTeamInfo ? awayTeamInfo.logo : match.awayTeam.logo,
        code: awayTeamInfo ? awayTeamInfo.code : (match.awayTeam.code || match.awayTeam.name.slice(0, 3).toUpperCase())
      };

      // 3. Fetch/Generate goals average stats
      let homeGoalsScored = 1.6;
      let homeGoalsConceded = 1.1;
      let awayGoalsScored = 1.3;
      let awayGoalsConceded = 1.4;

      if (homeTeamInfo && awayTeamInfo && headers && apiUrl) {
        const homeStats = await getTeamStats(homeTeamInfo.id, leagueId, headers, apiUrl);
        const awayStats = await getTeamStats(awayTeamInfo.id, leagueId, headers, apiUrl);

        if (homeStats) {
          homeGoalsScored = parseFloat(homeStats.goalsForHome) || 1.6;
          homeGoalsConceded = parseFloat(homeStats.goalsAgainstHome) || 1.1;
        }
        if (awayStats) {
          awayGoalsScored = parseFloat(awayStats.goalsForAway) || 1.3;
          awayGoalsConceded = parseFloat(awayStats.goalsAgainstAway) || 1.4;
        }
      } else {
        // Fallback: randomized realistic averages for testing
        homeGoalsScored = parseFloat((Math.random() * 1.5 + 1.1).toFixed(2));
        homeGoalsConceded = parseFloat((Math.random() * 1.4 + 0.6).toFixed(2));
        awayGoalsScored = parseFloat((Math.random() * 1.4 + 0.8).toFixed(2));
        awayGoalsConceded = parseFloat((Math.random() * 1.5 + 0.7).toFixed(2));
      }

      // 4. Calculate Poisson Win/Draw/Loss probabilities and score predictions
      const predictions = calculateMatchPredictions(homeGoalsScored, homeGoalsConceded, awayGoalsScored, awayGoalsConceded);

      // 5. Construct stats object
      const statistics = {
        goalsScoredAvg: [homeGoalsScored, awayGoalsScored],
        goalsConcededAvg: [homeGoalsConceded, awayGoalsConceded],
        shotsAvg: [parseFloat((homeGoalsScored * 7 + 3).toFixed(1)), parseFloat((awayGoalsScored * 6 + 4).toFixed(1))],
        shotsConcededAvg: [parseFloat((homeGoalsConceded * 8 + 2).toFixed(1)), parseFloat((awayGoalsConceded * 7 + 3).toFixed(1))],
        firstGoalPct: [Math.round(homeGoalsScored * 30 + 20), Math.round(awayGoalsScored * 25 + 25)],
        bothTeamsToScorePct: Math.round((1 - (homeGoalsConceded < 0.2 ? 0.2 : homeGoalsConceded) * 0.1) * 60)
      };

      // xG approximations
      statistics.xgScored = [parseFloat((homeGoalsScored * 0.9 + 0.2).toFixed(2)), parseFloat((awayGoalsScored * 0.85 + 0.25).toFixed(2))];
      statistics.xgConceded = [parseFloat((homeGoalsConceded * 0.85 + 0.2).toFixed(2)), parseFloat((awayGoalsConceded * 0.9 + 0.15).toFixed(2))];

      // 6. Build final match object
      const fullMatch = {
        matchId: match.matchId,
        league: leagueName,
        homeTeam,
        awayTeam,
        statistics,
        h2hMatches: h2h.length > 0 ? h2h : (match.h2hMatches || []),
        playPercentages: match.playPercentages || { home: 34, draw: 33, away: 33 },
        odds: match.odds || { home: 2.10, draw: 3.20, away: 3.10 },
        probabilities: predictions.probabilities,
        scorePredictions: predictions.scorePredictions
      };

      updatedMatches.push(fullMatch);
    }

    // Write updated bulletin to Firestore
    const db = getFirestoreDb();
    if (db) {
      const docRef = db.collection('bulletin').doc('current');
      await docRef.set({
        matches: updatedMatches,
        lastUpdated: new Date().toISOString()
      });
      console.log("Successfully wrote active bulletin to Firestore.");
    } else {
      console.warn("Database connection unavailable. Synced bulletin generated locally but not saved to cloud.");
    }

    res.status(200).json({ success: true, matches: updatedMatches });
  } catch (error) {
    console.error("Critical error in /api/sync:", error);
    res.status(500).json({ error: "Failed to compile and sync bulletin matches.", message: error.message });
  }
};
