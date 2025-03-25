// @ts-ignore
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import ScenarioDashboard from "./components/ExampleScenario";
import { HelperContextProvider } from "./HelperContext";

function App() {
  return (
    <HelperContextProvider>
      {/* <Router>
        <Routes>
           <Route path="/" element={<LoginPage />} />
           <Route path="/Dashboard" element={<Dashboard />} />
        </Routes>
      </Router> */}
      {/* <ScenarioDashboard /> */}
      <Dashboard></Dashboard>
    </HelperContextProvider>
=======
import './stylesheets/App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateScenarioPage from './pages/CreateScenarioPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/createSenario" element={<CreateScenarioPage />} />
      </Routes>
    </Router>
>>>>>>> main
  );
}

export default App;
