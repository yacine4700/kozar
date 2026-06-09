"use client";

import React, { createContext, useContext } from 'react';
import { WorkshopSettings } from '@/actions/settings/settings.actions';

const SettingsContext = createContext<WorkshopSettings | null>(null);

export function SettingsProvider({ 
  initialSettings, 
  children 
}: { 
  initialSettings: WorkshopSettings | null; 
  children: React.ReactNode 
}) {
  return (
    <SettingsContext.Provider value={initialSettings}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * A reusable hook to access workshop and legal settings globally.
 * Contains: workshop_name, workshop_address, rc, nif, ai, nis.
 */
export function useSettings() {
  return useContext(SettingsContext);
}
