import 'dotenv/config';
import cron from 'node-cron';
import { fetchFeeds } from './sources/rss.js';
import { isDuplicate, saveArticle, markAsPosted } from './pipeline/dedup.js';
import { summarizeArticle } from './pipeline/summarize.js';
import { formatPost } from './pipeline/format.js';
import { sendToTelegram } from './pipeline/post.js';
import { logger } from './utils/logger.js';

async function runPipeline(): Promise<void> {
    logger.info('🐸 Запуск пайплайна...');

    const articles = await fetchFeeds();
    logger.info(`📰 Найдено статей: ${articles.length}`);

    let posted = 0;

    for (const article of articles) {
        if (await isDuplicate(article.url)) continue;

        await saveArticle(article);

        const summary = await summarizeArticle(article);
        if (!summary) continue;

        const post = formatPost(article, summary);
        await sendToTelegram(post);
        await markAsPosted(article.url);

        posted++;

        // Пауза между постами чтобы не спамить канал
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    logger.info(`✅ Пайплайн завершён. Запощено: ${posted}`);
}

// Запуск каждые 30 минут
cron.schedule('*/30 * * * *', () => {
    void runPipeline();
});

// Первый запуск сразу
void runPipeline();