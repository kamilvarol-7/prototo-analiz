/**
 * Mock Data for the 15 Spor Toto Matches of the Week.
 * Features: Süper Lig, English Premier League, Spanish La Liga, and Italian Serie A.
 */

export const INITIAL_MATCHES = [
  {
    matchId: "1",
    league: "Süper Lig",
    homeTeam: { name: "Galatasaray", logo: "https://images.fotmob.com/image_resources/logo/team/8670.png", code: "GS" },
    awayTeam: { name: "Fenerbahçe", logo: "https://images.fotmob.com/image_resources/logo/team/8675.png", code: "FB" },
    statistics: {
      goalsScoredAvg: [2.4, 2.1],
      goalsConcededAvg: [0.9, 0.8],
      shotsAvg: [16.4, 15.2],
      shotsConcededAvg: [8.6, 9.1],
      firstGoalPct: [78, 72],
      bothTeamsToScorePct: 56,
      xgScored: [2.15, 1.95],
      xgConceded: [0.92, 0.88]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 1, date: "19.05.2024" },
      { homeScore: 0, awayScore: 0, date: "24.12.2023" },
      { homeScore: 3, awayScore: 0, date: "04.06.2023" }
    ],
    playPercentages: { home: 55, draw: 25, away: 20 },
    odds: { home: 1.95, draw: 3.40, away: 3.10 }
  },
  {
    matchId: "2",
    league: "Süper Lig",
    homeTeam: { name: "Çaykur Rizespor", logo: "https://images.fotmob.com/image_resources/logo/team/10148.png", code: "RIZ" },
    awayTeam: { name: "Samsunspor", logo: "https://images.fotmob.com/image_resources/logo/team/8657.png", code: "SAM" },
    statistics: {
      goalsScoredAvg: [1.2, 1.4],
      goalsConcededAvg: [1.5, 1.1],
      shotsAvg: [11.2, 12.4],
      shotsConcededAvg: [13.1, 10.8],
      firstGoalPct: [45, 60],
      bothTeamsToScorePct: 48,
      xgScored: [1.15, 1.38],
      xgConceded: [1.42, 1.05]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 1, date: "23.02.2024" },
      { homeScore: 0, awayScore: 3, date: "08.10.2023" },
      { homeScore: 2, awayScore: 1, date: "12.03.2023" }
    ],
    playPercentages: { home: 35, draw: 30, away: 35 },
    odds: { home: 2.45, draw: 3.15, away: 2.55 }
  },
  {
    matchId: "3",
    league: "Süper Lig",
    homeTeam: { name: "Beşiktaş", logo: "https://images.fotmob.com/image_resources/logo/team/8658.png", code: "BJK" },
    awayTeam: { name: "Trabzonspor", logo: "https://images.fotmob.com/image_resources/logo/team/8655.png", code: "TS" },
    statistics: {
      goalsScoredAvg: [1.8, 1.6],
      goalsConcededAvg: [1.2, 1.3],
      shotsAvg: [14.1, 13.5],
      shotsConcededAvg: [11.2, 11.9],
      firstGoalPct: [65, 58],
      bothTeamsToScorePct: 52,
      xgScored: [1.72, 1.55],
      xgConceded: [1.18, 1.25]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 0, date: "04.02.2024" },
      { homeScore: 0, awayScore: 3, date: "17.09.2023" },
      { homeScore: 0, awayScore: 0, date: "16.04.2023" }
    ],
    playPercentages: { home: 48, draw: 28, away: 24 },
    odds: { home: 2.10, draw: 3.30, away: 2.90 }
  },
  {
    matchId: "4",
    league: "Süper Lig",
    homeTeam: { name: "Başakşehir", logo: "https://images.fotmob.com/image_resources/logo/team/10149.png", code: "IBFK" },
    awayTeam: { name: "Eyüpspor", logo: "https://images.fotmob.com/image_resources/logo/team/516900.png", code: "EYUP" },
    statistics: {
      goalsScoredAvg: [1.4, 1.3],
      goalsConcededAvg: [1.2, 1.4],
      shotsAvg: [11.8, 11.5],
      shotsConcededAvg: [12.0, 12.6],
      firstGoalPct: [52, 48],
      bothTeamsToScorePct: 50,
      xgScored: [1.35, 1.28],
      xgConceded: [1.18, 1.32]
    },
    h2hMatches: [
      { homeScore: 3, awayScore: 1, date: "15.01.2024" }
    ],
    playPercentages: { home: 50, draw: 30, away: 20 },
    odds: { home: 2.05, draw: 3.20, away: 3.10 }
  },
  {
    matchId: "5",
    league: "Süper Lig",
    homeTeam: { name: "Antalyaspor", logo: "https://images.fotmob.com/image_resources/logo/team/8656.png", code: "ANT" },
    awayTeam: { name: "Konyaspor", logo: "https://images.fotmob.com/image_resources/logo/team/8654.png", code: "KON" },
    statistics: {
      goalsScoredAvg: [1.1, 0.9],
      goalsConcededAvg: [1.3, 1.2],
      shotsAvg: [10.5, 9.8],
      shotsConcededAvg: [12.2, 11.5],
      firstGoalPct: [40, 38],
      bothTeamsToScorePct: 44,
      xgScored: [1.08, 0.94],
      xgConceded: [1.24, 1.15]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 1, date: "09.03.2024" },
      { homeScore: 1, awayScore: 1, date: "30.09.2023" },
      { homeScore: 1, awayScore: 1, date: "07.04.2023" }
    ],
    playPercentages: { home: 40, draw: 35, away: 25 },
    odds: { home: 2.25, draw: 3.00, away: 2.95 }
  },
  {
    matchId: "6",
    league: "Süper Lig",
    homeTeam: { name: "Göztepe", logo: "https://images.fotmob.com/image_resources/logo/team/8653.png", code: "GOZ" },
    awayTeam: { name: "Alanyaspor", logo: "https://images.fotmob.com/image_resources/logo/team/158572.png", code: "ALA" },
    statistics: {
      goalsScoredAvg: [1.5, 1.2],
      goalsConcededAvg: [1.1, 1.4],
      shotsAvg: [12.8, 11.1],
      shotsConcededAvg: [10.5, 13.0],
      firstGoalPct: [62, 45],
      bothTeamsToScorePct: 52,
      xgScored: [1.46, 1.18],
      xgConceded: [1.08, 1.35]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 2, date: "16.04.2022" },
      { homeScore: 2, awayScore: 0, date: "29.11.2021" }
    ],
    playPercentages: { home: 45, draw: 30, away: 25 },
    odds: { home: 2.15, draw: 3.10, away: 3.00 }
  },
  {
    matchId: "7",
    league: "Süper Lig",
    homeTeam: { name: "Kasımpaşa", logo: "https://images.fotmob.com/image_resources/logo/team/10214.png", code: "KAS" },
    awayTeam: { name: "Bodrum FK", logo: "https://images.fotmob.com/image_resources/logo/team/938743.png", code: "BOD" },
    statistics: {
      goalsScoredAvg: [1.6, 1.1],
      goalsConcededAvg: [1.7, 1.3],
      shotsAvg: [13.2, 10.2],
      shotsConcededAvg: [14.1, 11.5],
      firstGoalPct: [50, 42],
      bothTeamsToScorePct: 60,
      xgScored: [1.52, 1.08],
      xgConceded: [1.65, 1.28]
    },
    h2hMatches: [],
    playPercentages: { home: 55, draw: 25, away: 20 },
    odds: { home: 1.85, draw: 3.40, away: 3.50 }
  },
  {
    matchId: "8",
    league: "Süper Lig",
    homeTeam: { name: "Gaziantep FK", logo: "https://images.fotmob.com/image_resources/logo/team/7261.png", code: "GFK" },
    awayTeam: { name: "Sivasspor", logo: "https://images.fotmob.com/image_resources/logo/team/8652.png", code: "SIV" },
    statistics: {
      goalsScoredAvg: [1.2, 1.3],
      goalsConcededAvg: [1.5, 1.4],
      shotsAvg: [11.0, 11.2],
      shotsConcededAvg: [13.4, 12.8],
      firstGoalPct: [44, 46],
      bothTeamsToScorePct: 54,
      xgScored: [1.18, 1.24],
      xgConceded: [1.44, 1.38]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 2, date: "21.01.2024" },
      { homeScore: 1, awayScore: 3, date: "20.08.2023" },
      { homeScore: 1, awayScore: 2, date: "28.01.2023" }
    ],
    playPercentages: { home: 38, draw: 32, away: 30 },
    odds: { home: 2.30, draw: 3.10, away: 2.75 }
  },
  {
    matchId: "9",
    league: "Premier League",
    homeTeam: { name: "Arsenal", logo: "https://images.fotmob.com/image_resources/logo/team/9825.png", code: "ARS" },
    awayTeam: { name: "Manchester City", logo: "https://images.fotmob.com/image_resources/logo/team/8457.png", code: "MCI" },
    statistics: {
      goalsScoredAvg: [2.3, 2.6],
      goalsConcededAvg: [0.7, 0.9],
      shotsAvg: [17.1, 18.5],
      shotsConcededAvg: [7.8, 8.2],
      firstGoalPct: [82, 80],
      bothTeamsToScorePct: 48,
      xgScored: [2.24, 2.48],
      xgConceded: [0.78, 0.85]
    },
    h2hMatches: [
      { homeScore: 0, awayScore: 0, date: "31.03.2024" },
      { homeScore: 1, awayScore: 0, date: "08.10.2023" },
      { homeScore: 1, awayScore: 4, date: "26.04.2023" }
    ],
    playPercentages: { home: 33, draw: 30, away: 37 },
    odds: { home: 2.80, draw: 3.30, away: 2.35 }
  },
  {
    matchId: "10",
    league: "Premier League",
    homeTeam: { name: "Chelsea", logo: "https://images.fotmob.com/image_resources/logo/team/8455.png", code: "CHE" },
    awayTeam: { name: "Aston Villa", logo: "https://images.fotmob.com/image_resources/logo/team/10252.png", code: "AVL" },
    statistics: {
      goalsScoredAvg: [2.0, 1.9],
      goalsConcededAvg: [1.6, 1.5],
      shotsAvg: [14.8, 13.9],
      shotsConcededAvg: [12.5, 11.8],
      firstGoalPct: [60, 58],
      bothTeamsToScorePct: 62,
      xgScored: [1.92, 1.84],
      xgConceded: [1.54, 1.48]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 2, date: "27.04.2024" },
      { homeScore: 3, awayScore: 1, date: "07.02.2024" },
      { homeScore: 0, awayScore: 1, date: "24.09.2023" }
    ],
    playPercentages: { home: 45, draw: 28, away: 27 },
    odds: { home: 1.95, draw: 3.60, away: 3.20 }
  },
  {
    matchId: "11",
    league: "La Liga",
    homeTeam: { name: "Real Madrid", logo: "https://images.fotmob.com/image_resources/logo/team/8633.png", code: "RMA" },
    awayTeam: { name: "Atletico Madrid", logo: "https://images.fotmob.com/image_resources/logo/team/9906.png", code: "ATM" },
    statistics: {
      goalsScoredAvg: [2.4, 1.8],
      goalsConcededAvg: [0.7, 1.1],
      shotsAvg: [16.2, 12.8],
      shotsConcededAvg: [9.5, 11.2],
      firstGoalPct: [80, 68],
      bothTeamsToScorePct: 50,
      xgScored: [2.25, 1.76],
      xgConceded: [0.82, 1.10]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 1, date: "04.02.2024" },
      { homeScore: 1, awayScore: 3, date: "24.09.2023" },
      { homeScore: 1, awayScore: 1, date: "25.02.2023" }
    ],
    playPercentages: { home: 58, draw: 24, away: 18 },
    odds: { home: 1.80, draw: 3.60, away: 3.90 }
  },
  {
    matchId: "12",
    league: "La Liga",
    homeTeam: { name: "Barcelona", logo: "https://images.fotmob.com/image_resources/logo/team/8634.png", code: "BAR" },
    awayTeam: { name: "Real Sociedad", logo: "https://images.fotmob.com/image_resources/logo/team/8560.png", code: "RSO" },
    statistics: {
      goalsScoredAvg: [2.1, 1.3],
      goalsConcededAvg: [1.1, 1.0],
      shotsAvg: [15.6, 12.1],
      shotsConcededAvg: [10.2, 10.5],
      firstGoalPct: [70, 52],
      bothTeamsToScorePct: 54,
      xgScored: [2.05, 1.28],
      xgConceded: [1.02, 1.08]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 0, date: "13.05.2024" },
      { homeScore: 1, awayScore: 0, date: "04.11.2023" },
      { homeScore: 1, awayScore: 2, date: "20.05.2023" }
    ],
    playPercentages: { home: 65, draw: 22, away: 13 },
    odds: { home: 1.55, draw: 3.90, away: 5.25 }
  },
  {
    matchId: "13",
    league: "Serie A",
    homeTeam: { name: "Inter", logo: "https://images.fotmob.com/image_resources/logo/team/8636.png", code: "INT" },
    awayTeam: { name: "Juventus", logo: "https://images.fotmob.com/image_resources/logo/team/9885.png", code: "JUV" },
    statistics: {
      goalsScoredAvg: [2.3, 1.4],
      goalsConcededAvg: [0.6, 0.8],
      shotsAvg: [15.8, 13.5],
      shotsConcededAvg: [9.2, 9.6],
      firstGoalPct: [84, 70],
      bothTeamsToScorePct: 40,
      xgScored: [2.18, 1.38],
      xgConceded: [0.72, 0.85]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 0, date: "04.02.2024" },
      { homeScore: 1, awayScore: 1, date: "26.11.2023" },
      { homeScore: 0, awayScore: 1, date: "19.03.2023" }
    ],
    playPercentages: { home: 50, draw: 30, away: 20 },
    odds: { home: 1.90, draw: 3.20, away: 3.80 }
  },
  {
    matchId: "14",
    league: "Serie A",
    homeTeam: { name: "Milan", logo: "https://images.fotmob.com/image_resources/logo/team/8564.png", code: "MIL" },
    awayTeam: { name: "Napoli", logo: "https://images.fotmob.com/image_resources/logo/team/9875.png", code: "NAP" },
    statistics: {
      goalsScoredAvg: [1.9, 1.4],
      goalsConcededAvg: [1.3, 1.3],
      shotsAvg: [14.2, 13.8],
      shotsConcededAvg: [11.5, 11.2],
      firstGoalPct: [68, 55],
      bothTeamsToScorePct: 56,
      xgScored: [1.82, 1.42],
      xgConceded: [1.22, 1.25]
    },
    h2hMatches: [
      { homeScore: 1, awayScore: 0, date: "11.02.2024" },
      { homeScore: 2, awayScore: 2, date: "29.10.2023" },
      { homeScore: 1, awayScore: 1, date: "18.04.2023" }
    ],
    playPercentages: { home: 44, draw: 29, away: 27 },
    odds: { home: 2.10, draw: 3.30, away: 3.00 }
  },
  {
    matchId: "15",
    league: "Süper Lig",
    homeTeam: { name: "Fatih Karagümrük", logo: "https://images.fotmob.com/image_resources/logo/team/516901.png", code: "FKG" },
    awayTeam: { name: "Pendikspor", logo: "https://images.fotmob.com/image_resources/logo/team/479904.png", code: "PEND" },
    statistics: {
      goalsScoredAvg: [1.2, 1.1],
      goalsConcededAvg: [1.4, 1.8],
      shotsAvg: [11.5, 10.8],
      shotsConcededAvg: [13.2, 14.6],
      firstGoalPct: [48, 40],
      bothTeamsToScorePct: 58,
      xgScored: [1.22, 1.05],
      xgConceded: [1.35, 1.72]
    },
    h2hMatches: [
      { homeScore: 2, awayScore: 0, date: "10.02.2024" },
      { homeScore: 1, awayScore: 1, date: "23.09.2023" }
    ],
    playPercentages: { home: 42, draw: 30, away: 28 },
    odds: { home: 2.10, draw: 3.25, away: 2.95 }
  }
];
