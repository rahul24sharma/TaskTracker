import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import sequelize from './db.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser()); 
const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true, 
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/', taskRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  sequelize.sync()
    .then(() => console.log('Database synced successfully'))
    .catch((err) => console.error('Database sync error:', err));
});
