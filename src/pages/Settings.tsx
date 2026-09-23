import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFleet } from '../context/FleetContext';
import { UserRole } from '../types';
import {
  Settings as SettingsIcon,
  Shield,
  Building,
  Bell,
  RefreshCw,
  Radio,
  Sliders,
  CheckCircle2,
  Database,
  Power
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { userProfile, switchRoleForDemo } = useAuth();
  const { seedInitialData, showToast } = useFleet();

  const [companyName, setCompanyName] = useState('FleetFlow Logistics Global, Inc.');
  const [hqAddress, setHqAddress] = useState('233 S Wacker Dr, Chicago, IL 60606');
  const [supportEmail, setSupportEmail] = useState('dispatch-ops@fleetflow.io');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (800) 555-FLEET');

  // Alert toggles
  const [alertsLowFuel, setAlertsLowFuel] = useState(true);
  const [alertsGeofence, setAlertsGeofence] = useState(true);
  const [alertsDelays, setAlertsDelays] = useState(true);
  const [alertsMaintenance, setAlertsMaintenance] = useState(true);

  // GPS Simulation refresh rate
  const [gpsIntervalSeconds, setGpsIntervalSeconds] = useState(4);
  const [isReSeeding, setIsReSeeding] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Settings Updated', 'Company profile and operational defaults saved.');
  };

  const handleResetData = async () => {
    if (
      confirm(
        'Are you sure you want to reset and re-seed sample fleet vehicles, drivers, hubs, and routes? This will restore realistic demo data.'
      )
    ) {
      setIsReSeeding(true);
      try {
        await seedInitialData();
        showToast('success', 'Database Re-seeded', 'Live fleet assets, shipments, and hubs successfully re-initialized.');
      } catch (err: any) {
        showToast('error', 'Re-seed Failed', err.message);
      } finally {
        setIsReSeeding(false);
      }
    }
  };

  const currentRole = userProfile?.role || 'dispatcher';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System Configuration & Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Organization profile, telematics refresh rates, automated alerting policies & role controls
        </p>
      </div>

      {/* Role Switcher Sandbox (Essential for testing all role perspectives) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Role-Based Access Control (RBAC) Switcher
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch perspective immediately to test Admin, Dispatcher, or Driver access limitations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {(['admin', 'dispatcher', 'driver'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                switchRoleForDemo(r);
                showToast('info', 'Perspective Switched', `Active role switched to ${r.toUpperCase()}.`);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                currentRole === r
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm uppercase tracking-wider">{r}</span>
                {currentRole === r && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {r === 'admin' && 'Full privileges: manage fleet, drivers, hubs, analytics, and settings.'}
                {r === 'dispatcher' && 'Operational dispatch: live tracking, manage consignments and routes.'}
                {r === 'driver' && 'In-cab portal: restricted to personal driver profile, cab asset, and trip.'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Company Profile Settings */}
      <form
        onSubmit={handleSaveCompany}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Carrier & Company Information
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Business entity details printed on electronic Bills of Lading
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Carrier Organization Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Headquarters Address
            </label>
            <input
              type="text"
              value={hqAddress}
              onChange={(e) => setHqAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dispatch Operations Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              24/7 Roadside Hotline
            </label>
            <input
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30"
          >
            Save Information
          </button>
        </div>
      </form>

      {/* Automated Telematics & Alert Policies */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Automated Incident Alert Triggers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure which background telemetry conditions dispatch instant notifications
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Low Fuel Level Alert (&lt; 15%)
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Trigger alert when a truck's tank drops below reserve threshold
              </span>
            </div>
            <input
              type="checkbox"
              checked={alertsLowFuel}
              onChange={(e) => setAlertsLowFuel(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Geofence Perimeter Entry / Exit
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Notify terminal supervisor when vehicles cross hub boundary radius
              </span>
            </div>
            <input
              type="checkbox"
              checked={alertsGeofence}
              onChange={(e) => setAlertsGeofence(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Shipment Transit Delays
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Alert dispatchers when weather or traffic impacts scheduled ETA
              </span>
            </div>
            <input
              type="checkbox"
              checked={alertsDelays}
              onChange={(e) => setAlertsDelays(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Scheduled Maintenance Due
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Notice when chassis mileage approaches inspection interval
              </span>
            </div>
            <input
              type="checkbox"
              checked={alertsMaintenance}
              onChange={(e) => setAlertsMaintenance(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* Telematics Refresh & Reset Sample Data */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              GPS Telemetry Simulation Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control the rate of live vehicle coordinate interpolation and database re-population
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Simulation Update Cadence
            </label>
            <select
              value={gpsIntervalSeconds}
              onChange={(e) => setGpsIntervalSeconds(Number(e.target.value))}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
            >
              <option value={2}>2 Seconds (High Speed)</option>
              <option value={4}>4 Seconds (Recommended Balanced)</option>
              <option value={8}>8 Seconds (Low Bandwidth)</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Adjusts coordinate advancement frequency across highway routes
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Reset Demo Telematics Dataset
              </span>
              <span className="text-[11px] text-slate-400">
                Resets realistic vehicle assets, active runs, drivers, and geofenced hubs
              </span>
            </div>

            <button
              type="button"
              disabled={isReSeeding}
              onClick={handleResetData}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReSeeding ? 'animate-spin' : ''}`} />
              {isReSeeding ? 'Re-seeding...' : 'Re-Seed Clean Demo Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
