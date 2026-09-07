// 양자택일 결정 도우미 — 채점 로직 (순수 함수, UI 의존성 없음)

export type Criterion = {
  id: string;
  name: string;
  /** 기준의 중요도 (1–5) */
  weight: number;
  /** 옵션 A가 이 기준을 만족하는 정도 (1–10) */
  scoreA: number;
  /** 옵션 B가 이 기준을 만족하는 정도 (1–10) */
  scoreB: number;
};

export type Side = "A" | "B" | "tie";

export type Contribution = {
  id: string;
  name: string;
  /** weight * (scoreA - scoreB). 양수 → A 유리, 음수 → B 유리 */
  value: number;
  favors: Side;
  /** |value| / max(|value|). 막대 길이용 0–1 비율 */
  ratio: number;
};

export type Result = {
  totalA: number;
  totalB: number;
  /** totalA - totalB */
  margin: number;
  winner: Side;
  /** 기여도 절댓값 내림차순 정렬 */
  contributions: Contribution[];
};

export const WEIGHT_MIN = 1;
export const WEIGHT_MAX = 5;
export const SCORE_MIN = 1;
export const SCORE_MAX = 10;

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function computeTotals(criteria: Criterion[]): {
  totalA: number;
  totalB: number;
} {
  let totalA = 0;
  let totalB = 0;
  for (const c of criteria) {
    totalA += c.weight * c.scoreA;
    totalB += c.weight * c.scoreB;
  }
  return { totalA, totalB };
}

function sideOf(value: number): Side {
  if (value > 0) return "A";
  if (value < 0) return "B";
  return "tie";
}

export function computeContributions(criteria: Criterion[]): Contribution[] {
  const raw = criteria.map((c) => ({
    id: c.id,
    name: c.name,
    value: c.weight * (c.scoreA - c.scoreB),
  }));

  const maxAbs = raw.reduce((m, r) => Math.max(m, Math.abs(r.value)), 0);

  return raw
    .map((r) => ({
      ...r,
      favors: sideOf(r.value),
      ratio: maxAbs === 0 ? 0 : Math.abs(r.value) / maxAbs,
    }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

export function evaluate(criteria: Criterion[]): Result {
  const { totalA, totalB } = computeTotals(criteria);
  const margin = totalA - totalB;
  return {
    totalA,
    totalB,
    margin,
    winner: sideOf(margin),
    contributions: computeContributions(criteria),
  };
}
