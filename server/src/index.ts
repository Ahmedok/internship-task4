import dotenv from 'dotenv';
dotenv.config();
console.log('DB URL:', process.env.DATABASE_URL);
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (_, res) => {
    res.json({ status: 'OK', serverTime: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
