import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">i<span>Movies</span></Link>
        <nav>
          <NavLink to="/">Movies</NavLink>
          {user?.role === "user" && (
            <>
              <NavLink to="/bookings">My tickets</NavLink>
              <NavLink to="/favorites">Watchlist</NavLink>
            </>
          )}
          {user?.role === "admin" && <NavLink to="/admin">Dashboard</NavLink>}
          {user ? (
            <button
              className="btn ghost small"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Log out ({user.username})
            </button>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn small">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
