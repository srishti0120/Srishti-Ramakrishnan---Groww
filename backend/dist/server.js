import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import watchlistRoutes from './routes/watchlist.routes.js';
import marketRoutes from './routes/market.routes.js';
import exportRoutes from './routes/export.routes.js';
import { MarketDataService } from './services/market-data.service.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use('/api', watchlistRoutes);
app.use('/api', marketRoutes);
app.use('/api', exportRoutes);
// Refresh interval
setInterval(() => {
    try {
        MarketDataService.refreshAllQuotes();
    }
    catch (err) {
        console.error('Error refreshing quotes:', err);
    }
}, 15000);
// Initial seed
setTimeout(() => {
    try {
        MarketDataService.refreshAllQuotes();
        console.log('Initial market data seeded');
    }
    catch (err) {
        console.error('Error seeding data:', err);
    }
}, 1000);
app.listen(PORT, () => {
    console.log(`Pulse backend running on port ${PORT}`);
});
