import 'dotenv/config';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { type FeedArticle } from '../sources/rss.js';
import { logger } from '../utils/logger.js';

const SummarySchema = z.object({
    title: z.string().describe('Catchy title in Spanish, max 10 words'),
    summary: z.string().describe('Clear summary in Spanish, 2-3 sentences, no jargon'),
    tags: z.array(z.string()).describe('3-5 relevant hashtags in Spanish, e.g. #bitcoin #defi'),
    sentiment: z.enum(['bullish', 'bearish', 'neutral']).describe('Market sentiment of the article'),
    emoji: z.string().describe('One relevant emoji that fits the news'),
});

export type Summary = z.infer<typeof SummarySchema>;

export async function summarizeArticle(article: FeedArticle): Promise<Summary | null> {
    try {
        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: SummarySchema,
            prompt: `
        You are a crypto news editor for a Latin American Spanish-speaking audience.
        
        Summarize the following article:
        Title: ${article.title}
        Source: ${article.source}
        URL: ${article.url}
        
        Rules:
        - Write ONLY in Spanish (Latin American style, not Spain)
        - Be concise and clear, avoid technical jargon
        - Keep the tone informative but engaging
        - Never make up information not present in the title
      `,
        });

        logger.info(`🧠 Summarized: ${article.title}`);
        return object;
    } catch (error) {
        logger.error(`❌ Failed to summarize: ${article.title} — ${error}`);
        return null;
    }
}
