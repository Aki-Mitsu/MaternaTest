'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import { useMaterna } from '@/lib/context/MaternaContext';
import { LotusIcon } from '@/components/shared/LotusIcon';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, isInitialized, isAuthenticated } = useMaterna();

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) router.replace('/login');
    else if (profile.onboarded) router.replace('/');
  }, [isInitialized, isAuthenticated, profile.onboarded, router]);

  if (!isInitialized || !isAuthenticated || profile.onboarded) {
    return (
      <div className="min-h-screen bg-[#F8F3F7] flex items-center justify-center">
        <LotusIcon className="w-10 h-10 text-[#9E4875] animate-pulse" />
      </div>
    );
  }

  // Mounted only after the profile has loaded, so initial values come straight from the account
  return (
    <OnboardingForm
      initialFullName={profile.full_name && profile.full_name !== 'Mama' ? profile.full_name : ''}
      initialBabyName={profile.baby_name && profile.baby_name !== 'Baby' ? profile.baby_name : ''}
    />
  );
}

function OnboardingForm({
  initialFullName,
  initialBabyName,
}: {
  initialFullName: string;
  initialBabyName: string;
}) {
  const router = useRouter();
  const { updateProfile } = useMaterna();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState(initialFullName);
  const [babyName, setBabyName] = useState(initialBabyName);
  const [birthDate, setBirthDate] = useState('');
  const [todayStr, setTodayStr] = useState('');
  const [primaryFocus, setPrimaryFocus] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date();
    const t = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setTodayStr(t);
    setBirthDate((prev) => prev || t);
  }, []);

  const focusOptions = [
    'Wake Windows & Sleep',
    'Nursing & Milk Supply',
    'Pelvic Floor & Healing',
    'Emotional Wellness & Mood',
    'Serenity & Mindfulness Audio',
  ];

  const toggleFocus = (opt: string) => {
    setPrimaryFocus((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const handleContinue = () => {
    if (!fullName.trim() || !babyName.trim()) {
      setErrorMsg('Please enter your name and your baby’s name.');
      return;
    }
    if (!birthDate || birthDate > todayStr) {
      setErrorMsg('Please choose your baby’s birth date (it can’t be in the future).');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    const ok = await updateProfile({
      full_name: fullName.trim(),
      baby_name: babyName.trim(),
      baby_birth_date: birthDate,
      primary_focus: primaryFocus,
      onboarded: true,
    });
    if (!ok) {
      setErrorMsg('We could not save your profile. Please try again.');
      setIsSubmitting(false);
      return;
    }
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F3F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md sm:max-w-lg bg-white rounded-[32px] p-6 sm:p-10 border border-[#EFE3EE] shadow-[0_10px_35px_rgba(140,80,120,0.06)] space-y-6 animate-in fade-in duration-200">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-[#8E738E]">
          <div className="flex items-center gap-1.5 text-[#9E4875]">
            <LotusIcon className="w-4 h-4" />
            <span>Postpartum Onboarding</span>
          </div>
          <span>Step {step} of 2</span>
        </div>

        <div className="w-full bg-[#F3E7F2] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#9E4875] h-full transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          ></div>
        </div>

        {/* Step 1: Mother & Baby's Baseline Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A162B]">
                Start Your Journey
              </h1>
              <p className="text-xs text-[#7A617D] leading-relaxed">
                Personalize your fourth-trimester sanctuary for you and your newborn.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#5B3F5D] block mb-1">
                  What should we call you? (Mother&apos;s Name)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarah"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF5FA] border border-[#ECE0EB] text-xs text-[#2A162B] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#9E4875]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5B3F5D] block mb-1">
                  Baby&apos;s Name or Nickname
                </label>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="Leo"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF5FA] border border-[#ECE0EB] text-xs text-[#2A162B] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#9E4875]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#5B3F5D] block mb-1">
                  Baby&apos;s Birth Date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  max={todayStr}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF5FA] border border-[#ECE0EB] text-xs text-[#2A162B] font-medium focus:outline-hidden focus:ring-1 focus:ring-[#9E4875]"
                />
                <p className="text-[10px] text-[#8C728C] mt-1">
                  Used to calibrate wake-window predictions and maternal healing milestones.
                </p>
              </div>
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs text-[#9E2B4B] bg-[#FFF2F5] border border-[#FAD4DE] rounded-2xl p-3">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-3.5 rounded-full bg-[#9E4875] hover:bg-[#8B3B64] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Step 2: Primary Postpartum Focus */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A162B]">
                Your Sanctuary Focus
              </h1>
              <p className="text-xs text-[#7A617D] leading-relaxed">
                Select the areas you&apos;d like Materna to highlight on your daily dashboard.
              </p>
            </div>

            <div className="space-y-2">
              {focusOptions.map((opt) => {
                const isSelected = primaryFocus.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => toggleFocus(opt)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#F9EFF6] border-[#EBD6E9] text-[#9E4875]'
                        : 'bg-[#FAF4F9] border-[#EFE3EE] text-[#553857] hover:bg-[#F5EAF3]'
                    }`}
                  >
                    <span className="text-xs font-bold">{opt}</span>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors ${
                        isSelected ? 'bg-[#9E4875] text-white' : 'border border-[#D8C2D8]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs text-[#9E2B4B] bg-[#FFF2F5] border border-[#FAD4DE] rounded-2xl p-3">
                {errorMsg}
              </p>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-full border border-[#EBDDE9] text-xs font-bold text-[#7A617D] hover:bg-[#FAF4F9] cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-full bg-[#9E4875] hover:bg-[#8B3B64] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-80"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FADCE8]" />
                <span>Launch Postpartum Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
