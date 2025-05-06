import React, { createContext, useContext } from "react";
import { useEventSeriesFormHooks } from "../hooks/useEventSeriesFormHooks";

// Create Context
const EventSeriesFormContext = createContext<ReturnType<
  typeof useEventSeriesFormHooks
> | null>(null);

// 2. Create a provider component
export function EventSeriesFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useEventSeriesFormHooks();
  return (
    <EventSeriesFormContext.Provider value={value}>
      {children}
    </EventSeriesFormContext.Provider>
  );
}

// 3. Custom Hook for consuming context
export function useEventSeriesForm() {
  const context = useContext(EventSeriesFormContext);
  if (!context) {
    throw new Error(
      "useEventSeriesForm must be used within an EventSeriesFormProvider"
    );
  }
  return context;
}
