export interface Event {
  id: string;
  name: string;
  slug: string;
  active_dates: {
    start: string;
    end: string;
  };
  theme_colors: {
    primary: string;
    secondary: string;
  };
  created_at: string;
}

export interface Venue {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Tapa {
  id: string;
  venue_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
}

export interface VenueWithTapa extends Venue {
  tapas: Tapa[];
}

export interface Vote {
  id: string;
  user_id: string;
  tapa_id: string;
  stars: number;
  validated_location: boolean;
  created_at: string;
}
