import CollapsibleWrapper from "../../wrapper/CollapsibleWrapper";
import { useScenarioContext } from "../../useScenarioContext";
import { useNavigate } from "react-router-dom";
import "../../stylesheets/shared/SelectionTable.css";

interface SelectionTableProps {
  title: string;
  description: string;
  data: Record<string, any>;
  emptyMessage?: string;
  renderAttribute: (item: any) => React.ReactNode;
}

export default function SelectionTable({
  title,
  description,
  data,
  emptyMessage,
  renderAttribute,
}: SelectionTableProps) {
  const navigate = useNavigate();
  const { setEditInvestmentType, setEditEventSeries } = useScenarioContext();

  const handleClick = (title: string, type: any) => {
    setEditInvestmentType(null);
    setEditEventSeries(null);
    if (title === "Investment Types") {
      setEditInvestmentType(type);
      navigate("/dashboard/createScenario/addNewInvestmentType");
    } else {
      setEditEventSeries(type);
      navigate("/dashboard/createScenario/addNewEventSeries");
    }
  };

  return (
    <CollapsibleWrapper title={title} initiallyOpen={true}>
      <p className="grayed-text">{description}</p>

      {Object.entries(data)?.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <>
          <table className="selection-type-container">
            <tbody>
              {Object.entries(data)?.map(([key, type]) => (
                <tr key={key} className="selection-type-item">
                  <td>{type.name}</td>
                  <td className="category">{renderAttribute(type)}</td>
                  <td className="right-align-td">
                    <button
                      className="edit-button"
                      onClick={() => handleClick(title, type)}
                    >
                      Edit
                    </button>
                    <button className="delete-button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </CollapsibleWrapper>
  );
}
