import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/init';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.route';
import challengeRoutes from './routes/challenge.route';
import projectRoutes from './routes/project.route';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB
initDatabase();

// Define routes
app.use('/api/upload', uploadRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/projects', projectRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
