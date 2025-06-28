import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_project_url_here' || 
    supabaseAnonKey === 'your_supabase_anon_key_here') {
  
  console.error('❌ Supabase Configuration Error');
  console.error('Missing or invalid Supabase environment variables.');
  console.error('');
  console.error('To fix this:');
  console.error('1. Go to your Supabase project dashboard');
  console.error('2. Navigate to Settings > API');
  console.error('3. Copy your Project URL and Public anon key');
  console.error('4. Update the .env file in your project root with:');
  console.error('   VITE_SUPABASE_URL=your_actual_project_url');
  console.error('   VITE_SUPABASE_ANON_KEY=your_actual_anon_key');
  console.error('5. Restart the development server');
  console.error('');
  console.error('Current values:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'undefined');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present but invalid' : 'undefined');
  
  throw new Error('Supabase não configurado. Verifique o arquivo .env e configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY com os valores do seu projeto Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Database types
export interface DatabaseStudent {
  id: string;
  photo?: string;
  full_name: string;
  birth_date: string;
  cpf?: string;
  rg?: string;
  email: string;
  phone?: string;
  religion?: string;
  unit: 'SP' | 'BH';
  development_start_date?: string;
  internship_start_date?: string;
  magist_initiation_date?: string;
  not_entry_date?: string;
  master_magus_initiation_date?: string;
  is_founder: boolean;
  is_active: boolean;
  inactive_since?: string;
  last_activity?: string;
  is_admin: boolean;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  location: string;
  unit: string;
  photo?: string; // New field for event photo
  created_at: string;
  updated_at: string;
}

export interface DatabaseAttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  type: 'development' | 'work' | 'monthly' | 'event';
  event_id?: string;
  created_at: string;
}

export interface DatabaseEventAttendee {
  id: string;
  event_id: string;
  student_id: string;
  created_at: string;
}