import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFleet } from '../../context/FleetContext';
import {
  LayoutDashboard,
  Navigation,
  Truck,
  Users,
  Package,
  Warehouse,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'tracking'
  | 'fleet'
  | 'drivers'
  | 'shipments'
  | 'hubs'
  | 'alerts'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse
}) => {
  const { userProfile } = useAuth();
  const { unreadAlertsCount } = useFleet();
  const role = userProfile?.role || 'dispatcher';

  // Navigation configuration
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    rolesAllowed: ('admin' | 'dispatcher' | 'driver')[];
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      rolesAllowed: ['admin', 'dispatcher', 'driver']
    },
    {
      id: 'tracking',
      label: 'Live Tracking',
      icon: Navigation,
      rolesAllowed: ['admin', 'dispatcher', 'driver']
    },
    {
      id: 'fleet',
      label: 'Fleet Assets',
      icon: Truck,
      rolesAllowed: ['admin', 'dispatcher', 'driver']
    },
    {
      id: 'drivers',
      label: role === 'driver' ? 'My Driver Profile' : 'Driver Roster',
      icon: Users,
      rolesAllowed: ['admin', 'dispatcher', 'driver']
    },
    {
      id: 'shipments',
      label: role === 'driver' ? 'My Shipments' : 'Shipments',
      icon: Package,
      rolesAllowed: ['admin', 'dispatcher', 'driver']
    },
    {
      id: 'hubs',
      label: 'Hubs & Depots',
      icon: Warehouse,
      rolesAllowed: ['admin', 'dispatcher']
    },
    {
      id: 'alerts',
      label: 'Alerts & Incidents',
      icon: Bell,
      badge: unreadAlertsCount,
      rolesAllowed: ['admin', 'dispatcher', 'driver']
    },
    {
      id: 'analytics',
      label: 'Analytics & KPIs',
      icon: BarChart3,
      rolesAllowed: ['admin', 'dispatcher']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      rolesAllowed: ['admin', 'dispatcher', 'driver']
    }
  ];

  const visibleItems = navItems.filter((item) => item.rolesAllowed.includes(role));

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-white tracking-tight">Fleet<span className="text-amber-400">Flow</span></span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Telematics & Logistics</p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Live Telemetry Ping status indicator */}
      <div className={`px-4 py-2.5 bg-blue-950/30 border-b border-blue-900/30 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          {!collapsed && (
            <span className="text-[11px] font-medium text-emerald-400">
              GPS Telemetry Live
            </span>
          )}
        </div>
        {!collapsed && (
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Radio className="w-3 h-3 text-blue-400 animate-pulse" /> 4s sync
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`}
              />

              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive
                      ? 'bg-white text-blue-700'
                      : 'bg-amber-500 text-slate-950 font-black animate-pulse'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-950 text-white text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                  {item.badge ? ` (${item.badge})` : ''}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Role Card at bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-blue-400 font-bold shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate capitalize">
                {userProfile?.displayName || 'Active User'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-purple-400' : role === 'dispatcher' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {role} Role
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
