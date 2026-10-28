import { Link } from "react-router-dom";

export const posterOf = (m) =>
  m.poster || `https://placehold.co/400x600/1e2340/ff4d6d?text=${encodeURIComponent(m.movieName)}`;

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie._id}`} className="movie-card">
      <img src={posterOf(movie)} alt={movie.movieName} loading="lazy" />
      <div className="movie-info">
        <h3>{movie.movieName}</h3>
        <p>{movie.genres.join(", ")}</p>
        <span className="rating">{movie.ratingCount ? `★ ${movie.rating}` : "No ratings yet"}</span>
      </div>
    </Link>
  );
}
