import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { fmtTime } from "./MovieDetails.jsx";

export default function Bookings() {
  const loc = useLocation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    api.get("/bookings/my").then(({ data }) => setList(data)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm("Cancel this booking? Your payment will be refunded.")) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <>
      <h1>My tickets</h1>
      {loc.state?.success && <p className="alert ok">Booking confirmed. Enjoy the movie!</p>}
      {error && <p className="alert error">{error}</p>}
      {loading && <p className="muted">Loading...</p>}
      {!loading && list.length === 0 && <p className="muted">You haven't booked anything yet. Pick a movie from the home page.</p>}
      {list.map((b) => (
        <div key={b._id} className={`card ticket ${b.status}`}>
          <div>
            <h3>{b.show?.movie?.movieName || "Movie removed"}</h3>
            <p className="muted">
              {b.show?.theatre?.theatreName}, {b.show?.theatre?.location}
              {b.show && <> | {new Date(b.show.showDate).toLocaleDateString()} | {fmtTime(b.show.showTime)}</>}
            </p>
            <p>Seats: <strong>{b.seats.join(", ")}</strong></p>
            <p className="muted small-text">Booking ID {b._id.slice(-8).toUpperCase()} | {b.payment.transactionId}</p>
          </div>
          <div className="ticket-side">
            <h3>₹{b.amount}</h3>
            <span className={`badge ${b.status}`}>{b.status === "confirmed" ? "Confirmed" : "Cancelled, refunded"}</span>
            {b.status === "confirmed" && <button className="btn ghost small" onClick={() => cancel(b._id)}>Cancel</button>}
          </div>
        </div>
      ))}
    </>
  );
}
