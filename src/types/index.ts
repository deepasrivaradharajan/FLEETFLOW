export type UserRole = 'admin' | 'dispatcher' | 'driver';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  driverId?: string; // If user is a driver
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export type VehicleStatus = 'moving' | 'idle' | 'delayed' | 'offline';
export type VehicleType = 'Semi-Truck' | 'Box Truck' | 'Delivery Van' | 'Reefer' | 'Flatbed';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface VehicleLocation extends GeoPoint {
  address: string;
  speed: number; // km/h
  heading: number; // degrees 0-360
  lastUpdated: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  cost: number;
  notes: string;
  technician: string;
}

export interface FuelLog {
  date: string;
  level: number; // 0-100%
  consumptionLiters: number;
  costUSD: number;
}

export interface Vehicle {
  id: string; // e.g. "VH-101"
  name: string;
  plateNumber: string;
  type: VehicleType;
  capacity: string; // e.g. "18,000 kg"
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedHubId: string;
  assignedHubName: string;
  currentShipmentId?: string;
  status: VehicleStatus;
  currentLocation: VehicleLocation;
  fuelLevel: number; // 0 - 100%
  fuelCapacityLiters: number;
  batteryLevel?: number; // for EV vans
  mileageKm: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceScheduleKm: number;
  routePoints?: [number, number][]; // active simulation route
  currentRouteIndex?: number;
  fuelHistory: FuelLog[];
  maintenanceLog: MaintenanceRecord[];
  updatedAt: string;
}

export type DriverStatus = 'on_duty' | 'driving' | 'break' | 'off_duty';
export type LicenseStatus = 'valid' | 'expiring_soon' | 'expired';

export interface DriverTrip {
  shipmentId: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  date: string;
  distanceKm: number;
  status: 'completed' | 'in_progress';
  onTime: boolean;
}

export interface DriverRatingPoint {
  month: string;
  rating: number;
}

export interface Driver {
  id: string; // e.g. "DRV-201"
  name: string;
  email: string;
  phone: string;
  avatar: string;
  assignedVehicleId?: string;
  assignedVehicleName?: string;
  currentShipmentId?: string;
  status: DriverStatus;
  rating: number; // 1.0 to 5.0
  totalDeliveries: number;
  onTimeRate: number; // percentage e.g. 96
  licenseNumber: string;
  licenseCategory: string; // e.g. "CDL Class A"
  licenseExpiry: string;
  licenseStatus: LicenseStatus;
  emergencyContact: string;
  ratingHistory: DriverRatingPoint[];
  tripHistory: DriverTrip[];
  userId?: string; // Linked Firebase Auth UID
  createdAt: string;
}

export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed';
export type ShipmentPriority = 'standard' | 'express' | 'urgent';

export interface Waypoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface ShipmentTimelineEvent {
  status: ShipmentStatus | 'created' | 'loaded' | 'delayed_alert' | 'out_for_delivery';
  title: string;
  timestamp: string;
  note: string;
  location?: string;
}

export interface Shipment {
  id: string; // e.g. "SHP-8801"
  trackingNumber: string;
  customerName: string;
  customerContact: string;
  origin: Waypoint;
  destination: Waypoint;
  originHubId?: string;
  status: ShipmentStatus;
  priority: ShipmentPriority;
  packageDetails: {
    description: string;
    weightKg: number;
    pieces: number;
    isFragile: boolean;
    temperatureSensitive: boolean;
  };
  assignedVehicleId?: string;
  assignedVehicleName?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  eta: string;
  progress: number; // 0 - 100%
  routePolyline: [number, number][];
  currentLocation: GeoPoint;
  timeline: ShipmentTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export type HubType = 'Central Distribution Hub' | 'Regional Depot' | 'Fulfillment Warehouse' | 'Cross-Dock' | 'Regional Distribution Center' | 'Cross-Dock Facility';

export interface Hub {
  id: string; // e.g. "HUB-01"
  code: string;
  name: string;
  type: HubType;
  address: string;
  location: GeoPoint;
  capacityVehicles: number;
  currentVehiclesCount?: number;
  activeShipmentsCount?: number;
  contactPerson: string;
  phone: string;
  operatingHours: string;
  geofenceRadiusMeters: number;
  createdAt: string;
}

export type AlertType = 'delay' | 'geofence' | 'low_fuel' | 'maintenance' | 'license_expiry' | 'speeding';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  vehicleId?: string;
  vehicleName?: string;
  driverId?: string;
  driverName?: string;
  shipmentId?: string;
  trackingNumber?: string;
  hubId?: string;
  read: boolean;
  timestamp: string;
}

export interface CompanySettings {
  companyName: string;
  companyLogoUrl?: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  currency: string;
  distanceUnit: 'km' | 'miles';
  gpsRefreshRateSeconds: number;
  lowFuelAlertThreshold: number; // e.g. 15%
  enableGeofenceAlerts: boolean;
  enableLowFuelAlerts: boolean;
  enableDelayAlerts: boolean;
  enableMaintenanceAlerts: boolean;
  simulationActive: boolean;
}
