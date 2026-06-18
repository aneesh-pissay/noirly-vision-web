export const PRIORITY_MATRIX_MIDPOINT = 50;

export type MatrixLevel = "low" | "high";

export function scoreToMatrixLevel(score: number): MatrixLevel {
  return score >= PRIORITY_MATRIX_MIDPOINT ? "high" : "low";
}

export type PriorityMatrixItem<T> = {
  impact: MatrixLevel;
  effort: MatrixLevel;
  item: T;
};

export type PriorityMatrix<T> = {
  highImpactLowEffort: T[];
  highImpactHighEffort: T[];
  lowImpactLowEffort: T[];
  lowImpactHighEffort: T[];
};

export function buildPriorityMatrix<T extends { impactScore: number; effortScore: number }>(
  items: T[]
): PriorityMatrix<T> {
  const matrix: PriorityMatrix<T> = {
    highImpactLowEffort: [],
    highImpactHighEffort: [],
    lowImpactLowEffort: [],
    lowImpactHighEffort: [],
  };

  for (const item of items) {
    const impact = scoreToMatrixLevel(item.impactScore);
    const effort = scoreToMatrixLevel(item.effortScore);

    if (impact === "high" && effort === "low") {
      matrix.highImpactLowEffort.push(item);
    } else if (impact === "high" && effort === "high") {
      matrix.highImpactHighEffort.push(item);
    } else if (impact === "low" && effort === "low") {
      matrix.lowImpactLowEffort.push(item);
    } else {
      matrix.lowImpactHighEffort.push(item);
    }
  }

  return matrix;
}
