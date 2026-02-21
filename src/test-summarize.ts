import 'dotenv/config';
import { fetchFeeds } from './sources/rss.js';
import { summarizeArticle } from './pipeline/summarize.js';
import { formatPost } from './pipeline/format.js';
import { sendToTelegram } from './pipeline/post.js';

const articles = await fetchFeeds();
const first = articles[0];

if (first) {
  console.log(`\n📰 Оригинал: ${first.title}\n`);
  const summary = await summarizeArticle(first);
  if (summary) {
    const post = formatPost(first, summary);
    console.log(post);
    await sendToTelegram(post);
    console.log('✅ Отправлено в канал!');
  }
}
