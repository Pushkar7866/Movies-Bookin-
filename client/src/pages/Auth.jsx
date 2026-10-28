import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";

export default function Auth({ mode }) {
  const isLogin = mode === "login";
  const { login } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const [asAdmin, setAsAdmin] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", adminKey: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const base = asAdmin ? "/auth/admin" : "/auth";
      const { data } = await api.post(`${base}/${isLogin ? "login" : "register"}`, form);
      login(data);
      navigate(data.user.role === "admin" ? "/admin" : loc.state?.from || "/");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card form narrow" onSubmit={submit}>
      <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
      {error && <p className="alert error">{error}</p>}

      {!isLogin && <input placeholder="Username (3-20 characters)" value={form.username} onChange={set("username")} required minLength={3} maxLength={20} />}
      <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
      <input type="password" placeholder="Password (min 8 characters)" value={form.password} onChange={set("password")} required minLength={8} />

      <label className="check">
        <input type="checkbox" checked={asAdmin} onChange={(e) => setAsAdmin(e.target.checked)} />
        {isLogin ? "I'm an admin" : "Register as admin"}
      </label>
      {!isLogin && asAdmin && <input placeholder="Admin key" value={form.adminKey} onChange={set("adminKey")} required />}

      <button className="btn" disabled={busy}>{busy ? "Please wait..." : isLogin ? "Log in" : "Sign up"}</button>
      <p className="muted center">
        {isLogin ? <>New here? <Link to="/register">Create an account</Link></> : <>Already have an account? <Link to="/login">Log in</Link></>}
      </p>
    </form>
  );
}
