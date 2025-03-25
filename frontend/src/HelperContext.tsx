import React, { createContext, useContext, useState, useEffect } from "react";

interface HelperContextType {
  scenario: any | null;
  allScenarios: any | null;
}

const HelperContext = createContext<HelperContextType>({
  scenario: null,
  allScenarios: null,
});

export const useHelperContext = () => useContext(HelperContext);

export const HelperContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scenario, setScenario] = useState<any>(null);
  const [allScenarios, setAllScenarios] = useState<any>(null);

  useEffect(() => {
    fetchAllScenarios();
  }, []);

  const fetchScenario = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/scenarios/${id}`);
      const json = await res.json();
      setScenario(json.data);
    } catch (error) {
      console.error("Error fetching scenario:", error);
    }
  };

  const fetchAllScenarios = async () => {
    try {
      const res = await fetch(`http://localhost:8000/scenarios/`);
      const json = await res.json();
      setAllScenarios(json.data);
    } catch (error) {
      console.error("Error fetching scenario:", error);
    }
  };

  return (
    <HelperContext.Provider value={{ scenario, allScenarios }}>
      {children}
    </HelperContext.Provider>
  );
};
