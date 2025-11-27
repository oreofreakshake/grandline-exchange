export type UUID = string;

export type TradeType = "BUY" | "SELL";

// core types
export interface Character {
    id: UUID;
    name: string;
    slug: string;
    image_url: string;
    description: string;

    base_price: number;
    volatility: number;
    total_shares: number;
    created_at: string;
}

export interface PricePoint {
    id: UUID;
    character_id: UUID;
    price: number;
    timestamp: string;
}

export interface Profile {
    id: UUID;
    username: string | null;
    avatar_url: string | null;


    //discord integration
    discord_id: string | null;
    discord_username: string | null;

    berries_balance: number;
    created_at: string;
}

export interface Holding {
    id: UUID; 
    user_id: UUID;
    character_id: UUID;
    shares: number;
}

export interface Transaction {
    id: UUID;
    user_id: UUID;
    character_id: UUID;
    shares: number;
    price: number;
    type: TradeType;
    timestamp: string;
}

// UI structure

export interface CharacterWithPrice extends Character {
    last_price: number;
    last_price_change: number;
    last_price_change_percentage: number;
}

export interface PortfolioPosition  {
    character: CharacterWithPrice;
    shares: number;
    average_buy_price: number;
    current_value: number;
    profit_loss: number;
    profit_loss_percentage: number;
}

export interface PortfolioSummary {
    user: Profile;
    positions: PortfolioPosition [];
    total_current_value: number;
    total_invested: number;
    total_profit_loss: number;
    total_profit_loss_percentage: number;
}

export interface LeaderboardEntry {
    user: Profile;
    net_worth: number; // berriesBalance + portfolio value
    rank: number;
}


//constants/config types for the game

export interface MarketConfig {
    min_trade_shares: number;
    max_trade_shares: number;
    trade_cooldown_seconds: number;
    starting_berries_balance: number;
    price_impact_per_share: number; // base factor used in formula
}


// import ts object
export const DEFAULT_MARKET_CONFIG: MarketConfig = {
    min_trade_shares: 1,
    max_trade_shares: 1_000,
    trade_cooldown_seconds: 10,
    starting_berries_balance: 10_000,
    price_impact_per_share: 0.02,
};
