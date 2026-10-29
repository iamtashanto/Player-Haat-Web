'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export type ActiveRole = 'PLAYER' | 'RECRUITER';

interface PhPreferencesContextValue {
  reduceEffects: boolean;
  setReduceEffects: (val: boolean) => void;
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  dualRolesEnabled: boolean;
  setDualRolesEnabled: (enabled: boolean) => void;
}

const PhPreferencesContext = createContext<PhPreferencesContextValue>({
  reduceEffects: false,
  setReduceEffects: () => {},
  activeRole: 'PLAYER',
  setActiveRole: () => {},
  dualRolesEnabled: true,
  setDualRolesEnabled: () => {},
});

export function usePhPreferences() {
  return useContext(PhPreferencesContext);
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [reduceEffects, setReduceEffectsState] = useState(false);
  const [activeRole, setActiveRoleState] = useState<ActiveRole>('PLAYER');
  const [dualRolesEnabled, setDualRolesEnabled] = useState(true);

  useEffect(() => {
    try {
      const savedReduce = localStorage.getItem('ph-reduce-effects');
      if (savedReduce === 'true') {
        setReduceEffectsState(true);
        document.documentElement.setAttribute('data-reduce-effects', 'true');
      } else if (
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        window.matchMedia('(prefers-reduced-transparency: reduce)').matches
      ) {
        setReduceEffectsState(true);
        document.documentElement.setAttribute('data-reduce-effects', 'true');
      }
      const savedRole = localStorage.getItem('ph-active-role');
      if (savedRole === 'PLAYER' || savedRole === 'RECRUITER') {
        setActiveRoleState(savedRole);
      }
    } catch {
      // Ignore storage access errors in private browsing
    }
  }, []);

  const setReduceEffects = (val: boolean) => {
    setReduceEffectsState(val);
    try {
      localStorage.setItem('ph-reduce-effects', String(val));
      if (val) {
        document.documentElement.setAttribute('data-reduce-effects', 'true');
      } else {
        document.documentElement.removeAttribute('data-reduce-effects');
      }
    } catch {
      // ignore
    }
  };

  const setActiveRole = (role: ActiveRole) => {
    setActiveRoleState(role);
    try {
      localStorage.setItem('ph-active-role', role);
    } catch {
      // ignore
    }
  };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <PhPreferencesContext.Provider
          value={{
            reduceEffects,
            setReduceEffects,
            activeRole,
            setActiveRole,
            dualRolesEnabled,
            setDualRolesEnabled,
          }}
        >
          {children}
        </PhPreferencesContext.Provider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}

