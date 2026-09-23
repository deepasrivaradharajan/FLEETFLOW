import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  Vehicle,
  Driver,
  Shipment,
  ShipmentStatus,
  Hub,
  Alert,
  CompanySettings
} from '../types';
import {
  subscribeToVehicles,
  subscribeToDrivers,
  subscribeToShipments,
  subscribeToHubs,
  subscribeToAlerts,
  subscribeToSettings,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  addDriver,
  updateDriver,
  deleteDriver,
  addShipment,
  updateShipment,
  deleteShipment,
  addHub,
  updateHub,
  deleteHub,
  addAlert,
  markAlertRead,
  markAllAlertsRead,
  deleteAlert,
  updateCompanySettings,
  checkAndSeedDatabase,
  forceSeedDatabase
} from '../services/db';
import { simulationEngine } from '../services/simulation';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_SHIPMENTS,
  INITIAL_HUBS,
  INITIAL_ALERTS,
  INITIAL_COMPANY_SETTINGS
} from '../services/seedData';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export interface FleetContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  shipments: Shipment[];
  hubs: Hub[];
  alerts: Alert[];
  settings: CompanySettings;
  loading: boolean;
  unreadAlertsCount: number;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  createVehicle: (vehicle: Vehicle) => Promise<void>;
  editVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  createDriver: (driver: Driver) => Promise<void>;
  editDriver: (id: string, data: Partial<Driver>) => Promise<void>;
  removeDriver: (id: string) => Promise<void>;
  createShipment: (shipment: Shipment) => Promise<void>;
  editShipment: (id: string, data: Partial<Shipment>) => Promise<void>;
  removeShipment: (id: string) => Promise<void>;
  createHub: (hub: Hub) => Promise<void>;
  editHub: (id: string, data: Partial<Hub>) => Promise<void>;
  removeHub: (id: string) => Promise<void>;
  createAlert: (alert: Alert) => Promise<void>;
  readAlert: (id: string) => Promise<void>;
  readAllAlerts: () => Promise<void>;
  removeAlert: (id: string) => Promise<void>;
  saveSettings: (data: Partial<CompanySettings>) => Promise<void>;
  resetFleetData: () => Promise<void>;
  seedInitialData: () => Promise<void>;
  advanceShipmentStatus: (id: string, nextStatus: ShipmentStatus) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

