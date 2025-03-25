import React, { createContext, useContext, useState, useEffect } from "react";

interface HelperContextType {
  fetchScenario: (id: string) => Promise<any>;
  fetchInvestmentType: (id: string) => Promise<any>;
  fetchDistribution: (id: string) => Promise<any>;
  fetchAllScenarios: () => Promise<any>;
  allInvestmentTypes: any[] | null;
  allScenarios: any[] | null;
}

const HelperContext = createContext<HelperContextType>({
  fetchScenario: async () => null,
  fetchInvestmentType: async () => null,
  fetchDistribution: async () => null,
  fetchAllScenarios: async () => null,
  allInvestmentTypes: null,
  allScenarios: null,
});

export const useHelperContext = () => useContext(HelperContext);

export const HelperContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allInvestmentTypes, setAllInvestmentTypes] = useState(null);
  const [allScenarios, setAllScenarios] = useState(null);

  useEffect(() => {
    fetchAllInvestmentTypes();
    fetchAllScenarios();
  }, []);

  const fetchScenario = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/scenarios/${id}`);
      const json = await res.json();
      return json.data;
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
      console.error("Error fetching all the scenarios:", error);
    }
  };

  const fetchInvestmentType = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/investmentTypes/${id}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.error("Error fetching investment type:", error);
    }
  };

  const fetchAllInvestmentTypes = async () => {
    try {
      const res = await fetch(`http://localhost:8000/investmentTypes/`);
      const json = await res.json();
      setAllInvestmentTypes(json.data);
    } catch (error) {
      console.error("Error fetching investment type:", error);
    }
  };

  const fetchDistribution = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/distributions/${id}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.error("Error fetching distribution:", error);
    }
  };

  return (
    <HelperContext.Provider
      value={{
        fetchScenario,
        fetchInvestmentType,
        fetchDistribution,
        fetchAllScenarios,
        allInvestmentTypes,
        allScenarios,
      }}
    >
      {children}
    </HelperContext.Provider>
  );
};
