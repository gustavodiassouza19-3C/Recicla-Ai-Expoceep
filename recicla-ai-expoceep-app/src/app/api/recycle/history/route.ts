import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  const { data, error } = await supabase
    .from('reciclagens')
    .select('id, data_entrega, status, tags')
    .order('id', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform for dashboard compatibility
  const historyData = (data || []).map((item) => ({
    id: item.id,
    tag_id: item.id,
    data_entrega: item.data_entrega,
    status: item.status,
    tags: item.tags ? { codigo_nfc: item.tags, status: item.status } : undefined,
  }));

  return NextResponse.json({ historyData });
}