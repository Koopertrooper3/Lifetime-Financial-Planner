/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";
import { isDebug, User } from "./debug";
import { Scenario } from "../../backend/db/Scenario";
import axios from "axios";
import { mockSimulationResults } from "./components/Charts/MockData";

interface HelperContextType {
  fetchScenario: (id: string) => Promise<any>;
  fetchAllScenarios: () => Promise<any>;
  fetchSimulationResults: (scenarioId: string) => Promise<any>;
  setGlobalUserID: (userId: string) => void;
  userID: any;
  allInvestmentTypes: any[] | null;
  allScenarios: any[] | null;
  handleEditScenario: (
    userID: string,
    scenarioID: string,
    updatedFields: Partial<Scenario>
  ) => Promise<any>;
}

const HelperContext = createContext<HelperContextType>({
  fetchScenario: async () => null,
  fetchAllScenarios: async () => null,
  fetchSimulationResults: async () => null,
  setGlobalUserID: async () => null,
  userID: "",
  allInvestmentTypes: null,
  allScenarios: null,
  handleEditScenario: async () => null,
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
  const [allInvestmentTypes, setAllInvestmentTypes] = useState<
    InvestmentType[] | null
  >(null);

  const [userID, setUserID] = useState<User | null>(null);

  const mockScenarios = [
    { _id: "1", name: "Mock Retirement Plan" },
    { _id: "2", name: "Guest Scenario" },
  ];

  const mockInvestmentTypes = [
    { _id: "a", name: "Stocks" },
    { _id: "b", name: "Bonds" },
  ];

  // useEffect(() => {
  //   if (isDebug) {
  //     console.log("DEBUG MODE: Injecting mock scenario and investment data.");
  //     setAllScenarios(mockScenarios);
  //     setAllInvestmentTypes(mockInvestmentTypes);
  //   } else {
  //     fetchAllScenarios();
  //   }
  // }, []);

  // ------ WITHOUT DEBUG ------

  useEffect(() => {
    fetchAllScenarios();
  }, []);

  useEffect(() => {
    console.log("All investment types:", allInvestmentTypes);
  }, [allInvestmentTypes]);

  const fetchScenario = async (id: string) => {
    console.log("Fetching for scenario: ", id);
    try {
      const res = await fetch(`http://localhost:8000/scenario/${id}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.error("Error fetching scenario:", error);
    }
  };

  const fetchSimulationResults = async (scenarioId: string) => {
    try {
      const res = await fetch(
        `http://localhost:8000/simulation-results/${scenarioId}`
      );
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.error("Error fetching simulation results:", error);
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

  const handleEditScenario = async (
    userID: string,
    scenarioID: string,
    updatedFields: Partial<Scenario> // Allow partial fields instead of full scenario
  ) => {
    console.log("Sending scenario:", updatedFields);
    try {
      const res = await axios.post("http://localhost:8000/scenario/edit", {
        userID,
        scenarioID,
        updatedFields,
      });

      console.log("Scenario updated successfully:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error updating scenario:", error);
    }
  };

  const setGlobalUserID = (userID: any) => {
    setUserID(userID);
  };
  // const fetchInvestmentType = async (id: string) => {
  //   try {
  //     const res = await fetch(`http://localhost:8000/investmentTypes/${id}`);
  //     const json = await res.json();
  //     return json.data;
  //   } catch (error) {
  //     console.error("Error fetching investment type:", error);
  //   }
  // };

  return (
    <HelperContext.Provider
      value={
        // isDebug
        //   ? {
        //       fetchScenario: async (id: string) =>
        //         mockScenarios.find((s) => s._id === id),
        //       fetchAllScenarios: async () => mockScenarios,
        //       fetchSimulationResults: async () => mockSimulationResults,
        //       setGlobalUserID,
        //       userID,
        //       allInvestmentTypes: mockInvestmentTypes,
        //       allScenarios: mockScenarios,
        //       handleEditScenario,
        //     }
        //   :
        {
          fetchScenario,
          fetchAllScenarios,
          fetchSimulationResults,
          setGlobalUserID,
          userID,
          allInvestmentTypes,
          allScenarios,
          handleEditScenario,
        }
      }
    >
      {children}
    </HelperContext.Provider>
  );
};
