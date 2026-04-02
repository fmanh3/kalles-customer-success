import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 8080;
// URL:er till våra molntjänster (hämtas från miljövariabler i Cloud Run)
const FINANCE_SERVICE_URL = process.env.FINANCE_SERVICE_URL || 'http://localhost:8081';
const HR_SERVICE_URL = process.env.HR_SERVICE_URL || 'http://localhost:8082';
const TRAFFIC_SERVICE_URL = process.env.TRAFFIC_SERVICE_URL || 'http://localhost:8083';
/**
 * CEO Dashboard Endpoint
 * Aggregerar data för VD-vyn
 */
app.get('/api/ceo/dashboard', async (req, res) => {
    try {
        console.log('[BFF] Hämtar data för VD Dashboard...');
        // 1. Hämta likviditet från Finance
        const financeRes = await axios.get(`${FINANCE_SERVICE_URL}/liquidity`).catch(e => ({ data: { error: 'Finance offline' } }));
        // 2. I en framtida version skulle vi hämta varningsflaggor från HR här
        res.json({
            timestamp: new Date().toISOString(),
            finance: financeRes.data,
            companyName: 'Kalles Buss AB'
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
/**
 * Driver Schedule Endpoint
 */
app.get('/api/driver/schedule/:driverId', async (req, res) => {
    const { driverId } = req.params;
    try {
        console.log(`[BFF] Hämtar schema för förare ${driverId}...`);
        // I en riktig app skulle vi anropa HR-tjänstens API här
        res.json({
            driverId,
            shifts: [
                { id: 'S-101', start: '08:00', end: '16:00', line: '676', status: 'SCHEDULED' }
            ]
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/health', (req, res) => res.send('BFF is healthy'));
app.listen(port, () => {
    console.log(`[BFF] Customer Success Gateway listening on port ${port}`);
});
//# sourceMappingURL=index.js.map