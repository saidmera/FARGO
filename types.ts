
export type ItemCategory = 'Furniture' | 'Appliances' | 'Construction' | 'Laundry' | 'Fragile' | 'Food' | 'Electronics' | 'Other';
export type UserRole = 'CLIENT' | 'DRIVER';
export type VehicleType = 'VAN' | 'TRUCK' | 'HEAVY';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export enum OrderStatus {
  IDLE = 'IDLE',
  CONFIGURING = 'CONFIGURING',
  SEARCHING = 'SEARCHING', // Client waiting for offers
  NEGOTIATING = 'NEGOTIATING', // Client reviewing offers
  ACCEPTED = 'ACCEPTED', // Matched with a driver
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED'
}

export interface DriverOffer {
  id: string;
  driverName: string;
  driverRating: number;
  vehicleType: VehicleType;
  price: number;
  etaMinutes: number;
}

export interface Order {
  id: string;
  itemType: string;
  category: ItemCategory;
  weight: number; // in kg
  weightUnit: 'kg' | 'tons';
  vehicleType: VehicleType;
  pickup: Location;
  destination: Location;
  distance: number; // in km
  suggestedPrice: number; // in DH
  status: OrderStatus;
  createdAt: number;
  offers: DriverOffer[];
  acceptedOfferId?: string;
}
