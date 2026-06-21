import React, { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthForm({ onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [devResetLink, setDevResetLink] = useState("");

  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        const data = await api.forgotPassword(email);
        setInfo(data.message);
        if (data.devResetLink) setDevResetLink(data.devResetLink);
      } else {
        const data =
          mode === "login"
            ? await api.login(email, password)
            : await api.signup(name, email, password);
        login(data);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setInfo("");
    setDevResetLink("");
  };

  const titles = {
    login: "Welcome back",
    signup: "Create your account",
    forgot: "Reset your password",
  };
  const subtitles = {
    login: "Log in to save favorite cities and see your search history.",
    signup: "Sign up to save favorite cities and your search history.",
    forgot: "Enter your email and we'll generate a reset link.",
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">{titles[mode]}</h2>
        <p className="modal__subtitle">{subtitles[mode]}</p>

        <form onSubmit={submit} className="modal__form">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== "forgot" && (
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-field__toggle"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          )}

          {mode === "login" && (
            <button
              type="button"
              className="modal__forgot-link"
              onClick={() => switchMode("forgot")}
            >
              Forgot password?
            </button>
          )}

          {error && <p className="form-error">{error}</p>}
          {info && <p className="form-info">{info}</p>}
          {devResetLink && (
            <p className="form-info form-info--dev">
              Dev mode (no email service yet) — reset link:
              <br />
              <a href={devResetLink}>{devResetLink}</a>
            </p>
          )}

          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "login"
              ? "Log in"
              : mode === "signup"
              ? "Sign up"
              : "Send reset link"}
          </button>
        </form>

        {mode === "login" && (
          <button className="modal__switch" onClick={() => switchMode("signup")}>
            Don't have an account? Sign up
          </button>
        )}
        {mode === "signup" && (
          <button className="modal__switch" onClick={() => switchMode("login")}>
            Already have an account? Log in
          </button>
        )}
        {mode === "forgot" && (
          <button className="modal__switch" onClick={() => switchMode("login")}>
            Back to log in
          </button>
        )}
      </div>
    </div>
  );
}
