import 'dotenv/config';
import cron from 'node-cron';
import { fetchFeeds } from './sources/rss.js';
import { fetchPrices, formatPricesPost } from './sources/prices.js';
import { isDuplicate, saveArticle, markAsPosted } from './pipeline/dedup.js';
import { summarizeArticle } from './pipeline/summarize.js';
import { formatPost } from './pipeline/format.js';
import { sendToTelegram } from './pipeline/post.js';
import { logger } from './utils/logger.js';
import { db } from './db/client.js';
import { sql } from 'drizzle-orm';

const KEYWORDS = [
  'bitcoin',
  'btc',
  'ethereum',
  'eth',
  'solana',
  'sol',
  'defi',
  'sec',
  'etf',
  'stablecoin',
  'regulation',
  'fed',
  'blackrock',
  'coinbase',
  'binance',
  'hack',
  'exploit',
  'pepe',
  'doge',
  'memecoin',
  'layer2',
  'l2',
  'airdrop',
];

function isRelevant(title: string): boolean {
  const lower = title.toLowerCase();
  return KEYWORDS.some((kw) => lower.includes(kw));
}

// 🌅 10:00 — утренний дайджест с курсами
async function runMorningDigest(): Promise<void> {
  logger.info('🌅 Запуск утреннего дайджеста...');

  try {
    const prices = await fetchPrices();
    await sendToTelegram(formatPricesPost(prices));

    // После курсов — топ-3 свежих новости
    await runNewsPipeline(3);
  } catch (error) {
    logger.error(`❌ Ошибка утреннего дайджеста: ${error}`);
  }
}

// 📰 Дневные прогоны — только новости
async function runNewsPipeline(limit = 5): Promise<void> {
  logger.info('📰 Запуск новостного прогона...');

  const articles = await fetchFeeds();
  const filtered = articles.filter((a) => isRelevant(a.title));

  logger.info(`🔍 После фильтра: ${filtered.length} из ${articles.length}`);

  let posted = 0;

  for (const article of filtered) {
    if (posted >= limit) break;
    if (await isDuplicate(article.url)) continue;

    await saveArticle(article);

    const summary = await summarizeArticle(article);
    if (!summary) continue;

    const post = formatPost(article, summary);
    await sendToTelegram(post);
    await markAsPosted(article.url);

    posted++;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  logger.info(`✅ Запощено: ${posted}`);
}

// 🌙 21:00 — вечерний прогон
async function runEveningDigest(): Promise<void> {
  logger.info('🌙 Запуск вечернего дайджеста...');

  try {
    // Одна фановая/необычная новость
    await runNewsPipeline(1);

    await sendToTelegram(
      `🌙 *Buenas noches mis sapos* 🐸\n\nA descansar, que mañana el mercado sigue ahí. _O no._ 😄`,
    );
  } catch (error) {
    logger.error(`❌ Ошибка вечернего дайджеста: ${error}`);
  }
}

const TIMEZONE = 'America/Montevideo';

cron.schedule('0 10 * * *', () => void runMorningDigest(), { timezone: TIMEZONE });
cron.schedule('0 12 * * *', () => void runNewsPipeline(1), { timezone: TIMEZONE });
cron.schedule('0 15 * * *', () => void runNewsPipeline(1), { timezone: TIMEZONE });
cron.schedule('0 18 * * *', () => void runNewsPipeline(1), { timezone: TIMEZONE });
cron.schedule('0 21 * * *', () => void runEveningDigest(), { timezone: TIMEZONE });
cron.schedule(
  '0 0 * * 0',
  () => {
    db.run(sql`DELETE FROM articles WHERE created_at < datetime('now', '-7 days')`);
    logger.info('🗑️ Old articles cleaned up');
  },
  { timezone: TIMEZONE },
);

logger.info('🐸 El Sapo Cripto arrancó! Esperando el horario...');
