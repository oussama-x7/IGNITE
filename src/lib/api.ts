import { supabase } from './supabase';
import type { Database } from './database.types';

type Company = Database['public']['Tables']['company']['Row'];
type Talk = Database['public']['Tables']['talks']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Feedback = Database['public']['Tables']['feedback']['Row'];

// --- Companies API ---

export async function getCompanies() {
  const { data, error } = await supabase.from('company').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Company[];
}

export async function createCompany(company: Omit<Database['public']['Tables']['company']['Insert'], 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('company').insert(company).select().single();
  if (error) throw error;
  return data as Company;
}

export async function deleteCompany(id: number) {
  const { error } = await supabase.from('company').delete().eq('id', id);
  if (error) throw error;
}

// --- Talks API ---

export async function getTalks() {
  const { data, error } = await supabase.from('talks').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Talk[];
}

export async function createTalk(talk: Omit<Database['public']['Tables']['talks']['Insert'], 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('talks').insert(talk).select().single();
  if (error) throw error;
  return data as Talk;
}

export async function updateTalkStatus(id: number, status: string) {
  const { error } = await supabase.from('talks').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteTalk(id: number) {
  const { error } = await supabase.from('talks').delete().eq('id', id);
  if (error) throw error;
}

// --- Users API ---

export async function getUsers() {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as User[];
}

export async function getUserById(id: any) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw error;
  return data as User;
}

export async function createUser(user: Omit<Database['public']['Tables']['users']['Insert'], 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('users').insert(user).select().single();
  if (error) throw error;
  return data as User;
}

export async function updateUser(id: any, updates: Database['public']['Tables']['users']['Update']) {
  const { error } = await supabase.from('users').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteUser(id: any) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
}

// --- Feedback API ---

// Extend the generated type with the 3 new columns
type FeedbackInsert = Omit<Database['public']['Tables']['feedback']['Insert'], 'id' | 'created_at'> & {
  email?: string;
  year_of_study?: string;
  school?: string;
};

export async function createFeedback(feedback: FeedbackInsert) {
  const { data, error } = await supabase
    .from('feedback')
    .insert(feedback as any)   // cast needed until you regenerate database.types.ts
    .select()
    .single();
  if (error) throw error;
  return data as Feedback;
}