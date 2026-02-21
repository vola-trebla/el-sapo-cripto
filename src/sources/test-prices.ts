import 'dotenv/config';
import { fetchPrices, formatPricesPost } from './prices.js';

const prices = await fetchPrices();
console.log(formatPricesPost(prices));
