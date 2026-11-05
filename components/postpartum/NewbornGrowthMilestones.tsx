'use client';

import React, { useState } from 'react';
import { Baby, CheckCircle2, Edit3, Check } from 'lucide-react';
import { useMaterna } from '@/lib/context/MaternaContext';
import { calculatePostpartumAge } from '@/lib/utils';
import { BABY_52_WEEKS } from '@/lib/data/babyMilestones52';

export function NewbornGrowthMilestones() {
  const { profile, updateProfile, toggleMilestone } = useMaterna();
  const postData = calculatePostpartumAge(profile.baby_birth_date);
  const babyName = profile.baby_name || 'Leo';
  const currentWeek = Math.min(Math.max(postData.weeks || 6, 1), 52);

  const weekReference =
    BABY_52_WEEKS.find((w) => w.week === currentWeek) || BABY_52_WEEKS[5];

  const displayWeight = profile.baby_weight_lbs ?? weekReference.weightLbs;
  const displayLength = profile.baby_length_in ?? weekReference.lengthInches;
  const displayHead = profile.baby_head_in ?? weekReference.headCircInches;

  const [isEditingStats, setIsEditingStats] = useState(false);
  const [weightInput, setWeightInput] = useState(String(displayWeight));
  const [lengthInput, setLengthInput] = useState(String(displayLength));
  const [headInput, setHeadInput] = useState(String(displayHead));

  const completedMilestones = profile.completed_milestones || ['m-1', 'm-2'];

  const milestones = [
    {
      id: 'm-1',
      title: 'First Social Smile',
      timing: 'Week 4 - 6',
      desc: 'Smiling responsively when you talk gently or smile up close.',
    },
    {
      id: 'm-2',
      title: 'Head Lifting (Tummy Time)',
      timing: 'Week 4 - 8',
      desc: 'Briefly holds head at a 45-degree angle while on belly.',
    },
    {
      id: 'm-3',
      title: 'Visual Tracking (180°)',
      timing: 'Week 6 - 8',
      desc: 'Follows colorful toys or your face smoothly from side to side.',
    },
    {
      id: 'm-4',
      title: 'Coos & Vowel Sounds',
      timing: 'Week 6 - 9',
      desc: 'Produces happy "oohs" and "aahs" when engaged.',
    },
  ];

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      baby_weight_lbs: parseFloat(weightInput) || weekReference.weightLbs,
      baby_length_in: parseFloat(lengthInput) || weekReference.lengthInches,
      baby_head_in: parseFloat(headInput) || weekReference.headCircInches,
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
              NEWBORN DEVELOPMENT
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
              {profile.baby_weight_lbs ? 'Logged' : `Wk ${currentWeek} Avg`}
            </div>
          </div>
          <div className="text-center border-x border-[#E8D7E7]">
            <div className="text-[10px] font-semibold text-[#8C728C]">Length</div>
            <div className="font-serif text-base font-bold text-[#2A162B]">{displayLength} in</div>
            <div className="text-[9px] text-[#9E4875] font-bold">
              {profile.baby_length_in ? 'Logged' : `Wk ${currentWeek} Avg`}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-semibold text-[#8C728C]">Head Circ.</div>
            <div className="font-serif text-base font-bold text-[#2A162B]">{displayHead} in</div>
            <div className="text-[9px] text-[#9E4875] font-bold">
              {profile.baby_head_in ? 'Logged' : `Wk ${currentWeek} Avg`}
            </div>
          </div>
        </div>
      )}

      {/* Checklist items */}
      <div className="space-y-2">
        {milestones.map((item) => {
          const isDone = completedMilestones.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleMilestone(item.id)}
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
