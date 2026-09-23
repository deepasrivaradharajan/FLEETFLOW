import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFleet } from '../../context/FleetContext';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Shield,
  Truck,
  Package,
  Users,
  CheckCheck,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';

interface TopBarProps {
  sidebarCollapsed: boolean;
  onOpenAlerts: () => void;
  onSelectEntity?: (type: 'vehicle' | 'shipment' | 'driver' | 'hub', id: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  sidebarCollapsed,
  onOpenAlerts,
  onSelectEntity
}) => {
  const { userProfile, logout, switchRoleForDemo } = useAuth();
  const { alerts, vehicles, shipments, drivers, readAlert, readAllAlerts, unreadAlertsCount } = useFleet();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setShowAlertsDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter entities for global search
  const filteredVehicles = searchQuery.trim()
    ? vehicles.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredShipments = searchQuery.trim()
    ? shipments.filter(
        (s) =>
          s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredDrivers = searchQuery.trim()
    ? drivers.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasSearchResults =
    filteredVehicles.length > 0 || filteredShipments.length > 0 || filteredDrivers.length > 0;

  const currentRole = userProfile?.role || 'dispatcher';

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Search Bar */}
      <div ref={searchRef} className="relative w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            placeholder="Search vehicles, tracking #, drivers, destinations..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
            {!hasSearchResults ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No fleet assets or orders match "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVehicles.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Vehicles ({filteredVehicles.length})
                    </div>
                    {filteredVehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          onSelectEntity?.('vehicle', v.id);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs"
                      >
                        <Truck className="w-4 h-4 text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{v.name}</span>
                          <span className="text-slate-400 ml-2 font-mono">[{v.plateNumber}]</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          v.status === 'moving' ? 'bg-emerald-500/20 text-emerald-400' :
                          v.status === 'delayed' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredShipments.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Shipments ({filteredShipments.length})
                    </div>
                    {filteredShipments.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectEntity?.('shipment', s.id);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs"
                      >
                        <Package className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{s.trackingNumber}</span>
                          <p className="text-slate-400 truncate">{s.origin.name} → {s.destination.name}</p>
                        </div>
                        <span className="text-blue-500 font-bold">{s.progress}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredDrivers.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Drivers ({filteredDrivers.length})
                    </div>
                    {filteredDrivers.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          onSelectEntity?.('driver', d.id);
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs"
                      >
                        <Users className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{d.name}</span>
                          <span className="text-slate-400 ml-2 font-mono">[{d.id}]</span>
                        </div>
                        <span className="text-amber-500 font-bold">★ {d.rating}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Role perspective switcher pill for demo & evaluation */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-xs">
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => switchRoleForDemo(e.target.value as UserRole)}
            className="bg-transparent font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer capitalize"
          >
            <option value="admin" className="dark:bg-slate-800">Admin (Full Access)</option>
            <option value="dispatcher" className="dark:bg-slate-800">Dispatcher (Fleet & Hubs)</option>
            <option value="driver" className="dark:bg-slate-800">Driver (My Vehicle & Route)</option>
          </select>
        </div>

        {/* Notifications Bell Dropdown */}
        <div ref={alertsRef} className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="System Alerts & Incidents"
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900">
                {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Panel */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Active Alerts</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-rose-500/20 text-rose-400 font-black">
                    {unreadAlertsCount} unread
                  </span>
                </div>
                {unreadAlertsCount > 0 && (
                  <button
                    onClick={() => readAllAlerts()}
                    className="text-xs text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {alerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    All fleet telematics systems nominal. No active alerts.
                  </div>
                ) : (
                  alerts.slice(0, 6).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => readAlert(alert.id)}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        !alert.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {alert.severity === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : alert.severity === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {alert.title}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-center">
                <button
                  onClick={() => {
                    setShowAlertsDropdown(false);
                    onOpenAlerts();
                  }}
                  className="w-full text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline py-1"
                >
                  View All Alerts Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-600/20">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {userProfile?.displayName || 'User'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {currentRole}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {userProfile?.displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {userProfile?.email}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
