'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, TrendingUp, Wind } from 'lucide-react';
import { useMaterna } from '@/lib/context/MaternaContext';
import { MaternalMoodReflection } from '@/components/postpartum/MaternalMoodReflection';
import { LotusIcon } from '@/components/shared/LotusIcon';

export default function MoodPage() {
  const { moodLogs } = useMaterna();
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopBreathing = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setBreathingActive(false);
    setBreathPhase('Inhale');
  };

  const startBreathing = () => {
    stopBreathing();
    setBreathingActive(true);
    let phaseIdx = 0;
    const phases: Array<'Inhale' | 'Hold' | 'Exhale'> = ['Inhale', 'Hold', 'Exhale'];
    setBreathPhase('Inhale');

    intervalRef.current = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % 3;
      setBreathPhase(phases[phaseIdx]);
    }, 4000);

    timeoutRef.current = setTimeout(() => {
      stopBreathing();
    }, 60000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const [clientNowMs, setClientNowMs] = useState<number | null>(null);

  useEffect(() => {
    setClientNowMs(Date.now());
  }, []);

  // Build dynamic 7-day trend from moodLogs
  const scoreLabels: Record<number, string> = {
    1: 'Depleted',
    2: 'Fragile',
    3: 'Balanced',
    4: 'Grounded',
    5: 'Joyful',
  };

  const baseMs = clientNowMs ?? 1729760400000;
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i;
    const d = new Date(baseMs - daysAgo * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const matchingLogs = moodLogs.filter((m) => m.logged_date === dateStr);
    const avgScore =
      matchingLogs.length > 0
        ? Math.round(matchingLogs.reduce((acc, c) => acc + c.score, 0) / matchingLogs.length)
        : 3;

    return {
      dateStr,
      day: dayName,
      score: Math.min(5, Math.max(1, avgScore)),
      label: scoreLabels[avgScore] || 'Balanced',
      hasEntry: matchingLogs.length > 0,
    };
  });

  const sevenDayAvg =
    last7Days.reduce((acc, item) => acc + item.score, 0) / last7Days.length;

  const trajectoryDescriptor =
    sevenDayAvg >= 4.2
      ? 'Joyful & Radiant'
      : sevenDayAvg >= 3.4
      ? 'Grounded & Steady'
      : sevenDayAvg >= 2.6
      ? 'Balanced Transition'
      : 'Needs Gentle Support';

  const badgeLabel =
    sevenDayAvg >= 3.5
      ? 'Healthy Equilibrium'
      : sevenDayAvg >= 2.5
      ? 'Mindful Pacing'
      : 'Extra Rest Recommended';

  // Aggregate root-cause tags dynamically across moodLogs
  const tagCountsMap: Record<string, number> = {};
  moodLogs.forEach((log) => {
    (log.tags || []).forEach((t) => {
      tagCountsMap[t] = (tagCountsMap[t] || 0) + 1;
    });
  });

  const totalLogsCount = Math.max(1, moodLogs.length);
  const sortedTags = Object.entries(tagCountsMap)
    .map(([tag, count]) => ({
      tag,
      count,
      percent: Math.min(100, Math.round((count / totalLogsCount) * 100)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const topTag = sortedTags[0]?.tag || "Baby's Feeding";
  const lowestDay = [...last7Days].sort((a, b) => a.score - b.score)[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#FFE8DE] via-[#FCE4EF] to-white rounded-[32px] p-6 sm:p-8 border border-[#EFE3EE] shadow-[0_8px_30px_rgba(140,80,120,0.06)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#8F7292] uppercase tracking-wider">
          <LotusIcon className="w-4 h-4 text-[#9E4875]" />
          <span>MATERNAL MENTAL WELLNESS</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A162B]">
          Mom&apos;s Emotional Reflections
        </h1>
        <p className="text-xs sm:text-sm text-[#7D607E] leading-relaxed max-w-xl">
          Tracking the fourth-trimester emotional landscape. Low-friction reflections designed for tired mothers, paired with gentle AI validation and serene breathing resets.
        </p>
      </section>

      {/* Responsive Grid for Mood Reflections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Main Check-in & 7-Day Trajectory */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Check-In Tracker Card */}
          <MaternalMoodReflection />

          {/* 7-Day Trend Visualizer */}
          <section className="bg-white rounded-[32px] p-6 border border-[#EFE3EE] shadow-[0_8px_30px_rgba(140,80,120,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#2A162B] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#9E4875]" />
                  <span>7-Day Mood Trajectory</span>
                </h2>
                <p className="text-[11px] text-[#8C728C]">
                  Average: {trajectoryDescriptor} ({sevenDayAvg.toFixed(1)} / 5.0)
                </p>
              </div>
              <span className="text-[10px] font-bold bg-[#F9EFF6] text-[#9E4875] border border-[#ECDDEC] px-3 py-1 rounded-full shadow-2xs">
                {badgeLabel}
              </span>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-2.5 pt-4 h-36 px-1">
              {last7Days.map((item, idx) => {
                const heightPercent = (item.score / 5) * 100;
                const barColors = [
                  '',
                  'bg-[#985873]', // 1
                  'bg-[#E59A83]', // 2
                  'bg-[#B08CC7]', // 3
                  'bg-[#7E5785]', // 4
                  'bg-[#A24874]', // 5
                ];
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-bold text-[#8E738E]">{item.score}/5</span>
                    <div
                      title={`${item.dateStr}: ${item.label} (${item.score}/5)`}
                      className={`w-full max-w-[32px] rounded-t-xl transition-all duration-500 ${barColors[item.score]} shadow-xs`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-[10px] font-semibold text-[#7D637F]">{item.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-[#69486F] bg-[#FAF4F9] p-4 rounded-2xl border border-[#EFE3EE] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#9E4875] shrink-0 mt-0.5" />
              <span>
                Your most frequent emotional influence is <strong>{topTag}</strong>. Lowest reflection occurred on{' '}
                <strong>{lowestDay.day}</strong> ({lowestDay.label}, {lowestDay.score}/5). Prioritizing a 20-minute afternoon rest block helps buffer evening fatigue.
              </span>
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Contextual Root Causes & Breathing Reset */}
        <div className="lg:col-span-5 space-y-6 sticky lg:top-20">
          {/* Contextual Root Causes Breakdown */}
          <section className="bg-white rounded-[32px] p-6 border border-[#EFE3EE] shadow-[0_8px_30px_rgba(140,80,120,0.05)] space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#2A162B]">
              Root Cause &amp; Contextual Tagging
            </h2>
            <p className="text-[11px] text-[#866D87]">
              What influenced your emotional state most frequently across {moodLogs.length} check-ins:
            </p>

            <div className="space-y-2.5">
              {sortedTags.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#3C223E]">{item.tag}</span>
                    <span className="text-[11px] text-[#8C728C]">
                      {item.count} {item.count === 1 ? 'check-in' : 'check-ins'} ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F4E8F2] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#DF6385] to-[#7B4C7A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Guided 1-Minute Reset Breathing */}
          <section className="bg-white rounded-[32px] p-6 border border-[#EFE3EE] shadow-[0_8px_30px_rgba(140,80,120,0.05)] space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#7E5785] uppercase tracking-wider">
              <Wind className="w-4 h-4 text-[#9E4875]" />
              <span>NERVOUS SYSTEM REGULATION</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#2A162B]">
              1-Minute Vagus Nerve Box Reset
            </h2>
            <p className="text-xs text-[#7A617D] max-w-xs mx-auto">
              Calms the physiological startle response caused by infant crying or postpartum fatigue.
            </p>

            <div className="py-4 flex flex-col items-center justify-center">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-1000 ${
                  breathingActive
                    ? breathPhase === 'Inhale'
                      ? 'scale-125 bg-[#F9E5EF] text-[#8C3A64] ring-8 ring-[#FADCE8]'
                      : breathPhase === 'Hold'
                      ? 'scale-110 bg-[#EFE3F7] text-[#5A3563] ring-4 ring-[#E4D1F0]'
                      : 'scale-90 bg-[#FDF0E9] text-[#7E432A] ring-2 ring-[#FBD7C7]'
                    : 'bg-[#F6ECF5] text-[#69486F]'
                }`}
              >
                <span className="font-serif text-sm font-extrabold">
                  {breathingActive ? breathPhase : 'Ready'}
                </span>
              </div>
            </div>

            <button
              onClick={breathingActive ? stopBreathing : startBreathing}
              className="w-full py-3 rounded-full bg-[#69486F] hover:bg-[#57395D] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {breathingActive ? 'Stop Exercise' : 'Start 1-Minute Breathing'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
