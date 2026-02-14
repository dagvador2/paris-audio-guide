/**
 * Service de scoring.
 * Calcul des points par checkpoint, bonus énigmes avec décroissance,
 * et score total de la visite.
 */

export function calculateCheckpointScore(
  basePoints: number,
  riddleSolved: boolean,
  bonusPoints: number
): number {
  return basePoints + (riddleSolved ? bonusPoints : 0);
}

export function getRiddleScore(
  correct: boolean,
  attempts: number,
  maxAttempts: number,
  bonusPoints: number
): number {
  if (!correct) return 0;
  if (maxAttempts <= 1) return bonusPoints;

  // Décroissance linéaire : 100% au 1er essai, 10% au dernier
  const minFraction = 0.1;
  const decayPerAttempt = (1 - minFraction) / (maxAttempts - 1);
  const fraction = Math.max(minFraction, 1 - decayPerAttempt * (attempts - 1));
  return Math.round(bonusPoints * fraction);
}
