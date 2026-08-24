/**
 * Poisson Distribution forecasting mathematical engine.
 */

// Calculates the factorial of a number
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/**
 * Calculates Poisson Probability for k events given expected rate lambda.
 * P(k; lambda) = (e^-lambda * lambda^k) / k!
 */
export function poissonProbability(k, lambda) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

/**
 * Predicts score matrix and win/draw/loss probabilities using Poisson distribution.
 * 
 * @param {number} homeScoredAvg - Average goals scored by Home team
 * @param {number} homeConcededAvg - Average goals conceded by Home team
 * @param {number} awayScoredAvg - Average goals scored by Away team
 * @param {number} awayConcededAvg - Average goals conceded by Away team
 */
export function calculateMatchPredictions(homeScoredAvg, homeConcededAvg, awayScoredAvg, awayConcededAvg) {
  // Approximate lambda (expected goals) for the match
  // A team's expectation is based on their scoring ability and the opponent's defensive vulnerability
  const lambdaHome = (homeScoredAvg + awayConcededAvg) / 2;
  const lambdaAway = (awayScoredAvg + homeConcededAvg) / 2;

  const maxGoals = 5; // We compute probabilities up to 5 goals
  const homeProbabilities = [];
  const awayProbabilities = [];

  // 1. Calculate individual goal probabilities for both teams
  for (let g = 0; g <= maxGoals; g++) {
    homeProbabilities[g] = poissonProbability(g, lambdaHome);
    awayProbabilities[g] = poissonProbability(g, lambdaAway);
  }

  // Normalize array elements to sum up to 1 (accounting for goals > 5)
  const homeSum = homeProbabilities.reduce((a, b) => a + b, 0);
  const awaySum = awayProbabilities.reduce((a, b) => a + b, 0);
  for (let g = 0; g <= maxGoals; g++) {
    homeProbabilities[g] /= homeSum;
    awayProbabilities[g] /= awaySum;
  }

  // 2. Generate probability matrix for scorelines
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
        probability: Math.round(prob * 1000) / 10 // Store as percentage (e.g. 12.2)
      });
    }
  }

  // Sort scorelist by highest probability to get top score predictions
  scorelist.sort((a, b) => b.probability - a.probability);

  return {
    probabilities: {
      homeWin: Math.round(homeWinProb * 100),
      draw: Math.round(drawProb * 100),
      awayWin: Math.round(awayWinProb * 100)
    },
    scorePredictions: scorelist.slice(0, 3) // Return top 3 scores
  };
}
