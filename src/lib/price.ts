import {
  type Character,
  DEFAULT_MARKET_CONFIG,
  type Holding,
  type PricePoint,
  type TradeType,
} from "@/types/glx_types";

// Helpers

const clampPrice = (p: number) => Math.max(1, Number(p));

const round = (n: number) => Math.round(n * 100) / 100;

// Price engine

export function calculateNewPrice(
  character: Character,
  shares: number,
  type: TradeType,
  config = DEFAULT_MARKET_CONFIG,
): number {
  const base = character.base_price;
  const vol = character.volatility;

  const impact = shares * vol * config.price_impact_per_share;

  let next: number;
  if (type === "BUY") next = base + impact;
  else next = base - impact;

  return clampPrice(round(next));
}

export function calculatePriceChange(
  last: number,
  prev: number,
): { diff: number; pct: number } {
  const diff = round(last - prev);
  const pct = prev === 0 ? 0 : round((diff / prev) * 100);

  return { diff, pct };
}

export function enrichCharacterWithPrice(
  character: Character,
  history: PricePoint[],
) {
  if (history.length < 2) {
    return {
      ...character,
      last_price: character.base_price,
      last_price_change: 0,
      last_price_change_percentage: 0,
    };
  }

  const last = history[history.length - 1].price;
  const prev = history[history.length - 2].price;

  const change = calculatePriceChange(last, prev);

  return {
    ...character,
    last_price: last,
    last_price_change: change.diff,
    last_price_change_percentage: change.pct,
  };
}

interface PortfolioMathParams {
  character: Character;
  holdings: Holding;
  avg_buy_price: number;
}

export function computePosition({
  character,
  holdings,
  avg_buy_price,
}: PortfolioMathParams) {
  const shares = holdings.shares;
  const last = character.base_price;

  const current_value = round(shares * last);
  const invested = round(shares * avg_buy_price);
  const profit_loss = round(current_value - invested);
  const profit_loss_percentage =
    invested === 0 ? 0 : round((profit_loss / invested) * 100);

  return {
    shares,
    avg_buy_price,
    current_value,
    invested,
    profit_loss,
    profit_loss_percentage,
  };
}

export function computePortfolioSummary(
  positions: ReturnType<typeof computePosition>[],
  berries_balance: number,
) {
  const total_current_value = round(
    positions.reduce((acc, p) => acc + p.current_value, 0),
  );
  const total_invested = round(
    positions.reduce((acc, p) => acc + p.invested, 0),
  );

  const total_profit_loss = round(total_current_value - total_invested);
  const total_profit_loss_percentage =
    total_invested === 0
      ? 0
      : round((total_profit_loss / total_invested) * 100);

  return {
    total_current_value,
    total_invested,
    total_profit_loss,
    total_profit_loss_percentage,
    net_worth: round(total_current_value + berries_balance),
  };
}
