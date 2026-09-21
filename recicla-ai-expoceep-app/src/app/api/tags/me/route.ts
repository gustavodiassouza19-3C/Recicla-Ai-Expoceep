import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  const { data, error } = await supabase
    .from('tags')
    .select('codigo_nfc, status, id')
    .order('id', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform for dashboard compatibility
  const tagsData = (data || []).map((item: { id: number; codigo_nfc: string; status: string }) => ({
    id: item.id,
    codigo_nfc: item.codigo_nfc,
    status: item.status,
    last_used: item.id.toString(),
  }));

  return NextResponse.json({ tags: tagsData });
}