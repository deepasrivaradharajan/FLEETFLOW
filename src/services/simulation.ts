import { auth, db } from '../firebase';
import { doc, updateDoc, collection, setDoc } from 'firebase/firestore';
import { Vehicle, Shipment, Hub, Alert, CompanySettings } from '../types';
import { COLLECTIONS } from './db';

// Helper to calculate distance in km between two GPS coordinates
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate bearing/heading angle in degrees between two coordinates
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export type LocalSimulationCallback = (
  updatedVehicles: Vehicle[],
  updatedShipments: Shipment[],
  newAlert?: Alert
) => void;

class SimulationEngine {
  private timerId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private refreshIntervalMs: number = 4000;
  private alertCooldown: Map<string, number> = new Map(); // Prevent spamming alerts

  public start(
    getVehicles: () => Vehicle[],
    getShipments: () => Shipment[],
    getHubs: () => Hub[],
    getSettings: () => CompanySettings,
    onLocalUpdate?: LocalSimulationCallback
  ) {
    if (this.isRunning) return;
    this.isRunning = true;

    const tick = async () => {
      try {
        const settings = getSettings();
        if (settings && !settings.simulationActive) return;

        const vehicles = getVehicles();
        const shipments = getShipments();
        const hubs = getHubs();

        await this.stepSimulation(vehicles, shipments, hubs, settings, onLocalUpdate);
      } catch (err) {
        console.warn('Simulation tick error:', err);
      } finally {
        if (this.isRunning) {
          const settings = getSettings();
          const interval = (settings?.gpsRefreshRateSeconds || 4) * 1000;
          this.timerId = setTimeout(tick, interval);
        }
      }
    };

    this.timerId = setTimeout(tick, this.refreshIntervalMs);
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private async stepSimulation(
    vehicles: Vehicle[],
    shipments: Shipment[],
    hubs: Hub[],
    settings: CompanySettings,
    onLocalUpdate?: LocalSimulationCallback
  ) {
    // Only update vehicles that have routePoints and are in active status
    const movingVehicles = vehicles.filter(
      (v) => (v.status === 'moving' || v.status === 'delayed') && v.routePoints && v.routePoints.length > 1
    );

    if (movingVehicles.length === 0) return;

    let localVehicles = [...vehicles];
    let localShipments = [...shipments];
    let newlyTriggeredAlert: Alert | undefined;

    for (const vehicle of movingVehicles) {
      if (!vehicle.routePoints || vehicle.routePoints.length <= 1) continue;

      const points = vehicle.routePoints;
      const currentIndex = vehicle.currentRouteIndex ?? 0;
      let nextIndex = currentIndex + 1;
      let newProgress = 0;
      let isCompleted = false;

      // When reaching end of route, loop back
      if (nextIndex >= points.length) {
        nextIndex = 0;
        isCompleted = true;
      }

      const targetCoord = points[nextIndex];

      // Smooth interpolation: step ~28% towards next waypoint
      const interpLat = Number((vehicle.currentLocation.lat + (targetCoord[0] - vehicle.currentLocation.lat) * 0.28).toFixed(5));
      const interpLng = Number((vehicle.currentLocation.lng + (targetCoord[1] - vehicle.currentLocation.lng) * 0.28).toFixed(5));

      // Check if close to target waypoint to advance index
      const distToTarget = calculateDistanceKm(interpLat, interpLng, targetCoord[0], targetCoord[1]);
      const updatedIndex = distToTarget < 5 ? nextIndex : currentIndex;

      // Calculate speed and heading
      const heading = Math.round(calculateBearing(vehicle.currentLocation.lat, vehicle.currentLocation.lng, targetCoord[0], targetCoord[1]));
      let speed = vehicle.status === 'delayed' ? Math.floor(18 + Math.random() * 12) : Math.floor(75 + Math.random() * 18);

      // Fuel consumption simulation: drain 0.2% per tick
      let newFuel = vehicle.fuelLevel;
      if (vehicle.fuelLevel > 5) {
        newFuel = Math.max(5, Math.round((vehicle.fuelLevel - 0.2) * 10) / 10);
      } else {
        newFuel = 95;
      }

      // Check for Low Fuel Alert
      if (newFuel <= (settings?.lowFuelAlertThreshold || 15) && settings?.enableLowFuelAlerts) {
        const cooldownKey = `low_fuel_${vehicle.id}`;
        const lastAlert = this.alertCooldown.get(cooldownKey) || 0;
        if (Date.now() - lastAlert > 300000) {
          this.alertCooldown.set(cooldownKey, Date.now());
          const alertObj: Alert = {
            id: `ALT-FUEL-${vehicle.id}-${Date.now()}`,
            type: 'low_fuel',
            severity: 'critical',
            title: `Low Fuel Level Alert: ${vehicle.name}`,
            message: `Vehicle fuel reserves have dropped to ${newFuel}%. Nearest refueling terminal recommended.`,
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            read: false,
            timestamp: new Date().toISOString()
          };
          newlyTriggeredAlert = alertObj;
          if (auth.currentUser) {
            await this.triggerAlert(alertObj);
          }
        }
      }

      // Geofence check against Hubs
      if (settings?.enableGeofenceAlerts && hubs) {
        for (const hub of hubs) {
          const distToHubKm = calculateDistanceKm(interpLat, interpLng, hub.location.lat, hub.location.lng);
          const geofenceRadiusKm = (hub.geofenceRadiusMeters || 3000) / 1000;
          if (distToHubKm <= geofenceRadiusKm) {
            const geofenceKey = `geofence_${vehicle.id}_${hub.id}`;
            const lastGeofence = this.alertCooldown.get(geofenceKey) || 0;
            if (Date.now() - lastGeofence > 600000) {
              this.alertCooldown.set(geofenceKey, Date.now());
              const geofenceAlert: Alert = {
                id: `ALT-GEO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                type: 'geofence',
                severity: 'info',
                title: `Geofence Entry: ${hub.name}`,
                message: `Vehicle ${vehicle.name} entered the delivery zone for ${hub.name}.`,
                vehicleId: vehicle.id,
                vehicleName: vehicle.name,
                hubId: hub.id,
                read: false,
                timestamp: new Date().toISOString()
              };
              newlyTriggeredAlert = geofenceAlert;
              if (auth.currentUser) {
                await this.triggerAlert(geofenceAlert);
              }
            }
          }
        }
      }

      // Update in local memory
      localVehicles = localVehicles.map((v) => {
        if (v.id === vehicle.id) {
          return {
            ...v,
            currentLocation: {
              ...v.currentLocation,
              lat: interpLat,
              lng: interpLng,
              speed,
              heading,
              lastUpdated: new Date().toISOString()
            },
            fuelLevel: newFuel,
            batteryLevel: v.batteryLevel !== undefined ? newFuel : undefined,
            currentRouteIndex: updatedIndex,
            mileageKm: (v.mileageKm || 100000) + 1,
            updatedAt: new Date().toISOString()
          };
        }
        return v;
      });

      // Update vehicle in Firestore if user is logged in to Firebase
      if (auth.currentUser) {
        try {
          const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicle.id);
          await updateDoc(vehicleRef, {
            'currentLocation.lat': interpLat,
            'currentLocation.lng': interpLng,
            'currentLocation.speed': speed,
            'currentLocation.heading': heading,
            'currentLocation.lastUpdated': new Date().toISOString(),
            fuelLevel: newFuel,
            batteryLevel: vehicle.batteryLevel !== undefined ? newFuel : undefined,
            currentRouteIndex: updatedIndex,
            mileageKm: (vehicle.mileageKm || 100000) + 1,
            updatedAt: new Date().toISOString()
          });
        } catch {
          // Handled silently
        }
      }

      // If vehicle has active shipment, update shipment location, progress & status
      if (vehicle.currentShipmentId) {
        const shipment = shipments.find((s) => s.id === vehicle.currentShipmentId);
        if (shipment && shipment.status !== 'delivered') {
          const routeLen = points.length;
          newProgress = Math.min(99, Math.round((updatedIndex / Math.max(1, routeLen - 1)) * 100));

          const shipmentUpdates: Partial<Shipment> = {
            currentLocation: { lat: interpLat, lng: interpLng },
            progress: newProgress,
            updatedAt: new Date().toISOString()
          };

          if (isCompleted && newProgress > 90) {
            shipmentUpdates.status = 'delivered';
            shipmentUpdates.progress = 100;
            shipmentUpdates.timeline = [
              ...shipment.timeline,
              {
                status: 'delivered',
                title: 'Delivered to Final Consignee',
                timestamp: new Date().toISOString(),
                note: 'Delivery successfully verified and completed.'
              }
            ];
          }

          localShipments = localShipments.map((s) => {
            if (s.id === shipment.id) {
              return { ...s, ...shipmentUpdates };
            }
            return s;
          });

          if (auth.currentUser) {
            try {
              const shipmentRef = doc(db, COLLECTIONS.SHIPMENTS, shipment.id);
              await updateDoc(shipmentRef, shipmentUpdates);
            } catch {
              // Handled silently
            }
          }
        }
      }
    }

    if (onLocalUpdate) {
      onLocalUpdate(localVehicles, localShipments, newlyTriggeredAlert);
    }
  }

  private async triggerAlert(alert: Alert) {
    if (!auth.currentUser) return;
    try {
      const alertRef = doc(db, COLLECTIONS.ALERTS, alert.id);
      await setDoc(alertRef, alert, { merge: true });
    } catch {
      // Handled silently
    }
  }
}

export const simulationEngine = new SimulationEngine();
