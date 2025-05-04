/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../debug";
import { Scenario } from "../../../backend/db/Scenario";
import axiosCookie from ".././axiosCookie";
// import { mockSimulationResults } from "./components/Charts/MockData";

interface HelperContextType {
  fetchScenario: (id: string) => Promise<any>;
  fetchSimulationResults: (scenarioId: string) => Promise<any>;
  fetchUser: () => void;
  userID: any;
  ownedScenarios: Scenario[];
  sharedWithScenarios: Scenario[];
  handleEditScenario: (
    userID: string,
    scenarioID: string,
    updatedFields: Partial<Scenario>
  ) => Promise<any>;
  userAuthenticated: boolean;
  setUserAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const HelperContext = createContext<HelperContextType>({
  fetchScenario: async () => null,
  fetchSimulationResults: async () => null,
  fetchUser: async () => null,
  userID: "",
  ownedScenarios: [],
  sharedWithScenarios: [],
  handleEditScenario: async () => null,
  userAuthenticated: false,
  setUserAuthenticated: () => {},
});

export const useHelperContext = () => useContext(HelperContext);

export const HelperContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ownedScenarios, setOwnedScenarios] = useState<Scenario[]>([]);
  const [sharedWithScenarios, setSharedWithScenarios] = useState<Scenario[]>([]);

  const [userID, setUserID] = useState<User | null>(null);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);

  // ------ WITHOUT DEBUG ------

  const fetchScenario = async (id: string) => {
    console.log("Fetching for scenario: ", id);
    try {
      const data = await axiosCookie(`/scenario/${id}`);
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

  const fetchUser = async () => {
    try {
      const response = await axiosCookie.get("/user");
      console.log(response.data);
      setUserID(response.data);
    } catch (err) {
      console.error("error fetching user data", err);
    }
  };

  const fetchUserContent = async () => {
    try {
      const response = await axiosCookie.get("/scenario/userScenarios");
      console.log(response.data);
      setOwnedScenarios(response.data.ownedScenarios);
      setSharedWithScenarios(response.data.sharedScenarios);
    } catch (err) {
      console.error("error fetching user data", err);
    }
  };

  useEffect(() => {
    fetchUserContent();
  }, []);

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
          fetchSimulationResults,
          fetchUser,
          userID,
          ownedScenarios,
          sharedWithScenarios,
          handleEditScenario,
          userAuthenticated,
          setUserAuthenticated,
        }
      }
    >
      {children}
    </HelperContext.Provider>
  );
};
