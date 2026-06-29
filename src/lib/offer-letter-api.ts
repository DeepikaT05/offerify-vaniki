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

export async function listLetters(): Promise<OfferLetterRow[]> {
  const { data, error } = await db
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToFormState);
}

export async function getLetter(id: string): Promise<OfferLetterRow | null> {
  const { data, error } = await db.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToFormState(data) : null;
}

export async function createLetter(form: OfferLetterFormState): Promise<OfferLetterRow> {
  const { data, error } = await db.from(TABLE).insert(form).select("*").single();
  if (error) throw error;
  return rowToFormState(data);
}

export async function updateLetter(
  id: string,
  form: OfferLetterFormState,
): Promise<OfferLetterRow> {
  const { data, error } = await db.from(TABLE).update(form).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToFormState(data);
}

export async function deleteLetter(id: string): Promise<void> {
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
