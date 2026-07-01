import { supabase } from "@/integrations/supabase/client";
import type { OfferLetterFormState, OfferLetterRow, CustomBlock } from "./offer-letter-types";

// Cast: the generated Supabase types haven't been regenerated yet to include offer_letters.
const db = supabase as unknown as {
  from: (t: string) => any;
};

const TABLE = "offer_letters";

function rowToFormState(row: any): OfferLetterRow {
  const blocks: CustomBlock[] = Array.isArray(row.custom_blocks) ? row.custom_blocks : [];
  return { ...row, custom_blocks: blocks } as OfferLetterRow;
}

function getLocalLetters(): OfferLetterRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("local_offer_letters");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalLetters(letters: OfferLetterRow[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("local_offer_letters", JSON.stringify(letters));
  } catch (e) {}
}

export async function listLetters(): Promise<OfferLetterRow[]> {
  let onlineLetters: OfferLetterRow[] = [];
  try {
    const { data, error } = await db
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      onlineLetters = data.map(rowToFormState);
    }
  } catch (e) {
    console.warn("Could not fetch online letters:", e);
  }

  const localLetters = getLocalLetters();

  // Combine lists and sort by created_at desc
  const all = [...localLetters, ...onlineLetters];
  return all.sort((a, b) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dbVal = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dbVal - da;
  });
}

export async function getLetter(id: string): Promise<OfferLetterRow | null> {
  if (id.startsWith("local-")) {
    const localLetters = getLocalLetters();
    return localLetters.find((l) => l.id === id) ?? null;
  }

  try {
    const { data, error } = await db.from(TABLE).select("*").eq("id", id).maybeSingle();
    if (!error && data) return rowToFormState(data);
  } catch (e) {
    console.warn("Could not fetch online letter:", e);
  }

  const localLetters = getLocalLetters();
  return localLetters.find((l) => l.id === id) ?? null;
}

export async function createLetter(form: OfferLetterFormState): Promise<OfferLetterRow> {
  try {
    const { data, error } = await db.from(TABLE).insert(form).select("*").single();
    if (!error && data) {
      return rowToFormState(data);
    }
    if (error) throw error;
  } catch (e) {
    console.warn("Supabase insert failed, saving locally:", e);
  }

  // Save locally
  const newId = "local-" + Math.random().toString(36).substring(2, 11);
  const localRow: OfferLetterRow = {
    ...form,
    id: newId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as OfferLetterRow;

  const localLetters = getLocalLetters();
  localLetters.unshift(localRow);
  saveLocalLetters(localLetters);

  return localRow;
}

export async function updateLetter(
  id: string,
  form: OfferLetterFormState,
): Promise<OfferLetterRow> {
  if (id.startsWith("local-")) {
    const localLetters = getLocalLetters();
    const idx = localLetters.findIndex((l) => l.id === id);
    const updatedRow = {
      ...form,
      id,
      updated_at: new Date().toISOString(),
    } as OfferLetterRow;
    if (idx !== -1) {
      localLetters[idx] = updatedRow;
    } else {
      localLetters.push(updatedRow);
    }
    saveLocalLetters(localLetters);
    return updatedRow;
  }

  try {
    const { data, error } = await db.from(TABLE).update(form).eq("id", id).select("*").single();
    if (!error && data) {
      return rowToFormState(data);
    }
    if (error) throw error;
  } catch (e) {
    console.warn("Supabase update failed, updating locally:", e);
  }

  // Update locally as fallback
  const localLetters = getLocalLetters();
  const idx = localLetters.findIndex((l) => l.id === id);
  const updatedRow = {
    ...form,
    id,
    updated_at: new Date().toISOString(),
  } as OfferLetterRow;
  if (idx !== -1) {
    localLetters[idx] = updatedRow;
  } else {
    localLetters.push(updatedRow);
  }
  saveLocalLetters(localLetters);
  return updatedRow;
}

export async function deleteLetter(id: string): Promise<void> {
  if (id.startsWith("local-")) {
    const localLetters = getLocalLetters();
    const filtered = localLetters.filter((l) => l.id !== id);
    saveLocalLetters(filtered);
    return;
  }

  try {
    const { error } = await db.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  } catch (e) {
    console.warn("Supabase delete failed, deleting locally if exists:", e);
  }

  // Clean from local anyway
  const localLetters = getLocalLetters();
  const filtered = localLetters.filter((l) => l.id !== id);
  saveLocalLetters(filtered);
}
