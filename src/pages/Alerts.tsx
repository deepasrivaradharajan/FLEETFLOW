import React, { useState, useMemo } from 'react';
import { useFleet } from '../context/FleetContext';
import { Alert, AlertSeverity, AlertType } from '../types';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  Filter,
  Search,
  CheckCheck,
  Fuel,
  Compass,
  Clock,
  Wrench,
  Truck
} from 'lucide-react';

interface AlertsProps {
  onSelectEntity?: (type: 'vehicle' | 'shipment' | 'driver' | 'hub', id: string) => void;
}

export const Alerts: React.FC<AlertsProps> = ({ onSelectEntity }) => {
  const { alerts, readAlert, readAllAlerts, removeAlert, clearAllAlerts } = useFleet();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      const matchSearch =
        !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.vehicleId && a.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSeverity && matchType && matchSearch;
    });
  }, [alerts, severityFilter, typeFilter, searchQuery]);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const unreadCount = alerts.filter((a) => !a.read).length;

  const getAlertIcon = (type: AlertType, severity: AlertSeverity) => {
    if (severity === 'critical') return <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />;
    if (severity === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Alerts & Telematics Incidents
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time geofence breaches, route delays, maintenance requirements, and low fuel alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => readAllAlerts()}
              className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </button>
          )}
          {alerts.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all logged alert notifications?')) clearAllAlerts();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Critical Incidents</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
              {criticalCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Warning Notices</span>
            <div className="text-2xl font-black text-amber-500 mt-1 font-mono">{warningCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Unread Logs</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
              {unreadCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>
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
              placeholder="Search alert title, vehicle, message..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical</option>
            <option value="warning">🟡 Warning</option>
            <option value="info">🔵 Information</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Trigger Categories</option>
            <option value="fuel_low">Low Fuel Level (&lt;15%)</option>
            <option value="geofence_entry">Geofence Entry</option>
            <option value="geofence_exit">Geofence Departure</option>
            <option value="route_deviation">Route Deviation</option>
            <option value="delivery_delayed">Shipment Delay</option>
            <option value="maintenance_due">Maintenance Due</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          {filteredAlerts.length} events logged
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Clear</h3>
            <p className="text-xs text-slate-500 mt-1">
              No matching alerts or notifications found in telematics feed.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                !alert.read
                  ? 'bg-blue-50/30 dark:bg-slate-900 border-blue-200 dark:border-blue-900/60 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="mt-0.5">{getAlertIcon(alert.type, alert.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {alert.title}
                    </h4>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-black uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400'
                          : alert.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" title="Unread" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>

                    {alert.vehicleId && (
                      <button
                        onClick={() => onSelectEntity?.('vehicle', alert.vehicleId!)}
                        className="text-blue-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" /> Vehicle {alert.vehicleId}
                      </button>
                    )}

                    <span className="capitalize text-slate-500">
                      Category: {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {!alert.read && (
                  <button
                    onClick={() => readAlert(alert.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Mark as Read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Dismiss Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
