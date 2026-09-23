import { Vehicle, Driver, Hub, Shipment, Alert, CompanySettings } from '../types';

export const INITIAL_HUBS: Hub[] = [
  {
    id: 'HUB-CHI',
    code: 'ORD-01',
    name: 'Chicago Central Logistics Hub',
    type: 'Central Distribution Hub',
    address: '4200 S Pulaski Rd, Chicago, IL 60632',
    location: { lat: 41.8155, lng: -87.7235 },
    capacityVehicles: 35,
    contactPerson: 'Marcus Vance',
    phone: '+1 (312) 555-0142',
    operatingHours: '24/7 Operations',
    geofenceRadiusMeters: 4500,
    createdAt: '2025-01-10T08:00:00Z'
  },
  {
    id: 'HUB-DAL',
    code: 'DFW-02',
    name: 'Dallas South Intermodal Terminal',
    type: 'Regional Depot',
    address: '4800 Bonnie View Rd, Dallas, TX 75241',
    location: { lat: 32.6842, lng: -96.7645 },
    capacityVehicles: 28,
    contactPerson: 'Elena Rodriguez',
    phone: '+1 (214) 555-0198',
    operatingHours: '05:00 - 23:00',
    geofenceRadiusMeters: 3800,
    createdAt: '2025-01-15T08:00:00Z'
  },
  {
    id: 'HUB-ATL',
    code: 'ATL-03',
    name: 'Atlanta Gateway Fulfillment Depot',
    type: 'Fulfillment Warehouse',
    address: '1500 Southside Industrial Pkwy, Atlanta, GA 30354',
    location: { lat: 33.6725, lng: -84.3820 },
    capacityVehicles: 25,
    contactPerson: 'Derrick Hall',
    phone: '+1 (404) 555-0187',
    operatingHours: '06:00 - 22:00',
    geofenceRadiusMeters: 4000,
    createdAt: '2025-02-01T08:00:00Z'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'DRV-101',
    name: 'Robert "Bob" Martinez',
    email: 'robert.martinez@fleetflow.io',
    phone: '+1 (312) 555-7811',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-101',
    assignedVehicleName: 'Freightliner Cascadia #101',
    currentShipmentId: 'SHP-9001',
    status: 'driving',
    rating: 4.95,
    totalDeliveries: 412,
    onTimeRate: 98,
    licenseNumber: 'IL-CDL-882914',
    licenseCategory: 'CDL Class A (Hazmat & Tanker)',
    licenseExpiry: '2027-08-15',
    licenseStatus: 'valid',
    emergencyContact: 'Maria Martinez (+1 312 555-7812)',
    ratingHistory: [
      { month: 'Apr', rating: 4.9 },
      { month: 'May', rating: 4.92 },
      { month: 'Jun', rating: 4.95 },
      { month: 'Jul', rating: 4.94 },
      { month: 'Aug', rating: 4.96 },
      { month: 'Sep', rating: 4.95 }
    ],
    tripHistory: [
      { shipmentId: 'SHP-8990', trackingNumber: 'FF-ORD-4491', origin: 'Chicago, IL', destination: 'Indianapolis, IN', date: '2026-09-20', distanceKm: 295, status: 'completed', onTime: true },
      { shipmentId: 'SHP-8975', trackingNumber: 'FF-ORD-4472', origin: 'Rockford, IL', destination: 'Chicago, IL', date: '2026-09-18', distanceKm: 140, status: 'completed', onTime: true }
    ],
    createdAt: '2025-02-10T10:00:00Z'
  },
  {
    id: 'DRV-102',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@fleetflow.io',
    phone: '+1 (214) 555-3392',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-102',
    assignedVehicleName: 'Volvo VNL 860 #102',
    currentShipmentId: 'SHP-9002',
    status: 'driving',
    rating: 4.88,
    totalDeliveries: 340,
    onTimeRate: 96,
    licenseNumber: 'TX-CDL-552019',
    licenseCategory: 'CDL Class A',
    licenseExpiry: '2026-11-20',
    licenseStatus: 'expiring_soon',
    emergencyContact: 'David Jenkins (+1 214 555-3399)',
    ratingHistory: [
      { month: 'Apr', rating: 4.8 },
      { month: 'May', rating: 4.84 },
      { month: 'Jun', rating: 4.86 },
      { month: 'Jul', rating: 4.87 },
      { month: 'Aug', rating: 4.89 },
      { month: 'Sep', rating: 4.88 }
    ],
    tripHistory: [
      { shipmentId: 'SHP-8985', trackingNumber: 'FF-DFW-3310', origin: 'Dallas, TX', destination: 'Houston, TX', date: '2026-09-21', distanceKm: 385, status: 'completed', onTime: true }
    ],
    createdAt: '2025-03-01T10:00:00Z'
  },
  {
    id: 'DRV-103',
    name: 'Marcus Cole',
    email: 'marcus.cole@fleetflow.io',
    phone: '+1 (404) 555-6671',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-103',
    assignedVehicleName: 'Peterbilt 579 Ultra #103',
    currentShipmentId: 'SHP-9003',
    status: 'driving',
    rating: 4.91,
    totalDeliveries: 289,
    onTimeRate: 94,
    licenseNumber: 'GA-CDL-449102',
    licenseCategory: 'CDL Class A (Reefer Endorsement)',
    licenseExpiry: '2028-04-10',
    licenseStatus: 'valid',
    emergencyContact: 'Tasha Cole (+1 404 555-6679)',
    ratingHistory: [
      { month: 'Apr', rating: 4.85 },
      { month: 'May', rating: 4.88 },
      { month: 'Jun', rating: 4.90 },
      { month: 'Jul', rating: 4.92 },
      { month: 'Aug', rating: 4.90 },
      { month: 'Sep', rating: 4.91 }
    ],
    tripHistory: [
      { shipmentId: 'SHP-8971', trackingNumber: 'FF-ATL-7711', origin: 'Atlanta, GA', destination: 'Savannah, GA', date: '2026-09-19', distanceKm: 400, status: 'completed', onTime: true }
    ],
    createdAt: '2025-03-12T10:00:00Z'
  },
  {
    id: 'DRV-104',
    name: 'Alexei Ivanov',
    email: 'alexei.ivanov@fleetflow.io',
    phone: '+1 (312) 555-9122',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-104',
    assignedVehicleName: 'Kenworth T680 #104',
    currentShipmentId: 'SHP-9004',
    status: 'driving',
    rating: 4.78,
    totalDeliveries: 195,
    onTimeRate: 89,
    licenseNumber: 'IL-CDL-994120',
    licenseCategory: 'CDL Class A',
    licenseExpiry: '2027-02-18',
    licenseStatus: 'valid',
    emergencyContact: 'Olga Ivanova (+1 312 555-9128)',
    ratingHistory: [
      { month: 'Apr', rating: 4.72 },
      { month: 'May', rating: 4.75 },
      { month: 'Jun', rating: 4.76 },
      { month: 'Jul', rating: 4.78 },
      { month: 'Aug', rating: 4.79 },
      { month: 'Sep', rating: 4.78 }
    ],
    tripHistory: [
      { shipmentId: 'SHP-8960', trackingNumber: 'FF-ORD-2209', origin: 'Chicago, IL', destination: 'Milwaukee, WI', date: '2026-09-19', distanceKm: 150, status: 'completed', onTime: false }
    ],
    createdAt: '2025-04-05T10:00:00Z'
  },
  {
    id: 'DRV-105',
    name: 'Jessica Chen',
    email: 'jessica.chen@fleetflow.io',
    phone: '+1 (214) 555-1440',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-105',
    assignedVehicleName: 'Ford E-Transit Van #105',
    currentShipmentId: 'SHP-9005',
    status: 'driving',
    rating: 4.97,
    totalDeliveries: 512,
    onTimeRate: 99,
    licenseNumber: 'TX-CDL-771420',
    licenseCategory: 'CDL Class B / City Express',
    licenseExpiry: '2028-09-14',
    licenseStatus: 'valid',
    emergencyContact: 'Howard Chen (+1 214 555-1449)',
    ratingHistory: [
      { month: 'Apr', rating: 4.94 },
      { month: 'May', rating: 4.95 },
      { month: 'Jun', rating: 4.96 },
      { month: 'Jul', rating: 4.98 },
      { month: 'Aug', rating: 4.97 },
      { month: 'Sep', rating: 4.97 }
    ],
    tripHistory: [],
    createdAt: '2025-04-20T10:00:00Z'
  },
  {
    id: 'DRV-106',
    name: 'Carlos Santana-Reyes',
    email: 'carlos.reyes@fleetflow.io',
    phone: '+1 (404) 555-8819',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-106',
    assignedVehicleName: 'Isuzu NPR-HD Box Truck #106',
    status: 'on_duty',
    rating: 4.82,
    totalDeliveries: 230,
    onTimeRate: 93,
    licenseNumber: 'GA-CDL-110933',
    licenseCategory: 'CDL Class B',
    licenseExpiry: '2026-10-15',
    licenseStatus: 'expiring_soon',
    emergencyContact: 'Lucia Reyes (+1 404 555-8822)',
    ratingHistory: [
      { month: 'Apr', rating: 4.80 },
      { month: 'May', rating: 4.81 },
      { month: 'Jun', rating: 4.82 },
      { month: 'Jul', rating: 4.84 },
      { month: 'Aug', rating: 4.83 },
      { month: 'Sep', rating: 4.82 }
    ],
    tripHistory: [],
    createdAt: '2025-05-02T10:00:00Z'
  },
  {
    id: 'DRV-107',
    name: 'Tanya Washington',
    email: 'tanya.washington@fleetflow.io',
    phone: '+1 (312) 555-4428',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-107',
    assignedVehicleName: 'Mack Anthem #107',
    status: 'break',
    rating: 4.89,
    totalDeliveries: 310,
    onTimeRate: 95,
    licenseNumber: 'IL-CDL-661298',
    licenseCategory: 'CDL Class A',
    licenseExpiry: '2027-12-05',
    licenseStatus: 'valid',
    emergencyContact: 'Reggie Washington (+1 312 555-4430)',
    ratingHistory: [
      { month: 'Apr', rating: 4.86 },
      { month: 'May', rating: 4.87 },
      { month: 'Jun', rating: 4.89 },
      { month: 'Jul', rating: 4.89 },
      { month: 'Aug', rating: 4.90 },
      { month: 'Sep', rating: 4.89 }
    ],
    tripHistory: [],
    createdAt: '2025-05-18T10:00:00Z'
  },
  {
    id: 'DRV-108',
    name: 'Damon Bradley',
    email: 'damon.bradley@fleetflow.io',
    phone: '+1 (214) 555-7731',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-108',
    assignedVehicleName: 'Mercedes-Benz Sprinter Cargo #108',
    status: 'on_duty',
    rating: 4.92,
    totalDeliveries: 420,
    onTimeRate: 97,
    licenseNumber: 'TX-CDL-334190',
    licenseCategory: 'CDL Class B',
    licenseExpiry: '2028-06-25',
    licenseStatus: 'valid',
    emergencyContact: 'Monica Bradley (+1 214 555-7738)',
    ratingHistory: [
      { month: 'Apr', rating: 4.90 },
      { month: 'May', rating: 4.91 },
      { month: 'Jun', rating: 4.92 },
      { month: 'Jul', rating: 4.93 },
      { month: 'Aug', rating: 4.92 },
      { month: 'Sep', rating: 4.92 }
    ],
    tripHistory: [],
    createdAt: '2025-06-01T10:00:00Z'
  },
  {
    id: 'DRV-109',
    name: 'Liam O\'Connor',
    email: 'liam.oconnor@fleetflow.io',
    phone: '+1 (404) 555-2281',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-109',
    assignedVehicleName: 'Freightliner eCascadia (EV) #109',
    status: 'driving',
    rating: 4.87,
    totalDeliveries: 175,
    onTimeRate: 92,
    licenseNumber: 'GA-CDL-883109',
    licenseCategory: 'CDL Class A (Electric Commercial)',
    licenseExpiry: '2027-05-30',
    licenseStatus: 'valid',
    emergencyContact: 'Fiona O\'Connor (+1 404 555-2285)',
    ratingHistory: [
      { month: 'Apr', rating: 4.82 },
      { month: 'May', rating: 4.84 },
      { month: 'Jun', rating: 4.86 },
      { month: 'Jul', rating: 4.87 },
      { month: 'Aug', rating: 4.88 },
      { month: 'Sep', rating: 4.87 }
    ],
    tripHistory: [],
    createdAt: '2025-06-15T10:00:00Z'
  },
  {
    id: 'DRV-110',
    name: 'Amina Mansoor',
    email: 'amina.mansoor@fleetflow.io',
    phone: '+1 (312) 555-6610',
    avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed28a0e5?w=150&auto=format&fit=crop&q=80',
    assignedVehicleId: 'VH-110',
    assignedVehicleName: 'International LT625 #110',
    status: 'off_duty',
    rating: 4.93,
    totalDeliveries: 280,
    onTimeRate: 96,
    licenseNumber: 'IL-CDL-119482',
    licenseCategory: 'CDL Class A',
    licenseExpiry: '2027-10-18',
    licenseStatus: 'valid',
    emergencyContact: 'Samir Mansoor (+1 312 555-6619)',
    ratingHistory: [
      { month: 'Apr', rating: 4.90 },
      { month: 'May', rating: 4.92 },
      { month: 'Jun', rating: 4.93 },
      { month: 'Jul', rating: 4.94 },
      { month: 'Aug', rating: 4.93 },
      { month: 'Sep', rating: 4.93 }
    ],
    tripHistory: [],
    createdAt: '2025-07-01T10:00:00Z'
  }
];

