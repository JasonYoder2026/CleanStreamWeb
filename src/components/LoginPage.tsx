import {useState} from "react";
import '../styles/Login.css'
import {SupabaseAuthService} from "../api/models/supabase_auth_service";
import supabase from "../api/supabase-client";
import type {AuthService} from "../api/services/auth_service";
import { AuthenticationResponse} from "../api/Enum/authentication_responses";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // single error message
  const [obscure, setObscure] = useState(true);
  const navigate = useNavigate();
  const authenticator:AuthService = new SupabaseAuthService(supabase);

  const handleLogin = async () => {
    // Reset previous error
    setError("");

    if (email === "" || password === "") {
      setError("Please fill in both fields");
      return;
    }

    // Login
    let loginResponse:AuthenticationResponse = await authenticator.login(email, password);
    if (loginResponse === AuthenticationResponse.failure) {
      setError("Email or Password is incorrect");
    } else {
      navigate("/home");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(""); // clear error when user types
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(""); // clear error when user types
  };

  return (
    <div className="login-container" onKeyDown={handleKeyPress}>
      <img src="src\assets\Logo.png" className="logo" alt="Logo" />

      {/* Centered Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Email Field */}
      <input
        className={`input ${error ? "error" : ""}`}
        placeholder="Email"
        value={email}
        onChange={handleEmailChange}
      />

      {/* Password Field */}
      <div className="password-container">
        <input
          className={`input password-input ${error ? "error" : ""}`}
          type={obscure ? "password" : "text"}
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
        />
        <button
          type="button"
          className="show-button"
          onClick={() => setObscure(!obscure)}
        >
          {obscure ? "Show" : "Hide"}
        </button>
      </div>

      <button className="login-button" onClick={handleLogin}>
        Log In
      </button>
    </div>
  );
}

export default Login;