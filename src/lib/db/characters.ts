"use server";

import type {
  Character,
  CharacterWithPrice,
  PricePoint,
} from "../../types/glx_types";
import { enrichCharacterWithPrice } from "../price";
import { createClient } from "../supabase";

export async function getAllCharacters(): Promise<Character[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Character[];
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Character;
}

export async function getCharacterBySlug(
  slug: string,
): Promise<Character | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Character;
}

export async function getCharacterHistory(
  characterId: string,
  limit = 100,
): Promise<PricePoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("character_id", characterId)
    .order("timestamp", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data as PricePoint[];
}

export async function getCharacterWithHistory(
  slug: string,
  limit = 100,
): Promise<CharacterWithPrice | null> {
  const character = await getCharacterBySlug(slug);
  if (!character) return null;

  const history = await getCharacterHistory(character.id, limit);
  return enrichCharacterWithPrice(character, history);
}

export async function updateCharacterPrice(
  characterId: string,
  newprice: number,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("characters")
    .update({ base_price: newprice })
    .eq("id", characterId);

  if (error) throw error;
}

export async function insertPricePoint(
  characterId: string,
  price: number,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("price_history").insert({
    character_id: characterId,
    price: price,
    timestamp: new Date().toISOString(),
  });

  if (error) throw error;
}
