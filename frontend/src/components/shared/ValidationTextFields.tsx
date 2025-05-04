import * as React from "react";
import TextField from "@mui/material/TextField";
import { useState, useEffect } from "react";

interface ValidationTextFieldsProps {
  value: string | number;
  placeholder: string;
  setInput?: (value: string | number) => void;
  inputType: "string" | "number";
  width: string;
  height: string;
  disabled: boolean;
}

// Updated ValidationTextFields.tsx
export default function ValidationTextFields({
  value,
  placeholder,
  setInput,
  inputType,
  width,
  height,
  disabled,
}: ValidationTextFieldsProps) {
  const [isError, setIsError] = useState(false);
  const [displayValue, setDisplayValue] = useState<string>(
    value?.toString() ?? ""
  );

  useEffect(() => {
    setDisplayValue(value?.toString() ?? "");
  }, [value]);

  const handleChange = (inputValue: string) => {
    setDisplayValue(inputValue);

    if (inputType === "number") {
      if (inputValue === "") {
        setInput?.(""); // Allow empty value
        setIsError(false);
        return;
      }

      const num = Number(inputValue);
      if (isNaN(num)) {
        setIsError(true);
        return;
      }

      setInput?.(num);
      setIsError(false);
    } else {
      setInput?.(inputValue);
      setIsError(false);
    }
  };

  return (
    <TextField
      value={displayValue}
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
      error={isError}
      label={isError ? "Error" : ""}
      size="small"
      disabled={disabled}
      sx={{
        width,
        "& .MuiOutlinedInput-root": {
          backgroundColor: "white",
          borderRadius: "5px",
          minHeight: height,
          alignItems: "flex-start",
          padding: 0,
        },
        "& input": {
          fontSize: "14px",
          padding: "12px 16px",
          height: "auto",
        },
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    />
  );
}
