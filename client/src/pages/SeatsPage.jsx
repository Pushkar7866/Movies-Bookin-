import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../api.js";
import { fmtTime } from "./MovieDetails.jsx";

export default function SeatsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [selected, setSelected] = useState([]);
  const [method, setMethod] = useState("card");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => api.get(`/shows/${id}`).then(({ data }) => setShow(data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, [id]);

  if (!show) return error ? <p className="alert error">{error}</p> : <p className="muted">Loading seats...</p>;

  const { rows, cols } = show.theatre;
  const toggle = (seat) =>
    setSelected((s) => (s.includes(seat) ? s.filter((x) => x !== seat) : s.length < 10 ? [...s, seat] : s));

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      await api.post("/bookings", { showId: id, seats: selected, paymentMethod: method });
      navigate("/bookings", { state: { success: true } });
    } catch (err) {
      setError(errMsg(err));
      setSelected([]);
      load(); // refresh seat map
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>{show.movie.movieName}</h1>
      <p className="muted">
        {show.theatre.theatreName}, {show.theatre.location} | {new Date(show.showDate).toLocaleDateString()} | {fmtTime(show.showTime)} | ₹{show.price} per seat
      </p>

      <div className="screen">Screen this way</div>
      <div className="seatmap">
        {Array.from({ length: rows }, (_, r) => {
          const letter = String.fromCharCode(65 + r);
          return (
            <div key={letter} className="seat-row">
              <span className="row-label">{letter}</span>
              {Array.from({ length: cols }, (_, c) => {
                const seat = letter + (c + 1);
                const booked = show.bookedSeats.includes(seat);
                const sel = selected.includes(seat);
                return (
                  <button
                    key={seat}
                    type="button"
                    disabled={booked}
                    title={seat}
                    aria-label={`Seat ${seat}${booked ? " (booked)" : ""}`}
                    className={`seat ${booked ? "booked" : sel ? "selected" : ""}`}
                    onClick={() => toggle(seat)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="legend">
        <span><i className="seat" /> Available</span>
        <span><i className="seat selected" /> Selected</span>
        <span><i className="seat booked" /> Booked</span>
      </div>

      <div className="card checkout">
        {error && <p className="alert error">{error}</p>}
        {selected.length === 0 ? (
          <p className="muted">Tap seats to select them (up to 10).</p>
        ) : (
          <>
            <p><strong>{selected.join(", ")}</strong></p>
            <h3>Total: ₹{selected.length * show.price}</h3>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="card">Credit / Debit card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net banking</option>
            </select>
            <button className="btn" disabled={busy} onClick={pay}>
              {busy ? "Processing payment..." : `Pay ₹${selected.length * show.price}`}
            </button>
            <p className="muted small-text">Demo payment: no real money is charged.</p>
          </>
        )}
      </div>
    </>
  );
}
