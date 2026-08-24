const { getFirestoreDb } = require('./firebase-admin-init');

// --- Helper: Static Team name to API-Football ID mapping ---
// Bypasses search queries, saves API quota, and resolves spelling/Turkish character mismatches
const TEAM_IDS = {
  "galatasaray": 611,
  "fenerbahçe": 607,
  "fenerbahce": 607,
  "beşiktaş": 564,
  "besiktas": 564,
  "trabzonspor": 549,
  "başakşehir": 996,
  "basaksehir": 996,
  "eyüpspor": 3577,
  "eyupspor": 3577,
  "çaykur rizespor": 603,
  "rizespor": 603,
  "samsunspor": 3584,
  "antalyaspor": 558,
  "konyaspor": 560,
  "göztepe": 601,
  "goztepe": 601,
  "alanyaspor": 563,
  "kasımpaşa": 1001,
  "kasimpasa": 1001,
  "bodrum fk": 14093,
  "bodrumspor": 14093,
  "gaziantep fk": 3575,
  "sivasspor": 559,
  "kayserispor": 561,
  "hatayspor": 3578,
  "adana demirspor": 3569,
  "fatih karagümrük": 1002,
  "karagümrük": 1002,
  "pendikspor": 10167,
  "istanbulspor": 1005,
  "ankaragücü": 562,
  "gençlerbirliği": 602,
  "genclerbirligi": 602,
  "erzurumspor": 3574,
  "erzurum bb": 3574,
  "kocaelispor": 3580,
  "sakaryaspor": 3583,
  "giresunspor": 3576,
  "altay": 3570,
  "manisa fk": 10165,
  "boluspor": 3573,
  "bandırmaspor": 3572,
  "çorum fk": 12822,
  "ümraniyespor": 3585,
  "adanaspor": 3568,
  "şanlıurfaspor": 3582,
  "yeni malatyaspor": 3581,
  
  // Premier League
  "arsenal": 42,
  "manchester city": 50,
  "chelsea": 49,
  "aston villa": 66,
  "liverpool": 40,
  "manchester united": 33,
  "tottenham": 47,
  "newcastle": 34,
  "west ham": 48,
  "brighton": 51,
  
  // La Liga
  "real madrid": 541,
  "barcelona": 529,
  "atletico madrid": 530,
  "real sociedad": 548,
  "sevilla": 536,
  "villarreal": 533,
  
  // Serie A
  "inter": 505,
  "juventus": 496,
  "milan": 489,
  "napoli": 492,
  "roma": 497,
  
  // Bundesliga
  "bayern munich": 157,
  "borussia dortmund": 165,
  "bayer leverkusen": 168,
  "rb leipzig": 173,
  
  // Others
  "psg": 85,
  "ajax": 194,
  "psv": 197,
  "feyenoord": 198,
  "celtic": 65,
  "rangers": 62,
  "benfica": 211,
  "porto": 212,
  "sporting cp": 228
};

// --- Helper: League Name to API-Football League ID Mapping ---
function getLeagueId(leagueName) {
  const name = leagueName.toLowerCase().trim();
  if (name.includes("premier league") || name.includes("ingiltere") || name.includes("premier")) return 39;
  if (name.includes("la liga") || name.includes("laliga") || name.includes("ispanya")) return 140;
  if (name.includes("serie a") || name.includes("italya")) return 135;
  if (name.includes("bundesliga") || name.includes("almanya")) return 78;
  if (name.includes("ligue 1") || name.includes("fransa")) return 61;
  if (name.includes("eredivisie") || name.includes("hollanda")) return 88;
  if (name.includes("pro league") || name.includes("belçika") || name.includes("belcika")) return 144;
  if (name.includes("primeira liga") || name.includes("portekiz")) return 94;
  if (name.includes("super league") || name.includes("yunanistan")) return 197;
  if (name.includes("premiership") || name.includes("iskoçya") || name.includes("iskocya")) return 179;
  if (name.includes("ekstraklasa") || name.includes("polonya")) return 106;
  if (name.includes("premier league russia") || name.includes("rusya")) return 235;
  if (name.includes("tff 1. lig") || name.includes("tff 1.lig") || name.includes("1. lig")) return 204;
  return 203; // Default to Süper Lig (Turkey)
}

