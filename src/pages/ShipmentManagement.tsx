import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFleet } from '../context/FleetContext';
import { Shipment, ShipmentStatus, ShipmentPriority } from '../types';
import { Modal } from '../components/common/Modal';
import { LeafletFleetMap } from '../components/map/LeafletFleetMap';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  User,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface ShipmentManagementProps {
  onOpenShipmentDetail?: (shipmentId: string) => void;
  selectedShipmentIdInit?: string | null;
}

export const ShipmentManagement: React.FC<ShipmentManagementProps> = ({
  selectedShipmentIdInit
}) => {
  const { userProfile } = useAuth();
  const {
    shipments,
    vehicles,
    drivers,
    hubs,
    createShipment,
    editShipment,
    removeShipment,
    advanceShipmentStatus,
    showToast
  } = useFleet();

  const role = userProfile?.role || 'dispatcher';
  const isDriverRole = role === 'driver';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);

  // Form State for Create
  const [newShipment, setNewShipment] = useState({
    customerName: '',
    customerContact: '',
    originName: 'Chicago Central Logistics Hub',
    originAddress: '4200 S Pulaski Rd, Chicago, IL',
    originLat: 41.8155,
    originLng: -87.7235,
    destinationName: 'Detroit Freight Terminal',
    destinationAddress: '1500 E Grand Blvd, Detroit, MI',
    destinationLat: 42.3601,
    destinationLng: -83.0575,
    description: 'Automotive stamping dies & precision fasteners',
    weightKg: 8500,
    pieces: 14,
    isFragile: false,
    temperatureSensitive: false,
    priority: 'standard' as ShipmentPriority,
    assignedVehicleId: '',
    assignedDriverId: '',
    eta: 'Tomorrow, 16:30 EST'
  });

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      // If driver role: only show shipments assigned to this driver or driver's vehicle
      if (isDriverRole) {
        const isMyShipment =
          s.assignedDriverId === userProfile?.driverId ||
          s.assignedDriverName?.toLowerCase() === userProfile?.displayName?.toLowerCase();
        if (!isMyShipment) return false;
      }

      const matchSearch =
        !searchQuery.trim() ||
        s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.origin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.assignedDriverName && s.assignedDriverName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || s.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [shipments, isDriverRole, userProfile, searchQuery, statusFilter, priorityFilter]);

  const handleOpenDetail = (s: Shipment) => {
    setActiveShipment(s);
    setShowDetailModal(true);
  };

  const handleAutoAssign = () => {
    // Pick the first idle or available vehicle and driver
    const candidateVehicle = vehicles.find((v) => v.status === 'idle') || vehicles[0];
    const candidateDriver = drivers.find((d) => d.status === 'on_duty') || drivers[0];

    if (candidateVehicle) {
      setNewShipment((prev) => ({
        ...prev,
        assignedVehicleId: candidateVehicle.id,
        assignedDriverId: candidateDriver ? candidateDriver.id : ''
      }));
      showToast('info', 'Smart Auto-Assignment', `Suggested ${candidateVehicle.name} and driver.`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedVeh = vehicles.find((v) => v.id === newShipment.assignedVehicleId);
    const assignedDrv = drivers.find((d) => d.id === newShipment.assignedDriverId);

    const shipId = `SHP-${Math.floor(9100 + Math.random() * 800)}`;
    const trackingNum = `FF-${newShipment.originName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-USA`;

    const doc: Shipment = {
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
        isFragile: newShipment.isFragile,
        temperatureSensitive: newShipment.temperatureSensitive
      },
      assignedVehicleId: assignedVeh?.id,
      assignedVehicleName: assignedVeh?.name,
      assignedDriverId: assignedDrv?.id,
      assignedDriverName: assignedDrv?.name,
      eta: newShipment.eta,
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
          note: `Booking registered for ${newShipment.customerName}`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await createShipment(doc);
    setShowCreateModal(false);
  };

  const handleAdvanceStatus = async (shipment: Shipment, nextStatus: ShipmentStatus) => {
    await advanceShipmentStatus(shipment.id, nextStatus);
    if (activeShipment && activeShipment.id === shipment.id) {
      setActiveShipment({ ...activeShipment, status: nextStatus });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to cancel shipment ${id}?`)) {
      await removeShipment(id);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isDriverRole ? 'My Assigned Shipments & Cargo' : 'Freight Shipment Dispatch'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bill of lading tracking, milestone progression, priority dispatch & ETAs
          </p>
        </div>

        {!isDriverRole && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Consignment
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking #, customer, route..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Transit Statuses</option>
            <option value="pending">🟡 Pending / Dispatched</option>
            <option value="in_transit">🔵 In Transit</option>
            <option value="delayed">🔴 Delayed</option>
            <option value="delivered">🟢 Delivered</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="standard">Standard</option>
            <option value="express">⚡ Express</option>
            <option value="urgent">🔥 Urgent</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredShipments.length} consignments
        </span>
      </div>

      {/* Shipments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Tracking / BOL</th>
                <th className="px-4 py-3">Customer & Cargo</th>
                <th className="px-4 py-3">Origin & Destination</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">ETA & Progress</th>
                <th className="px-4 py-3">Hauler & Driver</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No shipments found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Tracking ID */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block">
                        {s.trackingNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{s.id}</span>
                    </td>

                    {/* Customer & Cargo */}
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">
                        {s.customerName}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                        {s.packageDetails.description} ({s.packageDetails.weightKg.toLocaleString()} kg)
                      </span>
                    </td>

                    {/* Origin & Destination */}
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="truncate">{s.origin.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{s.destination.name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          s.status === 'in_transit'
                            ? 'bg-blue-500/20 text-blue-400'
                            : s.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : s.status === 'delayed'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : s.priority === 'express'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {s.priority}
                      </span>
                    </td>

                    {/* ETA & Progress */}
                    <td className="px-4 py-3.5 min-w-[120px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] block">
                        {s.eta}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{s.progress}%</span>
                      </div>
                    </td>

                    {/* Vehicle & Driver */}
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold block truncate">
                        {s.assignedVehicleName || 'Unassigned'}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {s.assignedDriverName || 'No Driver'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          title="View Shipment Manifest & Timeline"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Status Advancement Quick Button */}
                        {s.status === 'pending' && (
                          <button
                            onClick={() => handleAdvanceStatus(s, 'in_transit')}
                            className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-500"
                          >
                            Dispatch
                          </button>
                        )}

                        {s.status === 'in_transit' && (
                          <button
                            onClick={() => handleAdvanceStatus(s, 'delivered')}
                            className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-500"
                          >
                            Mark Delivered
                          </button>
                        )}

                        {!isDriverRole && (
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                            title="Cancel Shipment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SHIPMENT DETAIL MODAL */}
      {activeShipment && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Shipment Manifest: ${activeShipment.trackingNumber}`}
          subtitle={`${activeShipment.customerName} • Priority: ${activeShipment.priority.toUpperCase()}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Visual Milestones Stepper */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                Milestone Progression Timeline
              </h4>

              <div className="grid grid-cols-4 gap-2 text-center relative">
                {[
                  { key: 'created', label: '1. Manifest Created', complete: true },
                  {
                    key: 'in_transit',
                    label: '2. In Transit',
                    complete: activeShipment.status === 'in_transit' || activeShipment.status === 'delivered'
                  },
                  {
                    key: 'destination',
                    label: '3. At Destination',
                    complete: activeShipment.progress >= 95 || activeShipment.status === 'delivered'
                  },
                  {
                    key: 'delivered',
                    label: '4. Signed & Delivered',
                    complete: activeShipment.status === 'delivered'
                  }
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                        step.complete
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {step.complete ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        step.complete ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons inside detail */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Current Status: <strong className="uppercase text-blue-500">{activeShipment.status}</strong>
                </span>
                <div className="flex gap-2">
                  {activeShipment.status !== 'delivered' && (
                    <button
                      onClick={() => handleAdvanceStatus(activeShipment, 'delivered')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {activeShipment.status !== 'delayed' && activeShipment.status !== 'delivered' && (
                    <button
                      onClick={() => handleAdvanceStatus(activeShipment, 'delayed')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold border border-rose-500/40"
                    >
                      Flag Delayed
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cargo & Assignment info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-500" /> Cargo Specifications
                </h5>
                <p className="text-slate-600 dark:text-slate-300">{activeShipment.packageDetails.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                  <div>Weight: <strong>{activeShipment.packageDetails.weightKg} kg</strong></div>
                  <div>Pieces: <strong>{activeShipment.packageDetails.pieces} pallets</strong></div>
                  <div>Fragile: <strong>{activeShipment.packageDetails.isFragile ? 'Yes' : 'No'}</strong></div>
                  <div>Temp Control: <strong>{activeShipment.packageDetails.temperatureSensitive ? 'Required' : 'Ambient'}</strong></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-500" /> Carrier & Personnel
                </h5>
                <p className="text-slate-600 dark:text-slate-300">
                  Vehicle: <strong>{activeShipment.assignedVehicleName || 'Unassigned'}</strong>
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Driver: <strong>{activeShipment.assignedDriverName || 'Unassigned'}</strong>
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] pt-1">
                  Expected Delivery ETA: <strong className="text-blue-500">{activeShipment.eta}</strong>
                </p>
              </div>
            </div>

            {/* Waypoints Origin/Dest */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Origin Facility:</span>
                  <p className="text-slate-600 dark:text-slate-300">{activeShipment.origin.name} ({activeShipment.origin.address})</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Destination Facility:</span>
                  <p className="text-slate-600 dark:text-slate-300">{activeShipment.destination.name} ({activeShipment.destination.address})</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE SHIPMENT MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Freight Consignment"
        subtitle="Book commercial shipment, configure waypoints, and assign hauler"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAutoAssign}
              className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5 hover:bg-blue-100"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Auto-Suggest Available Assets
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer / Consignee</label>
              <input
                type="text"
                required
                value={newShipment.customerName}
                onChange={(e) => setNewShipment({ ...newShipment, customerName: e.target.value })}
                placeholder="e.g. Navistar International"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Contact</label>
              <input
                type="email"
                required
                value={newShipment.customerContact}
                onChange={(e) => setNewShipment({ ...newShipment, customerContact: e.target.value })}
                placeholder="logistics@client.com"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Origin Logistics Hub</label>
              <select
                value={newShipment.originName}
                onChange={(e) => {
                  const h = hubs.find((hub) => hub.name === e.target.value);
                  if (h) {
                    setNewShipment({
                      ...newShipment,
                      originName: h.name,
                      originAddress: h.address,
                      originLat: h.location.lat,
                      originLng: h.location.lng
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
                placeholder="e.g. Columbus Distribution Depot"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo Manifest Summary</label>
            <input
              type="text"
              required
              value={newShipment.description}
              onChange={(e) => setNewShipment({ ...newShipment, description: e.target.value })}
              placeholder="e.g. Refrigerated pharmaceuticals, medical diagnostics"
              className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Gross Weight (kg)</label>
              <input
                type="number"
                required
                value={newShipment.weightKg}
                onChange={(e) => setNewShipment({ ...newShipment, weightKg: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pieces / Pallets</label>
              <input
                type="number"
                required
                value={newShipment.pieces}
                onChange={(e) => setNewShipment({ ...newShipment, pieces: Number(e.target.value) })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Class</label>
              <select
                value={newShipment.priority}
                onChange={(e) => setNewShipment({ ...newShipment, priority: e.target.value as ShipmentPriority })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="standard">Standard Freight</option>
                <option value="express">⚡ Express Expedited</option>
                <option value="urgent">🔥 Urgent Hot-Shot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Vehicle Assignment</label>
              <select
                value={newShipment.assignedVehicleId}
                onChange={(e) => setNewShipment({ ...newShipment, assignedVehicleId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">-- Manual Selection --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id} - {v.name} ({v.type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver Assignment</label>
              <select
                value={newShipment.assignedDriverId}
                onChange={(e) => setNewShipment({ ...newShipment, assignedDriverId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">-- Manual Selection --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status}) • Rating: ★ {d.rating}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/30"
            >
              Issue Manifest
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
