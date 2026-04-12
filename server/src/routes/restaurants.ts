import { Router, Request, Response } from 'express';
import { fetchRestaurants } from '../services/overpass';

const router = Router();

/**
 * GET /api/restaurants?lat=XX&lon=XX&radius=1000
 * Returns a JSON array of nearby restaurants.
 */
router.get('/restaurants', async (req: Request, res: Response): Promise<void> => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  const radius = parseInt(req.query.radius as string, 10) || 1000;

  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({
      error: 'Missing or invalid lat/lon query parameters.',
    });
    return;
  }

  if (radius < 100 || radius > 10000) {
    res.status(400).json({
      error: 'Radius must be between 100 and 10000 meters.',
    });
    return;
  }

  try {
    const restaurants = await fetchRestaurants(lat, lon, radius);
    res.json({
      count: restaurants.length,
      restaurants,
    });
  } catch (error: any) {
    console.error('Overpass API error:', error.message);
    res.status(502).json({
      error: 'Failed to fetch restaurant data from OpenStreetMap.',
      details: error.message,
    });
  }
});

export default router;
