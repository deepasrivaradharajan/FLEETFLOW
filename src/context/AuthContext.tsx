import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { COLLECTIONS } from '../services/db';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isDemoUser: boolean;
  loading: boolean;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, role: UserRole, driverId?: string) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRoleForDemo: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for persistent local fallback
const STORAGE_SESSION_KEY = 'fleetflow_auth_session';
const STORAGE_ACCOUNTS_KEY = 'fleetflow_user_accounts';

interface StoredAccount {
  profile: UserProfile;
  pass?: string;
}

function getStoredAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredAccounts(accounts: Record<string, StoredAccount>) {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed to persist accounts:', e);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.user || null;
      }
    } catch {}
    return null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.profile || null;
      }
    } catch {}
    return null;
  });

  const [isDemoUser, setIsDemoUser] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(STORAGE_SESSION_KEY);
    } catch {}
    return false;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile when auth state changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsDemoUser(false);
        try {
          const userDocRef = doc(db, COLLECTIONS.USERS, currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            const isBootstrappedAdmin = currentUser.email?.toLowerCase() === 'pooranima670@gmail.com';
            const defaultProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              role: isBootstrappedAdmin ? 'admin' : 'dispatcher',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Fleet User',
            role: currentUser.email?.toLowerCase() === 'pooranima670@gmail.com' ? 'admin' : 'dispatcher',
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // If not in a saved local session, clear user
        const savedSession = localStorage.getItem(STORAGE_SESSION_KEY);
        if (!savedSession) {
          setUser(null);
          setUserProfile(null);
          setIsDemoUser(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In with Popup
  const signInWithGoogle = async (preferredRole: UserRole = 'dispatcher') => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const authUser = userCredential.user;
      setUser(authUser);
      setIsDemoUser(false);
      localStorage.removeItem(STORAGE_SESSION_KEY);

      const userDocRef = doc(db, COLLECTIONS.USERS, authUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        const isBootstrappedAdmin = authUser.email?.toLowerCase() === 'pooranima670@gmail.com';
        const profile: UserProfile = {
          uid: authUser.uid,
          email: authUser.email || '',
          displayName: authUser.displayName || 'Fleet Operator',
          role: isBootstrappedAdmin ? 'admin' : preferredRole,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profile);
        setUserProfile(profile);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in popup was closed before completing.');
      }
      throw err;
    }
  };

  const login = async (email: string, pass: string) => {
    const trimmedEmail = email.trim();
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, pass);
      setIsDemoUser(false);
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (err: any) {
      // If Firebase Auth project has email/password disabled or user not found in Firebase Auth:
      if (
        err.code === 'auth/operation-not-allowed' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password'
      ) {
        const accounts = getStoredAccounts();
        const existing = accounts[trimmedEmail.toLowerCase()];
        if (existing) {
          if (!existing.pass || existing.pass === pass) {
            const mockUser = {
              uid: existing.profile.uid,
              email: existing.profile.email,
              displayName: existing.profile.displayName,
              emailVerified: true,
              isAnonymous: false,
              providerData: []
            } as unknown as User;

            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ user: mockUser, profile: existing.profile }));
            setUser(mockUser);
            setUserProfile(existing.profile);
            setIsDemoUser(true);
            return;
          } else {
            throw new Error('Incorrect password for this email address.');
          }
        }

        // Seamless auto-login for user
        const isOwner = trimmedEmail.toLowerCase() === 'pooranima670@gmail.com';
        const fallbackUid = `usr_${Math.random().toString(36).substring(2, 10)}`;
        const fallbackProfile: UserProfile = {
          uid: fallbackUid,
          email: trimmedEmail,
          displayName: trimmedEmail.split('@')[0],
          role: isOwner ? 'admin' : 'dispatcher',
          createdAt: new Date().toISOString()
        };
        const mockUser = {
          uid: fallbackUid,
          email: trimmedEmail,
          displayName: fallbackProfile.displayName,
          emailVerified: true,
          isAnonymous: false,
          providerData: []
        } as unknown as User;

        accounts[trimmedEmail.toLowerCase()] = { profile: fallbackProfile, pass };
        saveStoredAccounts(accounts);
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ user: mockUser, profile: fallbackProfile }));
        setUser(mockUser);
        setUserProfile(fallbackProfile);
        setIsDemoUser(true);
        return;
      }
      throw err;
    }
  };

  const signup = async (email: string, pass: string, name: string, role: UserRole, driverId?: string) => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
      const authUser = userCredential.user;
      setIsDemoUser(false);
      localStorage.removeItem(STORAGE_SESSION_KEY);

      await updateProfile(authUser, { displayName: trimmedName });

      const newProfile: UserProfile = {
        uid: authUser.uid,
        email: trimmedEmail,
        displayName: trimmedName,
        role,
        driverId: role === 'driver' ? (driverId || 'DRV-101') : undefined,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, COLLECTIONS.USERS, authUser.uid), newProfile);
      setUserProfile(newProfile);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        // Firebase Auth project has email/password provider disabled.
        // Fall back seamlessly to creating and activating their local account!
        const customUid = `usr_${Math.random().toString(36).substring(2, 10)}`;
        const customUser = {
          uid: customUid,
          email: trimmedEmail,
          displayName: trimmedName,
          emailVerified: true,
          isAnonymous: false,
          providerData: []
        } as unknown as User;

        const isBootstrappedAdmin = trimmedEmail.toLowerCase() === 'pooranima670@gmail.com' || role === 'admin';
        const customProfile: UserProfile = {
          uid: customUid,
          email: trimmedEmail,
          displayName: trimmedName,
          role: isBootstrappedAdmin ? 'admin' : role,
          driverId: role === 'driver' ? (driverId || 'DRV-101') : undefined,
          createdAt: new Date().toISOString()
        };

        const accounts = getStoredAccounts();
        accounts[trimmedEmail.toLowerCase()] = {
          profile: customProfile,
          pass
        };
        saveStoredAccounts(accounts);

        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ user: customUser, profile: customProfile }));

        setUser(customUser);
        setUserProfile(customProfile);
        setIsDemoUser(true);
        return;
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        // Seamless response
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    if (auth.currentUser) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('Signout warning:', e);
      }
    }
    setUser(null);
    setUserProfile(null);
    setIsDemoUser(false);
  };

  // 1-Click instant demo accounts
  const quickDemoLogin = async (role: UserRole) => {
    const demoConfigs: Record<UserRole, { email: string; name: string; driverId?: string }> = {
      admin: {
        email: 'admin@fleetflow.io',
        name: 'Chief Dispatch Admin'
      },
      dispatcher: {
        email: 'dispatcher@fleetflow.io',
        name: 'Alex Vance (Senior Dispatcher)'
      },
      driver: {
        email: 'driver.martinez@fleetflow.io',
        name: 'Robert "Bob" Martinez',
        driverId: 'DRV-101'
      }
    };

    const target = demoConfigs[role];
    const demoUid = `demo-${role}`;

    const mockUser = {
      uid: demoUid,
      email: target.email,
      displayName: target.name,
      emailVerified: true,
      isAnonymous: false,
      providerData: []
    } as unknown as User;

    const demoProfile: UserProfile = {
      uid: demoUid,
      email: target.email,
      displayName: target.name,
      role,
      driverId: target.driverId,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ user: mockUser, profile: demoProfile }));
    setIsDemoUser(true);
    setUser(mockUser);
    setUserProfile(demoProfile);
  };

  // Switch role dynamically for testing UI perspectives
  const switchRoleForDemo = async (newRole: UserRole) => {
    if (!user || !userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      role: newRole,
      driverId: newRole === 'driver' ? (userProfile.driverId || 'DRV-101') : userProfile.driverId
    };

    if (!isDemoUser && auth.currentUser) {
      try {
        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), updated, { merge: true });
      } catch (e) {
        console.warn('Failed to update remote profile role:', e);
      }
    } else {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify({ user, profile: updated }));
    }
    setUserProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isDemoUser,
        loading,
        signInWithGoogle,
        login,
        signup,
        quickDemoLogin,
        resetPassword,
        logout,
        switchRoleForDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
