import React, { useState } from "react";
import "../stylesheets/ExampleScenario.css";

export default function ScenarioDashboard() {
  const [activeTab, setActiveTab] = useState("investments");

  const tabs = [
    { id: "investments", label: "Investments" },
    { id: "investmentTypes", label: "Investment Types" },
    { id: "events", label: "Events" },
    { id: "strategies", label: "Strategies" },
    { id: "assumptions", label: "Assumptions" },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="card header-card">
        <h2>Scenario Overview: Reimu</h2>
        <div className="grid">
          <div>Marital Status: Couple</div>
          <div>Birth Years: 1985, 1987</div>
          <div>Life Expectancy: 80 / Normal(82, 3)</div>
          <div>Residence State: NY</div>
          <div>Financial Goal: $10,000</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card tab-content">
        {activeTab === "investments" && (
          <div className="card-grid">
            {[
              {
                name: "Cash",
                type: "Cash",
                value: "$100",
                tax: "Non-Retirement",
              },
              {
                name: "S&P 500",
                type: "S&P 500",
                value: "$100,000",
                tax: "Non-Retirement",
              },
              {
                name: "Tax-Exempt Bonds",
                type: "S&P 500",
                value: "$2,000",
                tax: "Non-Retirement",
              },
              {
                name: "S&P 500 (Pre-Tax)",
                type: "S&P 500",
                value: "$10,000",
                tax: "Pre-Tax",
              },
              {
                name: "S&P 500 (After-Tax)",
                type: "S&P 500",
                value: "$2,000",
                tax: "After-Tax",
              },
            ].map((inv) => (
              <div className="mini-card" key={inv.name}>
                <strong>{inv.name}</strong>
                <div>Type: {inv.type}</div>
                <div>Value: {inv.value}</div>
                <div>Tax Status: {inv.tax}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "investmentTypes" && (
          <div className="scroll-area">
            <div className="mini-card">
              <strong>S&P 500</strong>
              <div>Return: Percent (Normal: 0.06, 0.02)</div>
              <div>Income: Percent (Normal: 0.01, 0.005)</div>
              <div>Expense Ratio: 0</div>
              <div>Taxable: Yes</div>
            </div>
            <div className="mini-card">
              <strong>Cash</strong>
              <div>Return: Amount (Fixed: 0)</div>
              <div>Income: Percent (Fixed: 0)</div>
              <div>Expense Ratio: 0</div>
              <div>Taxable: Yes</div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="scroll-area">
            <div className="mini-card">
              <strong>Salary</strong>
              <div>Start: 2025</div>
              <div>Duration: 40 years</div>
              <div>Amount: $75,000 + Uniform($500–$2000)</div>
              <div>Social Security: No</div>
            </div>
            <div className="mini-card">
              <strong>Vacation</strong>
              <div>Starts with: Salary</div>
              <div>Expense: $1,200 (Fixed)</div>
              <div>Inflation Adjusted: Yes</div>
            </div>
          </div>
        )}

        {activeTab === "strategies" && (
          <div>
            <p>Spending: vacation → streaming services</p>
            <p>
              Withdrawal: S&P 500 non-retirement → tax-exempt bonds → S&P 500
              after-tax
            </p>
            <p>RMD: S&P 500 pre-tax</p>
            <p>Roth Conversion: 2050–2060 (from S&P 500 pre-tax)</p>
          </div>
        )}

        {activeTab === "assumptions" && (
          <div>
            <p>Inflation Assumption: Fixed(80)</p>
            <p>After-Tax Contribution Limit: $7,000</p>
          </div>
        )}
      </div>
    </div>
  );
}
