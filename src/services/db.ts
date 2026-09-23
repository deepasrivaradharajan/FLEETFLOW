import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  INITIAL_HUBS,
  INITIAL_DRIVERS,
  INITIAL_VEHICLES,
  INITIAL_SHIPMENTS,
  INITIAL_ALERTS,
  INITIAL_COMPANY_SETTINGS
} from './seedData';
import { Vehicle, Driver, Hub, Shipment, Alert, CompanySettings, UserProfile } from '../types';

// Collection references
export const COLLECTIONS = {
  USERS: 'users',
  VEHICLES: 'vehicles',
  DRIVERS: 'drivers',
  SHIPMENTS: 'shipments',
  HUBS: 'hubs',
  ALERTS: 'alerts',
  SETTINGS: 'settings'
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Check if the database has already been seeded.
 * If not, seeds with complete realistic fleet data.
 */
export async function checkAndSeedDatabase(): Promise<boolean> {
  if (!auth.currentUser) {
    return false;
  }
  try {
    const vehiclesSnapshot = await getDocs(collection(db, COLLECTIONS.VEHICLES));
    if (vehiclesSnapshot.empty) {
      console.log('FleetFlow: Empty database detected. Seeding realistic sample fleet data...');
      await forceSeedDatabase();
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTIONS.VEHICLES);
    return false;
  }
}

/**
 * Force write all initial hubs, drivers, vehicles, shipments, alerts, settings to Firestore.
 */
export async function forceSeedDatabase(): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. Hubs
    for (const hub of INITIAL_HUBS) {
      const hubRef = doc(db, COLLECTIONS.HUBS, hub.id);
      batch.set(hubRef, hub);
    }

    // 2. Drivers
    for (const driver of INITIAL_DRIVERS) {
      const driverRef = doc(db, COLLECTIONS.DRIVERS, driver.id);
      batch.set(driverRef, driver);
    }

    // 3. Vehicles
    for (const vehicle of INITIAL_VEHICLES) {
      const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicle.id);
      batch.set(vehicleRef, vehicle);
    }

    // 4. Shipments
    for (const shipment of INITIAL_SHIPMENTS) {
      const shipmentRef = doc(db, COLLECTIONS.SHIPMENTS, shipment.id);
      batch.set(shipmentRef, shipment);
    }

    // 5. Alerts
    for (const alert of INITIAL_ALERTS) {
      const alertRef = doc(db, COLLECTIONS.ALERTS, alert.id);
      batch.set(alertRef, alert);
    }

    // 6. Settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'company');
    batch.set(settingsRef, INITIAL_COMPANY_SETTINGS);

    await batch.commit();
    console.log('FleetFlow: Realistic fleet data successfully populated in Firestore.');
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch/seed');
  }
}

// ----------------------------------------------------
// REALTIME LISTENERS
// ----------------------------------------------------

export function subscribeToVehicles(callback: (vehicles: Vehicle[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.VEHICLES),
    (snapshot) => {
      const vehicles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vehicle));
      callback(vehicles);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.VEHICLES)
  );
}

export function subscribeToDrivers(callback: (drivers: Driver[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.DRIVERS),
    (snapshot) => {
      const drivers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Driver));
      callback(drivers);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.DRIVERS)
  );
}

export function subscribeToShipments(callback: (shipments: Shipment[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.SHIPMENTS),
    (snapshot) => {
      const shipments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Shipment));
      callback(shipments);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.SHIPMENTS)
  );
}

export function subscribeToHubs(callback: (hubs: Hub[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.HUBS),
    (snapshot) => {
      const hubs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Hub));
      callback(hubs);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.HUBS)
  );
}

export function subscribeToAlerts(callback: (alerts: Alert[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, COLLECTIONS.ALERTS),
    (snapshot) => {
      const alerts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Alert));
      // Sort descending by timestamp
      alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(alerts);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.ALERTS)
  );
}

export function subscribeToSettings(callback: (settings: CompanySettings) => void): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTIONS.SETTINGS, 'company'),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as CompanySettings);
      } else {
        callback(INITIAL_COMPANY_SETTINGS);
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.SETTINGS}/company`)
  );
}

// ----------------------------------------------------
// CRUD OPERATIONS
// ----------------------------------------------------

// Vehicles
export async function addVehicle(vehicle: Vehicle): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.VEHICLES, vehicle.id), vehicle);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.VEHICLES}/${vehicle.id}`);
  }
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.VEHICLES, id), { ...data, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.VEHICLES}/${id}`);
  }
}

export async function deleteVehicle(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.VEHICLES, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.VEHICLES}/${id}`);
  }
}

// Drivers
export async function addDriver(driver: Driver): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.DRIVERS, driver.id), driver);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.DRIVERS}/${driver.id}`);
  }
}

export async function updateDriver(id: string, data: Partial<Driver>): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.DRIVERS, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.DRIVERS}/${id}`);
  }
}

export async function deleteDriver(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.DRIVERS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.DRIVERS}/${id}`);
  }
}

// Shipments
export async function addShipment(shipment: Shipment): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.SHIPMENTS, shipment.id), shipment);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.SHIPMENTS}/${shipment.id}`);
  }
}

export async function updateShipment(id: string, data: Partial<Shipment>): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.SHIPMENTS, id), { ...data, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.SHIPMENTS}/${id}`);
  }
}

export async function deleteShipment(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SHIPMENTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.SHIPMENTS}/${id}`);
  }
}

// Hubs
export async function addHub(hub: Hub): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.HUBS, hub.id), hub);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.HUBS}/${hub.id}`);
  }
}

export async function updateHub(id: string, data: Partial<Hub>): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.HUBS, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.HUBS}/${id}`);
  }
}

export async function deleteHub(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.HUBS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.HUBS}/${id}`);
  }
}

// Alerts
export async function addAlert(alert: Alert): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.ALERTS, alert.id), alert);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.ALERTS}/${alert.id}`);
  }
}

export async function markAlertRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.ALERTS, id), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.ALERTS}/${id}`);
  }
}

export async function markAllAlertsRead(alertIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const id of alertIds) {
      const alertRef = doc(db, COLLECTIONS.ALERTS, id);
      batch.update(alertRef, { read: true });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.ALERTS}/markAllRead`);
  }
}

export async function deleteAlert(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ALERTS, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.ALERTS}/${id}`);
  }
}

// Settings
export async function updateCompanySettings(data: Partial<CompanySettings>): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.SETTINGS, 'company'), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.SETTINGS}/company`);
  }
}

// User Profiles
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (snapshot.exists()) {
      return snapshot.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.USERS}/${uid}`);
    return null;
  }
}

export async function saveUserProfile(user: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.USERS}/${user.uid}`);
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return snapshot.docs.map((doc) => doc.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTIONS.USERS);
    return [];
  }
}

export async function updateUserRole(uid: string, role: UserProfile['role']): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { role });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.USERS}/${uid}`);
  }
}