// High fidelity waypoints for active GPS simulation
// Route 1: Chicago (IL) -> Indianapolis (IN) -> Louisville (KY)
export const ROUTE_CHICAGO_INDY: [number, number][] = [
  [41.8155, -87.7235], // Chicago Hub
  [41.7482, -87.6189],
  [41.5833, -87.3364], // Gary IN
  [41.4285, -87.2710],
  [41.1345, -87.1682],
  [40.7511, -86.9942],
  [40.4173, -86.8753], // Lafayette IN
  [40.0984, -86.5312], // Lebanon
  [39.8821, -86.3015],
  [39.7684, -86.1581], // Indianapolis
  [39.5102, -86.0592],
  [39.2014, -85.9214], // Columbus IN
  [38.7499, -85.8012],
  [38.2527, -85.7585]  // Louisville KY
];

// Route 2: Dallas (TX) -> Austin (TX) -> San Antonio (TX)
export const ROUTE_DALLAS_AUSTIN: [number, number][] = [
  [32.6842, -96.7645], // Dallas Hub
  [32.4821, -96.8621],
  [32.2215, -97.0512], // Hillsboro
  [31.8491, -97.1082],
  [31.5493, -97.1467], // Waco
  [31.2501, -97.3482], // Temple
  [30.8984, -97.5312],
  [30.6384, -97.6782], // Georgetown
  [30.5083, -97.6789], // Round Rock
  [30.2672, -97.7431], // Austin
  [29.9821, -97.8781], // San Marcos
  [29.7030, -98.1245], // New Braunfels
  [29.4241, -98.4936]  // San Antonio
];

