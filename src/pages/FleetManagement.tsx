import React, { useState, useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { Vehicle, VehicleStatus, VehicleType } from '../types';
import { Modal } from '../components/common/Modal';
import { FuelLineChart } from '../components/common/Charts';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Fuel,
  Wrench,
  MapPin,
  Calendar,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

interface FleetManagementProps {
  onOpenVehicleDetail?: (vehicleId: string) => void;
  selectedVehicleIdInit?: string | null;
}

export const FleetManagement: React.FC<FleetManagementProps> = ({
  selectedVehicleIdInit
}) => {
  const { vehicles, drivers, hubs, createVehicle, editVehicle, removeVehicle, showToast } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [hubFilter, setHubFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    plateNumber: '',
    type: 'Semi-Truck' as VehicleType,
    capacity: '24,000 kg',
    assignedHubId: 'HUB-CHI',
    assignedDriverId: '',
    status: 'idle' as VehicleStatus,
    fuelCapacityLiters: 450,
    maintenanceScheduleKm: 25000
  });

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        !searchQuery.trim() ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchType = typeFilter === 'all' || v.type === typeFilter;
      const matchHub = hubFilter === 'all' || v.assignedHubId === hubFilter;

      return matchSearch && matchStatus && matchType && matchHub;
    });
  }, [vehicles, searchQuery, statusFilter, typeFilter, hubFilter]);

  // Handle open detail modal if requested
  const handleOpenDetail = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setShowDetailModal(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle);
    setFormData({
      id: vehicle.id,
      name: vehicle.name,
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
      capacity: vehicle.capacity,
      assignedHubId: vehicle.assignedHubId,
      assignedDriverId: vehicle.assignedDriverId || '',
      status: vehicle.status,
      fuelCapacityLiters: vehicle.fuelCapacityLiters,
      maintenanceScheduleKm: vehicle.maintenanceScheduleKm
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hub = hubs.find((h) => h.id === formData.assignedHubId) || hubs[0];
    const drv = drivers.find((d) => d.id === formData.assignedDriverId);

    const vehicleObj: Vehicle = {
      id: formData.id || `VH-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      plateNumber: formData.plateNumber,
      type: formData.type,
      capacity: formData.capacity,
      assignedHubId: hub.id,
      assignedHubName: hub.name,
      assignedDriverId: drv?.id,
      assignedDriverName: drv?.name,
      status: formData.status,
      currentLocation: {
        lat: hub.location.lat,
        lng: hub.location.lng,
        address: `${hub.name} Staging Bay`,
        speed: 0,
        heading: 0,
        lastUpdated: new Date().toISOString()
      },
      fuelLevel: 90,
      fuelCapacityLiters: Number(formData.fuelCapacityLiters),
      mileageKm: 45000,
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      nextMaintenanceDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      maintenanceScheduleKm: Number(formData.maintenanceScheduleKm),
      fuelHistory: [
        { date: '2026-09-20', level: 95, consumptionLiters: 45, costUSD: 56 },
        { date: '2026-09-21', level: 92, consumptionLiters: 40, costUSD: 50 },
        { date: '2026-09-22', level: 90, consumptionLiters: 20, costUSD: 25 }
      ],
      maintenanceLog: [],
      updatedAt: new Date().toISOString()
    };

    await createVehicle(vehicleObj);
    setShowAddModal(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) return;

    const hub = hubs.find((h) => h.id === formData.assignedHubId);
    const drv = drivers.find((d) => d.id === formData.assignedDriverId);

    await editVehicle(currentVehicle.id, {
      name: formData.name,
      plateNumber: formData.plateNumber,
      type: formData.type,
      capacity: formData.capacity,
      assignedHubId: hub ? hub.id : currentVehicle.assignedHubId,
      assignedHubName: hub ? hub.name : currentVehicle.assignedHubName,
      assignedDriverId: drv ? drv.id : undefined,
      assignedDriverName: drv ? drv.name : undefined,
      status: formData.status,
      fuelCapacityLiters: Number(formData.fuelCapacityLiters),
      maintenanceScheduleKm: Number(formData.maintenanceScheduleKm)
    });

    setShowEditModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to decommission vehicle ${id}?`)) {
      await removeVehicle(id);
    }
  };

  const handleRefuel = async (vehicle: Vehicle) => {
    await editVehicle(vehicle.id, {
      fuelLevel: 100,
      batteryLevel: vehicle.batteryLevel !== undefined ? 100 : undefined
    });
    showToast('success', 'Vehicle Refueled', `${vehicle.name} tank filled to 100%.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Fleet Asset Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage commercial haulers, vans, reefers, telematics health & maintenance cycles
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              id: `VH-${Math.floor(115 + Math.random() * 80)}`,
              name: '',
              plateNumber: '',
              type: 'Semi-Truck',
              capacity: '24,000 kg',
              assignedHubId: 'HUB-CHI',
              assignedDriverId: '',
              status: 'idle',
              fuelCapacityLiters: 450,
              maintenanceScheduleKm: 25000
            });
            setShowAddModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Vehicle Asset
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle name, plate, ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Operational States</option>
            <option value="moving">🟢 Moving</option>
            <option value="idle">🟡 Idle</option>
            <option value="delayed">🔴 Delayed</option>
            <option value="offline">⚪ Offline</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Vehicle Types</option>
            <option value="Semi-Truck">Semi-Truck</option>
            <option value="Box Truck">Box Truck</option>
            <option value="Delivery Van">Delivery Van</option>
            <option value="Reefer">Reefer</option>
            <option value="Flatbed">Flatbed</option>
          </select>

          {/* Hub Filter */}
          <select
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Assigned Hubs</option>
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredVehicles.length} of {vehicles.length} assets
        </span>
      </div>

      {/* Fleet Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Vehicle ID & Name</th>
                <th className="px-4 py-3">Type & Capacity</th>
                <th className="px-4 py-3">Driver Assigned</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fuel / Charge Level</th>
                <th className="px-4 py-3">Last Maintenance</th>
                <th className="px-4 py-3">Current Location</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No vehicles found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Vehicle ID & Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                            v.status === 'moving'
                              ? 'bg-emerald-600'
                              : v.status === 'delayed'
                              ? 'bg-rose-600'
                              : 'bg-amber-500'
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {v.name}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{v.id}</span>
                            <span>•</span>
                            <span>{v.plateNumber}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type & Capacity */}
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold block">{v.type}</span>
                      <span className="text-[11px] text-slate-400">{v.capacity}</span>
                    </td>

                    {/* Driver Assigned */}
                    <td className="px-4 py-3.5">
                      {v.assignedDriverName ? (
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {v.assignedDriverName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          v.status === 'moving'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : v.status === 'delayed'
                            ? 'bg-rose-500/20 text-rose-400'
                            : v.status === 'idle'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {v.status}
                      </span>
                    </td>

                    {/* Fuel Level with Progress Bar */}
                    <td className="px-4 py-3.5 min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                            <Fuel className="w-3 h-3 text-amber-500" />
                            {v.fuelLevel}%
                          </span>
                          {v.fuelLevel < 15 && (
                            <span className="text-[9px] font-bold text-rose-500 uppercase animate-pulse">
                              Low!
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              v.fuelLevel < 15
                                ? 'bg-rose-500'
                                : v.fuelLevel < 35
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${v.fuelLevel}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Last Maintenance Date */}
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                      <span>{v.lastMaintenanceDate}</span>
                      <span className="block text-[10px] text-slate-400">
                        Next: {v.nextMaintenanceDate}
                      </span>
                    </td>

                    {/* Current Location */}
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="truncate">{v.currentLocation.address}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          title="Vehicle Telemetry & History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Vehicle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          title="Decommission Vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VEHICLE DETAIL MODAL */}
      {currentVehicle && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Vehicle Telematics: ${currentVehicle.name}`}
          subtitle={`${currentVehicle.id} • Plate: ${currentVehicle.plateNumber} • ${currentVehicle.type}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Fuel Tank Level</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    {currentVehicle.fuelLevel}%
                  </span>
                  <button
                    onClick={() => handleRefuel(currentVehicle)}
                    className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
                  >
                    Refuel
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Total Mileage</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1 block">
                  {currentVehicle.mileageKm.toLocaleString()} km
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Live Speed</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1 block">
                  {currentVehicle.currentLocation.speed} km/h
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Operational State</span>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    currentVehicle.status === 'moving'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : currentVehicle.status === 'delayed'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {currentVehicle.status}
                </span>
              </div>
            </div>

            {/* Fuel Consumption Trend Chart */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-blue-500" />
                    Fuel Consumption Trend (Last 7 Days)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Real-time tank level telemetry recorded during daily routes
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">Tank: {currentVehicle.fuelCapacityLiters} Liters</span>
              </div>

              <FuelLineChart
                data={currentVehicle.fuelHistory || []}
                height={160}
                unit="%"
                valueKey="level"
                color="#2563EB"
              />
            </div>

            {/* Maintenance Log */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-500" />
                Maintenance & Service Log
              </h4>

              {currentVehicle.maintenanceLog && currentVehicle.maintenanceLog.length > 0 ? (
                <div className="space-y-2">
                  {currentVehicle.maintenanceLog.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{log.type}</span>
                        <p className="text-slate-400 text-[11px] mt-0.5">{log.notes}</p>
                        <span className="text-[10px] text-slate-400">
                          {log.date} • Performed by: {log.technician}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ${log.cost}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center text-slate-400">
                  No maintenance incidents logged. Preventive inspection current.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ADD VEHICLE MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Commercial Vehicle"
        subtitle="Register haulage unit or delivery van into company fleet"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit ID</label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="e.g. VH-105"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Plate Number</label>
              <input
                type="text"
                required
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="e.g. IL-4902-TR"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Make & Model</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Freightliner Cascadia 126"
              className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
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
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Hub</label>
              <select
                value={formData.assignedHubId}
                onChange={(e) => setFormData({ ...formData, assignedHubId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
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
              Save Vehicle
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT VEHICLE MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Vehicle Details"
        subtitle={`Modify asset specifications for ${formData.id}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Make & Model</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Plate Number</label>
              <input
                type="text"
                required
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white capitalize"
              >
                <option value="moving">Moving</option>
                <option value="idle">Idle</option>
                <option value="delayed">Delayed</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Driver</label>
              <select
                value={formData.assignedDriverId}
                onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">-- No Driver --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Hub</label>
              <select
                value={formData.assignedHubId}
                onChange={(e) => setFormData({ ...formData, assignedHubId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
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
