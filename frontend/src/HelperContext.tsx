/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";
import { isDebug, User } from "./debug";
import { Scenario } from "../../backend/db/Scenario";
import axiosCookie from "./axiosCookie";
// import { mockSimulationResults } from "./components/Charts/MockData";

interface HelperContextType {
  fetchScenario: (id: string) => Promise<any>;
  fetchAllScenarios: () => Promise<any>;
  fetchSimulationResults: (scenarioId: string) => Promise<any>;
  fetchUser: () => void;
  userID: any;
  allInvestmentTypes: any[] | null;
  allScenarios: any[] | null;
  ownedScenarios : any[],
  sharedWithScenarios : any[],
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
  fetchUser: async () => null,
  userID: "",
  allInvestmentTypes: null,
  allScenarios: null,
  ownedScenarios : [],
  sharedWithScenarios : [],
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
  const [ownedScenarios, setOwnedScenarios] = useState<Scenario[] | null>(null);
  const [sharedWithScenarios, setSharedWithScenarios] = useState<Scenario[] | null>(null);
  const [allInvestmentTypes, setAllInvestmentTypes] = useState<
    InvestmentType[] | null
  >(null);

  const [userID, setUserID] = useState<User | null>(null);

  

  useEffect(() => {
    const mockScenarios = [
      { _id: "1", name: "Mock Retirement Plan" },
      { _id: "2", name: "Guest Scenario" },
    ];
  
    const mockInvestmentTypes = [
      { _id: "a", name: "Stocks" },
      { _id: "b", name: "Bonds" },
    ];

    if (isDebug) {
      console.log("DEBUG MODE: Injecting mock scenario and investment data.");
      setAllScenarios(mockScenarios);
      setAllInvestmentTypes(mockInvestmentTypes);
    } else {
      fetchAllScenarios();
    }
  }, []);

  // ------ WITHOUT DEBUG ------

  const fetchScenario = async (id: string) => {
    console.log("Fetching for scenario: ", id);
    try {
      const data = await axiosCookie(`/scenario/${id}`);
      console.log("asdsada", data)
      return data.data.data;
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
      const res = await axiosCookie.get(`/scenario`);
      const json = await res.data;
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
      const res = await axiosCookie.post("/scenario/edit", {
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

  const fetchUser = async() => {
    try {
      const response = await axiosCookie.get("/user");
      console.log(response.data);
      setUserID(response.data);
    } catch (err) {
      console.error("error fetching user data", err);
    }
  }
  
  const fetchUserContent = async () => {

    try {
      const response = await axiosCookie.get("/scenario/userScenarios");
      console.log(response.data);
      setOwnedScenarios(response.data.ownedScenarios)
      setSharedWithScenarios(response.data.sharedScenarios)
    } catch (err) {
      console.error("error fetching user data", err);
    }
  }
  // const setGlobalUserID = (userID: any) => {
  //   setUserID(userID);
  // };

  useEffect(() => {
    fetchUserContent();
  }, []);


  useEffect(() => {
    console.log("All investment types:", allInvestmentTypes);
  }, [allInvestmentTypes]);

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
        //   : {
        {
          fetchScenario,
          fetchAllScenarios,
          fetchSimulationResults,
          fetchUser,
          userID,
          allInvestmentTypes,
          allScenarios,
          ownedScenarios,
          sharedWithScenarios,
          handleEditScenario,
        }
      }
    >
      {children}
    </HelperContext.Provider>
  );
};
