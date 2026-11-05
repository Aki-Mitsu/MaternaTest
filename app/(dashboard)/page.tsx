'use client';

import React from 'react';
import { HeroGreeting } from '@/components/shared/HeroGreeting';
import { BabyQuickLogSummary } from '@/components/postpartum/BabyQuickLogSummary';
import { NextNapPredictor } from '@/components/postpartum/NextNapPredictor';
import { MaternalMoodReflection } from '@/components/postpartum/MaternalMoodReflection';
import { NewbornGrowthMilestones } from '@/components/postpartum/NewbornGrowthMilestones';
import { SerenityAudioPlayer } from '@/components/postpartum/SerenityAudioPlayer';

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Serene Hero Greeting with Lotus Header, Date Pill & Featured Cards */}
      <HeroGreeting />

      {/* 2. Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Newborn Care Intelligence & Tracking */}
        <div className="lg:col-span-7 space-y-6">
          <BabyQuickLogSummary />
          <NextNapPredictor />
          <NewbornGrowthMilestones />
        </div>

        {/* Right Column (5 cols): Maternal Mindfulness, Mood Donut & Serenity Audio */}
        <div className="lg:col-span-5 space-y-6">
          <MaternalMoodReflection />
          <SerenityAudioPlayer />
        </div>
      </div>
    </div>
  );
}
