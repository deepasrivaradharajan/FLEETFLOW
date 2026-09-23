import React, { useState, useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { LeafletFleetMap } from '../components/map/LeafletFleetMap';
import { Vehicle, VehicleStatus, Hub } from '../types';
import {
  Search,
  Filter,
  Truck,
  Gauge,
  Compass,
  BatteryCharging,
  Fuel,
  MapPin,
  Clock,
  User,
  Package,
  Layers,
  Activity,
  AlertTriangle,
  X,
  Radio,
  Maximize2
} from 'lucide-react';

export const LiveTracking: React.FC = () => {
  const { vehicles, hubs, shipments, drivers, alerts, showToast } = useFleet();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hubFilter, setHubFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showGeofences, setShowGeofences] = useState<boolean>(true);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchesHub = hubFilter === 'all' || v.assignedHubId === hubFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesHub && matchesSearch;
    });
  }, [vehicles, statusFilter, hubFilter, searchQuery]);

  // Keep selected vehicle fresh from Firestore updates
  const activeSelectedVehicle = useMemo(() => {
    if (!selectedVehicle) return null;
    return vehicles.find((v) => v.id === selectedVehicle.id) || selectedVehicle;
  }, [selectedVehicle, vehicles]);

  // Find linked shipment and driver for selected vehicle
  const activeShipment = useMemo(() => {
    if (!activeSelectedVehicle?.currentShipmentId) return null;
    return shipments.find((s) => s.id === activeSelectedVehicle.currentShipmentId);
  }, [activeSelectedVehicle, shipments]);

  const activeDriver = useMemo(() => {
    if (!activeSelectedVehicle?.assignedDriverId) return null;
    return drivers.find((d) => d.id === activeSelectedVehicle.assignedDriverId);
  }, [activeSelectedVehicle, drivers]);

  // Trigger interactive geofence alert test
  const handleSimulateGeofenceTrigger = (vehicle: Vehicle) => {
    showToast(
      'warning',
      'Geofence Simulation',
      `Vehicle ${vehicle.id} simulated route departure alert emitted to telemetry log.`
    );
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-950">
      {/* Top Filter & Telemetry Control Bar */}
      <div className="z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-3 px-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter vehicle or driver..."
              className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="all">All Vehicle States</option>
              <option value="moving">🟢 Moving ({vehicles.filter((v) => v.status === 'moving').length})</option>
              <option value="idle">🟡 Idle ({vehicles.filter((v) => v.status === 'idle').length})</option>
              <option value="delayed">🔴 Delayed ({vehicles.filter((v) => v.status === 'delayed').length})</option>
              <option value="offline">⚪ Offline ({vehicles.filter((v) => v.status === 'offline').length})</option>
            </select>
          </div>

          {/* Region / Hub Filter */}
          <select
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
          >
            <option value="all">All Logistics Hubs</option>
            {hubs.map((hub) => (
              <option key={hub.id} value={hub.id}>
                📍 {hub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right Toggle Options */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showGeofences}
              onChange={(e) => setShowGeofences(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 bg-slate-800 border-slate-700"
            />
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" /> Show Hub Geofences
            </span>
          </label>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>{filteredVehicles.length} Vehicles Displayed</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative flex-1 w-full h-full">
        <LeafletFleetMap
          vehicles={filteredVehicles}
          hubs={hubs}
          selectedVehicleId={activeSelectedVehicle?.id}
          onSelectVehicle={(v) => {
            setSelectedVehicle(v);
            setSelectedHub(null);
          }}
          onSelectHub={(h) => {
            setSelectedHub(h);
            setSelectedVehicle(null);
          }}
          showGeofences={showGeofences}
          activeRoutePolyline={activeShipment?.routePolyline || activeSelectedVehicle?.routePoints}
          className="h-full w-full"
        />

        {/* VEHICLE TELEMETRY SIDE PANEL */}
        {activeSelectedVehicle && (
          <div className="absolute top-4 right-4 z-20 w-84 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200 flex flex-col max-h-[calc(100%-2rem)]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                    activeSelectedVehicle.status === 'moving'
                      ? 'bg-emerald-600'
                      : activeSelectedVehicle.status === 'delayed'
                      ? 'bg-rose-600'
                      : 'bg-amber-500'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeSelectedVehicle.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {activeSelectedVehicle.plateNumber}
                    </span>
                    <span
                      className={`px-2 py-0.2 text-[10px] font-black uppercase rounded-full ${
                        activeSelectedVehicle.status === 'moving'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : activeSelectedVehicle.status === 'delayed'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {activeSelectedVehicle.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Details */}
            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              {/* Telemetry gauges: Speed, Heading, Location */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5">
                  <Gauge className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Live Speed</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeSelectedVehicle.currentLocation.speed} km/h
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Heading</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeSelectedVehicle.currentLocation.heading}° NNE
                    </span>
                  </div>
                </div>
              </div>

              {/* Fuel / Battery Monitoring Progress Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-amber-500" />
                    {activeSelectedVehicle.batteryLevel !== undefined ? 'EV Battery Charge' : 'Fuel Tank Level'}
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      activeSelectedVehicle.fuelLevel < 15
                        ? 'text-rose-500 animate-pulse'
                        : activeSelectedVehicle.fuelLevel < 35
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}
                  >
                    {activeSelectedVehicle.fuelLevel}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeSelectedVehicle.fuelLevel < 15
                        ? 'bg-rose-500'
                        : activeSelectedVehicle.fuelLevel < 35
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${activeSelectedVehicle.fuelLevel}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Tank Capacity: {activeSelectedVehicle.fuelCapacityLiters}L</span>
                  {activeSelectedVehicle.fuelLevel < 15 && (
                    <span className="text-rose-500 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Low Fuel Warning
                    </span>
                  )}
                </div>
              </div>

              {/* Current GPS Location & Waypoint */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" /> Current Position
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  {activeSelectedVehicle.currentLocation.address || 'En route on interstate network'}
                </p>
                <p className="font-mono text-[10px] text-slate-400 mt-1">
                  Lat: {activeSelectedVehicle.currentLocation.lat.toFixed(4)}, Lng:{' '}
                  {activeSelectedVehicle.currentLocation.lng.toFixed(4)}
                </p>
              </div>

              {/* Assigned Driver Card */}
              {activeDriver ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                  <img
                    src={activeDriver.avatar}
                    alt={activeDriver.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">Assigned Driver</span>
                    <p className="font-bold text-slate-900 dark:text-white truncate">{activeDriver.name}</p>
                    <p className="text-[10px] text-slate-400">{activeDriver.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-black text-xs">★ {activeDriver.rating}</span>
                    <span className="block text-[9px] text-slate-400">{activeDriver.onTimeRate}% On-Time</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-slate-400 text-center">
                  No driver assigned to this vehicle
                </div>
              )}

              {/* Active Shipment & Waypoint Progress */}
              {activeShipment ? (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Active Consignment
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {activeShipment.trackingNumber}
                    </span>
                  </div>

                  <div className="text-slate-800 dark:text-slate-200 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{activeShipment.customerName}</span>
                      <span className="text-[11px] text-amber-500 font-bold">{activeShipment.eta}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeShipment.origin.name} → {activeShipment.destination.name}
                    </div>
                  </div>

                  {/* Route Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Transit Completion</span>
                      <span className="font-bold text-blue-400">{activeShipment.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${activeShipment.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-slate-400 text-center">
                  Vehicle is available / Unassigned
                </div>
              )}

              {/* Geofence Alert Simulation Test Button */}
              <button
                type="button"
                onClick={() => handleSimulateGeofenceTrigger(activeSelectedVehicle)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                Test Geofence Departure Alert
              </button>
            </div>
          </div>
        )}

        {/* HUB INFORMATION SIDE PANEL */}
        {selectedHub && (
          <div className="absolute top-4 right-4 z-20 w-84 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedHub.name}</h3>
                  <span className="text-xs text-amber-500 font-mono font-bold">
                    {selectedHub.code} • {selectedHub.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedHub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block mb-1">Terminal Address</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedHub.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Fleet Capacity</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedHub.capacityVehicles} Bays
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">Geofence Radius</span>
                  <span className="text-sm font-bold text-amber-500">
                    {(selectedHub.geofenceRadiusMeters / 1000).toFixed(1)} km
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block mb-1">Terminal Contact</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedHub.contactPerson}</p>
                <p className="text-slate-400 text-[11px]">{selectedHub.phone}</p>
                <p className="text-slate-500 text-[10px] mt-1">{selectedHub.operatingHours}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
