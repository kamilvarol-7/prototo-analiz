const { getFirestoreDb } = require('./firebase-admin-init');

// Memory cache to store team search results during execution and protect API quota limits
const searchCache = {};

// --- Helper: Clean and Sanitize Team Names for API-Football Fuzzy Search ---
function sanitizeTeamNameForSearch(name) {
  if (!name) return "";
  let clean = String(name).toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
  
  // Strip common abbreviations to make fuzzy matching extremely accurate
  clean = clean.replace(/spor/g, '')
               .replace(/\bfk\b/g, '')
               .replace(/\bsk\b/g, '')
               .replace(/\bbs\b/g, '')
               .replace(/\bbb\b/g, '')
               .replace(/\bbb\b/g, '')
               .trim();
  return clean;
}

// --- Helper: League Name to API-Football League ID Mapping ---
function getLeagueId(leagueName) {
  if (!leagueName) return 203; // Default to Süper Lig
  const name = String(leagueName).toLowerCase().trim();
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
  const nameStr = teamName ? String(teamName).trim() : "";
  if (!nameStr) return null;

  const cleanName = sanitizeTeamNameForSearch(nameStr);
  
  // Return cached result if already searched in this execution run
  if (searchCache[cleanName]) {
    return searchCache[cleanName];
  }

  if (!baseUrl || !headers) return null;
  try {
    const response = await fetch(`${baseUrl}/teams?search=${encodeURIComponent(cleanName)}`, { headers });
    const data = await response.json();
    if (data && data.response && data.response.length > 0) {
      let teamObj = data.response[0];
      
      // Auto-filter for Turkish teams first if searching a local team
      const isLocalSearch = nameStr.toLowerCase().match(/(spor|fk|sk|bb|ankara|istanbul|izmir|adana|bursa|kocaeli|erzurum|samsun|rize|konya|antalya|sivas|gaziantep|kayseri|hatay|bodrum|goztepe|eyup|basaksehir|galatasaray|fenerbahce|besiktas|trabzonspor|corum|umranıye|bandırma|bolu|manisa|altay|giresun|sakarya|kocaeli|şanlıurfa|malatya)/);
      if (isLocalSearch) {
        const turkishTeam = data.response.find(r => r.team && r.team.country === 'Turkey');
        if (turkishTeam) {
          teamObj = turkishTeam;
        }
      }
      
      if (teamObj && teamObj.team) {
        const result = {
          id: teamObj.team.id,
          name: teamObj.team.name,
          logo: teamObj.team.logo,
          code: teamObj.team.code || nameStr.slice(0, 3).toUpperCase()
        };
        searchCache[cleanName] = result;
        return result;
      }
    }
  } catch (err) {
    console.error(`Error searching team ${teamName}:`, err);
  }
  return null;
}

