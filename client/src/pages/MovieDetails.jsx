import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { posterOf } from "../components/MovieCard.jsx";

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
export const fmtTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [fav, setFav] = useState(false);
  const [rev, setRev] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");

  const loadMovie = () => api.get(`/movies/${id}`).then(({ data }) => setMovie(data));
  const loadReviews = () => api.get(`/reviews/movie/${id}`).then(({ data }) => setReviews(data));

  useEffect(() => {
    loadMovie().catch((e) => setError(errMsg(e)));
    loadReviews();
    api.get("/shows", { params: { movieId: id } }).then(({ data }) => setShows(data));
    if (user?.role === "user") api.get(`/favorites/${id}/status`).then(({ data }) => setFav(data.favorite));
  }, [id]);

  const toggleFav = async () => {
    if (!user) return navigate("/login");
    const { data } = await api.post(`/favorites/${id}`);
    setFav(data.favorite);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/movie/${id}`, rev);
      setRev({ rating: 5, comment: "" });
      await Promise.all([loadReviews(), loadMovie()]);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  if (error && !movie) return <p className="alert error">{error}</p>;
  if (!movie) return <p className="muted">Loading...</p>;

  // group shows by date
  const byDate = shows.reduce((acc, s) => {
    const k = fmtDate(s.showDate);
    (acc[k] = acc[k] || []).push(s);
    return acc;
  }, {});

  return (
    <>
      <div className="details">
        <img src={posterOf(movie)} alt={movie.movieName} />
        <div>
          <h1>{movie.movieName}</h1>
          <p className="muted">
            {movie.certification} | {movie.runtime} min | {movie.language} | {movie.genres.join(", ")}
          </p>
          <p className="rating big">{movie.ratingCount ? `★ ${movie.rating} (${movie.ratingCount} reviews)` : "No ratings yet"}</p>
          <p>{movie.description}</p>
          {movie.cast.length > 0 && <p className="muted">Cast: {movie.cast.join(", ")}</p>}
          <p className="muted">Releases {new Date(movie.releaseDate).toLocaleDateString()}</p>
          {user?.role !== "admin" && (
            <button className={`btn ${fav ? "" : "ghost"}`} onClick={toggleFav}>
              {fav ? "In your watchlist" : "Add to watchlist"}
            </button>
          )}
        </div>
      </div>

      <h2>Showtimes</h2>
      {shows.length === 0 && <p className="muted">No upcoming shows for this movie yet. Check back soon.</p>}
      {Object.entries(byDate).map(([date, list]) => (
        <div key={date} className="card">
          <h3>{date}</h3>
          <div className="chips">
            {list.map((s) => (
              <Link key={s._id} to={`/show/${s._id}/seats`} className="chip">
                <strong>{fmtTime(s.showTime)}</strong>
                <span>{s.theatre?.theatreName}, {s.theatre?.location}</span>
                <span>₹{s.price}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <h2>Reviews</h2>
      {user?.role === "user" && (
        <form className="card form" onSubmit={submitReview}>
          <select value={rev.rating} onChange={(e) => setRev({ ...rev, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}
          </select>
          <textarea placeholder="What did you think? (optional)" value={rev.comment} onChange={(e) => setRev({ ...rev, comment: e.target.value })} maxLength={500} />
          <button className="btn small">Post review</button>
        </form>
      )}
      {error && <p className="alert error">{error}</p>}
      {reviews.length === 0 && <p className="muted">No reviews yet. Be the first to review.</p>}
      {reviews.map((r) => (
        <div key={r._id} className="card">
          <strong>{r.user?.username || "User"}</strong> <span className="rating">{"★".repeat(r.rating)}</span>
          {r.comment && <p>{r.comment}</p>}
        </div>
      ))}
    </>
  );
}
