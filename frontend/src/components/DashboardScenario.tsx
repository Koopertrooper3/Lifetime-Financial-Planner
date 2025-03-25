export default function DashboardScenario({ Scenario }: { Scenario: any }) {
  return (
    <div>
      <button className="dashboard">
        <h1>Scenario: {Scenario.name}</h1>
        <div>
          <div className="left-panel">
            <div>Martial Status: {Scenario.maritalStatus}</div>
            <div>
              Life Expectancy:
              {Scenario.lifeExpectancy
                .map((expectancy: any) => {
                  if (expectancy.type === "Fixed") {
                    return ` Fixed: ${expectancy.value}`;
                  }
                  if (expectancy.type === "Normal") {
                    return ` Normal: mean = ${expectancy.mean}, stdev = ${expectancy.stdev}`;
                  }
                  return null;
                })
                .join(" / ")}
              ;
            </div>
            <div>Financial Goal: ${Scenario.financialGoal}</div>
          </div>

          <div className="right-panel">
            <div>
              Birth Year:
              {Scenario.maritalStatus == "couple"
                ? ` ${Scenario.birthYear[0]}, ${Scenario.birthYear[1]}`
                : Scenario.birthYear[0]}
            </div>
            <div>Residence State: {Scenario.residenceState}</div>
          </div>
        </div>
      </button>
    </div>
  );
}
