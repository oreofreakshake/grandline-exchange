import { supabase} from "../supabaseClient";
import { Character, TradeType, Transaction, Holding, DEFAULT_MARKET_CONFIG } from "../../types/glx_types";
import { calculateNewPrice } from "../price";
import { getProfileById, hasEnoughBerries, updateBerriesBalance } from "./users";
import { getCharacterById, insertPricePoint, updateCharacterPrice } from "./characters";


//users holding for a character yna mean
async function getOrCreateHolding(user_id: string, character_id: string): Promise<Holding> { 
    const {data, error} = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', user_id)
    .eq('character_id', character_id)
    .single();

    if (data) return data as Holding;

    const {data: created, error: insertError} = await supabase
    .from('holdings')
    .insert({user_id: user_id, character_id: character_id, shares: 0})
    .select("*")
    .single();

    if (insertError) throw insertError;
    return created as Holding;
}


//transaction row
async function insertTransaction(user_id: string, character_id: string, shares: number, price: number, type: TradeType) {
    const {error} = await supabase
    .from('transactions')
    .insert({user_id: user_id, character_id: character_id, shares, price, type});

    if (error) throw error;
}

//update holding shares
async function updateHoldingShares(holding_id: string, new_shares: number) {
    const {error} = await supabase
    .from('holdings')
    .update({shares: new_shares})
    .eq('id', holding_id);

    if (error) throw error;
}

//buy
export async function buyShares(
    user_id: string,
    character_id: string,
    shares: number,
    config = DEFAULT_MARKET_CONFIG
) {
    if (shares < config.min_trade_shares) throw new Error(`Minimum shares to buy is ${config.min_trade_shares}`);

    if (shares > config.max_trade_shares) throw new Error(`Maximum shares to buy is ${config.max_trade_shares}`);

    const character = await getCharacterById(character_id);
    if (!character) throw new Error(`Character not found`);

    const priceBefore = Number(character.base_price);
    const cost = priceBefore * shares;

    //check if user has enough berries
    const canBuy = await hasEnoughBerries(user_id, cost);
    if (!canBuy) throw new Error("Insufficient berries");

    //deduct berries
    const newBalance = await updateBerriesBalance(user_id, -cost);

    //update character price
    const updatedPrice = calculateNewPrice(character, shares, "BUY", config);
    await updateCharacterPrice(character_id, updatedPrice);

    //log transaction
    const holding = await getOrCreateHolding(user_id, character_id);
    const newShareCount = holding.shares + shares;
    await updateHoldingShares(holding.id, newShareCount);

    //insert transaction
    await insertTransaction(user_id, character_id, shares, updatedPrice, "BUY");

    return {
        success: true,
        type: "BUY",
        character_id,
        shares,
        priceBefore,
        updatedPrice,
        newShareCount,
        berriesRemaining: newBalance,
    };
}

//sell
export async function sellShares(
    user_id: string,
    character_id: string,
    shares: number,
    config = DEFAULT_MARKET_CONFIG
){
    if (shares < config.min_trade_shares) throw new Error(`Minimum shares to sell is ${config.min_trade_shares}`);

    const character = await getCharacterById(character_id);
    if (!character) throw new Error(`Character not found`);

    const holding = await getOrCreateHolding(user_id, character_id);

    if (holding.shares < shares) throw new Error(`Not enough shares to sell`);

    const priceBefore = Number(character.base_price);
    const revenue = priceBefore * shares;

    //add berries
    const newBalance = await updateBerriesBalance(user_id, revenue);

    //update character price
    const updatedPrice = calculateNewPrice(character, shares, "SELL", config);
    await updateCharacterPrice(character_id, updatedPrice);

    //log transaction
    await insertPricePoint(character_id, updatedPrice);

    //update holding shares
    const newShareCount = holding.shares - shares;
    await updateHoldingShares(holding.id, newShareCount);

    //insert transaction
    await insertTransaction(user_id, character_id, shares, priceBefore, "SELL");

    return {
        success: true,
        type: "SELL",
        character_id,
        shares,
        priceBefore,
        updatedPrice,
        newShareCount,
        berriesRemaining: newBalance,
    };
}