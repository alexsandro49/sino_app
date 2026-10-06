import { getQuotes, type Quote } from "./brapi.js";
import { getProfile, removePushTokens, type NotificationMode } from "./profile.js";
import { listWatchlist } from "./watchlist.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_BATCH_SIZE = 100;
const FLAT_THRESHOLD = 0.005;

type PushMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  data: Record<string, string>;
};

type ExpoPushTicket = {
  status: "ok" | "error";
  details?: { error?: string };
};

export type SummaryResult =
  | { status: "sent"; notifications: number }
  | { status: "skipped"; reason: "notifications_off" | "no_device" | "empty_watchlist" | "no_quotes" };

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function isMarketOpen(now: Date = new Date()): boolean {
  const brasiliaTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const weekday = brasiliaTime.getUTCDay();
  const minutes = brasiliaTime.getUTCHours() * 60 + brasiliaTime.getUTCMinutes();

  return weekday >= 1 && weekday <= 5 && minutes >= 10 * 60 && minutes < 18 * 60;
}

function tickerSentence(quote: Quote, marketOpen: boolean): string {
  const period = marketOpen ? "no pregão de hoje, até agora" : "no pregão de hoje";
  const change = percentFormatter.format(Math.abs(quote.changePercent));

  if (Math.abs(quote.changePercent) < FLAT_THRESHOLD) {
    return `${quote.symbol} ficou estável ${period}.`;
  }

  const verb = quote.changePercent > 0 ? "subiu" : "caiu";
  return `${quote.symbol} ${verb} ${change}% ${period}.`;
}

function summarySentence(quotes: Quote[], marketOpen: boolean): string {
  const rising = quotes.filter((quote) => quote.changePercent >= FLAT_THRESHOLD).length;
  const tickers = quotes.length === 1 ? "1 ticker" : `${quotes.length} tickers`;
  const risingText = rising === 0 ? "nenhum em alta" : `${rising} em alta`;
  const intro = marketOpen ? "Seu resumo parcial do pregão está pronto." : "Seu resumo do pregão está pronto.";

  return `${intro} ${tickers}, ${risingText}.`;
}

function buildMessages(mode: NotificationMode, quotes: Quote[], tokens: string[], marketOpen: boolean): PushMessage[] {
  if (mode === "summary") {
    const body = summarySentence(quotes, marketOpen);
    return tokens.map((to) => ({ to, title: "Sino", body, sound: "default", data: { screen: "home" } }));
  }

  return quotes.flatMap((quote) =>
    tokens.map((to) => ({
      to,
      title: "Sino",
      body: tickerSentence(quote, marketOpen),
      sound: "default" as const,
      data: { screen: "ticker", symbol: quote.symbol },
    })),
  );
}

async function sendPushMessages(messages: PushMessage[]): Promise<{ sent: number; invalidTokens: string[] }> {
  let sent = 0;
  const invalidTokens = new Set<string>();

  for (let start = 0; start < messages.length; start += EXPO_BATCH_SIZE) {
    const batch = messages.slice(start, start + EXPO_BATCH_SIZE);
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      throw new Error(`Expo Push respondeu ${response.status}`);
    }

    const { data } = (await response.json()) as { data: ExpoPushTicket[] };

    data.forEach((ticket, index) => {
      if (ticket.status === "ok") {
        sent += 1;
      } else if (ticket.details?.error === "DeviceNotRegistered") {
        invalidTokens.add(batch[index].to);
      }
    });
  }

  return { sent, invalidTokens: [...invalidTokens] };
}

export async function sendSummaryToUser(userId: string, brapiToken: string): Promise<SummaryResult> {
  const profile = await getProfile(userId);

  if (profile.notificationMode === "none") {
    return { status: "skipped", reason: "notifications_off" };
  }

  if (profile.pushTokens.length === 0) {
    return { status: "skipped", reason: "no_device" };
  }

  const watchlist = await listWatchlist(userId);

  if (watchlist.length === 0) {
    return { status: "skipped", reason: "empty_watchlist" };
  }

  const { quotes } = await getQuotes(
    watchlist.map((item) => item.symbol),
    brapiToken,
  );

  if (quotes.length === 0) {
    return { status: "skipped", reason: "no_quotes" };
  }

  const messages = buildMessages(profile.notificationMode, quotes, profile.pushTokens, isMarketOpen());
  const { sent, invalidTokens } = await sendPushMessages(messages);
  await removePushTokens(userId, invalidTokens);

  if (sent === 0) {
    return { status: "skipped", reason: "no_device" };
  }

  return { status: "sent", notifications: sent };
}
