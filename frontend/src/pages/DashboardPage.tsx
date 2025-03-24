import "../stylesheets/Dashboard.css";
import Banner from "../components/Banner";
import SideBar from "../components/Sidebar";
import AddPlan from "../components/AddPlan";

function DashboardPage() {
  return (
    <div>
      <Banner />
      <SideBar />
      <div className="dashboard-container">
        <AddPlan />
      </div>
      {/* <CreateScenario></CreateScenario> */}
    </div>
  );
}

export default DashboardPage;
