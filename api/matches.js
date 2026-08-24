const { getFirestoreDb } = require('./firebase-admin-init');

// Self-contained server-side fallback matches with correct team logo URLs and full prediction models
const INITIAL_MATCHES = [
  {
    matchId: "1",
    league: "Süper Lig",
    homeTeam: { name: "Galatasaray", logo: "https://images.fotmob.com/image_resources/logo/team/8670.png", code: "GS" },
    awayTeam: { name: "Fenerbahçe", logo: "https://images.fotmob.com/image_resources/logo/team/8675.png", code: "FB" },
    statistics: {
      goalsScoredAvg: [2.4, 2.1],
      goalsConcededAvg: [0.9, 0.8],
      cleanSheetPct: [52, 48],
      failedToScorePct: [10, 12],
      winPct: [74, 68],
      drawPct: [16, 18],
      lossPct: [10, 14]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 1, date: "19.05.2024" },
      { homeScore: 0, awayScore: 0, date: "24.12.2023" },
      { homeScore: 3, awayScore: 0, date: "04.06.2023" }
    ],
    playPercentages: { home: 55, draw: 25, away: 20 },
    odds: { home: 1.95, draw: 3.40, away: 3.10 },
    probabilities: { homeWin: 52, draw: 26, awayWin: 22 },
    scorePredictions: [
      { score: "2 - 1", probability: 14.8 },
      { score: "1 - 1", probability: 12.2 },
      { score: "2 - 0", probability: 10.5 }
    ]
  },
  {
    matchId: "2",
    league: "Süper Lig",
    homeTeam: { name: "Çaykur Rizespor", logo: "https://images.fotmob.com/image_resources/logo/team/10148.png", code: "RIZ" },
    awayTeam: { name: "Samsunspor", logo: "https://images.fotmob.com/image_resources/logo/team/8657.png", code: "SAM" },
    statistics: {
      goalsScoredAvg: [1.2, 1.4],
      goalsConcededAvg: [1.5, 1.1],
      cleanSheetPct: [24, 35],
      failedToScorePct: [32, 20],
      winPct: [34, 42],
      drawPct: [26, 28],
      lossPct: [40, 30]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 1, date: "23.02.2024" },
      { homeScore: 0, awayScore: 3, date: "08.10.2023" },
      { homeScore: 2, awayScore: 1, date: "12.03.2023" }
    ],
    playPercentages: { home: 35, draw: 30, away: 35 },
    odds: { home: 2.45, draw: 3.15, away: 2.55 },
    probabilities: { homeWin: 33, draw: 29, awayWin: 38 },
    scorePredictions: [
      { score: "1 - 1", probability: 15.2 },
      { score: "1 - 2", probability: 11.8 },
      { score: "0 - 1", probability: 9.6 }
    ]
  },
  {
    matchId: "3",
    league: "Süper Lig",
    homeTeam: { name: "Beşiktaş", logo: "https://images.fotmob.com/image_resources/logo/team/8658.png", code: "BJK" },
    awayTeam: { name: "Trabzonspor", logo: "https://images.fotmob.com/image_resources/logo/team/8655.png", code: "TS" },
    statistics: {
      goalsScoredAvg: [1.8, 1.6],
      goalsConcededAvg: [1.2, 1.3],
      cleanSheetPct: [40, 32],
      failedToScorePct: [18, 22],
      winPct: [54, 46],
      drawPct: [24, 26],
      lossPct: [22, 28]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 0, date: "04.02.2024" },
      { homeScore: 0, awayScore: 3, date: "17.09.2023" },
      { homeScore: 0, awayScore: 0, date: "16.04.2023" }
    ],
    playPercentages: { home: 48, draw: 28, away: 24 },
    odds: { home: 2.10, draw: 3.30, away: 2.90 },
    probabilities: { homeWin: 45, draw: 28, awayWin: 27 },
    scorePredictions: [
      { score: "1 - 1", probability: 13.5 },
      { score: "2 - 1", probability: 11.2 },
      { score: "1 - 0", probability: 10.1 }
    ]
  },
  {
    matchId: "4",
    league: "Süper Lig",
    homeTeam: { name: "Başakşehir", logo: "https://images.fotmob.com/image_resources/logo/team/10149.png", code: "IBFK" },
    awayTeam: { name: "Eyüpspor", logo: "https://images.fotmob.com/image_resources/logo/team/516900.png", code: "EYUP" },
    statistics: {
      goalsScoredAvg: [1.4, 1.3],
      goalsConcededAvg: [1.2, 1.4],
      cleanSheetPct: [36, 28],
      failedToScorePct: [22, 30],
      winPct: [45, 38],
      drawPct: [28, 26],
      lossPct: [27, 36]
    },
    h2hMatches: [
      { homeScore: 3, awayScore: 1, date: "15.01.2024" }
    ],
    playPercentages: { home: 50, draw: 30, away: 20 },
    odds: { home: 2.05, draw: 3.20, away: 3.10 },
    probabilities: { homeWin: 42, draw: 30, awayWin: 28 },
    scorePredictions: [
      { score: "1 - 1", probability: 14.1 },
      { score: "1 - 0", probability: 12.3 },
      { score: "2 - 1", probability: 10.2 }
    ]
  },
  {
    matchId: "5",
    league: "Süper Lig",
    homeTeam: { name: "Antalyaspor", logo: "https://images.fotmob.com/image_resources/logo/team/8656.png", code: "ANT" },
    awayTeam: { name: "Konyaspor", logo: "https://images.fotmob.com/image_resources/logo/team/8654.png", code: "KON" },
    statistics: {
      goalsScoredAvg: [1.1, 0.9],
      goalsConcededAvg: [1.3, 1.2],
      cleanSheetPct: [30, 26],
      failedToScorePct: [34, 38],
      winPct: [38, 32],
      drawPct: [30, 32],
      lossPct: [32, 36]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 1, date: "09.03.2024" },
      { homeScore: 1, awayScore: 1, date: "30.09.2023" },
      { homeScore: 1, awayScore: 1, date: "07.04.2023" }
    ],
    playPercentages: { home: 40, draw: 35, away: 25 },
    odds: { home: 2.25, draw: 3.00, away: 2.95 },
    probabilities: { homeWin: 38, draw: 33, awayWin: 29 },
    scorePredictions: [
      { score: "1 - 1", probability: 16.5 },
      { score: "1 - 0", probability: 13.2 },
      { score: "0 - 1", probability: 10.8 }
    ]
  },
  {
    matchId: "6",
    league: "Süper Lig",
    homeTeam: { name: "Göztepe", logo: "https://images.fotmob.com/image_resources/logo/team/8653.png", code: "GOZ" },
    awayTeam: { name: "Alanyaspor", logo: "https://images.fotmob.com/image_resources/logo/team/158572.png", code: "ALA" },
    statistics: {
      goalsScoredAvg: [1.5, 1.2],
      goalsConcededAvg: [1.1, 1.4],
      cleanSheetPct: [38, 22],
      failedToScorePct: [24, 34],
      winPct: [48, 36],
      drawPct: [26, 28],
      lossPct: [26, 36]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 2, date: "16.04.2022" },
      { homeScore: 2, awayScore: 0, date: "29.11.2021" }
    ],
    playPercentages: { home: 45, draw: 30, away: 25 },
    odds: { home: 2.15, draw: 3.10, away: 3.00 },
    probabilities: { homeWin: 47, draw: 28, awayWin: 25 },
    scorePredictions: [
      { score: "2 - 1", probability: 13.9 },
      { score: "1 - 1", probability: 12.1 },
      { score: "2 - 0", probability: 10.4 }
    ]
  },
  {
    matchId: "7",
    league: "Süper Lig",
    homeTeam: { name: "Kasımpaşa", logo: "https://images.fotmob.com/image_resources/logo/team/10214.png", code: "KAS" },
    awayTeam: { name: "Bodrum FK", logo: "https://images.fotmob.com/image_resources/logo/team/938743.png", code: "BOD" },
    statistics: {
      goalsScoredAvg: [1.6, 1.1],
      goalsConcededAvg: [1.7, 1.3],
      cleanSheetPct: [20, 28],
      failedToScorePct: [22, 36],
      winPct: [42, 32],
      drawPct: [24, 28],
      lossPct: [34, 40]
    },
    h2hMatches: [],
    playPercentages: { home: 55, draw: 25, away: 20 },
    odds: { home: 1.85, draw: 3.40, away: 3.50 },
    probabilities: { homeWin: 50, draw: 26, awayWin: 24 },
    scorePredictions: [
      { score: "2 - 1", probability: 12.9 },
      { score: "1 - 1", probability: 11.5 },
      { score: "2 - 0", probability: 10.2 }
    ]
  },
  {
    matchId: "8",
    league: "Süper Lig",
    homeTeam: { name: "Gaziantep FK", logo: "https://images.fotmob.com/image_resources/logo/team/7261.png", code: "GFK" },
    awayTeam: { name: "Sivasspor", logo: "https://images.fotmob.com/image_resources/logo/team/8652.png", code: "SIV" },
    statistics: {
      goalsScoredAvg: [1.2, 1.3],
      goalsConcededAvg: [1.5, 1.4],
      cleanSheetPct: [22, 26],
      failedToScorePct: [32, 28],
      winPct: [32, 38],
      drawPct: [28, 26],
      lossPct: [40, 36]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 2, date: "21.01.2024" },
      { homeScore: 1, awayScore: 3, date: "20.08.2023" },
      { homeScore: 1, awayScore: 2, date: "28.01.2023" }
    ],
    playPercentages: { home: 38, draw: 32, away: 30 },
    odds: { home: 2.30, draw: 3.10, away: 2.75 },
    probabilities: { homeWin: 36, draw: 31, awayWin: 33 },
    scorePredictions: [
      { score: "1 - 1", probability: 15.6 },
      { score: "1 - 2", probability: 11.2 },
      { score: "2 - 1", probability: 10.5 }
    ]
  },
  {
    matchId: "9",
    league: "Premier League",
    homeTeam: { name: "Arsenal", logo: "https://images.fotmob.com/image_resources/logo/team/9825.png", code: "ARS" },
    awayTeam: { name: "Manchester City", logo: "https://images.fotmob.com/image_resources/logo/team/8457.png", code: "MCI" },
    statistics: {
      goalsScoredAvg: [2.3, 2.6],
      goalsConcededAvg: [0.7, 0.9],
      cleanSheetPct: [56, 44],
      failedToScorePct: [8, 6],
      winPct: [76, 72],
      drawPct: [14, 16],
      lossPct: [10, 12]
    },
    h2hMatches: [
      { homeScore: 0, awayScore: 0, date: "31.03.2024" },
      { homeScore: 1, awayScore: 0, date: "08.10.2023" },
      { homeScore: 1, awayScore: 4, date: "26.04.2023" }
    ],
    playPercentages: { home: 33, draw: 30, away: 37 },
    odds: { home: 2.80, draw: 3.30, away: 2.35 },
    probabilities: { homeWin: 35, draw: 27, awayWin: 38 },
    scorePredictions: [
      { score: "1 - 1", probability: 12.8 },
      { score: "1 - 2", probability: 10.5 },
      { score: "2 - 2", probability: 8.9 }
    ]
  },
  {
    matchId: "10",
    league: "Premier League",
    homeTeam: { name: "Chelsea", logo: "https://images.fotmob.com/image_resources/logo/team/8455.png", code: "CHE" },
    awayTeam: { name: "Aston Villa", logo: "https://images.fotmob.com/image_resources/logo/team/10252.png", code: "AVL" },
    statistics: {
      goalsScoredAvg: [2.0, 1.9],
      goalsConcededAvg: [1.6, 1.5],
      cleanSheetPct: [32, 28],
      failedToScorePct: [18, 22],
      winPct: [54, 48],
      drawPct: [22, 24],
      lossPct: [24, 28]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 2, date: "27.04.2024" },
      { homeScore: 3, awayScore: 1, date: "07.02.2024" },
      { homeScore: 0, awayScore: 1, date: "24.09.2023" }
    ],
    playPercentages: { home: 45, draw: 28, away: 27 },
    odds: { home: 1.95, draw: 3.60, away: 3.20 },
    probabilities: { homeWin: 46, draw: 26, awayWin: 28 },
    scorePredictions: [
      { score: "2 - 1", probability: 12.1 },
      { score: "1 - 1", probability: 11.5 },
      { score: "2 - 2", probability: 9.8 }
    ]
  },
  {
    matchId: "11",
    league: "La Liga",
    homeTeam: { name: "Real Madrid", logo: "https://images.fotmob.com/image_resources/logo/team/8633.png", code: "RMA" },
    awayTeam: { name: "Atletico Madrid", logo: "https://images.fotmob.com/image_resources/logo/team/9906.png", code: "ATM" },
    statistics: {
      goalsScoredAvg: [2.4, 1.8],
      goalsConcededAvg: [0.7, 1.1],
      cleanSheetPct: [62, 40],
      failedToScorePct: [6, 14],
      winPct: [78, 54],
      drawPct: [16, 26],
      lossPct: [6, 20]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 1, date: "04.02.2024" },
      { homeScore: 1, awayScore: 3, date: "24.09.2023" },
      { homeScore: 1, awayScore: 1, date: "25.02.2023" }
    ],
    playPercentages: { home: 58, draw: 24, away: 18 },
    odds: { home: 1.80, draw: 3.60, away: 3.90 },
    probabilities: { homeWin: 58, draw: 24, awayWin: 18 },
    scorePredictions: [
      { score: "2 - 0", probability: 15.1 },
      { score: "2 - 1", probability: 12.8 },
      { score: "1 - 0", probability: 11.2 }
    ]
  },
  {
    matchId: "12",
    league: "La Liga",
    homeTeam: { name: "Barcelona", logo: "https://images.fotmob.com/image_resources/logo/team/8634.png", code: "BAR" },
    awayTeam: { name: "Real Sociedad", logo: "https://images.fotmob.com/image_resources/logo/team/8560.png", code: "RSO" },
    statistics: {
      goalsScoredAvg: [2.1, 1.3],
      goalsConcededAvg: [1.1, 1.0],
      cleanSheetPct: [48, 38],
      failedToScorePct: [12, 24],
      winPct: [68, 42],
      drawPct: [18, 28],
      lossPct: [14, 30]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 0, date: "13.05.2024" },
      { homeScore: 1, awayScore: 0, date: "04.11.2023" },
      { homeScore: 1, awayScore: 2, date: "20.05.2023" }
    ],
    playPercentages: { home: 65, draw: 22, away: 13 },
    odds: { home: 1.55, draw: 3.90, away: 5.25 },
    probabilities: { homeWin: 64, draw: 22, awayWin: 14 },
    scorePredictions: [
      { score: "2 - 0", probability: 16.2 },
      { score: "2 - 1", probability: 13.1 },
      { score: "1 - 0", probability: 12.5 }
    ]
  },
  {
    matchId: "13",
    league: "Serie A",
    homeTeam: { name: "Inter", logo: "https://images.fotmob.com/image_resources/logo/team/8636.png", code: "INT" },
    awayTeam: { name: "Juventus", logo: "https://images.fotmob.com/image_resources/logo/team/9885.png", code: "JUV" },
    statistics: {
      goalsScoredAvg: [2.3, 1.4],
      goalsConcededAvg: [0.6, 0.8],
      cleanSheetPct: [64, 48],
      failedToScorePct: [4, 18],
      winPct: [74, 52],
      drawPct: [18, 30],
      lossPct: [8, 18]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 0, date: "04.02.2024" },
      { homeScore: 1, awayScore: 1, date: "26.11.2023" },
      { homeScore: 0, awayScore: 1, date: "19.03.2023" }
    ],
    playPercentages: { home: 50, draw: 30, away: 20 },
    odds: { home: 1.90, draw: 3.20, away: 3.80 },
    probabilities: { homeWin: 55, draw: 27, awayWin: 18 },
    scorePredictions: [
      { score: "2 - 0", probability: 14.8 },
      { score: "1 - 0", probability: 13.1 },
      { score: "2 - 1", probability: 10.9 }
    ]
  },
  {
    matchId: "14",
    league: "Serie A",
    homeTeam: { name: "Milan", logo: "https://images.fotmob.com/image_resources/logo/team/8564.png", code: "MIL" },
    awayTeam: { name: "Napoli", logo: "https://images.fotmob.com/image_resources/logo/team/9875.png", code: "NAP" },
    statistics: {
      goalsScoredAvg: [1.9, 1.4],
      goalsConcededAvg: [1.3, 1.3],
      cleanSheetPct: [38, 36],
      failedToScorePct: [16, 24],
      winPct: [56, 48],
      drawPct: [24, 26],
      lossPct: [20, 26]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 0, date: "11.02.2024" },
      { homeScore: 2, awayScore: 2, date: "29.10.2023" },
      { homeScore: 1, awayScore: 1, date: "18.04.2023" }
    ],
    playPercentages: { home: 44, draw: 29, away: 27 },
    odds: { home: 2.10, draw: 3.30, away: 3.00 },
    probabilities: { homeWin: 45, draw: 29, awayWin: 26 },
    scorePredictions: [
      { score: "1 - 1", probability: 14.1 },
      { score: "2 - 1", probability: 11.5 },
      { score: "1 - 0", probability: 9.8 }
    ]
  },
  {
    matchId: "15",
    league: "Süper Lig",
    homeTeam: { name: "Fatih Karagümrük", logo: "https://images.fotmob.com/image_resources/logo/team/516901.png", code: "FKG" },
    awayTeam: { name: "Pendikspor", logo: "https://images.fotmob.com/image_resources/logo/team/479904.png", code: "PEND" },
    statistics: {
      goalsScoredAvg: [1.2, 1.1],
      goalsConcededAvg: [1.4, 1.8],
      cleanSheetPct: [28, 18],
      failedToScorePct: [30, 36],
      winPct: [32, 28],
      drawPct: [28, 24],
      lossPct: [40, 48]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 0, date: "10.02.2024" },
      { homeScore: 1, awayScore: 1, date: "23.09.2023" }
    ],
    playPercentages: { home: 42, draw: 30, away: 28 },
    odds: { home: 2.10, draw: 3.25, away: 2.95 },
    probabilities: { homeWin: 40, draw: 31, awayWin: 29 },
    scorePredictions: [
      { score: "1 - 1", probability: 15.2 },
      { score: "1 - 0", probability: 12.8 },
      { score: "2 - 1", probability: 10.1 }
    ]
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = getFirestoreDb();
    if (db) {
      const docRef = db.collection('bulletin').doc('current');
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        if (data && data.matches) {
          res.status(200).json({ matches: data.matches, isDemo: false });
          return;
        }
      }
    }
    
    res.status(200).json({ matches: INITIAL_MATCHES, isDemo: true });
  } catch (error) {
    console.error("Error in /api/matches:", error);
    res.status(200).json({ matches: INITIAL_MATCHES, isDemo: true });
  }
};
