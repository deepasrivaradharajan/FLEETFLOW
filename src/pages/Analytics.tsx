import React, { useState } from 'react';
import { useFleet } from '../context/FleetContext';
import { FuelLineChart, BarChart, DonutChart } from '../components/common/Charts';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Fuel,
  Truck,
  Award,
  Warehouse,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { vehicles, shipments, drivers, hubs, showToast } = useFleet();

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Compute key analytics
  const totalDeliveries = shipments.filter((s) => s.status === 'delivered').length;
  const delayedShipments = shipments.filter((s) => s.status === 'delayed').length;
  const onTimePercentage = totalDeliveries > 0
    ? Math.round((totalDeliveries / (totalDeliveries + delayedShipments)) * 100)
    : 96;

  const totalDistanceKm = vehicles.reduce((sum, v) => sum + (v.mileageKm || 0), 0);
  const totalFleetCost = 42500; // estimated fuel and maintenance

  // Driver leaderboard ranked by rating and onTimeRate
  const driverLeaderboard = [...drivers].sort((a, b) => b.rating - a.rating || b.onTimeRate - a.onTimeRate);

  // Shipments per hub
  const shipmentsPerHubData = hubs.map((h) => {
    const count = shipments.filter(
      (s) => s.origin.name.includes(h.name.split(' ')[0]) || s.destination.name.includes(h.name.split(' ')[0])
    ).length;
    return {
      label: h.code,
      value: count,
      color: '#1E3A8A'
    };
  });

  // Fleet fuel cost trend
  const fuelCostTrendData = [
    { date: '2026-09-17', level: 1200, costUSD: 1200 },
    { date: '2026-09-18', level: 1450, costUSD: 1450 },
    { date: '2026-09-19', level: 980, costUSD: 980 },
    { date: '2026-09-20', level: 1620, costUSD: 1620 },
    { date: '2026-09-21', level: 1390, costUSD: 1390 },
    { date: '2026-09-22', level: 1810, costUSD: 1810 },
    { date: '2026-09-23', level: 1540, costUSD: 1540 }
  ];

  // CSV Export utility
  const exportCSV = () => {
    const headers = 'ID,TrackingNumber,Customer,Origin,Destination,Status,Progress,Vehicle,Driver\n';
    const rows = shipments
      .map(
        (s) =>
          `"${s.id}","${s.trackingNumber}","${s.customerName}","${s.origin.name}","${s.destination.name}","${s.status}","${s.progress}%","${s.assignedVehicleName || ''}","${s.assignedDriverName || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FleetFlow_Shipments_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Report Exported', 'Shipments report downloaded as CSV.');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Fleet Intelligence & KPI Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational efficiency metrics, carrier performance, fuel consumption & logistics ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                timeRange === 'week'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                timeRange === 'month'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                timeRange === 'quarter'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              This Quarter
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Distance Logged</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalDistanceKm.toLocaleString()} km
            </span>
            <span className="text-[11px] text-emerald-500 font-semibold block mt-0.5">
              +8.4% vs last period
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">On-Time SLA Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {onTimePercentage}%
            </span>
            <span className="text-[11px] text-emerald-500 font-semibold block mt-0.5">
              Exceeds 95% contractual SLA
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Est. Fuel Expenditures</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              ${totalFleetCost.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
              Avg $3.45 / gal diesel
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Consignments Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalDeliveries} / {shipments.length}
            </span>
            <span className="text-[11px] text-blue-500 font-semibold block mt-0.5">
              Full manifest transparency
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Fuel Cost Trend (Line Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Fleet Fuel Spend Trend ($ USD)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily diesel and refuel costs across all active corridors
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              7-Day Telemetry
            </span>
          </div>

          <FuelLineChart
            data={fuelCostTrendData}
            height={200}
            unit="USD"
            valueKey="level"
            color="#F59E0B"
          />
        </div>

        {/* Shipments per Hub (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Freight Throughput by Hub Terminal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Outbound and inbound shipment volume per depot
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">Volume</span>
          </div>

          <BarChart data={shipmentsPerHubData} height={200} unit="loads" barColor="#2563EB" />
        </div>
      </div>

      {/* Driver Performance Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Driver Performance & Safety Leaderboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by safety scorecard, customer rating, and on-time arrival index
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-2.5 rounded-l-lg">Rank</th>
                <th className="px-4 py-2.5">Driver</th>
                <th className="px-4 py-2.5">Assigned Vehicle</th>
                <th className="px-4 py-2.5">Total Deliveries</th>
                <th className="px-4 py-2.5">On-Time %</th>
                <th className="px-4 py-2.5">Safety Rating</th>
                <th className="px-4 py-2.5 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {driverLeaderboard.map((d, index) => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-black text-slate-400 font-mono">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={d.avatar}
                        alt={d.name}
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {d.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{d.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {d.assignedVehicleName || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {d.totalDeliveries}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-emerald-500 font-mono">{d.onTimeRate}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-amber-500 font-mono">★ {d.rating}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
