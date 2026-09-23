import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFleet } from '../context/FleetContext';
import { Driver, DriverStatus, LicenseStatus } from '../types';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Plus,
  Search,
  Filter,
  Star,
  Shield,
  Truck,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit2,
  Trash2,
  Award,
  Package,
  Navigation
} from 'lucide-react';

interface DriverManagementProps {
  onOpenDriverDetail?: (driverId: string) => void;
  selectedDriverIdInit?: string | null;
}

export const DriverManagement: React.FC<DriverManagementProps> = ({ selectedDriverIdInit }) => {
  const { userProfile } = useAuth();
  const { drivers, vehicles, shipments, createDriver, editDriver, removeDriver } = useFleet();

  const role = userProfile?.role || 'dispatcher';
  const isDriverRole = role === 'driver';

  // If driver role: identify the logged-in driver record
  const currentLoggedInDriver = useMemo(() => {
    return (
      drivers.find(
        (d) =>
          d.id === userProfile?.driverId ||
          d.userId === userProfile?.uid ||
          d.email.toLowerCase() === userProfile?.email?.toLowerCase()
      ) || drivers[0]
    );
  }, [drivers, userProfile]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseFilter, setLicenseFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    assignedVehicleId: '',
    status: 'on_duty' as DriverStatus,
    licenseNumber: '',
    licenseCategory: 'CDL Class A',
    licenseExpiry: '',
    emergencyContact: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  // Filtered drivers (Admin & Dispatcher see all; Driver role sees only themselves)
  const displayDrivers = useMemo(() => {
    if (isDriverRole && currentLoggedInDriver) {
      return [currentLoggedInDriver];
    }

    return drivers.filter((d) => {
      const matchSearch =
        !searchQuery.trim() ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchLicense = licenseFilter === 'all' || d.licenseStatus === licenseFilter;

      return matchSearch && matchStatus && matchLicense;
    });
  }, [drivers, isDriverRole, currentLoggedInDriver, searchQuery, statusFilter, licenseFilter]);

  const handleOpenDetail = (driver: Driver) => {
    setActiveDriver(driver);
    setShowDetailModal(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setActiveDriver(driver);
    setFormData({
      id: driver.id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      assignedVehicleId: driver.assignedVehicleId || '',
      status: driver.status,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiry: driver.licenseExpiry,
      emergencyContact: driver.emergencyContact,
      avatar: driver.avatar
    });
    setShowEditModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === formData.assignedVehicleId);

    const newDriver: Driver = {
      id: formData.id || `DRV-${Math.floor(200 + Math.random() * 800)}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar,
      assignedVehicleId: veh?.id,
      assignedVehicleName: veh?.name,
      status: formData.status,
      rating: 4.9,
      totalDeliveries: 120,
      onTimeRate: 97,
      licenseNumber: formData.licenseNumber,
      licenseCategory: formData.licenseCategory,
      licenseExpiry: formData.licenseExpiry || '2028-01-15',
      licenseStatus: 'valid',
      emergencyContact: formData.emergencyContact,
      ratingHistory: [
        { month: 'Jul', rating: 4.88 },
        { month: 'Aug', rating: 4.90 },
        { month: 'Sep', rating: 4.92 }
      ],
      tripHistory: [],
      createdAt: new Date().toISOString()
    };

    await createDriver(newDriver);
    setShowAddModal(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDriver) return;

    const veh = vehicles.find((v) => v.id === formData.assignedVehicleId);

    await editDriver(activeDriver.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      assignedVehicleId: veh ? veh.id : undefined,
      assignedVehicleName: veh ? veh.name : undefined,
      status: formData.status,
      licenseNumber: formData.licenseNumber,
      licenseCategory: formData.licenseCategory,
      licenseExpiry: formData.licenseExpiry,
      emergencyContact: formData.emergencyContact
    });

    setShowEditModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to remove driver ${id}?`)) {
      await removeDriver(id);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isDriverRole ? 'My Driver Profile & Cab Assignment' : 'Driver Roster & Compliance'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isDriverRole
              ? 'Your certified credentials, assigned commercial vehicle, and safety score'
              : 'Commercial driver licenses (CDL), safety ratings, trip manifests, and assignment roster'}
          </p>
        </div>

        {!isDriverRole && (
          <button
            onClick={() => {
              setFormData({
                id: `DRV-${Math.floor(111 + Math.random() * 80)}`,
                name: '',
                email: '',
                phone: '',
                assignedVehicleId: '',
                status: 'on_duty',
                licenseNumber: '',
                licenseCategory: 'CDL Class A',
                licenseExpiry: '2028-06-30',
                emergencyContact: '',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Driver
          </button>
        )}
      </div>

      {/* Driver-Role Perspective Special Card */}
      {isDriverRole && currentLoggedInDriver && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <img
                src={currentLoggedInDriver.avatar}
                alt={currentLoggedInDriver.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-lg"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {currentLoggedInDriver.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                    {currentLoggedInDriver.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {currentLoggedInDriver.id} • License: {currentLoggedInDriver.licenseNumber}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-500" /> {currentLoggedInDriver.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-500" /> {currentLoggedInDriver.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Setter for Driver */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Update Current Cab State:</span>
              <div className="flex items-center gap-2">
                {(['driving', 'on_duty', 'break', 'off_duty'] as DriverStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => editDriver(currentLoggedInDriver.id, { status: st })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      currentLoggedInDriver.status === st
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* KPI Snapshot */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Safety & Delivery Rating
            </h3>
            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-500">
                  {currentLoggedInDriver.rating}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold mt-1">
                <Award className="w-4 h-4" /> Top Tier Commercial Driver
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Completed Runs:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentLoggedInDriver.totalDeliveries}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">On-Time Arrival Rate:</span>
                <span className="font-bold text-emerald-500">{currentLoggedInDriver.onTimeRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar (for Admin/Dispatcher) */}
      {!isDriverRole && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search driver name, phone, license..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Driver Statuses</option>
              <option value="driving">🟢 Driving</option>
              <option value="on_duty">🔵 On Duty</option>
              <option value="break">🟡 Break</option>
              <option value="off_duty">⚪ Off Duty</option>
            </select>

            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All License States</option>
              <option value="valid">Valid</option>
              <option value="expiring_soon">⚠️ Expiring Soon (&lt;60d)</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-mono">
            {displayDrivers.length} certified drivers
          </span>
        </div>
      )}

      {/* Drivers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Driver Name & Contact</th>
                <th className="px-4 py-3">Assigned Vehicle</th>
                <th className="px-4 py-3">Duty Status</th>
                <th className="px-4 py-3">Safety Rating</th>
                <th className="px-4 py-3">CDL License & Expiry</th>
                <th className="px-4 py-3">Emergency Contact</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayDrivers.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Name & Contact */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={d.avatar}
                        alt={d.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {d.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {d.id} • {d.phone}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Vehicle */}
                  <td className="px-4 py-3.5">
                    {d.assignedVehicleName ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-500" />
                        {d.assignedVehicleName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No Vehicle Assigned</span>
                    )}
                  </td>

                  {/* Duty Status */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        d.status === 'driving'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : d.status === 'on_duty'
                          ? 'bg-blue-500/20 text-blue-400'
                          : d.status === 'break'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {d.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Performance Rating */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-amber-500 font-mono text-sm">
                        ★ {d.rating}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({d.onTimeRate}% on-time)
                      </span>
                    </div>
                  </td>

                  {/* CDL License & Expiry */}
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold block">
                        {d.licenseNumber}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Exp: {d.licenseExpiry}</span>
                        {d.licenseStatus === 'expiring_soon' && (
                          <span className="text-[9px] font-bold text-amber-500 uppercase px-1 rounded bg-amber-500/10">
                            Renew
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Emergency Contact */}
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    {d.emergencyContact || 'On file with Dispatch'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(d)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        title="Driver Profile & History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {!isDriverRole && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(d)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Driver"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                            title="Remove Driver"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRIVER DETAIL MODAL */}
      {activeDriver && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Driver Profile: ${activeDriver.name}`}
          subtitle={`${activeDriver.id} • ${activeDriver.licenseCategory}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <img
                src={activeDriver.avatar}
                alt={activeDriver.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
              />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeDriver.name}
                </h3>
                <p className="text-slate-400">{activeDriver.email} • {activeDriver.phone}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400">
                    {activeDriver.status}
                  </span>
                  <span className="text-amber-500 font-bold">★ {activeDriver.rating} Safety Score</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">Assigned Commercial Asset</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                  {activeDriver.assignedVehicleName || 'None assigned'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-semibold">License Validity</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block font-mono">
                  {activeDriver.licenseNumber} (Exp: {activeDriver.licenseExpiry})
                </span>
              </div>
            </div>

            {/* Trip History */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Recent Haulage Trip History</h4>
              {activeDriver.tripHistory && activeDriver.tripHistory.length > 0 ? (
                <div className="space-y-2">
                  {activeDriver.tripHistory.map((trip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{trip.trackingNumber}</span>
                        <p className="text-slate-400 text-[11px]">{trip.origin} → {trip.destination}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{trip.distanceKm} km</span>
                        <span className="block text-[10px] text-emerald-400 font-semibold">On-Time Arrival</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center text-slate-400">
                  Current active run ongoing. Previous trip archives archived in dispatch ledger.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ADD DRIVER MODAL */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Commercial Driver"
        subtitle="Add driver credentials, CDL qualification, and assign hauler"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Samuel Ortiz"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver ID</label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">License Number</label>
              <input
                type="text"
                required
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="IL-CDL-908122"
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">License Expiry</label>
              <input
                type="date"
                required
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Initial Vehicle</label>
              <select
                value={formData.assignedVehicleId}
                onChange={(e) => setFormData({ ...formData, assignedVehicleId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">-- None --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.plateNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Name and phone"
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
              Add Driver
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT DRIVER MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Driver Profile"
        subtitle={`Update credentials and cab assignment for ${formData.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Driver Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Duty Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DriverStatus })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white capitalize"
              >
                <option value="driving">Driving</option>
                <option value="on_duty">On Duty</option>
                <option value="break">Break</option>
                <option value="off_duty">Off Duty</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Vehicle</label>
              <select
                value={formData.assignedVehicleId}
                onChange={(e) => setFormData({ ...formData, assignedVehicleId: e.target.value })}
                className="w-full p-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="">-- None --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.plateNumber})
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
