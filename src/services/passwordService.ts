import type { SupabaseClient } from '@supabase/supabase-js';

export type PasswordRow = {
  id: string;
  user_id: string;
  website: string;
  username: string;
  encrypted_password: string;
  iv_password: string;
  encrypted_notes: string | null;
  iv_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PasswordInsert = {
  website: string;
  username: string;
  encrypted_password: string;
  iv_password: string;
  encrypted_notes: string | null;
  iv_notes: string | null;
};

export type PasswordUpdate = Partial<PasswordInsert>;

export async function getPasswords(
  client: SupabaseClient,
): Promise<{ data: PasswordRow[] | null; error: Error | null }> {
  const { data, error } = await client
    .from('passwords')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as PasswordRow[], error: null };
}

export async function addPassword(
  client: SupabaseClient,
  userId: string,
  payload: PasswordInsert,
): Promise<{ data: PasswordRow | null; error: Error | null }> {
  const { data, error } = await client
    .from('passwords')
    .insert({
      user_id: userId,
      website: payload.website,
      username: payload.username,
      encrypted_password: payload.encrypted_password,
      iv_password: payload.iv_password,
      encrypted_notes: payload.encrypted_notes,
      iv_notes: payload.iv_notes,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as PasswordRow, error: null };
}

export async function updatePassword(
  client: SupabaseClient,
  id: string,
  payload: PasswordUpdate,
): Promise<{ data: PasswordRow | null; error: Error | null }> {
  const { data, error } = await client
    .from('passwords')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as PasswordRow, error: null };
}

export async function deletePassword(
  client: SupabaseClient,
  id: string,
): Promise<{ error: Error | null }> {
  const { error } = await client.from('passwords').delete().eq('id', id);

  if (error) {
    return { error: new Error(error.message) };
  }
  return { error: null };
}
