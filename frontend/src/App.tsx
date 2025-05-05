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
import SharedWithMePage from "./pages/SharedWithMePage";
import { LimitsInflationPage } from "./pages/LimitsInflationPage";
import CreateSlideWrapper from "./CreateSlideWrapper";
import UserProfilePage from "./pages/UserProfilePage";
import { registerChartJSComponents } from "./components/Charts/ChartSetup";
import { EventSeriesFormProvider } from "./context/EventSeriesFormContext";
import Strategies from "./pages/StrategiesPage";
import SpendingStrategy from "./components/Strategies/SpendingStrategy";
import SimulationExplorationPage from "./pages/SimulationExplorationPage";
import SharedScenarioPage from "./pages/SharedScenarioPage";
import AddNewInvestment from "./pages/AddNewInvestment";
import InvestmentForm from "./pages/InvestmentForm";

registerChartJSComponents();

function ProtectedRoutes() {
  return (
    <ScenarioProvider>
      <HelperContextProvider>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route
              path="createScenario/*"
              element={
                <CreateSlideWrapper
                  routes={[
                    <Route
                      index
                      element={<ScenarioFormPage />}
                      key="scenario"
                    />,
                    <Route path="addNewInvestment" element={<AddNewInvestment />}>
                    <Route index element={<InvestmentForm />} />
                    <Route path="addNewInvestmentType" element={<InvestmentTypeForm />} />
                  </Route>,
                    <Route
                      path="addNewEventSeries"
                      element={
                        <EventSeriesFormProvider>
                          <AddNewEventSeries />
                        </EventSeriesFormProvider>
                      }
                      key="eventSeries"
                    />,
                
                    <Route
                      path="Limits&ContributionLimits"
                      element={<LimitsInflationPage />}
                      key="limits"
                    />,
                    <Route
                      path="addStrategies/*"
                      element={
                        <CreateSlideWrapper
                          routes={[
                            <Route
                              index
                              element={<Strategies />}
                              key="strategies"
                            />,
                            <Route
                              path="spendingStrategy"
                              element={<SpendingStrategy />}
                              key="spending"
                            />,
                          ]}
                        />
                      }
                      key="strategiesRoot"
                    />,
                  ]}
                />
              }
            />
          </Route>

          {/* Other protected routes */}
          <Route path="/scenario/:id" element={<ScenarioPage />} />
          <Route path="/sharedScenario/:id" element={<SharedScenarioPage />} />
          <Route path="/chartsPage" element={<ChartsPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
          <Route path="/shared" element={<SharedWithMePage />} />
          <Route
            path="/simulationPage"
            element={<SimulationExplorationPage />}
          />
        </Routes>
      </HelperContextProvider>
    </ScenarioProvider>
  );
}

// Usage in App component:
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  );
}
