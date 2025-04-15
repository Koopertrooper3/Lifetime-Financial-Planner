import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { parse } from "yaml";
import "../stylesheets/UserProfilePage.css";

const UserProfilePage = () => {
  const [userData, setUserData] = useState<any | "guest" | null>(null);
  const [state, setState] = useState<string>("");
  const [yamlFile, setYamlFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/user-profile", {
        withCredentials: true,
      })
      .then((res) => {
        if (!res.data || Object.keys(res.data).length === 0) {
          setUserData("guest");
        } else {
          setUserData(res.data);
        }
      })
      .catch(() => setUserData("guest")); // NOTE: current fallback to guest, correct later
  }, []);

  const handleYAMLUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parse(content); // Validate here
        setYamlFile(file);
        console.log("Parsed YAML:", parsed);
      } catch (err) {
        alert("Invalid YAML file.");
      }
    };
    reader.readAsText(file);
  };

  const uploadYamlToServer = async () => {
    if (!yamlFile) return;
  
    const formData = new FormData();
    formData.append("yaml", yamlFile);
  
    try {
      const res = await axios.post("http://localhost:8000/api/upload-tax", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
  
      console.log("Upload success:", res.data);
      alert("YAML uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed.");
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (userData === null) return <div>Loading...</div>;

  const displayName = userData === "guest" ? "Guest" : userData.name;

  return (
    <div className="profile-container">
    <h2 className="header">User Profile</h2>

    <div className="expected-container">
        <p className="black-word"><strong>Name:</strong> {displayName}</p>

        <div className="profile-section">
        <label htmlFor="state-input" className="purple-title">State of Residence</label>
        <input
            type="text"
            id="state-input"
            placeholder="Enter your state (e.g., New York)"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="textbox"
        />
        </div>

        <div className="yaml-upload-section">
        <div className="title-with-info" style={{ marginBottom: "10px" }}>
            <h3 className="purple-title">Upload YAML for State Tax Info</h3>
            <span className="grayed-text">Optional</span>
        </div>
        <button onClick={openFileDialog} className="save-investment-type-button">
            Upload YAML
        </button>
        <input
            type="file"
            ref={fileInputRef}
            accept=".yaml,.yml"
            onChange={handleYAMLUpload}
            style={{ display: "none" }}
        />
        {yamlFile && (
            <>
            <p className="black-word">Uploaded: <strong>{yamlFile.name}</strong></p>
            <button
                onClick={uploadYamlToServer}
                className="save-investment-type-button confirm-upload-button"
            >
                Confirm & Upload to Server
            </button>
            </>
        )}
        </div>
    </div>
    </div>

  );
};

export default UserProfilePage;
