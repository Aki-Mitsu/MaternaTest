'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Baby, CheckCircle2, Edit3, Check, History, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useMaterna } from '@/lib/context/MaternaContext';
import { calculatePostpartumAge } from '@/lib/utils';
import { BABY_52_WEEKS } from '@/lib/data/babyMilestones52';

/**
 * Estimates an infant growth percentile (5th–99th) from the ratio between the
 * logged value and the WHO median for the baby's current week.
 */
function estimatePercentile(value: number | null | undefined, median: number, cv = 0.12): number | null {
  if (value === null || value === undefined || !Number.isFinite(value) || median <= 0) {
    return null;
  }
  const z = (value - median) / (median * cv);
  // Logistic approximation of standard normal CDF
  const cdf = 1 / (1 + Math.exp(-1.702 * z));
  return Math.min(99, Math.max(1, Math.round(cdf * 100)));
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export function NewbornGrowthMilestones() {
  const {
    profile,
    growthMeasurements,
    addGrowthMeasurement,
    deleteGrowthMeasurement,
    toggleMilestone,
  } = useMaterna();
  const postData = calculatePostpartumAge(profile.baby_birth_date);
  const babyName = profile.baby_name || 'Baby';
  const currentWeek = Math.min(Math.max(postData.weeks || 6, 1), 52);

  const weekReference =
    BABY_52_WEEKS.find((w) => w.week === currentWeek) || BABY_52_WEEKS[5];

  const latestLogged = growthMeasurements[0];
  const rawWeight = profile.baby_weight_lbs ?? latestLogged?.weight_lbs ?? null;
  const rawLength = profile.baby_length_in ?? latestLogged?.length_in ?? null;
  const rawHead = profile.baby_head_in ?? latestLogged?.head_in ?? null;

  const displayWeight = rawWeight ?? weekReference.weightLbs;
  const displayLength = rawLength ?? weekReference.lengthInches;
  const displayHead = rawHead ?? weekReference.headCircInches;

  const weightPct = estimatePercentile(rawWeight, weekReference.weightLbs, 0.13);
  const lengthPct = estimatePercentile(rawLength, weekReference.lengthInches, 0.04);
  const headPct = estimatePercentile(rawHead, weekReference.headCircInches, 0.035);

  const [isEditingStats, setIsEditingStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [weightInput, setWeightInput] = useState(String(displayWeight));
  const [lengthInput, setLengthInput] = useState(String(displayLength));
  const [headInput, setHeadInput] = useState(String(displayHead));

  const completedMilestones = profile.completed_milestones || [];

  // Dynamically show the 4 weekly milestones for the baby's current month
  const currentMonth = weekReference.month;
  const monthWeeks = BABY_52_WEEKS.filter((w) => w.month === currentMonth).slice(0, 4);
  const milestones = monthWeeks.map((w) => ({
    id: `w-${w.week}`,
    title: w.title,
    timing: `Week ${w.week} • ${w.category}`,
    desc: w.summary,
  }));

  const handleToggleMilestone = async (id: string, currentlyDone: boolean) => {
    await toggleMilestone(id);
    if (!currentlyDone && typeof window !== 'undefined') {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Ignore confetti errors in non-canvas environments
      }
    }
  };

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    await addGrowthMeasurement({
      weight_lbs: parseFloat(weightInput) || weekReference.weightLbs,
      length_in: parseFloat(lengthInput) || weekReference.lengthInches,
      head_in: parseFloat(headInput) || weekReference.headCircInches,
    });
    setIsEditingStats(false);
  };

  return (
    <section className="bg-white rounded-[32px] p-6 border border-[#EFE3EE] shadow-[0_8px_30px_rgba(140,80,120,0.05)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#F5EAF4] text-[#7B4C7A] flex items-center justify-center shadow-2xs">
            <Baby className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-[#8F7292] uppercase">
              MONTH {currentMonth} • WEEK {currentWeek} DEVELOPMENT
            </div>
            <h2 className="font-serif text-xl font-bold text-[#2A162B] leading-tight">
              {babyName}&apos;s Milestones
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setWeightInput(String(displayWeight));
            setLengthInput(String(displayLength));
            setHeadInput(String(displayHead));
            setIsEditingStats((v) => !v);
          }}
          className="text-[10px] font-semibold bg-[#F5EAF3] hover:bg-[#EBDCE9] text-[#784776] px-3 py-1 rounded-full shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>{isEditingStats ? 'Close' : 'Update Growth'}</span>
        </button>
      </div>

      {/* Inline Edit Growth Measurements Form */}
      {isEditingStats ? (
        <form onSubmit={handleSaveStats} className="bg-[#FAF4F9] p-4 rounded-2xl border border-[#EFE2EE] space-y-3">
          <div className="text-xs font-bold text-[#5D415F]">Log Pediatric Measurements</div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-[#8C728C] block mb-1">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#E5D5E4] text-xs font-bold text-[#2A162B]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8C728C] block mb-1">Length (in)</label>
              <input
                type="number"
                step="0.1"
                value={lengthInput}
                onChange={(e) => setLengthInput(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#E5D5E4] text-xs font-bold text-[#2A162B]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8C728C] block mb-1">Head (in)</label>
              <input
                type="number"
                step="0.1"
                value={headInput}
                onChange={(e) => setHeadInput(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#E5D5E4] text-xs font-bold text-[#2A162B]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-full bg-[#9E4875] hover:bg-[#8B3B64] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Measurements</span>
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 bg-[#FAF4F9] p-3.5 rounded-2xl border border-[#EFE2EE]">
          <div className="text-center">
            <div className="text-[10px] font-semibold text-[#8C728C]">Weight</div>
            <div className="font-serif text-base font-bold text-[#2A162B]">{displayWeight} lbs</div>
            <div className="text-[9px] text-[#9E4875] font-bold">
              {weightPct !== null ? `${ordinal(weightPct)} %ile` : `Wk ${currentWeek} Avg`}
            </div>
          </div>
          <div className="text-center border-x border-[#E8D7E7]">
            <div className="text-[10px] font-semibold text-[#8C728C]">Length</div>
            <div className="font-serif text-base font-bold text-[#2A162B]">{displayLength} in</div>
            <div className="text-[9px] text-[#9E4875] font-bold">
              {lengthPct !== null ? `${ordinal(lengthPct)} %ile` : `Wk ${currentWeek} Avg`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-semibold text-[#8C728C]">Head Circ.</div>
            <div className="font-serif text-base font-bold text-[#2A162B]">{displayHead} in</div>
            <div className="text-[9px] text-[#9E4875] font-bold">
              {headPct !== null ? `${ordinal(headPct)} %ile` : `Wk ${currentWeek} Avg`}
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Growth History Drawer */}
      {growthMeasurements.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-[#7B5D7E] hover:text-[#2A162B] px-1 py-1 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#9E4875]" />
              <span>Growth Log History ({growthMeasurements.length})</span>
            </span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showHistory && (
            <div className="mt-1.5 space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {growthMeasurements.slice(0, 10).map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between bg-[#FAF5FA] px-3 py-2 rounded-xl border border-[#EFE2EE] text-[11px]"
                >
                  <div className="text-[#2A162B] font-semibold">
                    <span className="text-[#8C728C] mr-2">{g.measured_on}</span>
                    <span>
                      {g.weight_lbs ?? '—'} lbs • {g.length_in ?? '—'} in • {g.head_in ?? '—'} in
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteGrowthMeasurement(g.id)}
                    aria-label="Delete measurement"
                    className="text-[#A888AA] hover:text-[#C93B63] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Checklist items */}
      <div className="space-y-2">
        {milestones.map((item) => {
          const isDone = completedMilestones.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => handleToggleMilestone(item.id, isDone)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                isDone
                  ? 'bg-[#F9EFF6] border-[#EBD6E9]'
                  : 'bg-white border-[#EDE0EC] hover:bg-[#FAF4F9]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isDone
                    ? 'bg-[#9E4875] text-white'
                    : 'border-2 border-[#D8C2D8] text-transparent'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isDone ? 'text-[#875578] line-through opacity-85' : 'text-[#2A162B]'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] font-semibold text-[#876888] bg-white px-2 py-0.5 rounded-full border border-[#EBE0EC]">
                    {item.timing}
                  </span>
                </div>
                <p className="text-[11px] text-[#7E6580] mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
