import express from 'express';
import cors from 'cors';
import restaurantRoutes from './routes/restaurants';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', restaurantRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'restaurant-roulette-api' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Restaurant Roulette API running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/restaurants?lat=22.3193&lon=114.1694&radius=1000`);
});
