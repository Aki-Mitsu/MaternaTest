'use client';

import React, { useState, useEffect } from 'react';
import { Droplets, Baby, Moon, Plus, Check, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useMaterna } from '@/lib/context/MaternaContext';
import { formatTimeAgo } from '@/lib/utils';

export function BabyQuickLogSummary() {
  const { profile, babyLogs, addBabyLog, deleteBabyLog } = useMaterna();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'feed' | 'diaper' | 'sleep' | null>(null);
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number | undefined>(undefined);

  // Modal custom states
  const [feedType, setFeedType] = useState<'left' | 'right' | 'bottle'>('left');
  const [feedDuration, setFeedDuration] = useState<number>(20);
  const [bottleAmount, setBottleAmount] = useState<number>(120);
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'mixed'>('wet');
  const [sleepDuration, setSleepDuration] = useState<number>(90);

  const babyName = profile.baby_name || 'Leo';
  const [todayString, setTodayString] = useState<string>('');

  useEffect(() => {
    setNowMs(Date.now());
    setTodayString(new Date().toISOString().split('T')[0]);
    const interval = setInterval(() => {
      setNowMs(Date.now());
      setTodayString(new Date().toISOString().split('T')[0]);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const todayLogs = todayString
    ? babyLogs.filter((log) => log.timestamp.startsWith(todayString))
    : babyLogs;

  const feedsCount = todayLogs.filter((l) => l.log_type === 'feed').length;
  const diapersCount = todayLogs.filter((l) => l.log_type === 'diaper').length;
  const sleepHours = todayLogs
    .filter((l) => l.log_type === 'sleep')
    .reduce((acc, curr) => acc + (curr.details.duration_mins || 0) / 60, 0);

  // Most recent logs overall
  const lastFeed = babyLogs.find((l) => l.log_type === 'feed');
  const lastDiaper = babyLogs.find((l) => l.log_type === 'diaper');
  const lastSleep = babyLogs.find((l) => l.log_type === 'sleep');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickLog = (type: 'feed' | 'diaper' | 'sleep', details: any, label: string) => {
    addBabyLog(type, details);
    triggerToast(label);
  };

  const handleSaveModal = () => {
    if (activeModal === 'feed') {
      if (feedType === 'bottle') {
        addBabyLog('feed', { bottle_type: 'formula', amount_ml: bottleAmount, duration_mins: 15 });
        triggerToast(`Logged bottle feed (${bottleAmount}ml)`);
      } else {
        addBabyLog('feed', { side: feedType, duration_mins: feedDuration });
        triggerToast(`Logged nursing (${feedType} breast, ${feedDuration}m)`);
      }
    } else if (activeModal === 'diaper') {
      addBabyLog('diaper', { type: diaperType });
      triggerToast(`Logged ${diaperType} diaper`);
    } else if (activeModal === 'sleep') {
      addBabyLog('sleep', { duration_mins: sleepDuration, notes: 'Crib nap' });
      triggerToast(`Logged nap (${sleepDuration} mins)`);
    }
    setActiveModal(null);
  };

  const formatLogDescription = (log: typeof babyLogs[0]) => {
    if (log.log_type === 'feed') {
      if (log.details.side) {
        return `Nursed ${log.details.side} breast (${log.details.duration_mins || 20}m)`;
      }
      return `Bottle feed (${log.details.amount_ml || 120}ml)`;
    }
    if (log.log_type === 'diaper') {
      return `${(log.details.type || 'wet').toUpperCase()} diaper`;
    }
    return `Slept ${log.details.duration_mins || 60} mins`;
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
              BABY STATUS • {babyName}
            </div>
            <h2 className="font-serif text-xl font-bold text-[#2A162B] leading-tight">
              Quick-Log Summary
            </h2>
          </div>
        </div>

        <span className="text-[10px] font-semibold bg-[#F5EAF3] text-[#784776] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9E4875] animate-pulse"></span>
          Live Sync
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* Feeds Card */}
        <div
          onClick={() => setActiveModal('feed')}
          className="bg-[#F4EDF7] hover:bg-[#EDE1F2] rounded-2xl p-3.5 sm:p-4 border border-[#E6D6E9] flex flex-col justify-between text-left transition-all active:scale-95 group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5B3961]">
              <Droplets className="w-3.5 h-3.5 text-[#88528E]" />
              <span>Feeds</span>
            </div>
            <span className="w-5 h-5 rounded-full bg-white/90 group-hover:bg-white text-[#633B69] flex items-center justify-center shadow-2xs">
              <Plus className="w-3 h-3" />
            </span>
          </div>

          <div className="my-2">
            <div className="font-serif text-2xl font-black text-[#2A162B] tracking-tight">{feedsCount}</div>
            <div className="text-[10px] font-medium text-[#7A5B80] truncate">
              {lastFeed
                ? lastFeed.details.side
                  ? `${lastFeed.details.side === 'left' ? 'Left' : 'Right'} • ${lastFeed.details.duration_mins}m`
                  : `${lastFeed.details.amount_ml || 120}ml bottle`
                : 'Tap to log'}
            </div>
          </div>

          <div className="text-[10px] text-[#704875] border-t border-[#E6D6E9]/90 pt-1 font-medium">
            {formatTimeAgo(lastFeed?.timestamp, nowMs)}
          </div>
        </div>

        {/* Diapers Card */}
        <div
          onClick={() => setActiveModal('diaper')}
          className="bg-[#FDF1EB] hover:bg-[#FBE5DC] rounded-2xl p-3.5 sm:p-4 border border-[#F6DACF] flex flex-col justify-between text-left transition-all active:scale-95 group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#7D4934]">
              <Baby className="w-3.5 h-3.5 text-[#B86E53]" />
              <span>Diapers</span>
            </div>
            <span className="w-5 h-5 rounded-full bg-white/90 group-hover:bg-white text-[#7D4934] flex items-center justify-center shadow-2xs">
              <Plus className="w-3 h-3" />
            </span>
          </div>

          <div className="my-2">
            <div className="font-serif text-2xl font-black text-[#2A162B] tracking-tight">{diapersCount}</div>
            <div className="text-[10px] font-medium text-[#8F5943] capitalize">
              {lastDiaper ? `${lastDiaper.details.type || 'Wet'} diaper` : 'Tap to log'}
            </div>
          </div>

          <div className="text-[10px] text-[#8F5943] border-t border-[#F6DACF]/90 pt-1 font-medium">
            {formatTimeAgo(lastDiaper?.timestamp, nowMs)}
          </div>
        </div>

        {/* Sleep Card */}
        <div
          onClick={() => setActiveModal('sleep')}
          className="bg-[#F0EBF4] hover:bg-[#E7DFEC] rounded-2xl p-3.5 sm:p-4 border border-[#E0D2E5] flex flex-col justify-between text-left transition-all active:scale-95 group cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#513657]">
              <Moon className="w-3.5 h-3.5 text-[#73507B]" />
              <span>Sleep</span>
            </div>
            <span className="w-5 h-5 rounded-full bg-white/90 group-hover:bg-white text-[#513657] flex items-center justify-center shadow-2xs">
              <Plus className="w-3 h-3" />
            </span>
          </div>

          <div className="my-2">
            <div className="font-serif text-2xl font-black text-[#2A162B] tracking-tight">
              {sleepHours.toFixed(1)}h
            </div>
            <div className="text-[10px] font-medium text-[#74557A]">
              {lastSleep?.details.duration_mins ? `${lastSleep.details.duration_mins}m last nap` : 'Tap to log'}
            </div>
          </div>

          <div className="text-[10px] text-[#69486F] border-t border-[#E0D2E5]/90 pt-1 font-medium">
            {formatTimeAgo(lastSleep?.timestamp, nowMs)}
          </div>
        </div>
      </div>

      {/* Quick 1-Tap Action Row */}
      <div className="bg-[#FAF4F9] rounded-2xl p-3 border border-[#EFE3EE] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-semibold text-[#785E7B]">Quick 1-Tap:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleQuickLog('feed', { side: 'left', duration_mins: 20 }, 'Logged left breast nursing (20m)')}
            className="px-3 py-1 rounded-lg bg-white border border-[#E8DAE7] hover:bg-[#F6ECF5] text-[11px] font-semibold text-[#56385B] transition-colors cursor-pointer"
          >
            + Nurse L
          </button>
          <button
            onClick={() => handleQuickLog('feed', { side: 'right', duration_mins: 20 }, 'Logged right breast nursing (20m)')}
            className="px-3 py-1 rounded-lg bg-white border border-[#E8DAE7] hover:bg-[#F6ECF5] text-[11px] font-semibold text-[#56385B] transition-colors cursor-pointer"
          >
            + Nurse R
          </button>
          <button
            onClick={() => handleQuickLog('diaper', { type: 'wet' }, 'Logged wet diaper')}
            className="px-3 py-1 rounded-lg bg-white border border-[#E8DAE7] hover:bg-[#FAF0E9] text-[11px] font-semibold text-[#56385B] transition-colors cursor-pointer"
          >
            + Wet Diaper
          </button>
        </div>
      </div>

      {/* Collapsible Today's Activity Log Drawer */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowTimeline((v) => !v)}
          className="w-full flex items-center justify-between text-[11px] font-bold text-[#7B5D7E] hover:text-[#2A162B] px-1 py-1 cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#9E4875]" />
            <span>Recent Activity History ({todayLogs.length} today)</span>
          </span>
          {showTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTimeline && (
          <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {babyLogs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between bg-[#FAF5FA] px-3 py-2 rounded-xl border border-[#EFE2EE] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9E4875]" />
                  <span className="font-semibold text-[#2A162B]">{formatLogDescription(log)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-[#8C728C]">{formatTimeAgo(log.timestamp, nowMs)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      deleteBabyLog(log.id);
                      triggerToast('Log entry removed');
                    }}
                    aria-label="Delete log"
                    className="text-[#A888AA] hover:text-[#C93B63] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#4C3053] text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-3.5 h-3.5 text-[#FFA6C0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Log Details Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[32px] max-w-sm w-full p-6 border border-[#ECE0EC] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#F2E8F1]">
              <h3 className="font-serif font-bold text-base text-[#2A162B] capitalize">
                Log Baby {activeModal}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-xs text-[#8A6F8B] hover:text-[#2A162B] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Feed Options */}
            {activeModal === 'feed' && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 bg-[#F8F1F7] p-1 rounded-xl">
                  <button
                    onClick={() => setFeedType('left')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      feedType === 'left' ? 'bg-white shadow-2xs text-[#9E4875]' : 'text-[#7B617E]'
                    }`}
                  >
                    Left Breast
                  </button>
                  <button
                    onClick={() => setFeedType('right')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      feedType === 'right' ? 'bg-white shadow-2xs text-[#9E4875]' : 'text-[#7B617E]'
                    }`}
                  >
                    Right Breast
                  </button>
                  <button
                    onClick={() => setFeedType('bottle')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      feedType === 'bottle' ? 'bg-white shadow-2xs text-[#9E4875]' : 'text-[#7B617E]'
                    }`}
                  >
                    Bottle
                  </button>
                </div>

                {feedType === 'bottle' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#664969]">Bottle Amount (ml)</label>
                    <div className="flex items-center gap-2">
                      {[60, 90, 120, 150].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setBottleAmount(amt)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                            bottleAmount === amt
                              ? 'bg-[#69486F] text-white border-[#69486F]'
                              : 'bg-white border-[#E8D9E8] text-[#5C3E60]'
                          }`}
                        >
                          {amt}ml
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#664969]">Nursing Duration</label>
                    <div className="flex items-center gap-2">
                      {[15, 20, 25, 30].map((min) => (
                        <button
                          key={min}
                          type="button"
                          onClick={() => setFeedDuration(min)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                            feedDuration === min
                              ? 'bg-[#69486F] text-white border-[#69486F]'
                              : 'bg-white border-[#E8D9E8] text-[#5C3E60]'
                          }`}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Diaper Options */}
            {activeModal === 'diaper' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#664969]">Diaper Condition</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['wet', 'dirty', 'mixed'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDiaperType(type)}
                      className={`py-3 text-xs font-bold rounded-xl border capitalize transition-all ${
                        diaperType === type
                          ? 'bg-[#69486F] text-white border-[#69486F]'
                          : 'bg-[#FAF5FA] border-[#EBDDE9] text-[#5C3E60]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sleep Options */}
            {activeModal === 'sleep' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#664969]">Nap Duration</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[45, 60, 90, 120].map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setSleepDuration(duration)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        sleepDuration === duration
                          ? 'bg-[#69486F] text-white border-[#69486F]'
                          : 'bg-[#FAF5FA] border-[#EBDDE9] text-[#5C3E60]'
                      }`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSaveModal}
              className="w-full py-3 rounded-full bg-[#9E4875] hover:bg-[#8B3B64] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
