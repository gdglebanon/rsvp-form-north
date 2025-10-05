"use client";

import React, { createContext, useContext } from "react";

type User = {
  uid: string;
  isAnonymous: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: { uid: 'anonymous', isAnonymous: true },
  loading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // No authentication needed, just provide a default anonymous user
  const value = {
    user: { uid: 'anonymous', isAnonymous: true },
    loading: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
