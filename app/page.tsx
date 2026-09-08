"use client";

import { useMemo, useState } from "react";
import defaultCriteria from "@/data/criteria.json";
import {
  clamp,
  evaluate,
  SCORE_MAX,
  SCORE_MIN,
  WEIGHT_MAX,
  WEIGHT_MIN,
  type Criterion,
} from "@/lib/score";

function makeDefaults(): Criterion[] {
  return (defaultCriteria as Criterion[]).map((c) => ({ ...c }));
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-400";

export default function Home() {
  const [optionAName, setOptionAName] = useState("옵션 A");
  const [optionBName, setOptionBName] = useState("옵션 B");
  const [criteria, setCriteria] = useState<Criterion[]>(makeDefaults);

  const result = useMemo(() => evaluate(criteria), [criteria]);

  const labelA = optionAName.trim() || "옵션 A";
  const labelB = optionBName.trim() || "옵션 B";

  function updateCriterion(id: string, patch: Partial<Criterion>) {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function addCriterion() {
    setCriteria((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        weight: 3,
        scoreA: 5,
        scoreB: 5,
      },
    ]);
  }

  function removeCriterion(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }

  function resetDefaults() {
    setCriteria(makeDefaults());
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 text-zinc-900 dark:text-zinc-100">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">양자택일 결정 도우미</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          두 선택지와 평가 기준별 가중치·점수를 입력하면 가중합으로 추천안을
          계산하고, 어느 기준이 결과를 갈랐는지 기여도로 보여줍니다.
        </p>
      </header>

      {/* 1. 선택지 입력 */}
      <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">선택지</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              옵션 A
            </span>
            <input
              type="text"
              value={optionAName}
              onChange={(e) => setOptionAName(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              옵션 B
            </span>
            <input
              type="text"
              value={optionBName}
              onChange={(e) => setOptionBName(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </section>

      {/* 2. 기준 입력 */}
      <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            평가 기준 ({criteria.length})
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetDefaults}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              기본값으로 초기화
            </button>
            <button
              type="button"
              onClick={addCriterion}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              기준 추가
            </button>
          </div>
        </div>

        {criteria.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
            기준이 없습니다. &quot;기준 추가&quot;로 시작하세요.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="hidden gap-2 px-1 text-xs font-medium text-zinc-400 sm:grid sm:grid-cols-[1fr_5rem_5rem_5rem_2rem] dark:text-zinc-500">
              <span>기준</span>
              <span>가중치 {WEIGHT_MIN}–{WEIGHT_MAX}</span>
              <span className="truncate">{labelA} 점수</span>
              <span className="truncate">{labelB} 점수</span>
              <span />
            </div>
            {criteria.map((c) => (
              <div
                key={c.id}
                className="grid gap-2 rounded-md border border-zinc-100 bg-zinc-50/60 p-2 sm:grid-cols-[1fr_5rem_5rem_5rem_2rem] sm:items-center sm:border-0 sm:bg-transparent sm:p-0 dark:border-zinc-800 dark:bg-zinc-800/40 dark:sm:bg-transparent"
              >
                <input
                  type="text"
                  value={c.name}
                  placeholder="기준 이름"
                  onChange={(e) =>
                    updateCriterion(c.id, { name: e.target.value })
                  }
                  className={inputClass}
                />
                <NumberField
                  ariaLabel={`${c.name || "기준"} 가중치`}
                  value={c.weight}
                  min={WEIGHT_MIN}
                  max={WEIGHT_MAX}
                  onCommit={(v) => updateCriterion(c.id, { weight: v })}
                />
                <NumberField
                  ariaLabel={`${c.name || "기준"} ${labelA} 점수`}
                  value={c.scoreA}
                  min={SCORE_MIN}
                  max={SCORE_MAX}
                  onCommit={(v) => updateCriterion(c.id, { scoreA: v })}
                />
                <NumberField
                  ariaLabel={`${c.name || "기준"} ${labelB} 점수`}
                  value={c.scoreB}
                  min={SCORE_MIN}
                  max={SCORE_MAX}
                  onCommit={(v) => updateCriterion(c.id, { scoreB: v })}
                />
                <button
                  type="button"
                  onClick={() => removeCriterion(c.id)}
                  aria-label="기준 삭제"
                  className="justify-self-end rounded-md border border-zinc-300 px-2 py-2 text-xs text-zinc-500 hover:bg-zinc-50 sm:w-8 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. 결과 */}
      <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">결과</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <TotalCard
            label={labelA}
            total={result.totalA}
            highlight={result.winner === "A"}
          />
          <TotalCard
            label={labelB}
            total={result.totalB}
            highlight={result.winner === "B"}
          />
        </div>
        <p className="mt-4 text-sm">
          {result.winner === "tie" ? (
            <span className="text-zinc-600 dark:text-zinc-400">
              두 선택지의 총점이 <strong>동점</strong>입니다.
            </span>
          ) : (
            <span className="text-zinc-700 dark:text-zinc-300">
              추천:{" "}
              <strong>{result.winner === "A" ? labelA : labelB}</strong>{" "}
              <span className="text-zinc-500 dark:text-zinc-400">
                (격차 {Math.abs(result.margin)}점)
              </span>
            </span>
          )}
        </p>
      </section>

      {/* 4. 근거 — 기준별 기여도 */}
      <section className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          근거 — 기준별 기여도
        </h2>
        <p className="mt-1 mb-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          각 막대 = 가중치 × ({labelA} 점수 − {labelB} 점수). 오른쪽은{" "}
          {labelA}, 왼쪽은 {labelB}에 유리하며, 모든 막대의 합이 곧 총점 격차
          입니다.
        </p>

        {result.contributions.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
            표시할 기준이 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center text-[11px] text-zinc-400 dark:text-zinc-500">
              <span className="flex-1 text-right pr-2">← {labelB} 유리</span>
              <span className="w-px self-stretch bg-zinc-300 dark:bg-zinc-700" />
              <span className="flex-1 pl-2">{labelA} 유리 →</span>
            </div>
            {result.contributions.map((con) => (
              <div key={con.id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-zinc-600 dark:text-zinc-400">
                  {con.name || "(이름 없음)"}
                </span>
                <div className="relative h-6 flex-1">
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-zinc-200 dark:bg-zinc-700" />
                  {con.value !== 0 && (
                    <span
                      className={`absolute top-1/2 h-4 -translate-y-1/2 rounded ${
                        con.favors === "A"
                          ? "left-1/2 bg-emerald-500"
                          : "right-1/2 bg-rose-500"
                      }`}
                      style={{ width: `${con.ratio * 50}%` }}
                    />
                  )}
                </div>
                <span
                  className={`w-10 shrink-0 text-right text-xs tabular-nums ${
                    con.favors === "A"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : con.favors === "B"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-zinc-400 dark:text-zinc-500"
                  }`}
                >
                  {con.value > 0 ? "+" : ""}
                  {con.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function NumberField({
  value,
  min,
  max,
  onCommit,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  onCommit: (v: number) => void;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState(String(value));

  // 외부 값(초기화 등)이 바뀌면 draft 동기화
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(String(value));
  }

  function commit(raw: string) {
    const parsed = clamp(parseInt(raw, 10), min, max);
    setDraft(String(parsed));
    onCommit(parsed);
  }

  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={ariaLabel}
      min={min}
      max={max}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      className="w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-400"
    />
  );
}

function TotalCard({
  label,
  total,
  highlight,
}: {
  label: string;
  total: number;
  highlight: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40"
      }`}
    >
      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{total}</div>
    </div>
  );
}
