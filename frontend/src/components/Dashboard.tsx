import "../stylesheets/Dashboard.css";
import Banner from "./Banner";
import SideBar from "./Sidebar";
import AddPlan from "./AddPlan";
import CreateScenario from "./CreateScenario";
import { useHelperContext } from "../HelperContext";
import DashboardScenario from "./DashboardScenario";

export default function Dashboard() {
  const { allScenarios } = useHelperContext();

  if (!allScenarios) {
    return <p>Loading scenarios...</p>;
  }

  return (
    <div>
      {/* <Banner></Banner>
      <SideBar></SideBar>
      <div className="dashboard-container">
        <AddPlan />
      </div> */}
      {allScenarios.map((scenario: any, idx: number) => (
        <DashboardScenario key={idx} Scenario={scenario} />
      ))}
      {/* <CreateScenario></CreateScenario> */}
    </div>
  );
}