// Route 3: Atlanta (GA) -> Charlotte (NC) -> Raleigh (NC)
export const ROUTE_ATLANTA_CHARLOTTE: [number, number][] = [
  [33.6725, -84.3820], // Atlanta Hub
  [33.8821, -84.2210],
  [34.1205, -83.9812], // Suwanee / Buford
  [34.3412, -83.7121],
  [34.5821, -83.3102], // Toccoa
  [34.6834, -82.8374], // Anderson SC
  [34.8526, -82.3940], // Greenville SC
  [34.9496, -81.9320], // Spartanburg SC
  [35.0521, -81.4215], // Gaffney SC
  [35.2271, -80.8431], // Charlotte NC
  [35.5921, -80.4412], // Salisbury NC
  [35.9940, -78.8986]  // Durham / Raleigh NC
];

// Route 4: Chicago (IL) -> Detroit (MI)
export const ROUTE_CHICAGO_DETROIT: [number, number][] = [
  [41.8155, -87.7235], // Chicago Hub
  [41.6821, -87.4512],
  [41.7123, -86.8921], // Michigan City
  [41.8312, -86.2514], // Niles MI
  [42.2917, -85.5872], // Kalamazoo
  [42.3211, -85.1797], // Battle Creek
  [42.2458, -84.4013], // Jackson MI
  [42.2808, -83.7430], // Ann Arbor MI
  [42.3314, -83.0458]  // Detroit MI
];

