import { supabase } from "@/integrations/supabase/client";
import type { OfferLetterFormState, OfferLetterRow, CustomBlock } from "./offer-letter-types";

const TABLE = "offer_letters" as const;

function rowToFormState(row: any): OfferLetterRow {
  const blocks: CustomBlock[] = Array.isArray(row.custom_blocks)
    ? row.custom_blocks
    : [];
  return { ...row, custom_blocks: blocks } as OfferLetterRow;
}

export async function listLetters(): Promise<OfferLetterRow[]> {
  // @ts-expect-error generated types not yet regenerated
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToFormState);
}

export async function getLetter(id: string): Promise<OfferLetterRow | null> {
  // @ts-expect-error generated types not yet regenerated
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToFormState(data) : null;
}

export async function createLetter(form: OfferLetterFormState): Promise<OfferLetterRow> {
  // @ts-expect-error generated types not yet regenerated
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...form, custom_blocks: form.custom_blocks as unknown as any })
    .select("*")
    .single();
  if (error) throw error;
  return rowToFormState(data);
}

export async function updateLetter(
  id: string,
  form: OfferLetterFormState,
): Promise<OfferLetterRow> {
  // @ts-expect-error generated types not yet regenerated
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...form, custom_blocks: form.custom_blocks as unknown as any })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return rowToFormState(data);
}

export async function deleteLetter(id: string): Promise<void> {
  // @ts-expect-error generated types not yet regenerated
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
