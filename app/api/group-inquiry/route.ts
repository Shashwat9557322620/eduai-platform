import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, institution, studentCount, phone, message } = body;

    if (!name || !email || !institution || !studentCount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('group_inquiries').insert({
      name,
      email,
      institution,
      student_count: studentCount,
      phone: phone || null,
      message: message || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Group Inquiry Insert Error]', error);
      return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Group Inquiry Error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
