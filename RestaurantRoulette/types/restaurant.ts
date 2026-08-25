export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cuisine: string;
  address: string;
}

export interface RestaurantsResponse {
  count: number;
  restaurants: Restaurant[];
}
