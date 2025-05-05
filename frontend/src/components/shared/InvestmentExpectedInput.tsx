import "../../stylesheets/InvestmentType/ExpectedInput.css";
import ValidationTextFields from "./ValidationTextFields";

interface InvestmentExpectedInputProps {
  label?: string;
  value: string | number;
  setValue: (val: string | number) => void;
  placeholder?: string;
}

const InvestmentExpectedInput = ({
  label = "Enter Current Market Value",
  value,
  setValue,
  placeholder = "e.g. $10,000",
}: InvestmentExpectedInputProps) => {
  return (
    <div className="expected-input-container">
      <p>{label}</p>
      <ValidationTextFields
        value={value}
        placeholder={placeholder}
        setInput={setValue}
        inputType="number"
        width="100%"
        height="1.4375em"
        disabled={false}
      />
    </div>
  );
};

export default InvestmentExpectedInput;
