import * as React from "react";
import TextField from "@mui/material/TextField";
import { useState } from "react";

interface ValidationTextFieldsProps {
  value: string | number;
  placeholder: string;
  setInput?: (value: string | number) => void;
  inputType: "string" | "number";
  width: string;
  height: string;
  disabled: boolean;
}

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

  const handleIncorrectInput = (value: string) => {
    if (inputType === "number") {
      const num = Number(value);
      if (isNaN(num)) {
        setIsError(true);
        return;
      }
      setInput?.(num);
      return;
    }

    // For string, no conversion is needed
    if (
      (inputType === "string" && typeof value !== "string") ||
      value.length == 0
    ) {
      setIsError(true);
      return;
    }

    setInput?.(value);
    setIsError(false);
  };

  return (
    <TextField
      value={value}
      placeholder={placeholder}
      onChange={(e) => handleIncorrectInput(e.target.value)}
      error={isError}
      label={isError ? "Error" : ""}
      size="small"
      disabled={disabled}
      sx={{
        width,
        // outer height for consistency (optional)
        "& .MuiOutlinedInput-root": {
          backgroundColor: "white",
          borderRadius: "5px",
          minHeight: height, // ✅ controls the overall height
          alignItems: "flex-start",
          padding: 0,
        },
        "& input": {
          fontSize: "14px",
          padding: "12px 16px", // ✅ vertical + horizontal padding
          height: "auto", // ✅ allow it to grow with padding
        },
        "& label": {
          fontSize: "14px",
        },
        "& .MuiFormHelperText-root": {
          fontSize: "14px",
        },
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    />
  );
}