const loadStoredOrDefault = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(`fleetflow_data_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToLocalStorage = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(`fleetflow_data_${key}`, JSON.stringify(data));
  } catch {}
};

const clearStoredData = () => {
  try {
    localStorage.removeItem('fleetflow_data_vehicles');
    localStorage.removeItem('fleetflow_data_drivers');
    localStorage.removeItem('fleetflow_data_shipments');
    localStorage.removeItem('fleetflow_data_hubs');
    localStorage.removeItem('fleetflow_data_alerts');
    localStorage.removeItem('fleetflow_data_settings');
  } catch {}
};

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoUser } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadStoredOrDefault('vehicles', INITIAL_VEHICLES));
  const [drivers, setDrivers] = useState<Driver[]>(() => loadStoredOrDefault('drivers', INITIAL_DRIVERS));
  const [shipments, setShipments] = useState<Shipment[]>(() => loadStoredOrDefault('shipments', INITIAL_SHIPMENTS));
  const [hubs, setHubs] = useState<Hub[]>(() => loadStoredOrDefault('hubs', INITIAL_HUBS));
  const [alerts, setAlerts] = useState<Alert[]>(() => loadStoredOrDefault('alerts', INITIAL_ALERTS));
  const [settings, setSettings] = useState<CompanySettings>(() => loadStoredOrDefault('settings', INITIAL_COMPANY_SETTINGS));
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Refs for current data accessed by simulation tick
  const vehiclesRef = useRef<Vehicle[]>(vehicles);
  const shipmentsRef = useRef<Shipment[]>(shipments);
  const hubsRef = useRef<Hub[]>(hubs);
  const settingsRef = useRef<CompanySettings>(settings);

  vehiclesRef.current = vehicles;
  shipmentsRef.current = shipments;
  hubsRef.current = hubs;
  settingsRef.current = settings;

  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronize data depending on auth status
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    // If user is not authenticated, do not start Firestore subscriptions or background simulation
    if (!user) {
      setLoading(false);
      simulationEngine.stop();
      return;
    }

    if (isDemoUser) {
      // Local session mode: populate loaded/stored data and run simulation locally
      const currentVehicles = loadStoredOrDefault('vehicles', INITIAL_VEHICLES);
      const currentDrivers = loadStoredOrDefault('drivers', INITIAL_DRIVERS);
      const currentShipments = loadStoredOrDefault('shipments', INITIAL_SHIPMENTS);
      const currentHubs = loadStoredOrDefault('hubs', INITIAL_HUBS);
      const currentAlerts = loadStoredOrDefault('alerts', INITIAL_ALERTS);
      const currentSettings = loadStoredOrDefault('settings', INITIAL_COMPANY_SETTINGS);

      setVehicles(currentVehicles);
      setDrivers(currentDrivers);
      setShipments(currentShipments);
      setHubs(currentHubs);
      setAlerts(currentAlerts);
      setSettings(currentSettings);
      setLoading(false);

      simulationEngine.start(
        () => vehiclesRef.current,
        () => shipmentsRef.current,
        () => hubsRef.current,
        () => settingsRef.current,
        (updatedVehicles, updatedShipments, newAlert) => {
          setVehicles(updatedVehicles);
          setShipments(updatedShipments);
          if (newAlert) {
            setAlerts((prev) => {
              const next = [newAlert, ...prev];
              saveToLocalStorage('alerts', next);
              return next;
            });
          }
        }
      );

      return () => {
        simulationEngine.stop();
      };
    }

    // Authenticated Firebase user: connect to live Firestore
    const initializeFirebaseData = async () => {
      try {
        await checkAndSeedDatabase();
      } catch (err) {
        console.warn('Seed verification notice:', err);
      }

      try {
        unsubs.push(
          subscribeToVehicles((data) => {
            if (data.length > 0) setVehicles(data);
          }),
          subscribeToDrivers((data) => {
            if (data.length > 0) setDrivers(data);
          }),
          subscribeToShipments((data) => {
            if (data.length > 0) setShipments(data);
          }),
          subscribeToHubs((data) => {
            if (data.length > 0) setHubs(data);
          }),
          subscribeToAlerts((data) => {
            setAlerts(data);
          }),
          subscribeToSettings((data) => {
            if (data) setSettings(data);
          })
        );
      } catch (err) {
        console.error('Subscription initialization error:', err);
      }

      setLoading(false);

      // Start live GPS movement engine
      simulationEngine.start(
        () => vehiclesRef.current,
        () => shipmentsRef.current,
        () => hubsRef.current,
        () => settingsRef.current
      );
    };

    initializeFirebaseData();

    return () => {
      unsubs.forEach((unsub) => unsub());
      simulationEngine.stop();
    };
  }, [user, isDemoUser]);

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  // Actions
  const createVehicle = async (vehicle: Vehicle) => {
    if (isDemoUser) {
      setVehicles((prev) => {
        const next = [vehicle, ...prev];
        saveToLocalStorage('vehicles', next);
        return next;
      });
    } else {
      await addVehicle(vehicle);
    }
    showToast('success', 'Vehicle Added', `Vehicle ${vehicle.name} has been enrolled in the fleet.`);
  };

  const editVehicle = async (id: string, data: Partial<Vehicle>) => {
    if (isDemoUser) {
      setVehicles((prev) => {
        const next = prev.map((v) => (v.id === id ? { ...v, ...data, updatedAt: new Date().toISOString() } : v));
        saveToLocalStorage('vehicles', next);
        return next;
      });
    } else {
      await updateVehicle(id, data);
    }
    showToast('success', 'Vehicle Updated', `Vehicle ${id} details saved successfully.`);
  };

  const removeVehicle = async (id: string) => {
    if (isDemoUser) {
      setVehicles((prev) => {
        const next = prev.filter((v) => v.id !== id);
        saveToLocalStorage('vehicles', next);
        return next;
      });
    } else {
      await deleteVehicle(id);
    }
    showToast('info', 'Vehicle Removed', `Vehicle ${id} was decommissioned from the fleet.`);
  };

  const createDriver = async (driver: Driver) => {
    if (isDemoUser) {
      setDrivers((prev) => {
        const next = [driver, ...prev];
        saveToLocalStorage('drivers', next);
        return next;
      });
    } else {
      await addDriver(driver);
    }
    showToast('success', 'Driver Added', `${driver.name} is now registered in the driver roster.`);
  };

  const editDriver = async (id: string, data: Partial<Driver>) => {
    if (isDemoUser) {
      setDrivers((prev) => {
        const next = prev.map((d) => (d.id === id ? { ...d, ...data } : d));
        saveToLocalStorage('drivers', next);
        return next;
      });
    } else {
      await updateDriver(id, data);
    }
    showToast('success', 'Driver Updated', `Profile updated for ${data.name || id}.`);
  };

  const removeDriver = async (id: string) => {
    if (isDemoUser) {
      setDrivers((prev) => {
        const next = prev.filter((d) => d.id !== id);
        saveToLocalStorage('drivers', next);
        return next;
      });
    } else {
      await deleteDriver(id);
    }
    showToast('info', 'Driver Removed', `Driver record ${id} was removed.`);
  };

  const createShipment = async (shipment: Shipment) => {
    if (isDemoUser) {
      setShipments((prev) => {
        const next = [shipment, ...prev];
        saveToLocalStorage('shipments', next);
        return next;
      });
    } else {
      await addShipment(shipment);
    }
    showToast('success', 'Shipment Created', `Waybill ${shipment.trackingNumber} scheduled for dispatch.`);
  };

  const editShipment = async (id: string, data: Partial<Shipment>) => {
    if (isDemoUser) {
      setShipments((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
        saveToLocalStorage('shipments', next);
        return next;
      });
    } else {
      await updateShipment(id, data);
    }
    showToast('success', 'Shipment Updated', 'Shipment status or details updated.');
  };

  const removeShipment = async (id: string) => {
    if (isDemoUser) {
      setShipments((prev) => {
        const next = prev.filter((s) => s.id !== id);
        saveToLocalStorage('shipments', next);
        return next;
      });
    } else {
      await deleteShipment(id);
    }
    showToast('info', 'Shipment Cancelled', `Shipment ${id} was deleted.`);
  };

  const createHub = async (hub: Hub) => {
    if (isDemoUser) {
      setHubs((prev) => {
        const next = [hub, ...prev];
        saveToLocalStorage('hubs', next);
        return next;
      });
    } else {
      await addHub(hub);
    }
    showToast('success', 'Hub Registered', `Logistics hub ${hub.name} added to network.`);
  };

  const editHub = async (id: string, data: Partial<Hub>) => {
    if (isDemoUser) {
      setHubs((prev) => {
        const next = prev.map((h) => (h.id === id ? { ...h, ...data } : h));
        saveToLocalStorage('hubs', next);
        return next;
      });
    } else {
      await updateHub(id, data);
    }
    showToast('success', 'Hub Updated', `Hub ${data.name || id} settings updated.`);
  };

  const removeHub = async (id: string) => {
    if (isDemoUser) {
      setHubs((prev) => {
        const next = prev.filter((h) => h.id !== id);
        saveToLocalStorage('hubs', next);
        return next;
      });
    } else {
      await deleteHub(id);
    }
    showToast('info', 'Hub Deleted', `Hub ${id} has been removed.`);
  };

  const createAlert = async (alert: Alert) => {
    if (isDemoUser) {
      setAlerts((prev) => {
        const next = [alert, ...prev];
        saveToLocalStorage('alerts', next);
        return next;
      });
    } else {
      await addAlert(alert);
    }
  };

  const readAlert = async (id: string) => {
    if (isDemoUser) {
      setAlerts((prev) => {
        const next = prev.map((a) => (a.id === id ? { ...a, read: true } : a));
        saveToLocalStorage('alerts', next);
        return next;
      });
    } else {
      await markAlertRead(id);
    }
  };

  const readAllAlerts = async () => {
    if (isDemoUser) {
      setAlerts((prev) => {
        const next = prev.map((a) => ({ ...a, read: true }));
        saveToLocalStorage('alerts', next);
        return next;
      });
    } else {
      const unreadIds = alerts.filter((a) => !a.read).map((a) => a.id);
      if (unreadIds.length > 0) {
        await markAllAlertsRead(unreadIds);
      }
    }
    showToast('info', 'Alerts Cleared', 'All notifications marked as read.');
  };

  const removeAlert = async (id: string) => {
    if (isDemoUser) {
      setAlerts((prev) => {
        const next = prev.filter((a) => a.id !== id);
        saveToLocalStorage('alerts', next);
        return next;
      });
    } else {
      await deleteAlert(id);
    }
  };

  const saveSettings = async (data: Partial<CompanySettings>) => {
    if (isDemoUser) {
      setSettings((prev) => {
        const next = { ...prev, ...data };
        saveToLocalStorage('settings', next);
        return next;
      });
    } else {
      await updateCompanySettings(data);
    }
    showToast('success', 'Settings Saved', 'System preferences updated.');
  };

  const resetFleetData = async () => {
    if (isDemoUser) {
      clearStoredData();
      setVehicles(INITIAL_VEHICLES);
      setDrivers(INITIAL_DRIVERS);
      setShipments(INITIAL_SHIPMENTS);
      setHubs(INITIAL_HUBS);
      setAlerts(INITIAL_ALERTS);
      setSettings(INITIAL_COMPANY_SETTINGS);
    } else {
      await forceSeedDatabase();
    }
    showToast('success', 'Database Reset', 'Realistic fleet data, routes, and shipments restored.');
  };

  const advanceShipmentStatus = async (id: string, nextStatus: ShipmentStatus) => {
    const target = shipments.find((s) => s.id === id);
    const nextProgress = nextStatus === 'delivered' ? 100 : nextStatus === 'in_transit' ? 45 : target?.progress || 0;
    await editShipment(id, {
      status: nextStatus,
      progress: nextProgress,
      timeline: target
        ? [
            ...target.timeline,
            {
              status: nextStatus,
              title: `Consignment status marked as ${nextStatus.toUpperCase()}`,
              timestamp: new Date().toISOString(),
              note: `Manual dispatch advancement update to ${nextStatus}`
            }
          ]
        : []
    });
    showToast('success', 'Status Updated', `Shipment status progressed to ${nextStatus.toUpperCase()}`);
  };

  const clearAllAlerts = async () => {
    if (isDemoUser) {
      setAlerts([]);
      saveToLocalStorage('alerts', []);
    } else {
      for (const a of alerts) {
        await deleteAlert(a.id);
      }
    }
    showToast('info', 'Alerts Cleared', 'All alerts have been cleared.');
  };

  return (
    <FleetContext.Provider
      value={{
        vehicles,
        drivers,
        shipments,
        hubs,
        alerts,
        settings,
        loading,
        unreadAlertsCount,
        toasts,
        showToast,
        removeToast,
        createVehicle,
        editVehicle,
        removeVehicle,
        createDriver,
        editDriver,
        removeDriver,
        createShipment,
        editShipment,
        removeShipment,
        createHub,
        editHub,
        removeHub,
        createAlert,
        readAlert,
        readAllAlerts,
        removeAlert,
        saveSettings,
        resetFleetData,
        seedInitialData: resetFleetData,
        advanceShipmentStatus,
        clearAllAlerts
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export const useFleet = () => {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
};
