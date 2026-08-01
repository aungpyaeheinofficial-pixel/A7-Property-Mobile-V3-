"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AccountType = "seeker" | "lister";
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  accountType: AccountType;
  isAgent: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  avatarUrl?: string;
  agencyName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  signIn: (email: string, accountType: AccountType) => AuthUser;
  signUp: (email: string, fullName: string, accountType: AccountType) => AuthUser;
  signOut: () => void;
  upgradeToLister: () => void;
  updateProfile: (patch: Partial<AuthUser>) => void;
}

const AUTH_STORAGE_KEY = "a7-auth-user";

const AuthContext = createContext<AuthContextValue | null>(null);

function generateId() {
  return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createUser(email: string, fullName: string, accountType: AccountType): AuthUser {
  return {
    id: generateId(),
    email,
    fullName,
    accountType,
    isAgent: false,
    phoneVerified: false,
    idVerified: false,
  };
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      const parsed = stored ? (JSON.parse(stored) as AuthUser) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsed);
       
      setStatus(parsed ? "authenticated" : "unauthenticated");
    } catch {
       
      setStatus("unauthenticated");
    }
  }, []);

  const persist = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    if (nextUser) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setStatus(nextUser ? "authenticated" : "unauthenticated");
  }, []);

  const signIn = useCallback((email: string, accountType: AccountType): AuthUser => {
    const existing = user?.email === email ? user : null;
    const nextUser = existing ?? createUser(email, email.split("@")[0] || "User", accountType);
    persist(nextUser);
    return nextUser;
  }, [user, persist]);

  const signUp = useCallback((email: string, fullName: string, accountType: AccountType): AuthUser => {
    const nextUser = createUser(email, fullName, accountType);
    persist(nextUser);
    return nextUser;
  }, [persist]);

  const signOut = useCallback(() => {
    persist(null);
  }, [persist]);

  const upgradeToLister = useCallback(() => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, accountType: "lister" as AccountType };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProfile = useCallback((patch: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    signIn,
    signUp,
    signOut,
    upgradeToLister,
    updateProfile,
  }), [user, status, signIn, signUp, signOut, upgradeToLister, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export { AuthProvider, useAuth };