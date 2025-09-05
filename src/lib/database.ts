// src/lib/database.ts
import { supabase } from "./supabaseClient";

/*
 Types (small helpers)
*/
export type UserRow = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: "student" | "working" | string | null;
  free_time?: string | null;
  created_at?: string | null;
};

export type InteractionRow = {
  id?: string;
  user_id: string;
  question: string;
  answer: string;
  timestamp?: string | null;
};

export type JournalRow = {
  id?: string;
  user_id: string;
  entry: string;
  mood?: string | null;
  created_at?: string | null;
};

/*
 Helper to get auth user id in both supabase-js v1 & v2
*/
export async function getAuthUserId(): Promise<string | null> {
  try {
    // v2: supabase.auth.getUser()
    // @ts-ignore
    if (supabase.auth && typeof (supabase.auth as any).getUser === "function") {
      // returns { data: { user } }
      const res: any = await (supabase.auth as any).getUser();
      const userId = res?.data?.user?.id;
      if (userId) return userId;
    }
  } catch (e) {
    // ignore
  }

  try {
    // v1 API fallback: supabase.auth.user()
    // @ts-ignore
    const maybeUser = (supabase.auth as any).user && (supabase.auth as any).user();
    if (maybeUser?.id) return maybeUser.id;
  } catch (e) {
    // ignore
  }

  return null;
}

/*
  createUser: create or upsert a user row
  - If id is passed it uses that id.
  - If id not passed it tries auth user id and then crypto.randomUUID() fallback.
*/
export async function createUser(params: {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  free_time?: string;
}): Promise<UserRow | null> {
  const authId = await getAuthUserId();
  const id = params.id ?? authId ?? (typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : undefined);

  if (!id) {
    throw new Error("No user id available (no auth and no UUID available).");
  }

  const payload: Partial<UserRow> = {
    id,
    name: params.name ?? null,
    email: params.email ?? null,
    role: params.role ?? null,
    free_time: params.free_time ?? null,
  };

  const { data, error } = await supabase
    .from("users")
    .upsert([payload], { onConflict: "id" });

  if (error) {
    console.error("createUser error:", error);
    return null;
  }

  if (!data) return null;
  return Array.isArray(data) ? data[0] : (data as unknown as UserRow | null);
}

/*
  saveInteraction: store one AI question + user answer
*/
export async function saveInteraction(user_id: string, question: string, answer: string) {
  const row: InteractionRow = { user_id, question, answer };
  const { data, error } = await supabase.from("ai_interactions").insert([row]).select().limit(1).single();

  if (error) {
    console.error("saveInteraction error:", error);
    return null;
  }
  return data;
}

/*
  saveJournal: store journal entry
*/
export async function saveJournal(user_id: string, entry: string, mood?: string) {
  const row: JournalRow = { user_id, entry, mood };
  const { data, error } = await supabase.from("journal_entries").insert([row]).select().limit(1).single();

  if (error) {
    console.error("saveJournal error:", error);
    return null;
  }
  return data;
}

/*
  Convenience read helpers
*/
export async function getInteractions(user_id: string, limit = 50) {
  const { data, error } = await supabase
    .from("ai_interactions")
    .select("*")
    .eq("user_id", user_id)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getInteractions error:", error);
    return [];
  }
  return data ?? [];
}

export async function getJournals(user_id: string, limit = 50) {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getJournals error:", error);
    return [];
  }
  return data ?? [];
}

/*
  Realtime subscription helper for ai_interactions:
  returns the channel object, call channel.unsubscribe() or supabase.removeChannel(channel) to clean up.
*/
export function subscribeToInteractions(user_id: string, onInsert: (row: any) => void) {
  // the filter string depends on your Supabase version; this works on modern clients
  // @ts-ignore
  const channel = supabase
    .channel(`ai_interactions_user_${user_id}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "ai_interactions", filter: `user_id=eq.${user_id}` },
      (payload: any) => {
        onInsert(payload.new);
      }
    )
    .subscribe();

  return channel;
}
