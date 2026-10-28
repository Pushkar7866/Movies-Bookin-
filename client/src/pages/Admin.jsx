import { useEffect, useState } from "react";
import api, { errMsg } from "../api.js";
import { fmtTime } from "./MovieDetails.jsx";

const TABS = ["Overview", "Movies", "Theatres", "Shows", "Bookings"];

function useMsg() {
  const [msg, setMsg] = useState(null);
  const ok = (text) => setMsg({ type: "ok", text });
  const fail = (e) => setMsg({ type: "error", text: errMsg(e) });
  const view = msg && <p className={`alert ${msg.type}`}>{msg.text}</p>;
  return { ok, fail, view };
}

function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/admin/stats").then(({ data }) => setS(data)); }, []);
  if (!s) return <p className="muted">Loading...</p>;
  const items = [
    ["Movies", s.movies], ["Theatres", s.theatres], ["Shows", s.shows],
    ["Users", s.users], ["Active bookings", s.bookings], ["Revenue", `₹${s.revenue}`],
  ];
  return (
    <div className="stats">
      {items.map(([k, v]) => (
        <div key={k} className="card stat"><h2>{v}</h2><p className="muted">{k}</p></div>
      ))}
    </div>
  );
}

const emptyMovie = { movieName: "", description: "", genres: "", language: "English", runtime: 120, certification: "UA", releaseDate: "", poster: "", cast: "" };

function Movies() {
  const [form, setForm] = useState(emptyMovie);
  const [movies, setMovies] = useState([]);
  const m = useMsg();
  const load = () => api.get("/movies").then(({ data }) => setMovies(data));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post("/movies", { ...form, runtime: Number(form.runtime) });
      m.ok("Movie added");
      setForm(emptyMovie);
      load();
    } catch (err) { m.fail(err); }
  };
  const del = async (id) => {
    if (!confirm("Delete this movie?")) return;
    try { await api.delete(`/movies/${id}`); load(); } catch (err) { m.fail(err); }
  };

  return (
    <>
      <form className="card form" onSubmit={add}>
        <h3>Add a movie</h3>
        {m.view}
        <input placeholder="Movie name" value={form.movieName} onChange={set("movieName")} required />
        <textarea placeholder="Description (min 10 characters)" value={form.description} onChange={set("description")} required />
        <input placeholder="Genres, separated by commas" value={form.genres} onChange={set("genres")} required />
        <div className="row">
          <input placeholder="Language" value={form.language} onChange={set("language")} />
          <input type="number" placeholder="Runtime (min)" value={form.runtime} onChange={set("runtime")} />
          <input placeholder="Certificate (U, UA, A)" value={form.certification} onChange={set("certification")} />
        </div>
        <label className="muted">Release date</label>
        <input type="date" value={form.releaseDate} onChange={set("releaseDate")} required />
        <input placeholder="Poster image URL (optional)" value={form.poster} onChange={set("poster")} />
        <input placeholder="Cast, separated by commas (optional)" value={form.cast} onChange={set("cast")} />
        <button className="btn">Add movie</button>
      </form>
      <h3>All movies ({movies.length})</h3>
      {movies.map((mv) => (
        <div key={mv._id} className="card row between">
          <span>{mv.movieName} <span className="muted">| {mv.language}</span></span>
          <button className="btn ghost small" onClick={() => del(mv._id)}>Delete</button>
        </div>
      ))}
    </>
  );
}

