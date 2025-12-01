import { supabase } from "../supabaseClient";
import { Profile } from "../../types/glx_types";

export async function getProfileById(user_id: string): Promise<Profile | null> { 
    const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user_id)
    .single();

    if (error) return null;
    return data as Profile;
}

export async function getProfileByDiscordId(discord_id: string): Promise<Profile | null> { 
    const {data, error} = await supabase
    .from('profiles')
    .select('*')
    .eq('discord_id', discord_id)
    .single();

    if (error) return null;
    return data as Profile;
}

interface UpsertProfileType {
    id: string;
    username: string | null;
    avatar_url: string | null;

    discord_id: string | null;
    discord_username: string | null;
}

export async function upsertProfile(input: UpsertProfileType) { 
    const {data, error} = await supabase
    .from('profiles')
    .upsert(
        {
            id: input.id,
            username: input.username ?? null,
            avatar_url: input.avatar_url ?? null,
            discord_id: input.discord_id ?? null,
            discord_username: input.discord_username ?? null,
        },
        {
            onConflict: 'id',
        }
    )
    .select('*')
    .single();

    if (error) throw error;
    return data as Profile;
}


//users balance
export async function getBerriesBalance(user_id: string): Promise<number | null> { 
    const {data, error} = await supabase
    .from('profiles')
    .select('berries_balance')
    .eq('id', user_id)
    .single();

    if (error) return null;
    return Number(data.berries_balance);
}


//users transactions (adding/subtracting berries)
export async function updateBerriesBalance(user_id: string, delta: number): Promise<number> { 
    const {data, error} = await supabase.rpc("add_berries", {user_id: user_id, amount: delta});

    if (error) throw error;
    return Number(data);
}

//prevents if insufficient balance
export async function hasEnoughBerries(user_id: string, cost: number): Promise<boolean> { 
    const balance = await getBerriesBalance(user_id);

    if (balance === null) return false;
    return balance >= cost;
}