// Route 5: Dallas (TX) -> Houston (TX)
export const ROUTE_DALLAS_HOUSTON: [number, number][] = [
  [32.6842, -96.7645], // Dallas Hub
  [32.3412, -96.6120], // Ennis
  [32.0912, -96.4678], // Corsicana
  [31.6214, -96.1601], // Fairfield
  [31.3120, -95.9812], // Centerville
  [30.9512, -95.7601], // Madisonville
  [30.7235, -95.5508], // Huntsville
  [30.3119, -95.4561], // Conroe
  [30.0121, -95.4210], // Spring
  [29.7604, -95.3698]  // Houston TX
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'VH-101',
    name: 'Freightliner Cascadia #101',
    plateNumber: 'IL-7749-X',
    type: 'Semi-Truck',
    capacity: '24,000 kg (53ft Dry Van)',
    assignedDriverId: 'DRV-101',
    assignedDriverName: 'Robert "Bob" Martinez',
    assignedHubId: 'HUB-CHI',
    assignedHubName: 'Chicago Central Logistics Hub',
    currentShipmentId: 'SHP-9001',
    status: 'moving',
    currentLocation: {
      lat: ROUTE_CHICAGO_INDY[3][0],
      lng: ROUTE_CHICAGO_INDY[3][1],
      address: 'I-65 Southbound near Crown Point, IN',
      speed: 88,
      heading: 155,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 68,
    fuelCapacityLiters: 450,
    mileageKm: 142850,
    lastMaintenanceDate: '2026-08-14',
    nextMaintenanceDate: '2026-11-14',
    maintenanceScheduleKm: 25000,
    routePoints: ROUTE_CHICAGO_INDY,
    currentRouteIndex: 3,
    fuelHistory: [
      { date: '2026-09-17', level: 95, consumptionLiters: 90, costUSD: 112 },
      { date: '2026-09-18', level: 75, consumptionLiters: 88, costUSD: 109 },
      { date: '2026-09-19', level: 50, consumptionLiters: 92, costUSD: 114 },
      { date: '2026-09-20', level: 90, consumptionLiters: 85, costUSD: 106 },
      { date: '2026-09-21', level: 82, consumptionLiters: 94, costUSD: 117 },
      { date: '2026-09-22', level: 74, consumptionLiters: 89, costUSD: 110 },
      { date: '2026-09-23', level: 68, consumptionLiters: 91, costUSD: 113 }
    ],
    maintenanceLog: [
      { id: 'MT-401', date: '2026-08-14', type: 'Preventive PM-B & Brake Inspection', cost: 740, notes: 'Replaced rear brake pads, flushed transmission fluid', technician: 'Midwest Fleet Services' },
      { id: 'MT-380', date: '2026-05-10', type: 'Oil & Filter Change + Tire Rotation', cost: 380, notes: 'Rotated steer and drive tires', technician: 'In-House Depot Tech' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VH-102',
    name: 'Volvo VNL 860 #102',
    plateNumber: 'TX-9902-TR',
    type: 'Semi-Truck',
    capacity: '22,500 kg (High-Cube Dry Van)',
    assignedDriverId: 'DRV-102',
    assignedDriverName: 'Sarah Jenkins',
    assignedHubId: 'HUB-DAL',
    assignedHubName: 'Dallas South Intermodal Terminal',
    currentShipmentId: 'SHP-9002',
    status: 'moving',
    currentLocation: {
      lat: ROUTE_DALLAS_AUSTIN[4][0],
      lng: ROUTE_DALLAS_AUSTIN[4][1],
      address: 'I-35 Southbound near Waco, TX',
      speed: 95,
      heading: 182,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 42,
    fuelCapacityLiters: 480,
    mileageKm: 98400,
    lastMaintenanceDate: '2026-07-28',
    nextMaintenanceDate: '2026-10-28',
    maintenanceScheduleKm: 25000,
    routePoints: ROUTE_DALLAS_AUSTIN,
    currentRouteIndex: 4,
    fuelHistory: [
      { date: '2026-09-17', level: 88, consumptionLiters: 95, costUSD: 118 },
      { date: '2026-09-18', level: 65, consumptionLiters: 98, costUSD: 122 },
      { date: '2026-09-19', level: 92, consumptionLiters: 90, costUSD: 112 },
      { date: '2026-09-20', level: 71, consumptionLiters: 93, costUSD: 116 },
      { date: '2026-09-21', level: 56, consumptionLiters: 91, costUSD: 113 },
      { date: '2026-09-22', level: 48, consumptionLiters: 87, costUSD: 108 },
      { date: '2026-09-23', level: 42, consumptionLiters: 89, costUSD: 111 }
    ],
    maintenanceLog: [
      { id: 'MT-398', date: '2026-07-28', type: 'DPF Cleaning & Turbo Inspection', cost: 1150, notes: 'DPF filter cleaned and software updated', technician: 'Lonestar Volvo Truck Center' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VH-103',
    name: 'Peterbilt 579 Ultra #103',
    plateNumber: 'GA-4481-PB',
    type: 'Reefer',
    capacity: '20,000 kg (Refrigerated -20°C to +15°C)',
    assignedDriverId: 'DRV-103',
    assignedDriverName: 'Marcus Cole',
    assignedHubId: 'HUB-ATL',
    assignedHubName: 'Atlanta Gateway Fulfillment Depot',
    currentShipmentId: 'SHP-9003',
    status: 'moving',
    currentLocation: {
      lat: ROUTE_ATLANTA_CHARLOTTE[5][0],
      lng: ROUTE_ATLANTA_CHARLOTTE[5][1],
      address: 'I-85 Northbound near Anderson, SC',
      speed: 92,
      heading: 42,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 81,
    fuelCapacityLiters: 500,
    mileageKm: 182300,
    lastMaintenanceDate: '2026-09-02',
    nextMaintenanceDate: '2026-12-02',
    maintenanceScheduleKm: 25000,
    routePoints: ROUTE_ATLANTA_CHARLOTTE,
    currentRouteIndex: 5,
    fuelHistory: [
      { date: '2026-09-17', level: 75, consumptionLiters: 110, costUSD: 137 },
      { date: '2026-09-18', level: 55, consumptionLiters: 108, costUSD: 135 },
      { date: '2026-09-19', level: 95, consumptionLiters: 112, costUSD: 140 },
      { date: '2026-09-20', level: 86, consumptionLiters: 105, costUSD: 131 },
      { date: '2026-09-21', level: 94, consumptionLiters: 109, costUSD: 136 },
      { date: '2026-09-22', level: 85, consumptionLiters: 102, costUSD: 127 },
      { date: '2026-09-23', level: 81, consumptionLiters: 106, costUSD: 132 }
    ],
    maintenanceLog: [
      { id: 'MT-415', date: '2026-09-02', type: 'Thermo King Reefer Unit Service', cost: 890, notes: 'Refrigerant recharge and compressor belt replacement', technician: 'Thermo King Atlanta' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VH-104',
    name: 'Kenworth T680 #104',
    plateNumber: 'IL-5519-KW',
    type: 'Semi-Truck',
    capacity: '23,000 kg',
    assignedDriverId: 'DRV-104',
    assignedDriverName: 'Alexei Ivanov',
    assignedHubId: 'HUB-CHI',
    assignedHubName: 'Chicago Central Logistics Hub',
    currentShipmentId: 'SHP-9004',
    status: 'delayed',
    currentLocation: {
      lat: ROUTE_CHICAGO_DETROIT[3][0],
      lng: ROUTE_CHICAGO_DETROIT[3][1],
      address: 'I-94 Eastbound near Kalamazoo, MI (Heavy Congestion)',
      speed: 18,
      heading: 75,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 14, // Under 15% -> Trigger low fuel alert
    fuelCapacityLiters: 420,
    mileageKm: 215400,
    lastMaintenanceDate: '2026-06-15',
    nextMaintenanceDate: '2026-09-15',
    maintenanceScheduleKm: 20000,
    routePoints: ROUTE_CHICAGO_DETROIT,
    currentRouteIndex: 3,
    fuelHistory: [
      { date: '2026-09-17', level: 60, consumptionLiters: 92, costUSD: 115 },
      { date: '2026-09-18', level: 42, consumptionLiters: 95, costUSD: 118 },
      { date: '2026-09-19', level: 80, consumptionLiters: 89, costUSD: 111 },
      { date: '2026-09-20', level: 55, consumptionLiters: 96, costUSD: 120 },
      { date: '2026-09-21', level: 32, consumptionLiters: 90, costUSD: 112 },
      { date: '2026-09-22', level: 22, consumptionLiters: 88, costUSD: 110 },
      { date: '2026-09-23', level: 14, consumptionLiters: 85, costUSD: 106 }
    ],
    maintenanceLog: [
      { id: 'MT-362', date: '2026-06-15', type: 'Full Axle Alignment and Shock Replacement', cost: 1250, notes: 'Replaced steer shocks and verified toe-in', technician: 'Great Lakes Peterbilt/Kenworth' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VH-105',
    name: 'Ford E-Transit Electric Van #105',
    plateNumber: 'TX-3301-EV',
    type: 'Delivery Van',
    capacity: '1,800 kg / 14 m³ Cargo Space',
    assignedDriverId: 'DRV-105',
    assignedDriverName: 'Jessica Chen',
    assignedHubId: 'HUB-DAL',
    assignedHubName: 'Dallas South Intermodal Terminal',
    currentShipmentId: 'SHP-9005',
    status: 'moving',
    currentLocation: {
      lat: ROUTE_DALLAS_HOUSTON[2][0],
      lng: ROUTE_DALLAS_HOUSTON[2][1],
      address: 'I-45 Southbound near Corsicana, TX',
      speed: 84,
      heading: 160,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 72, // Battery level representation
    fuelCapacityLiters: 85, // kWh battery pack
    batteryLevel: 72,
    mileageKm: 34200,
    lastMaintenanceDate: '2026-08-30',
    nextMaintenanceDate: '2026-11-30',
    maintenanceScheduleKm: 20000,
    routePoints: ROUTE_DALLAS_HOUSTON,
    currentRouteIndex: 2,
    fuelHistory: [
      { date: '2026-09-17', level: 98, consumptionLiters: 28, costUSD: 34 },
      { date: '2026-09-18', level: 85, consumptionLiters: 30, costUSD: 36 },
      { date: '2026-09-19', level: 90, consumptionLiters: 26, costUSD: 32 },
      { date: '2026-09-20', level: 82, consumptionLiters: 29, costUSD: 35 },
      { date: '2026-09-21', level: 88, consumptionLiters: 27, costUSD: 33 },
      { date: '2026-09-22', level: 79, consumptionLiters: 31, costUSD: 37 },
      { date: '2026-09-23', level: 72, consumptionLiters: 25, costUSD: 30 }
    ],
    maintenanceLog: [
      { id: 'MT-420', date: '2026-08-30', type: 'EV High-Voltage Battery Health Diagnostics', cost: 220, notes: 'Battery health rated at 99.1% capacity retention', technician: 'Ford Pro Commercial EV Center' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VH-106',
    name: 'Isuzu NPR-HD Box Truck #106',
    plateNumber: 'GA-7719-BX',
    type: 'Box Truck',
    capacity: '6,500 kg (26ft Box + Liftgate)',
    assignedDriverId: 'DRV-106',
    assignedDriverName: 'Carlos Santana-Reyes',
    assignedHubId: 'HUB-ATL',
    assignedHubName: 'Atlanta Gateway Fulfillment Depot',
    status: 'idle',
    currentLocation: {
      lat: 33.6725,
      lng: -84.3820,
      address: 'Atlanta Gateway Depot Loading Dock B4',
      speed: 0,
      heading: 0,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 88,
    fuelCapacityLiters: 150,
    mileageKm: 67900,
    lastMaintenanceDate: '2026-07-15',
    nextMaintenanceDate: '2026-10-15',
    maintenanceScheduleKm: 15000,
    fuelHistory: [
      { date: '2026-09-17', level: 90, consumptionLiters: 35, costUSD: 44 },
      { date: '2026-09-18', level: 70, consumptionLiters: 38, costUSD: 48 },
      { date: '2026-09-19', level: 95, consumptionLiters: 32, costUSD: 40 },
      { date: '2026-09-20', level: 80, consumptionLiters: 36, costUSD: 45 },
      { date: '2026-09-21', level: 68, consumptionLiters: 34, costUSD: 43 },
      { date: '2026-09-22', level: 92, consumptionLiters: 35, costUSD: 44 },
      { date: '2026-09-23', level: 88, consumptionLiters: 12, costUSD: 15 }
    ],
    maintenanceLog: [
      { id: 'MT-390', date: '2026-07-15', type: 'Hydraulic Liftgate Cylinder Maintenance', cost: 490, notes: 'Replaced seal kit on tuck-under liftgate', technician: 'Atlanta Truck Body Repairs' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VH-107',
    name: 'Mack Anthem 70" Sleeper #107',
    plateNumber: 'IL-8830-MK',
    type: 'Semi-Truck',
    capacity: '24,500 kg',
    assignedDriverId: 'DRV-107',
    assignedDriverName: 'Tanya Washington',
    assignedHubId: 'HUB-CHI',
    assignedHubName: 'Chicago Central Logistics Hub',
    status: 'idle',
    currentLocation: {
      lat: 41.8155,
      lng: -87.7235,
      address: 'Chicago Central Hub Staging Yard 3',
      speed: 0,
      heading: 0,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 54,
    fuelCapacityLiters: 460,
    mileageKm: 164200,
    lastMaintenanceDate: '2026-08-01',
    nextMaintenanceDate: '2026-11-01',
    maintenanceScheduleKm: 25000,
    fuelHistory: [
      { date: '2026-09-17', level: 82, consumptionLiters: 92, costUSD: 115 },
      { date: '2026-09-18', level: 64, consumptionLiters: 95, costUSD: 119 },
      { date: '2026-09-19', level: 88, consumptionLiters: 89, costUSD: 111 },
      { date: '2026-09-20', level: 70, consumptionLiters: 94, costUSD: 118 },
      { date: '2026-09-21', level: 52, consumptionLiters: 90, costUSD: 113 },
      { date: '2026-09-22', level: 56, consumptionLiters: 40, costUSD: 50 },
      { date: '2026-09-23', level: 54, consumptionLiters: 15, costUSD: 19 }
    ],
    maintenanceLog: [
      { id: 'MT-405', date: '2026-08-01', type: 'Fifth Wheel Hitch Rebuild', cost: 620, notes: 'Rebuilt locking jaws and lubricated plate', technician: 'Chicago Fleet Techs' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VH-108',
    name: 'Mercedes-Benz Sprinter Cargo #108',
    plateNumber: 'TX-1188-MB',
    type: 'Delivery Van',
    capacity: '2,200 kg / High Roof',
    assignedDriverId: 'DRV-108',
    assignedDriverName: 'Damon Bradley',
    assignedHubId: 'HUB-DAL',
    assignedHubName: 'Dallas South Intermodal Terminal',
    status: 'moving',
    currentLocation: {
      lat: 32.7842,
      lng: -96.7995,
      address: 'Downtown Dallas Logistics Corridor, Elm St',
      speed: 46,
      heading: 260,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 61,
    fuelCapacityLiters: 95,
    mileageKm: 48900,
    lastMaintenanceDate: '2026-08-20',
    nextMaintenanceDate: '2026-11-20',
    maintenanceScheduleKm: 15000,
    fuelHistory: [
      { date: '2026-09-17', level: 92, consumptionLiters: 22, costUSD: 28 },
      { date: '2026-09-18', level: 80, consumptionLiters: 24, costUSD: 30 },
      { date: '2026-09-19', level: 68, consumptionLiters: 25, costUSD: 31 },
      { date: '2026-09-20', level: 95, consumptionLiters: 21, costUSD: 26 },
      { date: '2026-09-21', level: 81, consumptionLiters: 23, costUSD: 29 },
      { date: '2026-09-22', level: 70, consumptionLiters: 24, costUSD: 30 },
      { date: '2026-09-23', level: 61, consumptionLiters: 18, costUSD: 23 }
    ],
    maintenanceLog: [
      { id: 'MT-412', date: '2026-08-20', type: 'Service A - Oil, Air & Fuel Filters', cost: 360, notes: 'Clean bill of health, brake pads at 80%', technician: 'Mercedes-Benz Commercial Dallas' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VH-109',
    name: 'Freightliner eCascadia (EV) #109',
    plateNumber: 'GA-9912-EV',
    type: 'Semi-Truck',
    capacity: '21,000 kg (Zero-Emission Regional)',
    assignedDriverId: 'DRV-109',
    assignedDriverName: 'Liam O\'Connor',
    assignedHubId: 'HUB-ATL',
    assignedHubName: 'Atlanta Gateway Fulfillment Depot',
    status: 'moving',
    currentLocation: {
      lat: 33.9512,
      lng: -84.1520,
      address: 'I-85 North near Duluth, GA',
      speed: 78,
      heading: 50,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 49,
    fuelCapacityLiters: 438, // kWh
    batteryLevel: 49,
    mileageKm: 28400,
    lastMaintenanceDate: '2026-08-10',
    nextMaintenanceDate: '2026-11-10',
    maintenanceScheduleKm: 30000,
    fuelHistory: [
      { date: '2026-09-17', level: 90, consumptionLiters: 65, costUSD: 45 },
      { date: '2026-09-18', level: 72, consumptionLiters: 68, costUSD: 48 },
      { date: '2026-09-19', level: 88, consumptionLiters: 62, costUSD: 43 },
      { date: '2026-09-20', level: 66, consumptionLiters: 70, costUSD: 49 },
      { date: '2026-09-21', level: 80, consumptionLiters: 64, costUSD: 45 },
      { date: '2026-09-22', level: 62, consumptionLiters: 67, costUSD: 47 },
      { date: '2026-09-23', level: 49, consumptionLiters: 58, costUSD: 41 }
    ],
    maintenanceLog: [
      { id: 'MT-402', date: '2026-08-10', type: 'Electric Drivetrain & Inverter Check', cost: 350, notes: 'Coolant loop flushed and software calibration applied', technician: 'Freightliner Electric Care' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'VH-110',
    name: 'International LT625 Heavy #110',
    plateNumber: 'IL-6604-LT',
    type: 'Flatbed',
    capacity: '26,000 kg (Machinery & Steel)',
    assignedDriverId: 'DRV-110',
    assignedDriverName: 'Amina Mansoor',
    assignedHubId: 'HUB-CHI',
    assignedHubName: 'Chicago Central Logistics Hub',
    status: 'offline',
    currentLocation: {
      lat: 41.8155,
      lng: -87.7235,
      address: 'Chicago Maintenance Bay 2 (Scheduled Service)',
      speed: 0,
      heading: 0,
      lastUpdated: new Date().toISOString()
    },
    fuelLevel: 35,
    fuelCapacityLiters: 480,
    mileageKm: 231900,
    lastMaintenanceDate: '2026-05-18',
    nextMaintenanceDate: '2026-09-25',
    maintenanceScheduleKm: 25000,
    fuelHistory: [
      { date: '2026-09-17', level: 70, consumptionLiters: 100, costUSD: 125 },
      { date: '2026-09-18', level: 48, consumptionLiters: 102, costUSD: 128 },
      { date: '2026-09-19', level: 85, consumptionLiters: 98, costUSD: 123 },
      { date: '2026-09-20', level: 60, consumptionLiters: 104, costUSD: 130 },
      { date: '2026-09-21', level: 45, consumptionLiters: 99, costUSD: 124 },
      { date: '2026-09-22', level: 35, consumptionLiters: 20, costUSD: 25 },
      { date: '2026-09-23', level: 35, consumptionLiters: 0, costUSD: 0 }
    ],
    maintenanceLog: [
      { id: 'MT-350', date: '2026-05-18', type: 'Transmission Service & Clutch Adjustment', cost: 1480, notes: 'Clutch plate inspected and calibrated', technician: 'International Trucks IL' }
    ],
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-9001',
    trackingNumber: 'FF-CHI-9001-USA',
    customerName: 'Baxter Healthcare Global',
    customerContact: 'shipping@baxterlogistics.com',
    origin: {
      name: 'Chicago Central Logistics Hub',
      address: '4200 S Pulaski Rd, Chicago, IL',
      lat: 41.8155,
      lng: -87.7235
    },
    destination: {
      name: 'Louisville Medical Center Distribution',
      address: '500 S Floyd St, Louisville, KY',
      lat: 38.2527,
      lng: -85.7585
    },
    originHubId: 'HUB-CHI',
    status: 'in_transit',
    priority: 'urgent',
    packageDetails: {
      description: 'Sterile surgical instruments & IV solution packs',
      weightKg: 14200,
      pieces: 42,
      isFragile: true,
      temperatureSensitive: true
    },
    assignedVehicleId: 'VH-101',
    assignedVehicleName: 'Freightliner Cascadia #101',
    assignedDriverId: 'DRV-101',
    assignedDriverName: 'Robert "Bob" Martinez',
    eta: 'Today, 16:45 EDT',
    progress: 32,
    routePolyline: ROUTE_CHICAGO_INDY,
    currentLocation: { lat: ROUTE_CHICAGO_INDY[3][0], lng: ROUTE_CHICAGO_INDY[3][1] },
    timeline: [
      { status: 'created', title: 'Shipment Manifest Generated', timestamp: '2026-09-23T06:15:00Z', note: 'Order dispatched by Baxter Central DC' },
      { status: 'loaded', title: 'Cargo Loaded & Secured', timestamp: '2026-09-23T07:45:00Z', note: '42 pallets sealed with tamper tags', location: 'Chicago Central Hub Dock 4' },
      { status: 'in_transit', title: 'Departed Chicago Hub', timestamp: '2026-09-23T08:10:00Z', note: 'In transit via I-65 Southbound', location: 'Chicago, IL' }
    ],
    createdAt: '2026-09-23T06:15:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-9002',
    trackingNumber: 'FF-DAL-9002-USA',
    customerName: 'Dell Technologies Austin',
    customerContact: 'enterprise-ops@dell.com',
    origin: {
      name: 'Dallas South Intermodal Terminal',
      address: '4800 Bonnie View Rd, Dallas, TX',
      lat: 32.6842,
      lng: -96.7645
    },
    destination: {
      name: 'Dell Campus 1 Logistics Hub',
      address: '1 Dell Way, Round Rock, TX',
      lat: 30.5083,
      lng: -97.6789
    },
    originHubId: 'HUB-DAL',
    status: 'in_transit',
    priority: 'express',
    packageDetails: {
      description: 'PowerEdge Enterprise Rack Servers & NVMe storage arrays',
      weightKg: 8900,
      pieces: 26,
      isFragile: true,
      temperatureSensitive: false
    },
    assignedVehicleId: 'VH-102',
    assignedVehicleName: 'Volvo VNL 860 #102',
    assignedDriverId: 'DRV-102',
    assignedDriverName: 'Sarah Jenkins',
    eta: 'Today, 14:15 CDT',
    progress: 45,
    routePolyline: ROUTE_DALLAS_AUSTIN,
    currentLocation: { lat: ROUTE_DALLAS_AUSTIN[4][0], lng: ROUTE_DALLAS_AUSTIN[4][1] },
    timeline: [
      { status: 'created', title: 'Shipment Created', timestamp: '2026-09-23T05:30:00Z', note: 'Priority manifest approved' },
      { status: 'loaded', title: 'Cargo Checked In & Loaded', timestamp: '2026-09-23T06:50:00Z', note: 'Shock sensors activated on crates' },
      { status: 'in_transit', title: 'En Route on I-35', timestamp: '2026-09-23T07:20:00Z', note: 'Passed Hillsboro waypoint' }
    ],
    createdAt: '2026-09-23T05:30:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-9003',
    trackingNumber: 'FF-ATL-9003-USA',
    customerName: 'FreshPoint Produce Carolina',
    customerContact: 'logistics@freshpoint-carolina.com',
    origin: {
      name: 'Atlanta Gateway Fulfillment Depot',
      address: '1500 Southside Industrial Pkwy, Atlanta, GA',
      lat: 33.6725,
      lng: -84.3820
    },
    destination: {
      name: 'Charlotte Wholesale Cold Storage',
      address: '3800 Statesville Ave, Charlotte, NC',
      lat: 35.2271,
      lng: -80.8431
    },
    originHubId: 'HUB-ATL',
    status: 'in_transit',
    priority: 'standard',
    packageDetails: {
      description: 'Organic berries, leafy greens and organic dairy (Temp 2-4°C)',
      weightKg: 16500,
      pieces: 34,
      isFragile: true,
      temperatureSensitive: true
    },
    assignedVehicleId: 'VH-103',
    assignedVehicleName: 'Peterbilt 579 Ultra #103',
    assignedDriverId: 'DRV-103',
    assignedDriverName: 'Marcus Cole',
    eta: 'Today, 18:30 EDT',
    progress: 55,
    routePolyline: ROUTE_ATLANTA_CHARLOTTE,
    currentLocation: { lat: ROUTE_ATLANTA_CHARLOTTE[5][0], lng: ROUTE_ATLANTA_CHARLOTTE[5][1] },
    timeline: [
      { status: 'created', title: 'Reefer Order Created', timestamp: '2026-09-23T04:45:00Z', note: 'Pre-cooling Reefer set to 3.0°C' },
      { status: 'loaded', title: 'Cold Chain Verified & Sealed', timestamp: '2026-09-23T06:15:00Z', note: 'Temperature verified at 2.8°C' },
      { status: 'in_transit', title: 'Crossing South Carolina State Line', timestamp: '2026-09-23T09:00:00Z', note: 'Normal traffic flow on I-85' }
    ],
    createdAt: '2026-09-23T04:45:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-9004',
    trackingNumber: 'FF-CHI-9004-USA',
    customerName: 'General Motors Component Plant',
    customerContact: 'j.miller@gm-supplierlink.com',
    origin: {
      name: 'Chicago Central Logistics Hub',
      address: '4200 S Pulaski Rd, Chicago, IL',
      lat: 41.8155,
      lng: -87.7235
    },
    destination: {
      name: 'GM Detroit-Hamtramck Assembly',
      address: '2500 E Grand Blvd, Detroit, MI',
      lat: 42.3314,
      lng: -83.0458
    },
    originHubId: 'HUB-CHI',
    status: 'delayed',
    priority: 'urgent',
    packageDetails: {
      description: 'Automotive wiring harnesses and stamped steel sub-assemblies',
      weightKg: 19800,
      pieces: 38,
      isFragile: false,
      temperatureSensitive: false
    },
    assignedVehicleId: 'VH-104',
    assignedVehicleName: 'Kenworth T680 #104',
    assignedDriverId: 'DRV-104',
    assignedDriverName: 'Alexei Ivanov',
    eta: 'Today, 21:00 EDT (Delayed +2h)',
    progress: 35,
    routePolyline: ROUTE_CHICAGO_DETROIT,
    currentLocation: { lat: ROUTE_CHICAGO_DETROIT[3][0], lng: ROUTE_CHICAGO_DETROIT[3][1] },
    timeline: [
      { status: 'created', title: 'Just-In-Time Manifest Dispatched', timestamp: '2026-09-23T05:00:00Z', note: 'Critical factory assembly line input' },
      { status: 'loaded', title: 'Loaded at Chicago Hub', timestamp: '2026-09-23T06:30:00Z', note: 'Gross vehicle weight 35,200 kg' },
      { status: 'in_transit', title: 'In Transit on I-94', timestamp: '2026-09-23T07:15:00Z', note: 'Traversing Indiana corridor' },
      { status: 'delayed', title: 'Delay Alert: Traffic Bottleneck & Fuel Stop', timestamp: '2026-09-23T09:40:00Z', note: 'I-94 construction delay + low fuel warning', location: 'Kalamazoo MI' }
    ],
    createdAt: '2026-09-23T05:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-9005',
    trackingNumber: 'FF-DAL-9005-USA',
    customerName: 'Sysco Houston Central',
    customerContact: 'inbound@sysco-houston.com',
    origin: {
      name: 'Dallas South Intermodal Terminal',
      address: '4800 Bonnie View Rd, Dallas, TX',
      lat: 32.6842,
      lng: -96.7645
    },
    destination: {
      name: 'Sysco Distribution Depot',
      address: '1390 Enclave Pkwy, Houston, TX',
      lat: 29.7604,
      lng: -95.3698
    },
    originHubId: 'HUB-DAL',
    status: 'in_transit',
    priority: 'standard',
    packageDetails: {
      description: 'Specialty bakery ingredients and dry goods',
      weightKg: 1200,
      pieces: 18,
      isFragile: false,
      temperatureSensitive: false
    },
    assignedVehicleId: 'VH-105',
    assignedVehicleName: 'Ford E-Transit Van #105',
    assignedDriverId: 'DRV-105',
    assignedDriverName: 'Jessica Chen',
    eta: 'Today, 17:00 CDT',
    progress: 25,
    routePolyline: ROUTE_DALLAS_HOUSTON,
    currentLocation: { lat: ROUTE_DALLAS_HOUSTON[2][0], lng: ROUTE_DALLAS_HOUSTON[2][1] },
    timeline: [
      { status: 'created', title: 'Express Delivery Created', timestamp: '2026-09-23T07:00:00Z', note: 'Electric Van route assigned' },
      { status: 'loaded', title: 'Pallets Secured', timestamp: '2026-09-23T08:00:00Z', note: 'Battery state 100%' },
      { status: 'in_transit', title: 'Southbound I-45', timestamp: '2026-09-23T08:30:00Z', note: 'Approaching Corsicana waypoint' }
    ],
    createdAt: '2026-09-23T07:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-9006',
    trackingNumber: 'FF-CHI-9006-USA',
    customerName: 'Abbott Laboratories',
    customerContact: 'distribution@abbott.com',
    origin: {
      name: 'Chicago Central Logistics Hub',
      address: '4200 S Pulaski Rd, Chicago, IL',
      lat: 41.8155,
      lng: -87.7235
    },
    destination: {
      name: 'Indianapolis Research Park',
      address: '1220 Waterway Blvd, Indianapolis, IN',
      lat: 39.7684,
      lng: -86.1581
    },
    originHubId: 'HUB-CHI',
    status: 'pending',
    priority: 'urgent',
    packageDetails: {
      description: 'Diagnostics chemistry analyzers and test cartridges',
      weightKg: 4200,
      pieces: 12,
      isFragile: true,
      temperatureSensitive: false
    },
    assignedVehicleId: 'VH-107',
    assignedVehicleName: 'Mack Anthem #107',
    assignedDriverId: 'DRV-107',
    assignedDriverName: 'Tanya Washington',
    eta: 'Tomorrow, 10:00 EDT',
    progress: 0,
    routePolyline: ROUTE_CHICAGO_INDY.slice(0, 10),
    currentLocation: { lat: 41.8155, lng: -87.7235 },
    timeline: [
      { status: 'created', title: 'Shipment Queued for Staging', timestamp: '2026-09-23T09:10:00Z', note: 'Driver assigned, awaiting dock call' }
    ],
    createdAt: '2026-09-23T09:10:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-9007',
    trackingNumber: 'FF-ATL-9007-USA',
    customerName: 'Home Depot Supply Southeast',
    customerContact: 'supply-inbound@homedepot.com',
    origin: {
      name: 'Atlanta Gateway Fulfillment Depot',
      address: '1500 Southside Industrial Pkwy, Atlanta, GA',
      lat: 33.6725,
      lng: -84.3820
    },
    destination: {
      name: 'Greenville Regional Fulfillment',
      address: '100 Gateway Dr, Greenville, SC',
      lat: 34.8526,
      lng: -82.3940
    },
    originHubId: 'HUB-ATL',
    status: 'delivered',
    priority: 'standard',
    packageDetails: {
      description: 'Contractor power tools, hardware fixtures, fasteners',
      weightKg: 15400,
      pieces: 50,
      isFragile: false,
      temperatureSensitive: false
    },
    assignedVehicleId: 'VH-103',
    assignedVehicleName: 'Peterbilt 579 Ultra #103',
    assignedDriverId: 'DRV-103',
    assignedDriverName: 'Marcus Cole',
    eta: 'Delivered (08:45 EDT)',
    progress: 100,
    routePolyline: ROUTE_ATLANTA_CHARLOTTE.slice(0, 7),
    currentLocation: { lat: 34.8526, lng: -82.3940 },
    timeline: [
      { status: 'created', title: 'Order Dispatched', timestamp: '2026-09-22T14:00:00Z', note: 'Ready for morning transit' },
      { status: 'loaded', title: 'Loaded at Dock 8', timestamp: '2026-09-23T04:00:00Z', note: 'BOL signed' },
      { status: 'in_transit', title: 'En route via I-85', timestamp: '2026-09-23T04:30:00Z', note: 'On-schedule' },
      { status: 'delivered', title: 'Successful Delivery & Signed POD', timestamp: '2026-09-23T08:45:00Z', note: 'Accepted by Receiving Mgr Tom Harris', location: 'Greenville SC' }
    ],
    createdAt: '2026-09-22T14:00:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-9008',
    trackingNumber: 'FF-DAL-9008-USA',
    customerName: 'Texas Instruments Semiconductor',
    customerContact: 'fabs-logistics@ti.com',
    origin: {
      name: 'Dallas South Intermodal Terminal',
      address: '4800 Bonnie View Rd, Dallas, TX',
      lat: 32.6842,
      lng: -96.7645
    },
    destination: {
      name: 'TI Sherman Advanced Wafer Fab',
      address: '13020 TI Blvd, Dallas, TX',
      lat: 32.9152,
      lng: -96.7645
    },
    originHubId: 'HUB-DAL',
    status: 'delivered',
    priority: 'urgent',
    packageDetails: {
      description: 'Silicon wafers & cleanroom equipment canisters',
      weightKg: 1800,
      pieces: 8,
      isFragile: true,
      temperatureSensitive: true
    },
    assignedVehicleId: 'VH-108',
    assignedVehicleName: 'Mercedes-Benz Sprinter #108',
    assignedDriverId: 'DRV-108',
    assignedDriverName: 'Damon Bradley',
    eta: 'Delivered (07:15 CDT)',
    progress: 100,
    routePolyline: [
      [32.6842, -96.7645],
      [32.7842, -96.7995],
      [32.9152, -96.7645]
    ],
    currentLocation: { lat: 32.9152, lng: -96.7645 },
    timeline: [
      { status: 'created', title: 'Order Prepared', timestamp: '2026-09-23T05:15:00Z', note: 'Clean transport verified' },
      { status: 'in_transit', title: 'Dispatched Across Dallas', timestamp: '2026-09-23T06:00:00Z', note: 'Sprinter van dispatched' },
      { status: 'delivered', title: 'Delivered to Fab Gate 4', timestamp: '2026-09-23T07:15:00Z', note: 'Cleanroom seal inspected', location: 'Sherman Fab' }
    ],
    createdAt: '2026-09-23T05:15:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-9009',
    trackingNumber: 'FF-CHI-9009-USA',
    customerName: 'Grainger Industrial Supply',
    customerContact: 'orders@grainger.com',
    origin: {
      name: 'Chicago Central Logistics Hub',
      address: '4200 S Pulaski Rd, Chicago, IL',
      lat: 41.8155,
      lng: -87.7235
    },
    destination: {
      name: 'Milwaukee Regional Warehouse',
      address: '1000 W St Paul Ave, Milwaukee, WI',
      lat: 43.0389,
      lng: -87.9065
    },
    originHubId: 'HUB-CHI',
    status: 'pending',
    priority: 'standard',
    packageDetails: {
      description: 'Industrial safety PPE, welding gear, motors',
      weightKg: 7800,
      pieces: 22,
      isFragile: false,
      temperatureSensitive: false
    },
    assignedVehicleId: 'VH-106',
    assignedVehicleName: 'Isuzu NPR-HD #106',
    assignedDriverId: 'DRV-106',
    assignedDriverName: 'Carlos Santana-Reyes',
    eta: 'Tomorrow, 12:00 CDT',
    progress: 0,
    routePolyline: [
      [41.8155, -87.7235],
      [42.2412, -87.8912],
      [43.0389, -87.9065]
    ],
    currentLocation: { lat: 41.8155, lng: -87.7235 },
    timeline: [
      { status: 'created', title: 'Pallet Order Staged', timestamp: '2026-09-23T08:30:00Z', note: 'Awaiting dispatch confirmation' }
    ],
    createdAt: '2026-09-23T08:30:00Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'SHP-9010',
    trackingNumber: 'FF-ATL-9010-USA',
    customerName: 'Coca-Cola Refreshments Bottling',
    customerContact: 'logistics@coca-cola.com',
    origin: {
      name: 'Atlanta Gateway Fulfillment Depot',
      address: '1500 Southside Industrial Pkwy, Atlanta, GA',
      lat: 33.6725,
      lng: -84.3820
    },
    destination: {
      name: 'Macon Distribution Center',
      address: '4400 Interstate Dr, Macon, GA',
      lat: 32.8407,
      lng: -83.6324
    },
    originHubId: 'HUB-ATL',
    status: 'delivered',
    priority: 'standard',
    packageDetails: {
      description: 'Concentrate beverage drums & packaging materials',
      weightKg: 21500,
      pieces: 40,
      isFragile: false,
      temperatureSensitive: false
    },
    assignedVehicleId: 'VH-109',
    assignedVehicleName: 'Freightliner eCascadia (EV) #109',
    assignedDriverId: 'DRV-109',
    assignedDriverName: 'Liam O\'Connor',
    eta: 'Delivered (06:30 EDT)',
    progress: 100,
    routePolyline: [
      [33.6725, -84.3820],
      [33.2501, -84.0512],
      [32.8407, -83.6324]
    ],
    currentLocation: { lat: 32.8407, lng: -83.6324 },
    timeline: [
      { status: 'created', title: 'Created', timestamp: '2026-09-22T20:00:00Z', note: 'Overnight shuttle run' },
      { status: 'in_transit', title: 'Dispatched on I-75 South', timestamp: '2026-09-23T04:00:00Z', note: 'All-electric run' },
      { status: 'delivered', title: 'Delivered on Schedule', timestamp: '2026-09-23T06:30:00Z', note: 'Accepted at Bay 6', location: 'Macon DC' }
    ],
    createdAt: '2026-09-22T20:00:00Z',
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'ALT-1001',
    type: 'low_fuel',
    severity: 'critical',
    title: 'Critical Fuel Alert: Kenworth #104',
    message: 'Vehicle VH-104 fuel level is currently at 14% (below 15% safety threshold). Recommended fuel stop: Flying J Travel Center #240 in Kalamazoo, MI (6.4 km ahead).',
    vehicleId: 'VH-104',
    vehicleName: 'Kenworth T680 #104',
    driverId: 'DRV-104',
    driverName: 'Alexei Ivanov',
    shipmentId: 'SHP-9004',
    trackingNumber: 'FF-CHI-9004-USA',
    read: false,
    timestamp: '2026-09-23T09:42:00Z'
  },
  {
    id: 'ALT-1002',
    type: 'delay',
    severity: 'warning',
    title: 'Delivery Delay Alert: Shipment SHP-9004',
    message: 'Shipment FF-CHI-9004-USA to GM Detroit is delayed by approximately 120 minutes due to heavy interstate congestion on I-94 and required fueling stop.',
    vehicleId: 'VH-104',
    vehicleName: 'Kenworth T680 #104',
    driverId: 'DRV-104',
    driverName: 'Alexei Ivanov',
    shipmentId: 'SHP-9004',
    trackingNumber: 'FF-CHI-9004-USA',
    read: false,
    timestamp: '2026-09-23T09:40:00Z'
  },
  {
    id: 'ALT-1003',
    type: 'geofence',
    severity: 'info',
    title: 'Geofence Entry: Dallas South Hub',
    message: 'Vehicle VH-108 entered Dallas South Intermodal Terminal geofence zone at 07:10 CDT.',
    vehicleId: 'VH-108',
    vehicleName: 'Mercedes-Benz Sprinter #108',
    driverId: 'DRV-108',
    driverName: 'Damon Bradley',
    hubId: 'HUB-DAL',
    read: true,
    timestamp: '2026-09-23T07:10:00Z'
  },
  {
    id: 'ALT-1004',
    type: 'license_expiry',
    severity: 'warning',
    title: 'Driver License Expiring Soon: Sarah Jenkins',
    message: 'Driver Sarah Jenkins (DRV-102) CDL Class A license is set to expire on 2026-11-20 (less than 60 days remaining). Please initiate renewal verification.',
    driverId: 'DRV-102',
    driverName: 'Sarah Jenkins',
    read: false,
    timestamp: '2026-09-23T06:00:00Z'
  },
  {
    id: 'ALT-1005',
    type: 'maintenance',
    severity: 'warning',
    title: 'Scheduled Maintenance Due: Kenworth #104',
    message: 'Vehicle VH-104 has reached 215,400 km and is due for scheduled 20,000 km inspection service.',
    vehicleId: 'VH-104',
    vehicleName: 'Kenworth T680 #104',
    read: false,
    timestamp: '2026-09-23T05:00:00Z'
  }
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'FleetFlow Logistics Global Inc.',
  companyLogoUrl: '',
  supportEmail: 'dispatch@fleetflow.io',
  supportPhone: '+1 (800) 555-FLOW',
  address: '100 N Riverside Plaza, Suite 2400, Chicago, IL 60606',
  currency: 'USD',
  distanceUnit: 'km',
  gpsRefreshRateSeconds: 4,
  lowFuelAlertThreshold: 15,
  enableGeofenceAlerts: true,
  enableLowFuelAlerts: true,
  enableDelayAlerts: true,
  enableMaintenanceAlerts: true,
  simulationActive: true
};
