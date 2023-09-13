export interface GroupInterface {
  group_name: string;
  description: string;
  image_URL: string;
  locations: Location[];
  admin_email: string;
  active: "active" | "inactive"; 
}

interface Location {
  name: string;
  coordinates: Coordinates;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

