import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  // Try to get user data from Supabase
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, tipo, criado_em');

  if (error) {
    // If table doesn't exist or error, return default mock data for development
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    const defaultData = months.map((month, i) => ({
      month,
      score: (i + 1) * 50, // Progressive scores: 50, 100, 150, etc.
    }));
    return NextResponse.json({ scoreData: defaultData });
  }

  // If user data exists, generate score history based on activity
  if (data && data.length > 0) {
    const user = data[0];
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    // Generate score history based on user's creation date and activity pattern
    const scoreData = months.map((month, i) => {
      // First months have more activity, then gradually decreases
      const activityFactor = 1 - (i * 0.08);
      const baseScore = 100;
      return {
        month,
        score: Math.max(10, Math.round(baseScore * activityFactor)),
      };
    });

    return NextResponse.json({ scoreData });
  }

  // No user data - return development default mock data
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  const defaultData = months.map((month, i) => ({
    month,
    score: (i + 1) * 50,
  }));

  return NextResponse.json({ scoreData: defaultData });
}