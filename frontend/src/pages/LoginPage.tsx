import GoogleIcon from "@mui/icons-material/Google";
import "../stylesheets/LoginPage.css";

const LoginPage = () => {
  const handleGoogleLogin = () => {
    const fullBackendUrl = "http://" + import.meta.env.VITE_BACKEND_IP + ":" + import.meta.env.VITE_BACKEND_PORT;

    console.log(fullBackendUrl);

    window.location.href = fullBackendUrl + "/auth/google";
  }

  return (
    <div className="page">
      <div className="container">
        <div className="left-panel"></div>
        <div className="right-panel">
          <div className="login-container">
            <h1>Welcome</h1>
            <p>
              <span className="highlight bold">New</span> or{" "}
              <span className="bold">Existing User?</span>
            </p>
            <p className="grayed-text">
              Click below to sign in with an existing Google account
            </p>

            <button className="google-button" onClick={handleGoogleLogin}>
              <GoogleIcon className="google-icon"></GoogleIcon>
              <p>Sign In with Google</p>
            </button>

            <p className="legal">
              Protected by reCAPTCHA and subject to the Google Privacy Policy
              and Terms of Service.
            </p>
          </div>
        </div>
      </div>

      {/* <footer className="footer">
        <div className="footer-content">
          <div className="left-footer">
            <span className="contact-us-text">Contact Us</span>
            <span className="placeholder-text">placeholder</span>
          </div>
          <div className="right-footer">
            <a className="privacy-policy-link" href="#">
              Privacy Policy
            </a>
            <a className="terms-of-service-link" href="#">
              Terms of Service
            </a>
          </div>
        </div>
        <div className="footer-bar"></div>
      </footer> */}
    </div>
  );
};

export default LoginPage;
