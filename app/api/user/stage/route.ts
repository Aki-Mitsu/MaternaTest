import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: Request) {
  try {
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

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const update: Record<string, unknown> = {
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (body.full_name !== undefined) {
      const name = typeof body.full_name === 'string' ? body.full_name.trim() : '';
      if (!name || name.length > 60) {
        return NextResponse.json({ error: 'full_name must be 1-60 characters' }, { status: 400 });
      }
      update.full_name = name;
    }

    if (body.baby_name !== undefined) {
      const name = typeof body.baby_name === 'string' ? body.baby_name.trim() : '';
      if (!name || name.length > 60) {
        return NextResponse.json({ error: 'baby_name must be 1-60 characters' }, { status: 400 });
      }
      update.baby_name = name;
    }

    if (body.baby_birth_date !== undefined) {
      const d = body.baby_birth_date;
      const parsed = typeof d === 'string' && DATE_RE.test(d) ? new Date(`${d}T00:00:00Z`) : null;
      const now = Date.now();
      if (
        !parsed ||
        Number.isNaN(parsed.getTime()) ||
        parsed.getTime() > now + 24 * 3600 * 1000 ||
        parsed.getTime() < now - 3 * 365 * 24 * 3600 * 1000
      ) {
        return NextResponse.json(
          { error: 'baby_birth_date must be a valid YYYY-MM-DD date within the last 3 years' },
          { status: 400 }
        );
      }
      update.baby_birth_date = d;
    }

    if (body.primary_focus !== undefined) {
      if (
        !Array.isArray(body.primary_focus) ||
        body.primary_focus.length > 10 ||
        !body.primary_focus.every((f: unknown) => typeof f === 'string' && f.length <= 60)
      ) {
        return NextResponse.json({ error: 'primary_focus must be an array of short strings' }, { status: 400 });
      }
      update.primary_focus = body.primary_focus;
    }

    if (Object.keys(update).length <= 2) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(update as never)
      .select('*')
      .single();

    if (error) {
      console.error('Profile update failed', error);
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error('Stage route error', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
