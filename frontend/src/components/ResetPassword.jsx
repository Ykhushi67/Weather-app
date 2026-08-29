import React, { useState } from "react";
import { api } from "../api.js";

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const data = await api.resetPassword(token, newPassword);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app sky--night" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="modal" style={{ position: "static" }}>
        <h2 className="modal__title">Set a new password</h2>
        <p className="modal__subtitle">Choose a new password for your account.</p>

        {!token && <p className="form-error">No reset token found in the URL.</p>}

        <form onSubmit={submit} className="modal__form">
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-info">{message}</p>}

          <button className="btn btn--primary" type="submit" disabled={loading || !token}>
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>

        <a className="modal__switch" href="/">
          Back to app
        </a>
      </div>
    </div>
  );
}
