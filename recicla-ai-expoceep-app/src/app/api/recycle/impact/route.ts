import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  // Try to get impact data from conquistas table (has 'pontos' column)
  const { data, error } = await supabase
    .from('conquistas')
    .select('pontos')
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate impact from conquistas points
  const totalPoints = (data || []).reduce((sum: number, item: { pontos?: number }) => sum + (item.pontos || 0), 0);

  // Transform for dashboard compatibility
  const impactData = {
    validated_count: data?.length || 0,
    trees: Math.floor(totalPoints / 10), // approximate: 1 tree per 10 points
    water_liters: Math.floor(totalPoints * 5), // approximate: 5L per point
  };

  return NextResponse.json({ impactData });
}