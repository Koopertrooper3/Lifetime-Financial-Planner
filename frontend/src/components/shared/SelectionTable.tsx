import { useState } from "react";
import CollapsibleWrapper from "../../wrapper/CollapsibleWrapper";
import InvestmentTypeForm from "../../pages/InvestmentTypeForm";
import EventSeriesForm from "../../pages/EventSeriesForm";
import { Link } from "react-router-dom";
import "../../stylesheets/shared/SelectionTable.css";

interface SelectionTableProps {
  title: string;
  description: string;
  data: any[] | null;
  emptyMessage?: string;
  category: string;
  renderAttribute: (item: any) => React.ReactNode;
}

export default function SelectionTable({
  title,
  description,
  data,
  emptyMessage,
  category,
  renderAttribute,
}: SelectionTableProps) {
  const [investmentType, setInvestmentType] = useState<any>(null);
  const [eventSeries, setEventSeries] = useState<any>(null);

  const handleClick = (title: string, type: any) => {
    setInvestmentType(null);
    setEventSeries(null);
    if (title === "Investment Types") {
      setInvestmentType(type);
    } else {
      setEventSeries(type);
    }
  };

  return (
    <CollapsibleWrapper title={title} initiallyOpen={true}>
      <p className="grayed-text">{description}</p>

      {data?.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <>
          <table className="selection-type-container">
            <thead className="header-container">
              <tr>
                <th className="purple-title">{title}</th>
                <th className="purple-title">{category}</th>
                <th className="purple-title">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((type, index) => (
                <tr key={index} className="selection-type-item">
                  <td className="purple-title">{type.name}</td>
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

          {investmentType && (
            <div className="investment-form-wrapper">
              <InvestmentTypeForm
                isEditMode={true}
                investmentType={investmentType}
              />
            </div>
          )}
          {eventSeries && (
            <div className="investment-form-wrapper">
              <EventSeriesForm isEditMode={true} eventSeries={eventSeries} />
            </div>
          )}
        </>
      )}
    </CollapsibleWrapper>
  );
}
