import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const context = body.context || {};
    const lastUserMessage: string = messages?.[messages.length - 1]?.content || '';

    const motherName = context.motherName || 'Sarah';
    const babyName = context.babyName || 'Leo';
    const weeksPostpartum = context.weeksPostpartum || 6;
    const wakeWindowMins = context.wakeWindowMins || 75;
    const feedsToday = context.feedsToday ?? 0;
    const diapersToday = context.diapersToday ?? 0;
    const sleepHoursToday = context.sleepHoursToday ?? 0;
    const waterGlasses = context.waterGlasses ?? 6;
    const latestMoodScore = context.latestMoodScore ?? 4;

    const lower = lastUserMessage.toLowerCase();

    // 1. Urgent clinical red-flag escalation check
    if (
      lower.includes('bleed') ||
      lower.includes('fever') ||
      lower.includes('headache') ||
      lower.includes('calf') ||
      lower.includes('clot') ||
      lower.includes('chest pain')
    ) {
      return NextResponse.json({
        role: 'assistant',
        content: `⚠️ Urgent Postpartum Health Caution for ${motherName}: If you are soaking through more than one sanitary pad per hour, passing blood clots larger than a golf ball, running a maternal fever over 100.4°F, or experiencing severe headache, vision changes, or calf pain, please contact your OB/GYN or visit labor & delivery triage immediately. How are your symptoms feeling right now?`,
      });
    }

    // 2. Wake windows, naps & sleep questions
    if (
      lower.includes('wake') ||
      lower.includes('nap') ||
      lower.includes('sleep') ||
      lower.includes('window') ||
      lower.includes('fussy') ||
      lower.includes('gas')
    ) {
      return NextResponse.json({
        role: 'assistant',
        content: `At Week ${weeksPostpartum} postpartum, ${babyName}'s optimal wake window is around ${wakeWindowMins} minutes. Today you've logged ${Number(sleepHoursToday).toFixed(1)} hours of daytime sleep. Watch for early sleepy cues (gaze aversion, red eyebrows, or yawning) about 15 minutes before the ${wakeWindowMins}-minute mark. For newborn gas or fussiness, gentle bicycle legs, upright burping for 10 minutes after feeds, and tummy-to-chest skin-to-skin help soothe the digestive tract.`,
      });
    }

    // 3. Emotional wellness, overwhelm & mental health
    if (
      lower.includes('overwhelm') ||
      lower.includes('emotional') ||
      lower.includes('cry') ||
      lower.includes('tired') ||
      lower.includes('alone') ||
      lower.includes('sad') ||
      lower.includes('anxious')
    ) {
      return NextResponse.json({
        role: 'assistant',
        content: `Take a slow, grounding breath, ${motherName}. Your most recent mood reflection was ${latestMoodScore}/5, and caring for ${babyName} at Week ${weeksPostpartum} is deeply demanding work. Please remember you don't have to carry everything alone today — try our 1-Minute Vagus Nerve Box Reset on the Mood page, and if distress feels heavy or persistent, the National Maternal Mental Health Hotline (1-833-943-5746) offers free, confidential support 24/7.`,
      });
    }

    // 4. Feeding, milk supply, hydration & lactation
    if (
      lower.includes('milk') ||
      lower.includes('feed') ||
      lower.includes('latch') ||
      lower.includes('formula') ||
      lower.includes('breast') ||
      lower.includes('supply') ||
      lower.includes('water')
    ) {
      return NextResponse.json({
        role: 'assistant',
        content: `You've logged ${feedsToday} feeds and ${diapersToday} diapers for ${babyName} so far today, along with ${waterGlasses}/10 glasses of water for yourself. At Week ${weeksPostpartum}, milk supply responds directly to frequent milk removal (8–12 feeds in 24h) and steady maternal hydration (~2.8L daily). Seeing 5–6+ wet diapers daily and hearing active swallowing are the strongest indicators that ${babyName} is getting plenty of milk!`,
      });
    }

    // 5. Physical recovery, lochia & pelvic floor
    if (
      lower.includes('pelvic') ||
      lower.includes('kegel') ||
      lower.includes('lochia') ||
      lower.includes('recover') ||
      lower.includes('exercise') ||
      lower.includes('heal')
    ) {
      return NextResponse.json({
        role: 'assistant',
        content: `At Week ${weeksPostpartum} postpartum, your body is in a key tissue-remodeling phase. Focus on coordinating gentle diaphragmatic ribcage breathing with pelvic floor relaxation on the inhale and a light lift on the exhale. Avoid heavy abdominal crunches or high-impact straining while your linea alba and pelvic ligaments restore their baseline tension.`,
      });
    }

    // Default personalized response
    return NextResponse.json({
      role: 'assistant',
      content: `I'm right here with you, ${motherName}. At Week ${weeksPostpartum} with ${babyName} (${feedsToday} feeds, ${diapersToday} diapers, and ${Number(sleepHoursToday).toFixed(1)}h sleep logged today), you are doing wonderful work. Would you like tailored guidance on ${babyName}'s ${wakeWindowMins}-minute wake windows, boosting lactation & hydration (${waterGlasses}/10 glasses today), or gentle pelvic floor recovery?`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
