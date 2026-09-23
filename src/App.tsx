import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FleetProvider } from './context/FleetContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { LiveTracking } from './pages/LiveTracking';
import { FleetManagement } from './pages/FleetManagement';
import { DriverManagement } from './pages/DriverManagement';
import { ShipmentManagement } from './pages/ShipmentManagement';
import { HubManagement } from './pages/HubManagement';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastContainer } from './components/common/Toast';

const MainApp: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-300">Initializing FleetFlow Telematics...</p>
      </div>
    );
  }

  // If not logged in, render AuthPage
  if (!user) {
    return (
      <>
        <AuthPage />
        <ToastContainer />
      </>
    );
  }

  const handleSelectEntity = (type: 'vehicle' | 'shipment' | 'driver' | 'hub', id: string) => {
    setSelectedEntityId(id);
    if (type === 'vehicle') setCurrentTab('fleet');
    else if (type === 'shipment') setCurrentTab('shipments');
    else if (type === 'driver') setCurrentTab('drivers');
    else if (type === 'hub') setCurrentTab('hubs');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedEntityId(null);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Header Bar */}
        <TopBar
          sidebarCollapsed={sidebarCollapsed}
          onOpenAlerts={() => setCurrentTab('alerts')}
          onSelectEntity={handleSelectEntity}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 mt-16 pb-12">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onSelectEntity={handleSelectEntity}
            />
          )}
          {currentTab === 'tracking' && <LiveTracking />}
          {currentTab === 'fleet' && (
            <FleetManagement
              selectedVehicleIdInit={selectedEntityId}
              onOpenVehicleDetail={(id) => setSelectedEntityId(id)}
            />
          )}
          {currentTab === 'drivers' && (
            <DriverManagement
              selectedDriverIdInit={selectedEntityId}
              onOpenDriverDetail={(id) => setSelectedEntityId(id)}
            />
          )}
          {currentTab === 'shipments' && (
            <ShipmentManagement
              selectedShipmentIdInit={selectedEntityId}
              onOpenShipmentDetail={(id) => setSelectedEntityId(id)}
            />
          )}
          {currentTab === 'hubs' && <HubManagement />}
          {currentTab === 'alerts' && <Alerts onSelectEntity={handleSelectEntity} />}
          {currentTab === 'analytics' && <Analytics />}
          {currentTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FleetProvider>
        <MainApp />
      </FleetProvider>
    </AuthProvider>
  );
}
