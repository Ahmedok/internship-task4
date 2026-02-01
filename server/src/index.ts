import dotenv from 'dotenv';
dotenv.config();
console.log('DB URL:', process.env.DATABASE_URL);
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true);

app.use(cors());
app.use(express.json());

morgan.token('date', () => {
    const locale = process.env.LOG_LOCALE || 'en-US';
    const tz = process.env.LOG_TIMEZONE || 'UTC';
    return new Date().toLocaleString(locale, { timeZone: tz });
});
app.use(morgan('[:date] IP::remote-addr | :method :url | Status: :status | :response-time ms'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_, res) => {
    res.json({ status: 'OK', serverTime: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
