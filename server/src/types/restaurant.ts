export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lon: number;
  cuisine: string;
  address: string;
}

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    cuisine?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    amenity?: string;
    [key: string]: string | undefined;
  };
}

export interface OverpassResponse {
  elements: OverpassElement[];
}
