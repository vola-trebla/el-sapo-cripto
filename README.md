# 🐸 El Sapo Cripto Bot

> *Sin drama, sin hype. Solo señal.*

Autonomous Telegram bot that monitors crypto news sources, filters noise, summarizes articles using AI, and posts clean digests to [@ElSapoCripto](https://t.me/ElSapoCripto) — in Spanish, for the Latin American crypto community.

---

## What it does

- Fetches crypto news from RSS feeds every 30 minutes
- Deduplicates articles to avoid reposts
- Summarizes and translates content to Spanish via Google Gemini 2.0 Flash
- Posts formatted digests to a Telegram channel
- Runs autonomously 24/7 in a Docker container

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 LTS |
| Language | TypeScript 5.x (strict) |
| LLM | Google Gemini 2.0 Flash (Vercel AI SDK) |
| Database | SQLite + Drizzle ORM |
| Telegram | Grammy |
| Validation | Zod |
| Scheduling | node-cron |
| Logging | Pino |
| Deploy | Docker + VPS |

---

## Channel

📢 Telegram: [@ElSapoCripto](https://t.me/ElSapoCripto)
🌎 Language: Spanish
🎯 Audience: Latin American crypto community

---

## Status

🚧 Under active development

---

## License

MIT