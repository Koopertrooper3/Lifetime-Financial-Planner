import { useState } from "react";
import axiosCookie from "../axiosCookie";

type PermissionLevel = "read-only" | "read-write";

export default function ShareScenarioButton({ scenarioId }: { scenarioId: string }) {
    const [email, setEmail] = useState("");
    const [permission, setPermission] = useState<PermissionLevel>("read-only");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (!email) {
            setMessage("Please enter an email address");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setMessage("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const selfUserInfoResponse = await axiosCookie.get("/user");
            const selfId = selfUserInfoResponse.data.user._id;

            const sharedUserIdResponse = await axiosCookie.post("/user/getIdFromEmail", {email});
            if(!sharedUserIdResponse.data.success){
                setMessage(sharedUserIdResponse.data.msg)
            }
            const sharedUserId = sharedUserIdResponse.data.userId;

            const response = await axiosCookie.post("/user/shareScenario", {
                scenarioID: scenarioId, 
                owner: selfId,
                shareWith: sharedUserId,
                permission // Send permission level to backend
            });
            
            if (response.data.success) {
                setMessage(`Scenario shared successfully with ${permission} access!`);
                setEmail("");
            } else {
                setMessage(response.data.msg || "Sharing failed");
            }
        } catch (error) {
            console.error("Sharing error:", error);
            setMessage("Error sharing scenario");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter recipient's email"
                    style={{ padding: "6px", width: "200px" }}
                    disabled={isLoading}
                />
                
                <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value as PermissionLevel)}
                    style={{ 
                        padding: "6px",
                        height: "30px",
                        cursor: "pointer"
                    }}
                    disabled={isLoading}
                >
                    <option value="read-only">read-only</option>
                    <option value="read-write">read-write</option>
                </select>
                
                <button
                    className="styled-button"
                    style={{
                        height: "30px",
                        width: "120px",
                        cursor: "pointer",
                        opacity: isLoading ? 0.7 : 1
                    }}
                    onClick={handleClick}
                    disabled={isLoading}
                >
                    {isLoading ? "Sharing..." : "Share"}
                </button>
            </div>
            {message && (
                <div style={{
                    color: message.includes("success") ? "green" : "red",
                    fontSize: "14px"
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}