// --- Helper: Search Team ID & Logo in Football API ---
async function searchTeam(teamName, headers, baseUrl) {
  const cleanName = teamName.toLowerCase().trim();
  
  // Try static resolution first (highly recommended for performance and accuracy)
  if (TEAM_IDS[cleanName]) {
    const id = TEAM_IDS[cleanName];
    return {
      id: id,
      name: teamName,
      logo: `https://media.api-sports.io/football/teams/${id}.png`,
      code: teamName.slice(0, 3).toUpperCase()
    };
  }

  // Fallback to active query
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

// --- Helper: Get Team Goals Stats, Matches Played and Form from Football API ---
async function getTeamStats(teamId, leagueId, headers, baseUrl) {
  if (!baseUrl || !headers) return null;
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = Jan, 7 = Aug
    const currentYear = month >= 7 ? year : year - 1;
    
    const response = await fetch(`${baseUrl}/teams/statistics?league=${leagueId}&season=${currentYear}&team=${teamId}`, { headers });
    const data = await response.json();
    if (data && data.response) {
      const stats = data.response;
      return {
        goalsForHome: stats.goals.for.average.home || "1.5",
        goalsForAway: stats.goals.for.average.away || "1.2",
        goalsAgainstHome: stats.goals.against.average.home || "1.1",
        goalsAgainstAway: stats.goals.against.average.away || "1.3",
        playedHome: (stats.fixtures && stats.fixtures.played && stats.fixtures.played.home) || 0,
        playedAway: (stats.fixtures && stats.fixtures.played && stats.fixtures.played.away) || 0,
        cleanSheetsHome: (stats.clean_sheet && stats.clean_sheet.home) || 0,
        cleanSheetsAway: (stats.clean_sheet && stats.clean_sheet.away) || 0,
        failedToScoreHome: (stats.failed_to_score && stats.failed_to_score.home) || 0,
        failedToScoreAway: (stats.failed_to_score && stats.failed_to_score.away) || 0,
        winsHome: (stats.fixtures && stats.fixtures.wins && stats.fixtures.wins.home) || 0,
        winsAway: (stats.fixtures && stats.fixtures.wins && stats.fixtures.wins.away) || 0,
        drawsHome: (stats.fixtures && stats.fixtures.draws && stats.fixtures.draws.home) || 0,
        drawsAway: (stats.fixtures && stats.fixtures.draws && stats.fixtures.draws.away) || 0,
        lossesHome: (stats.fixtures && stats.fixtures.loses && stats.fixtures.loses.home) || 0,
        lossesAway: (stats.fixtures && stats.fixtures.loses && stats.fixtures.loses.away) || 0,
        form: stats.form || ""
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

// --- Helper: Form Multiplier Calculation ---
function getFormMultiplier(formString) {
  if (!formString) return 1.0;
  const recentForm = formString.slice(-5).toUpperCase();
  let adjustment = 0;
  for (let i = 0; i < recentForm.length; i++) {
    const char = recentForm[i];
    if (char === 'W') adjustment += 0.04; 
    else if (char === 'L') adjustment -= 0.04; 
  }
  return 1.0 + adjustment;
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

// Dixon-Coles Adjusted Poisson Model
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

  const rho = -0.12;

  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;
  const scorelist = [];

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      let prob = homeProbabilities[h] * awayProbabilities[a];

      if (h === 0 && a === 0) {
        prob *= (1 - rho * lambdaHome * lambdaAway);
      } else if (h === 1 && a === 0) {
        prob *= (1 + rho * lambdaAway);
      } else if (h === 0 && a === 1) {
        prob *= (1 + rho * lambdaHome);
      } else if (h === 1 && a === 1) {
        prob *= (1 - rho);
      }

      if (h > a) {
        homeWinProb += prob;
      } else if (h === a) {
        drawProb += prob;
      } else {
        awayWinProb += prob;
      }

      scorelist.push({
        score: `${h} - ${a}`,
        probability: prob
      });
    }
  }

  const totalSum = homeWinProb + drawProb + awayWinProb;
  homeWinProb /= totalSum;
  drawProb /= totalSum;
  awayWinProb /= totalSum;

  scorelist.forEach(s => {
    s.probability = Math.round((s.probability / totalSum) * 1000) / 10;
  });
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

  // Detect API configs from Environment Variables with default URL fallback
  const apiKey = process.env.FOOTBALL_API_KEY;
  const apiUrl = process.env.FOOTBALL_API_URL || 'https://v3.football.api-sports.io';
  const apiHeader = process.env.FOOTBALL_API_HEADER;

  let headers = null;
  if (apiKey) {
    headers = {};
    // Auto-detect RapidAPI key format (usually 50 chars) or header setting
    if (apiKey.length === 50 || apiHeader === 'x-rapidapi-key') {
      headers['x-rapidapi-key'] = apiKey;
      headers['x-rapidapi-host'] = 'api-football-v1.p.rapidapi.com';
    } else {
      headers[apiHeader || 'x-apisports-key'] = apiKey;
    }
  }

  try {
    // ----------------------------------------------------
    // DEBUG ROUTINE: Fetch all teams for league 203 & 204
    // ----------------------------------------------------
    let debugTeams = {};
    if (headers && apiUrl) {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const currentYear = month >= 7 ? year : year - 1;

        const res203 = await fetch(`${apiUrl}/teams?league=203&season=${currentYear}`, { headers });
        const data203 = await res203.json();
        if (data203 && data203.response) {
          data203.response.forEach(r => {
            debugTeams[r.team.name.toLowerCase().trim()] = r.team.id;
          });
        }
        
        const res204 = await fetch(`${apiUrl}/teams?league=204&season=${currentYear}`, { headers });
        const data204 = await res204.json();
        if (data204 && data204.response) {
          data204.response.forEach(r => {
            debugTeams[r.team.name.toLowerCase().trim()] = r.team.id;
          });
        }
      } catch (e) {
        console.error("Debug fetch teams failed:", e);
      }
    }
    // ----------------------------------------------------

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

      // 3. Fetch/Generate goals average stats with form scaling and Bayesian Smoothing
      let rawHomeScored = 1.6;
      let rawHomeConceded = 1.1;
      let rawAwayScored = 1.3;
      let rawAwayConceded = 1.4;

      let homePlayed = 0;
      let awayPlayed = 0;
      let homeCleanSheets = 0;
      let awayCleanSheets = 0;
      let homeFailedToScore = 0;
      let awayFailedToScore = 0;
      let homeWinsCount = 0;
      let awayWinsCount = 0;
      let homeDrawsCount = 0;
      let awayDrawsCount = 0;
      let homeLossesCount = 0;
      let awayLossesCount = 0;
      let homeMult = 1.0;
      let awayMult = 1.0;

      if (homeTeamInfo && awayTeamInfo && headers && apiUrl) {
        const homeStats = await getTeamStats(homeTeamInfo.id, leagueId, headers, apiUrl);
        const awayStats = await getTeamStats(awayTeamInfo.id, leagueId, headers, apiUrl);

        if (homeStats) {
          homePlayed = parseInt(homeStats.playedHome) || 0;
          homeCleanSheets = parseInt(homeStats.cleanSheetsHome) || 0;
          homeFailedToScore = parseInt(homeStats.failedToScoreHome) || 0;
          homeWinsCount = parseInt(homeStats.winsHome) || 0;
          homeDrawsCount = parseInt(homeStats.drawsHome) || 0;
          homeLossesCount = parseInt(homeStats.lossesHome) || 0;
          homeMult = getFormMultiplier(homeStats.form);
          rawHomeScored = parseFloat(homeStats.goalsForHome) || 0.0;
          rawHomeConceded = parseFloat(homeStats.goalsAgainstHome) || 0.0;
        }
        
        if (awayStats) {
          awayPlayed = parseInt(awayStats.playedAway) || 0;
          awayCleanSheets = parseInt(awayStats.cleanSheetsAway) || 0;
          awayFailedToScore = parseInt(awayStats.failedToScoreAway) || 0;
          awayWinsCount = parseInt(awayStats.winsAway) || 0;
          awayDrawsCount = parseInt(awayStats.drawsAway) || 0;
          awayLossesCount = parseInt(awayStats.lossesAway) || 0;
          awayMult = getFormMultiplier(awayStats.form);
          rawAwayScored = parseFloat(awayStats.goalsForAway) || 0.0;
          rawAwayConceded = parseFloat(awayStats.goalsAgainstAway) || 0.0;
        }
      }

      // Smooth only for mathematical Poisson calculations
      let smoothedHomeScored = rawHomeScored;
      let smoothedHomeConceded = rawHomeConceded;
      let smoothedAwayScored = rawAwayScored;
      let smoothedAwayConceded = rawAwayConceded;

      if (headers && apiUrl) {
        if (homePlayed < 5) {
          smoothedHomeScored = (rawHomeScored * homePlayed + 1.5 * (5 - homePlayed)) / 5;
          smoothedHomeConceded = (rawHomeConceded * homePlayed + 1.2 * (5 - homePlayed)) / 5;
        }
        if (awayPlayed < 5) {
          smoothedAwayScored = (rawAwayScored * awayPlayed + 1.2 * (5 - awayPlayed)) / 5;
          smoothedAwayConceded = (rawAwayConceded * awayPlayed + 1.5 * (5 - awayPlayed)) / 5;
        }
      } else {
        // Fallback simulated values if no API connection
        rawHomeScored = parseFloat((Math.random() * 1.5 + 1.1).toFixed(2));
        rawHomeConceded = parseFloat((Math.random() * 1.4 + 0.6).toFixed(2));
        rawAwayScored = parseFloat((Math.random() * 1.4 + 0.8).toFixed(2));
        rawAwayConceded = parseFloat((Math.random() * 1.5 + 0.7).toFixed(2));
        
        smoothedHomeScored = rawHomeScored;
        smoothedHomeConceded = rawHomeConceded;
        smoothedAwayScored = rawAwayScored;
        smoothedAwayConceded = rawAwayConceded;
      }

      // 4. Calculate predictions using smoothed values
      const predictions = calculateMatchPredictions(
        smoothedHomeScored * homeMult, 
        smoothedHomeConceded / homeMult, 
        smoothedAwayScored * awayMult, 
        smoothedAwayConceded / awayMult
      );

      // 5. Construct stats object using raw values for UI display
      const statistics = {
        goalsScoredAvg: [parseFloat(rawHomeScored.toFixed(2)), parseFloat(rawAwayScored.toFixed(2))],
        goalsConcededAvg: [parseFloat(rawHomeConceded.toFixed(2)), parseFloat(rawAwayConceded.toFixed(2))],
        cleanSheetPct: [
          homePlayed > 0 ? Math.round((homeCleanSheets / homePlayed) * 100) : 0,
          awayPlayed > 0 ? Math.round((awayCleanSheets / awayPlayed) * 100) : 0
        ],
        failedToScorePct: [
          homePlayed > 0 ? Math.round((homeFailedToScore / homePlayed) * 100) : 0,
          awayPlayed > 0 ? Math.round((awayFailedToScore / awayPlayed) * 100) : 0
        ],
        winPct: [
          homePlayed > 0 ? Math.round((homeWinsCount / homePlayed) * 100) : 0,
          awayPlayed > 0 ? Math.round((awayWinsCount / awayPlayed) * 100) : 0
        ],
        drawPct: [
          homePlayed > 0 ? Math.round((homeDrawsCount / homePlayed) * 100) : 0,
          awayPlayed > 0 ? Math.round((awayDrawsCount / awayPlayed) * 100) : 0
        ],
        lossPct: [
          homePlayed > 0 ? Math.round((homeLossesCount / homePlayed) * 100) : 0,
          awayPlayed > 0 ? Math.round((awayLossesCount / awayPlayed) * 100) : 0
        ]
      };

      // xG approximations
      statistics.xgScored = [parseFloat((rawHomeScored * 0.9 + 0.2).toFixed(2)), parseFloat((rawAwayScored * 0.85 + 0.25).toFixed(2))];
      statistics.xgConceded = [parseFloat((rawHomeConceded * 0.85 + 0.2).toFixed(2)), parseFloat((rawAwayConceded * 0.9 + 0.15).toFixed(2))];

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

    res.status(200).json({ success: true, matches: updatedMatches, isDemo: !db, debugTeams });
  } catch (error) {
    console.error("Critical error in /api/sync:", error);
    res.status(500).json({ error: "Failed to compile and sync bulletin matches.", message: error.message });
  }
};
