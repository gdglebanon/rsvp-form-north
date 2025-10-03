"use client";

import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import React, { createContext, useEffect, useState, useContext } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in error", error);
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  if (loading) {
     return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-6">
        <div className="w-full max-w-md space-y-8">
            <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
