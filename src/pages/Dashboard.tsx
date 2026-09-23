import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFleet } from '../context/FleetContext';
import { LeafletFleetMap } from '../components/map/LeafletFleetMap';
import { Modal } from '../components/common/Modal';
import { FuelLineChart, DonutChart } from '../components/common/Charts';
import { Vehicle, Shipment, Driver, VehicleType, ShipmentPriority } from '../types';
import {
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Fuel,
  TrendingUp,
  PlusCircle,
  UserCheck,
  ArrowUpRight,
  Clock,
  MapPin,
  Compass,
  Gauge,
  Navigation,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  onNavigateTab: (tab: any) => void;
  onSelectEntity: (type: 'vehicle' | 'shipment' | 'driver' | 'hub', id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab, onSelectEntity }) => {
  const { userProfile } = useAuth();
  const {
    vehicles,
    shipments,
    drivers,
    hubs,
    alerts,
    createShipment,
    createVehicle,
    editVehicle,
    editDriver
  } = useFleet();

  const role = userProfile?.role || 'dispatcher';

  // Quick Action Modals
  const [showNewShipmentModal, setShowNewShipmentModal] = useState(false);
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // New Shipment form state
  const [newShipment, setNewShipment] = useState({
    customerName: '',
    customerContact: '',
    originName: 'Chicago Central Logistics Hub',
    originAddress: '4200 S Pulaski Rd, Chicago, IL',
    originLat: 41.8155,
    originLng: -87.7235,
    destinationName: '',
    destinationAddress: '',
    destinationLat: 39.7684,
    destinationLng: -86.1581,
    description: '',
    weightKg: 5000,
    pieces: 10,
    priority: 'standard' as ShipmentPriority,
    assignedVehicleId: '',
    assignedDriverId: ''
  });

  // Add Vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    id: `VH-${Math.floor(111 + Math.random() * 80)}`,
    name: '',
    plateNumber: '',
    type: 'Semi-Truck' as VehicleType,
    capacity: '22,000 kg',
    assignedHubId: 'HUB-CHI',
    fuelCapacityLiters: 450
  });

  // Assign Driver modal state
  const [selectedVehicleForDriver, setSelectedVehicleForDriver] = useState('');
  const [selectedDriverForVehicle, setSelectedDriverForVehicle] = useState('');

  // ----------------------------------------------------
  // METRICS COMPUTATION
  // ----------------------------------------------------
  const activeShipments = shipments.filter((s) => s.status === 'in_transit' || s.status === 'pending');
  const vehiclesOnRoad = vehicles.filter((v) => v.status === 'moving');
  const delayedDeliveries = shipments.filter((s) => s.status === 'delayed');

  const totalDelivered = shipments.filter((s) => s.status === 'delivered').length;
  const onTimePercentage = totalDelivered > 0
    ? Math.round((totalDelivered / (totalDelivered + delayedDeliveries.length)) * 100)
    : 96;

  const totalFuel = vehicles.reduce((sum, v) => sum + (v.fuelLevel || 0), 0);
  const avgFuelLevel = vehicles.length > 0 ? Math.round(totalFuel / vehicles.length) : 65;

  // Recent activity feed: merge recent shipments, alerts, maintenance
  const recentActivities = [
    ...alerts.map((a) => ({
      id: `act-alt-${a.id}`,
      type: 'alert' as const,
      title: a.title,
      desc: a.message,
      time: a.timestamp,
      severity: a.severity
    })),
    ...shipments.flatMap((s) =>
      s.timeline.map((t, idx) => ({
        id: `act-shp-${s.id}-${idx}`,
        type: 'shipment' as const,
        title: `${s.trackingNumber}: ${t.title}`,
        desc: t.note,
        time: t.timestamp,
        severity: s.status === 'delayed' ? ('warning' as const) : ('info' as const)
      }))
    )
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 7);

  // Driver Role specifics
  const myDriver = drivers.find((d) => d.id === userProfile?.driverId || d.email === userProfile?.email) || drivers[0];
  const myVehicle = vehicles.find((v) => v.id === myDriver?.assignedVehicleId);
  const myActiveShipment = shipments.find((s) => s.id === myDriver?.currentShipmentId || s.id === myVehicle?.currentShipmentId);

  // Quick Action Handlers
  const handleCreateShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedVeh = vehicles.find((v) => v.id === newShipment.assignedVehicleId);
    const assignedDrv = drivers.find((d) => d.id === newShipment.assignedDriverId);

    const shipId = `SHP-${Math.floor(9015 + Math.random() * 500)}`;
    const trackingNum = `FF-${newShipment.originName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-USA`;

    const newDoc: Shipment = {
      id: shipId,
      trackingNumber: trackingNum,
      customerName: newShipment.customerName,
      customerContact: newShipment.customerContact,
      origin: {
        name: newShipment.originName,
        address: newShipment.originAddress,
        lat: newShipment.originLat,
        lng: newShipment.originLng
      },
      destination: {
        name: newShipment.destinationName,
        address: newShipment.destinationAddress,
        lat: newShipment.destinationLat,
        lng: newShipment.destinationLng
      },
      status: 'pending',
      priority: newShipment.priority,
      packageDetails: {
        description: newShipment.description,
        weightKg: Number(newShipment.weightKg),
        pieces: Number(newShipment.pieces),
        isFragile: false,
        temperatureSensitive: false
      },
      assignedVehicleId: assignedVeh?.id,
      assignedVehicleName: assignedVeh?.name,
      assignedDriverId: assignedDrv?.id,
      assignedDriverName: assignedDrv?.name,
      eta: 'Tomorrow, 14:00 EST',
      progress: 0,
      routePolyline: [
        [newShipment.originLat, newShipment.originLng],
        [newShipment.destinationLat, newShipment.destinationLng]
      ],
      currentLocation: { lat: newShipment.originLat, lng: newShipment.originLng },
      timeline: [
        {
          status: 'created',
          title: 'Order Manifest Created',
          timestamp: new Date().toISOString(),
          note: `Booking initiated for ${newShipment.customerName}`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await createShipment(newDoc);
    setShowNewShipmentModal(false);
  };

  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hub = hubs.find((h) => h.id === newVehicle.assignedHubId) || hubs[0];

    const vehicleObj: Vehicle = {
      id: newVehicle.id,
      name: newVehicle.name,
      plateNumber: newVehicle.plateNumber,
      type: newVehicle.type,
      capacity: newVehicle.capacity,
      assignedHubId: hub.id,
      assignedHubName: hub.name,
      status: 'idle',
      currentLocation: {
        lat: hub.location.lat,
        lng: hub.location.lng,
        address: hub.name,
        speed: 0,
        heading: 0,
        lastUpdated: new Date().toISOString()
      },
      fuelLevel: 95,
      fuelCapacityLiters: Number(newVehicle.fuelCapacityLiters),
      mileageKm: 12000,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      maintenanceScheduleKm: 25000,
      fuelHistory: [
        { date: '2026-09-20', level: 98, consumptionLiters: 40, costUSD: 50 },
        { date: '2026-09-21', level: 95, consumptionLiters: 42, costUSD: 52 },
        { date: '2026-09-22', level: 95, consumptionLiters: 10, costUSD: 12 }
      ],
      maintenanceLog: [],
      updatedAt: new Date().toISOString()
    };

    await createVehicle(vehicleObj);
    setShowAddVehicleModal(false);
  };

  const handleAssignDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === selectedVehicleForDriver);
    const drv = drivers.find((d) => d.id === selectedDriverForVehicle);

    if (veh && drv) {
      await editVehicle(veh.id, { assignedDriverId: drv.id, assignedDriverName: drv.name });
      await editDriver(drv.id, { assignedVehicleId: veh.id, assignedVehicleName: veh.name });
      setShowAssignDriverModal(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Role Banner if Driver */}
      {role === 'driver' && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={myDriver?.avatar}
              alt={myDriver?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">{myDriver?.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {myDriver?.status}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Vehicle: <span className="font-bold text-white">{myVehicle?.name || 'Assigned Cab'}</span> • {myVehicle?.plateNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-blue-200 block">Performance Rating</span>
              <span className="text-xl font-black text-amber-400">★ {myDriver?.rating} / 5.0</span>
            </div>
            <button
              onClick={() => onNavigateTab('tracking')}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-950 font-bold text-xs hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              Open In-Cab GPS Nav
            </button>
          </div>
        </div>
      )}

      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Fleet Operations Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry, vehicle health, active logistics pipelines & alerts
          </p>
        </div>

        {/* Quick Actions (for Admin & Dispatcher) */}
        {role !== 'driver' && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowNewShipmentModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> New Shipment
            </button>
            <button
              onClick={() => setShowAssignDriverModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-blue-500" /> Assign Driver
            </button>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-indigo-500" /> Add Vehicle
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Shipments */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Shipments</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeShipments.length}
            </span>
            <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12% this week
            </span>
          </div>
        </div>

        {/* Vehicles on Road */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Vehicles On Road</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {vehiclesOnRoad.length}{' '}
              <span className="text-xs font-normal text-slate-400">/ {vehicles.length}</span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
              Live Telemetry
            </span>
          </div>
        </div>

        {/* Delayed Deliveries */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Delayed Deliveries</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {delayedDeliveries.length}
            </span>
            <span className="text-[11px] font-semibold text-rose-500">
              {delayedDeliveries.length > 0 ? 'Requires Reroute' : 'Zero Delays'}
            </span>
          </div>
        </div>

        {/* On-Time Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">On-Time %</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {onTimePercentage}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-500">
              Target 95% met
            </span>
          </div>
        </div>

        {/* Avg Fuel Level */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Avg Fuel Level</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {avgFuelLevel}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Fleet Average
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Mini Map + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Mini-Map Widget (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                Live Fleet Telemetry Mini-Map
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time positioning across interstate shipping corridors
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('tracking')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Full Screen Map <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex-1 min-h-[340px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <LeafletFleetMap
              vehicles={vehicles}
              hubs={hubs}
              showGeofences={true}
              onSelectVehicle={(v) => {
                onSelectEntity('vehicle', v.id);
                onNavigateTab('tracking');
              }}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Recent Activity Feed (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Recent Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live chronological events stream
              </p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[340px] pr-1">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  {act.type === 'alert' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Package className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {act.desc}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Status Breakdown & Active Deliveries Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Fleet Vehicle Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col items-center">
          <h2 className="text-base font-bold text-slate-900 dark:text-white self-start mb-1">
            Fleet Asset Status
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 self-start mb-4">
            Current operational disposition of all vehicles
          </p>

          <DonutChart
            segments={[
              { label: 'Moving', value: vehicles.filter((v) => v.status === 'moving').length, color: '#10B981' },
              { label: 'Idle', value: vehicles.filter((v) => v.status === 'idle').length, color: '#F59E0B' },
              { label: 'Delayed', value: vehicles.filter((v) => v.status === 'delayed').length, color: '#EF4444' },
              { label: 'Offline', value: vehicles.filter((v) => v.status === 'offline').length, color: '#64748B' }
            ]}
            size={180}
            centerLabel="Vehicles"
            centerValue={vehicles.length}
          />

          <div className="grid grid-cols-2 gap-3 w-full mt-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Moving ({vehicles.filter((v) => v.status === 'moving').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-300">Idle ({vehicles.filter((v) => v.status === 'idle').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-300">Delayed ({vehicles.filter((v) => v.status === 'delayed').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="text-slate-600 dark:text-slate-300">Offline ({vehicles.filter((v) => v.status === 'offline').length})</span>
            </div>
          </div>
        </div>

        {/* Priority Shipments Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active High-Priority Shipments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Shipments currently moving along interstate routes</p>
            </div>
            <button
              onClick={() => onNavigateTab('shipments')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All Shipments →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-2.5 rounded-l-lg">Tracking #</th>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Route</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Progress</th>
                  <th className="px-3 py-2.5 rounded-r-lg">Vehicle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {shipments.slice(0, 5).map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => {
                      onSelectEntity('shipment', s.id);
                      onNavigateTab('shipments');
                    }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {s.trackingNumber}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                      {s.customerName}
                    </td>
                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                      {s.origin.name.split(' ')[0]} → {s.destination.name.split(' ')[0]}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.status === 'in_transit'
                            ? 'bg-blue-500/20 text-blue-400'
                            : s.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : s.status === 'delayed'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                      {s.assignedVehicleName || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QUICK ACTION MODAL: NEW SHIPMENT */}
      <Modal
        isOpen={showNewShipmentModal}
        onClose={() => setShowNewShipmentModal(false)}
        title="Schedule New Freight Shipment"
        subtitle="Generate electronic bill of lading (BOL) and assign to fleet asset"
      >
        <form onSubmit={handleCreateShipmentSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer / Shipper</label>
              <input
                type="text"
                required
                value={newShipment.customerName}
                onChange={(e) => setNewShipment({ ...newShipment, customerName: e.target.value })}
                placeholder="e.g. Caterpillar Machinery"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={newShipment.customerContact}
                onChange={(e) => setNewShipment({ ...newShipment, customerContact: e.target.value })}
                placeholder="dispatch@client.com"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Origin Terminal</label>
              <select
                value={newShipment.originName}
                onChange={(e) => {
                  const hub = hubs.find((h) => h.name === e.target.value);
                  if (hub) {
                    setNewShipment({
                      ...newShipment,
                      originName: hub.name,
                      originAddress: hub.address,
                      originLat: hub.location.lat,
                      originLng: hub.location.lng
                    });
                  }
                }}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {hubs.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Destination Facility</label>
              <input
                type="text"
                required
                value={newShipment.destinationName}
                onChange={(e) => setNewShipment({ ...newShipment, destinationName: e.target.value, destinationAddress: e.target.value })}
                placeholder="e.g. Amazon Fulfillment MDW2"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo Weight (kg)</label>
              <input
                type="number"
                required
                value={newShipment.weightKg}
                onChange={(e) => setNewShipment({ ...newShipment, weightKg: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pallets / Pieces</label>
              <input
                type="number"
                required
                value={newShipment.pieces}
                onChange={(e) => setNewShipment({ ...newShipment, pieces: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={newShipment.priority}
                onChange={(e) => setNewShipment({ ...newShipment, priority: e.target.value as ShipmentPriority })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white capitalize"
              >
                <option value="standard">Standard Freight</option>
                <option value="express">Express Transport</option>
                <option value="urgent">Urgent Hot-Shot</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo Description</label>
            <input
              type="text"
              required
              value={newShipment.description}
              onChange={(e) => setNewShipment({ ...newShipment, description: e.target.value })}
              placeholder="e.g. Industrial pumps & electronic controllers"
              className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Fleet Vehicle</label>
              <select
                value={newShipment.assignedVehicleId}
                onChange={(e) => setNewShipment({ ...newShipment, assignedVehicleId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">-- Choose Vehicle --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.plateNumber}) - Fuel: {v.fuelLevel}%
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Driver</label>
              <select
                value={newShipment.assignedDriverId}
                onChange={(e) => setNewShipment({ ...newShipment, assignedDriverId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">-- Choose Driver --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status}) - ★ {d.rating}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowNewShipmentModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
            >
              Dispatch Shipment
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK ACTION MODAL: ADD VEHICLE */}
      <Modal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
        title="Add Fleet Asset"
        subtitle="Register commercial truck or delivery van into telematics tracking"
      >
        <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Unit ID</label>
              <input
                type="text"
                required
                value={newVehicle.id}
                onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">License Plate</label>
              <input
                type="text"
                required
                value={newVehicle.plateNumber}
                onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                placeholder="e.g. IL-9988-TR"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Make & Model</label>
            <input
              type="text"
              required
              value={newVehicle.name}
              onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
              placeholder="e.g. Peterbilt 579 Sleeper"
              className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Type</label>
              <select
                value={newVehicle.type}
                onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value as VehicleType })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Semi-Truck">Semi-Truck</option>
                <option value="Box Truck">Box Truck</option>
                <option value="Delivery Van">Delivery Van</option>
                <option value="Reefer">Reefer</option>
                <option value="Flatbed">Flatbed</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payload Capacity</label>
              <input
                type="text"
                required
                value={newVehicle.capacity}
                onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Home Hub</label>
              <select
                value={newVehicle.assignedHubId}
                onChange={(e) => setNewVehicle({ ...newVehicle, assignedHubId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddVehicleModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
            >
              Enroll Vehicle
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK ACTION MODAL: ASSIGN DRIVER */}
      <Modal
        isOpen={showAssignDriverModal}
        onClose={() => setShowAssignDriverModal(false)}
        title="Assign Driver to Vehicle"
        subtitle="Pair certified CDL driver with vehicle for upcoming freight shifts"
      >
        <form onSubmit={handleAssignDriverSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Vehicle Asset</label>
            <select
              required
              value={selectedVehicleForDriver}
              onChange={(e) => setSelectedVehicleForDriver(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="">-- Choose Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} - {v.name} ({v.plateNumber}) • Status: {v.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Driver</label>
            <select
              required
              value={selectedDriverForVehicle}
              onChange={(e) => setSelectedDriverForVehicle(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="">-- Choose Driver --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.licenseCategory}) • Rating: ★ {d.rating}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAssignDriverModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
