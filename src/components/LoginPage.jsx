import { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // single error message
  const [obscure, setObscure] = useState(true);

  const handleLogin = () => {
    // Reset previous error
    setError("");

    if (email === "" || password === "") {
      setError("Please fill in both fields");
      return;
    }

    // Fake login check
    if (email !== "test@test.com" || password !== "password") {
      setError("Email or Password is incorrect");
    } else {
      alert("Logged in!");
      setError(""); // clear error on success
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(""); // clear error when user types
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(""); // clear error when user types
  };

  return (
    <div className="login-container" onKeyDown={handleKeyPress}>
      <img src="./Logo.png" className="logo" alt="Logo" />

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