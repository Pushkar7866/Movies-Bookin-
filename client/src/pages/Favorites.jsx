import { useEffect, useState } from "react";
import api from "../api.js";
import MovieCard from "../components/MovieCard.jsx";

export default function Favorites() {
  const [movies, setMovies] = useState(null);
  useEffect(() => { api.get("/favorites").then(({ data }) => setMovies(data)); }, []);

  return (
    <>
      <h1>Your watchlist</h1>
      {movies === null ? <p className="muted">Loading...</p> : movies.length === 0 ? (
        <p className="muted">Nothing saved yet. Open a movie and tap "Add to watchlist".</p>
      ) : (
        <div className="grid">{movies.map((m) => <MovieCard key={m._id} movie={m} />)}</div>
      )}
    </>
  );
}
