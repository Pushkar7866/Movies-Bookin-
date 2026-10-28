import { useEffect, useState } from "react";
import api, { errMsg } from "../api.js";
import MovieCard from "../components/MovieCard.jsx";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({ genres: [], languages: [] });

  // Load all movies once to build filter options
  useEffect(() => {
    api.get("/movies").then(({ data }) =>
      setOptions({
        genres: [...new Set(data.flatMap((m) => m.genres))].sort(),
        languages: [...new Set(data.map((m) => m.language))].sort(),
      })
    ).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get("/movies", { params: { search, genre, language } })
        .then(({ data }) => { setMovies(data); setError(""); })
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search, genre, language]);

  return (
    <>
      <section className="hero">
        <h1>Pick a movie.<br />Pick your seat.</h1>
        <p>Book tickets for what's playing near you in under a minute.</p>
      </section>

      <div className="filters">
        <input placeholder="Search movies" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All genres</option>
          {options.genres.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="">All languages</option>
          {options.languages.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <p className="muted">Loading movies...</p>
      ) : movies.length === 0 ? (
        <p className="muted">No movies match your search. Try a different name or clear the filters.</p>
      ) : (
        <div className="grid">{movies.map((m) => <MovieCard key={m._id} movie={m} />)}</div>
      )}
    </>
  );
}
