import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Protected from "./components/Protected.jsx";
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import SeatsPage from "./pages/SeatsPage.jsx";
import Bookings from "./pages/Bookings.jsx";
import Favorites from "./pages/Favorites.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/show/:id/seats" element={<Protected role="user"><SeatsPage /></Protected>} />
          <Route path="/bookings" element={<Protected role="user"><Bookings /></Protected>} />
          <Route path="/favorites" element={<Protected role="user"><Favorites /></Protected>} />
          <Route path="/admin" element={<Protected role="admin"><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
