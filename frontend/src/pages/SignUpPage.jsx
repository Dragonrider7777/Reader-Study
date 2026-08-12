import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

import "../styles/auth.css";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [rank, setRank] = useState("resident");
  const [error, setError] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordCheck) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signup({ name, username, password, rank });
      navigate("/readerstudy");
    } catch {
      setError("Could not create account. Username may already be taken.");
    }
  };

  return (
    <main className="signup-page">
      <h1 className="header">Sign Up</h1>
      <p>Please fill out all the fields below</p>
      <form className="signup-container" onSubmit={handleSubmit}>
        <div className="name-container">
          <p>Enter your first and last name:</p>
          <input
            className="name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="username-container">
          <p>Choose a username:</p>
          <input
            className="username-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="rank-container">
          <p>Rank:</p>
          <select value={rank} onChange={(e) => setRank(e.target.value)}>
            <option value="resident">Resident</option>
            <option value="attending">Attending</option>
          </select>
        </div>
        <div className="password-container">
          <p>Create a password:</p>
          <input
            className="password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p>Enter your password again:</p>
          <input
            className="password-check-input"
            type="password"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
            required
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </main>
  );
}