// --- Helper: Get Team Goals Stats, Matches Played and Form from Football API ---
async function getTeamStats(teamId, leagueId, headers, baseUrl) {
  if (!teamId || !baseUrl || !headers) return null;
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = Jan, 7 = Aug
    const currentYear = month >= 7 ? year : year - 1;
    
    const response = await fetch(`${baseUrl}/teams/statistics?league=${leagueId}&season=${currentYear}&team=${teamId}`, { headers });
    const data = await response.json();
    if (data && data.response) {
      const stats = data.response;
      
      // Defensive structure checks for stats object properties
      const goalsFor = stats.goals && stats.goals.for ? stats.goals.for : {};
      const goalsForAvg = goalsFor.average || {};
      
      const goalsAgainst = stats.goals && stats.goals.against ? stats.goals.against : {};
      const goalsAgainstAvg = goalsAgainst.average || {};

      const fixtures = stats.fixtures || {};
      const played = fixtures.played || {};
      const wins = fixtures.wins || {};
      const draws = fixtures.draws || {};
      const losses = fixtures.loses || {};

      const cleanSheet = stats.clean_sheet || {};
      const failedToScore = stats.failed_to_score || {};

      return {
        goalsForHome: goalsForAvg.home || "1.5",
        goalsForAway: goalsForAvg.away || "1.2",
        goalsAgainstHome: goalsAgainstAvg.home || "1.1",
        goalsAgainstAway: goalsAgainstAvg.away || "1.3",
        playedHome: played.home || 0,
        playedAway: played.away || 0,
        cleanSheetsHome: cleanSheet.home || 0,
        cleanSheetsAway: cleanSheet.away || 0,
        failedToScoreHome: failedToScore.home || 0,
        failedToScoreAway: failedToScore.away || 0,
        winsHome: wins.home || 0,
        winsAway: wins.away || 0,
        drawsHome: draws.home || 0,
        drawsAway: draws.away || 0,
        lossesHome: losses.home || 0,
        lossesAway: losses.away || 0,
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
  if (!homeId || !awayId || !baseUrl || !headers) return [];
  try {
    const response = await fetch(`${baseUrl}/fixtures/h2h?h2h=${homeId}-${awayId}&last=3`, { headers });
    const data = await response.json();
    if (data && data.response) {
      return data.response.map(item => {
        const goals = item.goals || {};
        return {
          homeScore: goals.home !== null ? goals.home : 0,
          awayScore: goals.away !== null ? goals.away : 0,
          date: item.fixture && item.fixture.date ? new Date(item.fixture.date).toLocaleDateString('tr-TR') : ""
        };
      });
    }
  } catch (err) {
    console.error(`Error getting H2H between ${homeId} and ${awayId}:`, err);
  }
  return [];
}

// --- Helper: Form Multiplier Calculation ---
function getFormMultiplier(formString) {
  if (!formString) return 1.0;
  const recentForm = String(formString).slice(-5).toUpperCase();
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
  if (isNaN(lambda) || lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

// Dixon-Coles Adjusted Poisson Model
function calculateMatchPredictions(homeScoredAvg, homeConcededAvg, awayScoredAvg, awayConcededAvg) {
  // Ensure valid numeric values for lambdas
  const hScored = isNaN(homeScoredAvg) ? 1.6 : homeScoredAvg;
  const hConceded = isNaN(homeConcededAvg) ? 1.1 : homeConcededAvg;
  const aScored = isNaN(awayScoredAvg) ? 1.3 : awayScoredAvg;
  const aConceded = isNaN(awayConcededAvg) ? 1.4 : awayConcededAvg;

  const lambdaHome = (hScored + aConceded) / 2;
  const lambdaAway = (aScored + hConceded) / 2;

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
  const safeSum = totalSum > 0 ? totalSum : 1.0;

  homeWinProb /= safeSum;
  drawProb /= safeSum;
  awayWinProb /= safeSum;

  scorelist.forEach(s => {
    s.probability = Math.round((s.probability / safeSum) * 1000) / 10;
  });
  scorelist.sort((a, b) => b.probability - a.probability);

  return {
    probabilities: {
      homeWin: Math.round(homeWinProb * 100) || 34,
      draw: Math.round(drawProb * 100) || 33,
      awayWin: Math.round(awayWinProb * 100) || 33
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
    if (apiKey.length === 50 || apiHeader === 'x-rapidapi-key') {
      headers['x-rapidapi-key'] = apiKey;
      headers['x-rapidapi-host'] = 'api-football-v1.p.rapidapi.com';
    } else {
      headers[apiHeader || 'x-apisports-key'] = apiKey;
    }
  }

  try {
    const updatedMatches = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const leagueName = match.league || "Süper Lig";
      const leagueId = getLeagueId(leagueName);

      let homeTeamInfo = null;
      let awayTeamInfo = null;
      let h2h = [];

      const homeName = match.homeTeam && match.homeTeam.name ? String(match.homeTeam.name).trim() : "";
      const awayName = match.awayTeam && match.awayTeam.name ? String(match.awayTeam.name).trim() : "";

      // Call live API if keys are present and team names are not empty
      if (headers && apiUrl && homeName && awayName) {
        homeTeamInfo = await searchTeam(homeName, headers, apiUrl);
        awayTeamInfo = await searchTeam(awayName, headers, apiUrl);
        if (homeTeamInfo && awayTeamInfo) {
          h2h = await getH2HMatches(homeTeamInfo.id, awayTeamInfo.id, headers, apiUrl);
        }
      }

      // 1. Establish Home Team data
      const homeTeam = {
        name: homeName,
        logo: homeTeamInfo ? homeTeamInfo.logo : (match.homeTeam && match.homeTeam.logo ? match.homeTeam.logo : ""),
        code: homeTeamInfo ? homeTeamInfo.code : (match.homeTeam && match.homeTeam.code ? match.homeTeam.code : homeName.slice(0, 3).toUpperCase())
      };

      // 2. Establish Away Team data
      const awayTeam = {
        name: awayName,
        logo: awayTeamInfo ? awayTeamInfo.logo : (match.awayTeam && match.awayTeam.logo ? match.awayTeam.logo : ""),
        code: awayTeamInfo ? awayTeamInfo.code : (match.awayTeam && match.awayTeam.code ? match.awayTeam.code : awayName.slice(0, 3).toUpperCase())
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

      if (headers && apiUrl && homeName && awayName) {
        if (homePlayed < 5) {
          smoothedHomeScored = (rawHomeScored * homePlayed + 1.5 * (5 - homePlayed)) / 5;
          smoothedHomeConceded = (rawHomeConceded * homePlayed + 1.2 * (5 - homePlayed)) / 5;
        }
        if (awayPlayed < 5) {
          smoothedAwayScored = (rawAwayScored * awayPlayed + 1.2 * (5 - awayPlayed)) / 5;
          smoothedAwayConceded = (rawAwayConceded * awayPlayed + 1.5 * (5 - awayPlayed)) / 5;
        }
      } else {
        // Fallback simulated values if no API connection or empty team names
        rawHomeScored = 1.6;
        rawHomeConceded = 1.1;
        rawAwayScored = 1.3;
        rawAwayConceded = 1.4;
        
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
        goalsScoredAvg: [
          isNaN(rawHomeScored) ? 0.0 : parseFloat(rawHomeScored.toFixed(2)), 
          isNaN(rawAwayScored) ? 0.0 : parseFloat(rawAwayScored.toFixed(2))
        ],
        goalsConcededAvg: [
          isNaN(rawHomeConceded) ? 0.0 : parseFloat(rawHomeConceded.toFixed(2)), 
          isNaN(rawAwayConceded) ? 0.0 : parseFloat(rawAwayConceded.toFixed(2))
        ],
        cleanSheetPct: [
          homePlayed > 0 ? Math.round((homeCleanSheets / homePlayed) * 100) : 0,
          awayPlayed > 0 ? Math.round((awayCleanSheets / awayPlayed) * 100) : 0
        ],
        failedToScorePct: [
          homePlayed > 0 ? Math.round((homeFailedToScore / homePlayed) * 100) : 0,
          awayPlayed > 0 ? Math.round((awayCleanSheets / awayPlayed) * 100) : 0
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

      // xG approximations (prevent NaN propagating)
      const hScoredVal = isNaN(rawHomeScored) ? 1.6 : rawHomeScored;
      const aScoredVal = isNaN(rawAwayScored) ? 1.3 : rawAwayScored;
      const hConcededVal = isNaN(rawHomeConceded) ? 1.1 : rawHomeConceded;
      const aConcededVal = isNaN(rawAwayConceded) ? 1.4 : rawAwayConceded;

      statistics.xgScored = [parseFloat((hScoredVal * 0.9 + 0.2).toFixed(2)), parseFloat((aScoredVal * 0.85 + 0.25).toFixed(2))];
      statistics.xgConceded = [parseFloat((hConcededVal * 0.85 + 0.2).toFixed(2)), parseFloat((aConcededVal * 0.9 + 0.15).toFixed(2))];

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

    // Write updated bulletin to Firestore safely (do not let DB failures crash the endpoint)
    try {
      const db = getFirestoreDb();
      if (db) {
        const docRef = db.collection('bulletin').doc('current');
        await docRef.set({
          matches: updatedMatches,
          lastUpdated: new Date().toISOString()
        });
        console.log("Successfully wrote active bulletin to Firestore.");
      }
    } catch (dbError) {
      console.error("Firestore write failed, bypassing storage save:", dbError);
    }

    res.status(200).json({ success: true, matches: updatedMatches, isDemo: !getFirestoreDb() });
  } catch (error) {
    console.error("Critical error in /api/sync:", error);
    res.status(500).json({ error: "Failed to compile and sync bulletin matches.", message: error.message });
  }
};
