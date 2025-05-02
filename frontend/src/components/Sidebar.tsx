import React, { useState } from "react";
import "../stylesheets/Sidebar.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WalletIcon from "@mui/icons-material/Wallet";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import PaidIcon from "@mui/icons-material/Paid";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import MenuIcon from "@mui/icons-material/Menu"; 

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);
  const navigationFunction = (nextPage : string) => {
    if(nextPage == "Dashboard"){
      window.location.href = "/dashboard"
    }else if(nextPage == "Shared With Me"){
      window.location.href = "/shared"
    }else if(nextPage == "Reports"){
      window.location.href = "/dashboard"
    }else if(nextPage == "Investments"){
      window.location.href = "/dashboard"
    }else{
      window.location.href = "/dashboard"
    }
  }
  const upperIcons = [
    { name: "Dashboard", icon: DashboardIcon },
    { name: "Shared With Me", icon: WalletIcon },
    { name: "Reports", icon: SignalCellularAltIcon },
    { name: "Investments", icon: PaidIcon },
  ];

  const lowerIcons = [
    { name: "Settings", icon: SettingsIcon },
    { name: "Help", icon: HelpIcon },
  ];

  return (
    <aside>
      <div className={`side-bar ${collapsed ? "collapsed" : ""}`}>
        <button className="hamburger" onClick={toggleSidebar}>
          <MenuIcon />
        </button>

        <div className="sidebar-section">
          {upperIcons.map((item) => (
            <button className="sidebar-button" key={item.name} onClick={() => {navigationFunction(item.name)}}>
              <item.icon />
              {!collapsed && <span>{item.name}</span>}
            </button>
          ))}
        </div>

        <hr className="delimiter" />

        <div className="sidebar-section">
          {lowerIcons.map((item) => (
            <button className="sidebar-button" key={item.name}>
              <item.icon />
              {!collapsed && <span>{item.name}</span>}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
