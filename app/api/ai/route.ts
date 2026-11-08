import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_TIMEOUT_MS = 45_000;
// One of: minimal | low | medium | high
const THINKING_LEVEL = process.env.GEMINI_THINKING_LEVEL || 'low';

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;
const RATE_LIMIT_PER_MINUTE = 15;

// Simple in-memory rate limiter (per server instance). Replace with a shared store
// (e.g. Upstash/Redis or a Supabase table) if deploying to multiple serverless instances.
const rateBuckets = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(key) || []).filter((t) => now - t < 60_000);
  if (recent.length >= RATE_LIMIT_PER_MINUTE) {
    rateBuckets.set(key, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(key, recent);
  return false;
}

const RED_FLAG_PATTERN =
  /\b(bleed(ing)?|soaking|hemorrhag\w*|fever|headache|vision (change|problem)s?|blurr?y vision|calf (pain|swelling)|blood clots?|clots?|chest pain|short(ness)? of breath|seizure|infection|pus)\b/i;

const CRISIS_PATTERN =
  /(suicid|kill myself|end my life|hurt myself|harm myself|hurt (the )?baby|harm (the )?baby|don'?t want to (live|be here)|better off without me)/i;

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function cleanName(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().slice(0, 40);
  return trimmed || fallback;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function parseMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const parsed: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') continue;
    const role = (m as any).role === 'assistant' ? 'assistant' : 'user';
    const content = typeof (m as any).content === 'string' ? (m as any).content.trim() : '';
    if (!content) continue;
    parsed.push({ role, content: content.slice(0, MAX_MESSAGE_CHARS) });
  }
  // Gemini requires the conversation to begin with a user turn.
  while (parsed.length && parsed[0].role !== 'user') parsed.shift();
  return parsed;
}

function buildSystemPrompt(ctx: {
  motherName: string;
  babyName: string;
  weeksPostpartum: number;
  wakeWindowMins: number;
  feedsToday: number;
  diapersToday: number;
  sleepHoursToday: number;
  waterGlasses: number;
  latestMoodScore: number;
}): string {
  return `You are "Sanctuary", a warm, calm postpartum companion inside the Materna app. You support new mothers in the fourth trimester with questions about newborn feeding, sleep and wake windows, maternal physical recovery, hydration, and emotional wellbeing.

Style:
- Be gentle, reassuring and concise (under about 150 words). Plain language. Address the mother by first name occasionally, not every message.
- Formatting: short paragraphs separated by blank lines. For lists, put each item on its own line starting with "- ". You may use **bold** for key terms, but no headings, tables or numbered markdown.
- Use the context below only when it is relevant to her question.

Safety rules (always follow):
- You are not a doctor and cannot diagnose. Never give medication dosages or tell her to stop or start medication.
- For heavy bleeding, fever over 100.4F / 38C, severe headache or vision changes, calf pain or swelling, chest pain or trouble breathing, signs of infection, or a baby who is hard to wake, not feeding, or has a fever (especially under 3 months): tell her to contact her OB/GYN, midwife, or pediatrician or seek urgent care immediately.
- If she expresses hopelessness, thoughts of self-harm, or harming the baby, respond with compassion, encourage her to contact local emergency services or a crisis line now, and to reach out to someone she trusts.
- If you are unsure, say so and recommend her healthcare provider.
- Stay on topic. Politely decline unrelated requests.

Context about this user (from her app logs):
- Mother's first name: ${ctx.motherName}
- Baby's name: ${ctx.babyName}
- Weeks postpartum: ${ctx.weeksPostpartum}
- Recommended wake window for baby's age: about ${ctx.wakeWindowMins} minutes
- Today's logs: ${ctx.feedsToday} feeds, ${ctx.diapersToday} diapers, ${ctx.sleepHoursToday.toFixed(1)}h baby sleep
- Mother's water today: ${ctx.waterGlasses} glasses
- Mother's latest mood check-in: ${ctx.latestMoodScore}/5 (1 depleted, 5 joyful)`;
}

export async function POST(req: Request) {
  try {
    // 1. Require an authenticated user
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Backend not configured' }, { status: 503 });
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isRateLimited(user.id)) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    // 2. Validate input
    const body = await req.json().catch(() => null);
    const messages = parseMessages(body?.messages);
    if (messages.length === 0) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }
    const rawCtx = body?.context && typeof body.context === 'object' ? body.context : {};
    const ctx = {
      motherName: cleanName(rawCtx.motherName, 'Mama'),
      babyName: cleanName(rawCtx.babyName, 'baby'),
      weeksPostpartum: Math.round(clampNumber(rawCtx.weeksPostpartum, 0, 104, 0)),
      wakeWindowMins: Math.round(clampNumber(rawCtx.wakeWindowMins, 15, 300, 75)),
      feedsToday: Math.round(clampNumber(rawCtx.feedsToday, 0, 60, 0)),
      diapersToday: Math.round(clampNumber(rawCtx.diapersToday, 0, 60, 0)),
      sleepHoursToday: clampNumber(rawCtx.sleepHoursToday, 0, 24, 0),
      waterGlasses: Math.round(clampNumber(rawCtx.waterGlasses, 0, 15, 0)),
      latestMoodScore: Math.round(clampNumber(rawCtx.latestMoodScore, 1, 5, 3)),
    };

    const lastUserMessage = messages[messages.length - 1].content;

    // 3. Deterministic safety checks run BEFORE the model, so escalation never depends on the LLM
    if (CRISIS_PATTERN.test(lastUserMessage)) {
      return NextResponse.json({
        role: 'assistant',
        content: `${ctx.motherName}, I'm really glad you told me, and I'm so sorry it feels this heavy. You deserve support right now. Please contact your local emergency number or a crisis line immediately, or reach out to someone you trust and ask them to stay with you. In the US you can call or text 988, or call the National Maternal Mental Health Hotline at 1-833-943-5746 (24/7, free, confidential). If you are in immediate danger or worried you might hurt yourself or ${ctx.babyName}, please call emergency services now. You are not alone in this.`,
        safety: 'crisis',
      });
    }

    if (RED_FLAG_PATTERN.test(lastUserMessage)) {
      return NextResponse.json({
        role: 'assistant',
        content: `⚠️ Important health caution, ${ctx.motherName}: symptoms like soaking more than one pad per hour, passing clots larger than a golf ball, a fever over 100.4°F (38°C), a severe headache or vision changes, calf pain or swelling, chest pain, or trouble breathing need prompt medical attention. Please contact your OB/GYN or midwife right away, or go to urgent care or labor & delivery triage. If symptoms are severe, call emergency services. Can you tell me more about what you're feeling?`,
        safety: 'red_flag',
      });
    }

    // 4. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const baseBody = {
      systemInstruction: { parts: [{ text: buildSystemPrompt(ctx) }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    };

    const callGemini = (generationConfig: Record<string, unknown>) =>
      fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({ ...baseBody, generationConfig }),
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      });

    let geminiRes: Response;
    const startedAt = Date.now();
    try {
      // Keep reasoning effort low so replies come back quickly; the token budget leaves
      // room for the answer even if some tokens are spent on thinking.
      geminiRes = await callGemini({
        temperature: 0.7,
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingLevel: THINKING_LEVEL },
      });

      // If this model rejects the thinking setting, retry once without it.
      if (geminiRes.status === 400) {
        const errText = await geminiRes.text().catch(() => '');
        console.warn('Gemini 400 with thinkingConfig, retrying without it:', errText.slice(0, 300));
        geminiRes = await callGemini({ temperature: 0.7, maxOutputTokens: 1024 });
      }
    } catch (err) {
      const name = (err as Error)?.name;
      console.error(
        `Gemini request failed after ${Date.now() - startedAt}ms (${name}). ` +
          `Model: ${GEMINI_MODEL}. If this is a TimeoutError, check your internet/firewall access to generativelanguage.googleapis.com.`
      );
      return NextResponse.json(
        { error: name === 'TimeoutError' ? 'AI service timed out' : 'AI service unreachable' },
        { status: 504 }
      );
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => '');
      console.error('Gemini API error', geminiRes.status, errText.slice(0, 500));
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const data = await geminiRes.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || '')
      .join('')
      .trim();

    if (!text) {
      return NextResponse.json({
        role: 'assistant',
        content: `I'm here with you, ${ctx.motherName}. I wasn't able to put together a helpful answer to that. Could you rephrase it, or ask your care provider if it's a medical concern?`,
      });
    }

    return NextResponse.json({ role: 'assistant', content: text });
  } catch (error) {
    console.error('AI route error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
