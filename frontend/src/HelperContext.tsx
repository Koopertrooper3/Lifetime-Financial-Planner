/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";
import { isDebug,User } from "./debug";

interface HelperContextType {
  fetchScenario: (id: string) => Promise<any>;
  fetchAllScenarios: () => Promise<any>;
  setGlobalUserID : (userId: string) => void
  userID: any,
  allInvestmentTypes: any[] | null;
  allScenarios: any[] | null;
}

const HelperContext = createContext<HelperContextType>({
  fetchScenario: async () => null,
  fetchAllScenarios: async () => null,
  setGlobalUserID: async() => null,
  userID: "",
  allInvestmentTypes: null,
  allScenarios: null,
});

export const useHelperContext = () => useContext(HelperContext);

export const HelperContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  type Scenario = {
    _id: string;
    name: string;
    [key: string]: any; //for scaling
  };
  
  type InvestmentType = {
    _id: string;
    name: string;
    [key: string]: any; //for scaling
  };

  const [allScenarios, setAllScenarios] = useState<Scenario[] | null>(null);
  const [allInvestmentTypes, setAllInvestmentTypes] = useState<InvestmentType[] | null>(null);
  const [userID, setUserID] = useState<User | null>(null);

  const mockScenarios = [
    { _id: "1", name: "Mock Retirement Plan" },
    { _id: "2", name: "Guest Scenario" },
  ];

  
  const mockInvestmentTypes = [
    { _id: "a", name: "Stocks" },
    { _id: "b", name: "Bonds" },
  ];

  useEffect(() => {
    if (isDebug) {
      console.log("DEBUG MODE: Injecting mock scenario and investment data.");
      setAllScenarios(mockScenarios);
      setAllInvestmentTypes(mockInvestmentTypes);
    } else {
      fetchAllScenarios();
    }
  }, []);

  // ------ WITHOUT DEBUG ------

  // useEffect(() => {
  //   fetchAllInvestmentTypes();
  //   fetchAllScenarios();
  // }, []);

  const fetchScenario = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/scenario/${id}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.error("Error fetching scenario:", error);
    }
  };

  const fetchAllScenarios = async () => {
    try {
      const res = await fetch(`http://localhost:8000/scenario/`);
      const json = await res.json();
      setAllScenarios(json.data);
    } catch (error) {
      console.error("Error fetching all the scenarios:", error);
    }
  };

  const setGlobalUserID = (userID : any) =>{
    setUserID(userID)
  }
  // const fetchInvestmentType = async (id: string) => {
  //   try {
  //     const res = await fetch(`http://localhost:8000/investmentTypes/${id}`);
  //     const json = await res.json();
  //     return json.data;
  //   } catch (error) {
  //     console.error("Error fetching investment type:", error);
  //   }
  // };

  // const fetchAllInvestmentTypes = async () => {
  //   try {
  //     const res = await fetch(`http://localhost:8000/investmentTypes/`);
  //     const json = await res.json();
  //     setAllInvestmentTypes(json.data);
  //   } catch (error) {
  //     console.error("Error fetching investment type:", error);
  //   }
  // };

  // const fetchDistribution = async (id: string) => {
  //   try {
  //     const res = await fetch(`http://localhost:8000/distributions/${id}`);
  //     const json = await res.json();
  //     return json.data;
  //   } catch (error) {
  //     console.error("Error fetching distribution:", error);
  //   }
  // };

  return (
    <HelperContext.Provider
      value={
        isDebug
          ? {
              fetchScenario: async (id: string) =>
                mockScenarios.find((s) => s._id === id),
              fetchAllScenarios: async () => mockScenarios,
              setGlobalUserID,
              userID,
              allInvestmentTypes: mockInvestmentTypes,
              allScenarios: mockScenarios,
            }
          : {
              fetchScenario,
              fetchAllScenarios,
              setGlobalUserID,
              userID,
              allInvestmentTypes,
              allScenarios,
            }
      }
    >
      {children}
    </HelperContext.Provider>
  );  
};
