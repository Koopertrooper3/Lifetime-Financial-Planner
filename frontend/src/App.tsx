import "./stylesheets/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ScenarioFormPage from "./pages/ScenarioFormPage";
import { HelperContextProvider } from "./context/HelperContext";
import { ScenarioProvider } from "./context/useScenarioContext";
import ScenarioPage from "./pages/ScenarioPage";
import ChartsPage from "./pages/ChartsPage";
import InvestmentTypeForm from "./pages/InvestmentTypeForm";
import AddNewEventSeries from "./pages/EventSeriesForm";
import SharedWithMePage from "./pages/SharedWithMePage"
import { LimitsInflationPage } from "./pages/LimitsInflationPage";
import EditScenarioPage from "./pages/EditScenarioPage";
import CreateSlideWrapper from "./CreateSlideWrapper";
import UserProfilePage from "./pages/UserProfilePage";
import { registerChartJSComponents } from "./components/Charts/ChartSetup";
import { EventSeriesFormProvider } from "./context/EventSeriesFormContext";
import Strategies from "./pages/StrategiesPage";
import SpendingStrategy from "./components/Strategies/SpendingStrategy";
import SimulationExplorationPage from "./pages/SimulationExplorationPage";

registerChartJSComponents();

function App() {
  return (
    <ScenarioProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            element={
              <HelperContextProvider>
                <Route path="/dashboard" element={<DashboardPage />}>
                  <Route
                    path="createScenario/*"
                    element={
                      <CreateSlideWrapper
                        routes={[
                          <Route path="/" element={<ScenarioFormPage />} />,
                          <Route
                            path="addNewInvestmentType"
                            element={<InvestmentTypeForm />}
                          />,
                          <Route
                            path="addNewEventSeries"
                            element={
                              <EventSeriesFormProvider>
                                <AddNewEventSeries />
                              </EventSeriesFormProvider>
                            }
                          />,
                          <Route
                            path="Limits&ContributionLimits"
                            element={<LimitsInflationPage />}
                          />,
                          <Route
                            path="addStrategies/*"
                            element={
                              <CreateSlideWrapper
                                routes={[
                                  <Route
                                    key="default"
                                    path=""
                                    element={<Strategies />}
                                  />,
                                  <Route
                                    key="spendingStrategy"
                                    path="spendingStrategy"
                                    element={<SpendingStrategy />}
                                  />,
                                ]}
                              />
                            }
                          />,
                        ]}
                      />
                    }
                  />
                </Route>

                <Route path="/scenario/:id" element={<ScenarioPage />} />
                <Route path="/chartsPage/" element={<ChartsPage />} />
                <Route path="/user-profile" element={<UserProfilePage />} />
                <Route
                  path="/scenarios/:id/edit"
                  element={<EditScenarioPage />}
                />
              </HelperContextProvider>
            }
          ></Route>            <Route path="/shared" element={<SharedWithMePage/>} />
            <Route path="/simulationPage" element={<SimulationExplorationPage/>} />

          {/* <Route
            path="Limits&ContributionLimits"
            element={<LimitsInflationPage />}
          />

          <Route path="/AddNewEventSeries" element={<AddNewEventSeries />} /> */}
        </Routes>
      </Router>
    </ScenarioProvider>
  );
}

export default App;
