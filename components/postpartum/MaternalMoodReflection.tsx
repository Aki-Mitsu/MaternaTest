'use client';

import React, { useState } from 'react';
import { Check, TrendingUp, BookOpen, Trash2 } from 'lucide-react';
import { useMaterna } from '@/lib/context/MaternaContext';
import { LotusIcon } from '../shared/LotusIcon';

interface MoodOption {
  score: number;
  label: string;
  descriptor: string;
  colorBg: string;
  colorRing: string;
  colorText: string;
}

export function MaternalMoodReflection() {
  const { moodLogs, addMoodLog, deleteMoodLog } = useMaterna();
  const [selectedScore, setSelectedScore] = useState<number>(4); // Default: Grounded
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "Baby's Feeding",
    'Sleep Deprivation',
  ]);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const moodOptions: MoodOption[] = [
    {
      score: 1,
      label: 'Depleted',
      descriptor: 'Depleted & Heavy',
      colorBg: 'bg-[#985873]',
      colorRing: 'ring-[#985873]',
      colorText: 'text-white',
    },
    {
      score: 2,
      label: 'Fragile',
      descriptor: 'Fragile & Tender',
      colorBg: 'bg-[#E59A83]',
      colorRing: 'ring-[#E59A83]',
      colorText: 'text-white',
    },
    {
      score: 3,
      label: 'Balanced',
      descriptor: 'Balanced & Steady',
      colorBg: 'bg-[#B08CC7]',
      colorRing: 'ring-[#B08CC7]',
      colorText: 'text-white',
    },
    {
      score: 4,
      label: 'Grounded',
      descriptor: 'Grounded & Calm',
      colorBg: 'bg-[#7E5785]',
      colorRing: 'ring-[#7E5785]',
      colorText: 'text-white',
    },
    {
      score: 5,
      label: 'Joyful',
      descriptor: 'Joyful & Energized',
      colorBg: 'bg-[#A24874]',
      colorRing: 'ring-[#A24874]',
      colorText: 'text-white',
    },
  ];

  const availableTags = [
    "Baby's Feeding",
    'Sleep Deprivation',
    'Physical Healing',
    'Hormonal Shift',
    'Partner Support',
    'Grateful',
    'Overwhelmed',
    'Quiet Time',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveReflection = async () => {
    await addMoodLog(selectedScore, selectedTags, noteText.trim() || undefined);
    setNoteText('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const currentOption = moodOptions.find((m) => m.score === selectedScore) || moodOptions[3];

  // Dynamic Mood Statistics Computed from moodLogs
  const totalCheckIns = moodLogs.length;
  const happyCount = moodLogs.filter((m) => m.score >= 4).length;
  const calmCount = moodLogs.filter((m) => m.score === 3).length;
  const fragileCount = moodLogs.filter((m) => m.score <= 2).length;

  const happyPct = totalCheckIns > 0 ? Math.round((happyCount / totalCheckIns) * 100) : 65;
  const calmPct = totalCheckIns > 0 ? Math.round((calmCount / totalCheckIns) * 100) : 20;
  const fragilePct = totalCheckIns > 0 ? Math.max(0, 100 - happyPct - calmPct) : 15;

  const avgMoodScore =
    totalCheckIns > 0
      ? moodLogs.reduce((acc, m) => acc + m.score, 0) / totalCheckIns
      : 4.0;
  const heartWellnessPct = Math.min(100, Math.max(20, Math.round((avgMoodScore / 5) * 100)));

  // SVG Donut Circumference for r=38 is 2 * PI * 38 = 238.76
  const C = 238.76;
  const fragileDash = (fragilePct / 100) * C;
  const calmDash = (calmPct / 100) * C;
  const happyDash = (happyPct / 100) * C;

  const calmOffset = -fragileDash;
  const happyOffset = -(fragileDash + calmDash);

  const dominantLabel =
    happyPct >= calmPct && happyPct >= fragilePct
      ? 'Grounded'
      : calmPct >= fragilePct
      ? 'Balanced'
      : 'Tender';

  const recentNotes = moodLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Glowing 3D Heart Card */}
      <section className="bg-gradient-to-br from-[#FFEAE0] via-[#FCE4EF] to-[#EDE3F7] rounded-[32px] p-6 text-center border border-[#EFE1ED] shadow-[0_8px_30px_rgba(150,90,130,0.06)] relative overflow-hidden">
        {/* Soft watermark text */}
        <div className="absolute top-2 left-0 right-0 font-serif text-5xl font-bold text-[#8C5D8B]/8 pointer-events-none tracking-widest uppercase">
          Mindfulness
        </div>

        {/* 3D Glowing Heart with Liquid Wave */}
        <div className="relative z-10 py-2 flex flex-col items-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Ambient Heart Glow */}
            <div className="absolute inset-0 bg-[#E888B4]/40 rounded-full blur-xl animate-pulse"></div>

            {/* Glowing Heart SVG Shape with Gradient */}
            <svg className="w-24 h-24 drop-shadow-md" viewBox="0 0 100 90" fill="none">
              <defs>
                <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFA6C0" />
                  <stop offset="60%" stopColor="#D96E9E" />
                  <stop offset="100%" stopColor="#9E5699" />
                </linearGradient>
                <clipPath id="heartClip">
                  <path d="M50,85 C20,60 0,40 0,22 C0,9 10,0 24,0 C36,0 45,8 50,17 C55,8 64,0 76,0 C90,0 100,9 100,22 C100,40 80,60 50,85 Z" />
                </clipPath>
              </defs>

              <path
                d="M50,85 C20,60 0,40 0,22 C0,9 10,0 24,0 C36,0 45,8 50,17 C55,8 64,0 76,0 C90,0 100,9 100,22 C100,40 80,60 50,85 Z"
                fill="url(#heartGrad)"
                className="opacity-95"
              />

              {/* Liquid wave reflection scaled by wellness % */}
              <g clipPath="url(#heartClip)">
                <path
                  d={`M0,${95 - heartWellnessPct * 0.55} Q25,${85 - heartWellnessPct * 0.55} 50,${95 - heartWellnessPct * 0.55} T100,${95 - heartWellnessPct * 0.55} L100,100 L0,100 Z`}
                  fill="rgba(255,255,255,0.28)"
                />
              </g>
            </svg>

            {/* In-Heart Percentage */}
            <span className="absolute font-serif font-bold text-2xl text-white tracking-tight drop-shadow-sm select-none">
              {heartWellnessPct}%
            </span>
          </div>

          <div className="mt-3 space-y-0.5">
            <h3 className="font-serif text-xl font-bold text-[#2E182F]">
              {heartWellnessPct >= 70 ? 'Keep going!' : 'Be gentle with yourself'}
            </h3>
            <p className="text-xs text-[#876587] flex items-center justify-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-[#9E4875]" />
              <span>
                Avg {avgMoodScore.toFixed(1)}/5.0 across {totalCheckIns} reflections
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* 2. Mood Statistic Donut Card */}
      <section className="bg-white rounded-[32px] p-6 border border-[#EFE3EE] shadow-[0_8px_30px_rgba(140,80,120,0.05)] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2A162B]">Mood Statistic</h2>
            <p className="text-xs text-[#8E738E]">Live breakdown from your mood logs</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F7EFF6] text-[#7E5785] flex items-center justify-center">
            <LotusIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Circular Segmented Donut Chart */}
        <div className="flex items-center justify-center gap-6 py-2">
          {/* Donut SVG */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle cx="50" cy="50" r="38" stroke="#F4E8F2" strokeWidth="12" fill="none" />
              {/* Peach Arc: Fragile */}
              {fragilePct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#F6B89E"
                  strokeWidth="12"
                  strokeDasharray={`${fragileDash} ${C}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              {/* Lilac Arc: Calm */}
              {calmPct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#B48ECB"
                  strokeWidth="12"
                  strokeDasharray={`${calmDash} ${C}`}
                  strokeDashoffset={calmOffset}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              {/* Magenta Arc: Happy */}
              {happyPct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#9E4875"
                  strokeWidth="12"
                  strokeDasharray={`${happyDash} ${C}`}
                  strokeDashoffset={happyOffset}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>

            {/* Center Label */}
            <div className="absolute text-center select-none">
              <div className="font-serif font-black text-2xl text-[#2B172C] leading-none">
                {totalCheckIns}
              </div>
              <div className="text-[10px] font-bold text-[#8E738E] mt-0.5">{dominantLabel}</div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs font-semibold text-[#573E58]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9E4875]"></span>
              <span>Happy ({happyPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B48ECB]"></span>
              <span>Calm ({calmPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F6B89E]"></span>
              <span>Fragile ({fragilePct}%)</span>
            </div>
          </div>
        </div>

        {/* Add Note / Journal Toggle Row */}
        <div className="bg-[#FAF4F9] rounded-2xl p-4 border border-[#F0E4EF] flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#2E182F]">Journal Reflection</h4>
            <p className="text-[11px] text-[#866D88]">Capture a private thought with your check-in</p>
          </div>
          <button
            type="button"
            onClick={() => setShowNoteInput((v) => !v)}
            className="bg-[#A24874] hover:bg-[#8D3B63] text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer"
          >
            {showNoteInput ? 'Hide Note' : 'Add Note'}
          </button>
        </div>

        {/* 5-Point Expressive Scale Check-In */}
        <div className="space-y-3 pt-2 border-t border-[#F1E6F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#553C56]">Log today&apos;s emotional state:</span>
            <span className="text-xs font-bold text-[#9E4875]">{currentOption.descriptor}</span>
          </div>

          <div className="flex items-center justify-between gap-1.5 bg-[#F9F4F9] p-2 rounded-2xl border border-[#EDE0EC]">
            {moodOptions.map((option) => {
              const isSelected = selectedScore === option.score;
              return (
                <button
                  key={option.score}
                  type="button"
                  onClick={() => setSelectedScore(option.score)}
                  className={`flex-1 flex flex-col items-center py-2.5 px-1 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? `${option.colorBg} ${option.colorText} shadow-md scale-105 font-bold`
                      : 'hover:bg-white text-[#836985]'
                  }`}
                >
                  <span className="text-base select-none">
                    {option.score === 1 && '🥀'}
                    {option.score === 2 && '🌸'}
                    {option.score === 3 && '🌊'}
                    {option.score === 4 && '🪷'}
                    {option.score === 5 && '✨'}
                  </span>
                  <span className="text-[10px] mt-1 leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contextual Tags */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-[#553C56]">
            Postpartum Context Tags:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#9E4875] text-white shadow-xs'
                      : 'bg-[#F4E8F2] hover:bg-[#EBDDE9] text-[#69486F]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Note Textarea */}
        {showNoteInput && (
          <div className="space-y-2 pt-1">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="How are your recovery, emotions, and rest feeling today?"
              rows={2}
              className="w-full p-3 rounded-2xl bg-[#FAF5FA] border border-[#ECDDEC] text-xs text-[#2A162B] placeholder:text-[#A78FA8] focus:outline-hidden focus:ring-1 focus:ring-[#A24874]"
            />
          </div>
        )}

        {/* Save Action Button */}
        <button
          type="button"
          onClick={handleSaveReflection}
          disabled={isSaved}
          className="w-full py-3 rounded-full bg-[#69486F] hover:bg-[#57395D] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-80"
        >
          {isSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#FADCE8]" />
              <span>Reflection Logged &amp; Synced</span>
            </>
          ) : (
            <span>Save Mood Check-In</span>
          )}
        </button>

        {/* Recent Reflections Notes Drawer */}
        {recentNotes.length > 0 && (
          <div className="pt-3 border-t border-[#F1E6F0] space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7A5E7C]">
              <BookOpen className="w-3.5 h-3.5 text-[#9E4875]" />
              <span>Recent Check-Ins &amp; Journal Notes</span>
            </div>
            <div className="space-y-1.5">
              {recentNotes.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FAF5FA] p-2.5 rounded-xl border border-[#EFE2EE] text-[11px] text-[#4C3053]"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#8E738E] font-semibold mb-0.5">
                    <span>
                      {item.logged_date} • Score: {item.score}/5
                      {item.tags?.length ? ` • ${item.tags.slice(0, 2).join(', ')}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteMoodLog(item.id)}
                      aria-label="Delete reflection"
                      className="text-[#A888AA] hover:text-[#C93B63] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {item.notes && <p className="italic">&ldquo;{item.notes}&rdquo;</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