function Theatres() {
  const [form, setForm] = useState({ theatreName: "", location: "", rows: 8, cols: 12 });
  const [list, setList] = useState([]);
  const m = useMsg();
  const load = () => api.get("/theatres").then(({ data }) => setList(data));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post("/theatres", { ...form, rows: Number(form.rows), cols: Number(form.cols) });
      m.ok("Theatre added");
      setForm({ theatreName: "", location: "", rows: 8, cols: 12 });
      load();
    } catch (err) { m.fail(err); }
  };
  const del = async (id) => {
    if (!confirm("Delete this theatre?")) return;
    try { await api.delete(`/theatres/${id}`); load(); } catch (err) { m.fail(err); }
  };

  return (
    <>
      <form className="card form" onSubmit={add}>
        <h3>Add a theatre</h3>
        {m.view}
        <input placeholder="Theatre name" value={form.theatreName} onChange={set("theatreName")} required />
        <input placeholder="Location / city" value={form.location} onChange={set("location")} required />
        <div className="row">
          <input type="number" min="1" max="26" placeholder="Rows" value={form.rows} onChange={set("rows")} required />
          <input type="number" min="1" max="30" placeholder="Seats per row" value={form.cols} onChange={set("cols")} required />
        </div>
        <p className="muted small-text">Seats: {form.rows * form.cols} (rows A to {String.fromCharCode(64 + Math.min(26, Math.max(1, Number(form.rows) || 1)))})</p>
        <button className="btn">Add theatre</button>
      </form>
      <h3>All theatres ({list.length})</h3>
      {list.map((t) => (
        <div key={t._id} className="card row between">
          <span>{t.theatreName}, {t.location} <span className="muted">| {t.rows * t.cols} seats</span></span>
          <button className="btn ghost small" onClick={() => del(t._id)}>Delete</button>
        </div>
      ))}
    </>
  );
}

function Shows() {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [form, setForm] = useState({ movie: "", theatre: "", showDate: "", showTime: "", price: 200 });
  const m = useMsg();
  const load = () => api.get("/shows").then(({ data }) => setShows(data));
  useEffect(() => {
    api.get("/movies").then(({ data }) => setMovies(data));
    api.get("/theatres").then(({ data }) => setTheatres(data));
    load();
  }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post("/shows", { ...form, price: Number(form.price) });
      m.ok("Show scheduled");
      load();
    } catch (err) { m.fail(err); }
  };
  const del = async (id) => {
    if (!confirm("Delete this show?")) return;
    try { await api.delete(`/shows/${id}`); load(); } catch (err) { m.fail(err); }
  };

  return (
    <>
      <form className="card form" onSubmit={add}>
        <h3>Schedule a show</h3>
        {m.view}
        {(movies.length === 0 || theatres.length === 0) && <p className="alert error">Add at least one movie and one theatre first.</p>}
        <select value={form.movie} onChange={set("movie")} required>
          <option value="">Select movie</option>
          {movies.map((x) => <option key={x._id} value={x._id}>{x.movieName}</option>)}
        </select>
        <select value={form.theatre} onChange={set("theatre")} required>
          <option value="">Select theatre</option>
          {theatres.map((x) => <option key={x._id} value={x._id}>{x.theatreName}, {x.location}</option>)}
        </select>
        <div className="row">
          <input type="date" value={form.showDate} onChange={set("showDate")} required />
          <input type="time" value={form.showTime} onChange={set("showTime")} required />
          <input type="number" min="0" placeholder="Price per seat" value={form.price} onChange={set("price")} required />
        </div>
        <button className="btn">Schedule show</button>
      </form>
      <h3>Upcoming shows ({shows.length})</h3>
      {shows.map((s) => (
        <div key={s._id} className="card row between">
          <span>
            {s.movie?.movieName} <span className="muted">| {s.theatre?.theatreName} | {new Date(s.showDate).toLocaleDateString()} {fmtTime(s.showTime)} | {s.bookedSeats.length} booked</span>
          </span>
          <button className="btn ghost small" onClick={() => del(s._id)}>Delete</button>
        </div>
      ))}
    </>
  );
}

function Bookings() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get("/bookings/all").then(({ data }) => setList(data)); }, []);
  if (list.length === 0) return <p className="muted">No bookings yet.</p>;
  return list.map((b) => (
    <div key={b._id} className="card row between">
      <span>
        {b.show?.movie?.movieName} <span className="muted">| {b.user?.username} | seats {b.seats.join(", ")} | {b.payment.transactionId}</span>
      </span>
      <span>₹{b.amount} <span className={`badge ${b.status}`}>{b.status}</span></span>
    </div>
  ));
}

export default function Admin() {
  const [tab, setTab] = useState("Overview");
  const View = { Overview, Movies, Theatres, Shows, Bookings }[tab];
  return (
    <>
      <h1>Admin dashboard</h1>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={t === tab ? "active" : ""} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <View />
    </>
  );
}
