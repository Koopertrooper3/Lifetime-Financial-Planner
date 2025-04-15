import "../stylesheets/AddPlan.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useRef, useState } from "react";
import { parse } from 'yaml';

// NOTE: SCRAPPED
// May move upload YAML to here later

// const UploadTaxPlan = () => {
//   const [showUpload, setShowUpload] = useState(false);
//   const [yamlFile, setYamlFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleClick = () => {
//     setShowUpload(true);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setYamlFile(e.target.files[0]);
      
//     }
//   };

//   const handleUploadClick = () => {
//     fileInputRef.current?.click();
//   };

// };

// export default UploadTaxPlan;

