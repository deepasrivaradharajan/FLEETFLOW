import React, { useState, useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { Hub, HubType } from '../types';
import { Modal } from '../components/common/Modal';
import { LeafletFleetMap } from '../components/map/LeafletFleetMap';
import {
  Warehouse,
  Plus,
  Search,
  MapPin,
  Truck,
  Package,
  Layers,
  Phone,
  Clock,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Activity
} from 'lucide-react';

export const HubManagement: React.FC = () => {
  const { hubs, vehicles, shipments, createHub, editHub, removeHub } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeHub, setActiveHub] = useState<Hub | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    type: 'Regional Distribution Center' as HubType,
    address: '',
    lat: 41.8155,
    lng: -87.7235,
    capacityVehicles: 30,
    geofenceRadiusMeters: 4000,
    contactPerson: '',
    phone: '',
    operatingHours: '24/7 Operations'
  });

  const filteredHubs = useMemo(() => {
    return hubs.filter((h) => {
      return (
        !searchQuery.trim() ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [hubs, searchQuery]);

  const handleOpenDetail = (hub: Hub) => {
    setActiveHub(hub);
    setShowDetailModal(true);
  };

  const handleOpenEdit = (hub: Hub) => {
    setActiveHub(hub);
    setFormData({
      id: hub.id,
      name: hub.name,
      code: hub.code,
      type: hub.type,
      address: hub.address,
      lat: hub.location.lat,
      lng: hub.location.lng,
      capacityVehicles: hub.capacityVehicles,
      geofenceRadiusMeters: hub.geofenceRadiusMeters,
      contactPerson: hub.contactPerson,
      phone: hub.phone,
      operatingHours: hub.operatingHours
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newHub: Hub = {
      id: formData.id || `HUB-${formData.code.toUpperCase() || 'NEW'}`,
      name: formData.name,
      code: formData.code.toUpperCase(),
      type: formData.type,
      location: { lat: Number(formData.lat), lng: Number(formData.lng) },
      address: formData.address,
      capacityVehicles: Number(formData.capacityVehicles),
      geofenceRadiusMeters: Number(formData.geofenceRadiusMeters),
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      operatingHours: formData.operatingHours,
      createdAt: new Date().toISOString()
    };

    await createHub(newHub);
    setShowAddModal(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHub) return;

    await editHub(activeHub.id, {
      name: formData.name,
      code: formData.code.toUpperCase(),
      type: formData.type,
      location: { lat: Number(formData.lat), lng: Number(formData.lng) },
      address: formData.address,
      capacityVehicles: Number(formData.capacityVehicles),
      geofenceRadiusMeters: Number(formData.geofenceRadiusMeters),
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      operatingHours: formData.operatingHours
    });

    setShowEditModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to decommission hub terminal ${id}?`)) {
      await removeHub(id);
    }
  };

  // Compute hub stats
  const getHubVehicles = (hubId: string) => vehicles.filter((v) => v.assignedHubId === hubId);
  const getHubShipments = (hubName: string) =>
    shipments.filter((s) => s.origin.name.includes(hubName.split(' ')[0]) || s.destination.name.includes(hubName.split(' ')[0]));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Hubs & Depots Network
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Logistics terminals, staging bays, geofenced boundaries & capacity utilization
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              id: `HUB-${Math.floor(10 + Math.random() * 90)}`,
              name: '',
              code: '',
              type: 'Cross-Dock Facility',
              address: '',
              lat: 40.7128,
              lng: -74.006,
              capacityVehicles: 35,
              geofenceRadiusMeters: 4500,
              contactPerson: '',
              phone: '',
              operatingHours: '24/7 Operations'
            });
            setShowAddModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Logistics Hub
        </button>
      </div>

      {/* Filter / Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hub by terminal name, code, or city..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {filteredHubs.length} active terminals
        </span>
      </div>

      {/* Hub Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHubs.map((hub) => {
          const assignedVehs = getHubVehicles(hub.id);
          const activeShipments = getHubShipments(hub.name);
          const utilizationPct = Math.min(100, Math.round((assignedVehs.length / hub.capacityVehicles) * 100));

          return (
            <div
              key={hub.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                      <Warehouse className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{hub.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          {hub.code}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          • {hub.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(hub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(hub.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Address */}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{hub.address}</span>
                </p>

                {/* Capacity Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      Bay Utilization
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {assignedVehs.length} / {hub.capacityVehicles} bays ({utilizationPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        utilizationPct > 85 ? 'bg-rose-500' : utilizationPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${utilizationPct}%` }}
                    />
                  </div>
                </div>

                {/* Geofence & Shipments badges */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Geofence Radius</span>
                    <span className="font-bold text-amber-500 font-mono">
                      {(hub.geofenceRadiusMeters / 1000).toFixed(1)} km Zone
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Active Shipments</span>
                    <span className="font-bold text-blue-500 font-mono">
                      {activeShipments.length} Transits
                    </span>
                  </div>
                </div>
              </div>

              {/* View Detail CTA */}
              <button
                onClick={() => handleOpenDetail(hub)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" /> Terminal Dispatch Overview
              </button>
            </div>
          );
        })}
      </div>

      {/* HUB DETAIL MODAL */}
      {activeHub && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Logistics Terminal: ${activeHub.name}`}
          subtitle={`${activeHub.code} • ${activeHub.address}`}
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Terminal Map preview with geofence circle */}
            <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <LeafletFleetMap
                vehicles={vehicles.filter((v) => v.assignedHubId === activeHub.id)}
                hubs={[activeHub]}
                showGeofences={true}
                center={[activeHub.location.lat, activeHub.location.lng]}
                zoom={11}
                className="h-full w-full"
              />
            </div>

            {/* Hub Contacts & Operating stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Terminal Superintendent</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {activeHub.contactPerson}
                </span>
                <span className="text-[11px] text-slate-400">{activeHub.phone}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Staging Bay Capacity</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {activeHub.capacityVehicles} Commercial Units
                </span>
                <span className="text-[11px] text-slate-400">Security Gate Managed</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Telemetry Geofence</span>
                <span className="text-sm font-bold text-amber-500 mt-0.5 block font-mono">
                  {(activeHub.geofenceRadiusMeters / 1000).toFixed(1)} km Perimeter
                </span>
                <span className="text-[11px] text-slate-400">Automated departure alerts</span>
              </div>
            </div>

            {/* Assigned Fleet Vehicles in Terminal */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-500" />
                Fleet Vehicles Stationed / Assigned
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {getHubVehicles(activeHub.id).map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{v.name}</span>
                      <p className="text-slate-400 text-[10px] font-mono">{v.id} • {v.plateNumber}</p>
                    </div>
                    <span className="text-amber-500 font-mono font-bold">{v.fuelLevel}% Fuel</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD HUB MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Logistics Hub"
        subtitle="Establish regional depot or cross-dock terminal with geofencing"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hub Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Memphis Intermodal Gateway"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hub Code (3-4 Letters)</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="MEM"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 3100 Democrat Rd, Memphis, TN"
              className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GPS Latitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GPS Longitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Bay Capacity</label>
              <input
                type="number"
                required
                value={formData.capacityVehicles}
                onChange={(e) => setFormData({ ...formData, capacityVehicles: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Geofence Radius (Meters)</label>
              <input
                type="number"
                required
                value={formData.geofenceRadiusMeters}
                onChange={(e) => setFormData({ ...formData, geofenceRadiusMeters: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Terminal Superintendent</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Supervisor Name"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (901) 555-0182"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
            >
              Add Terminal
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT HUB MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Terminal Facility"
        subtitle={`Update configuration for ${formData.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hub Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bay Capacity</label>
              <input
                type="number"
                required
                value={formData.capacityVehicles}
                onChange={(e) => setFormData({ ...formData, capacityVehicles: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Geofence Radius (Meters)</label>
              <input
                type="number"
                required
                value={formData.geofenceRadiusMeters}
                onChange={(e) => setFormData({ ...formData, geofenceRadiusMeters: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
