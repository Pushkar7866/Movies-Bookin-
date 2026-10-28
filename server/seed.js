// Run once:  npm run seed   -> adds sample movies, theatres, shows
require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("./models/movieModel");
const Theatre = require("./models/theatreModel");
const Show = require("./models/showModel");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Movie.deleteMany(), Theatre.deleteMany(), Show.deleteMany()]);

  const movies = await Movie.insertMany([
    { movieName: "Midnight Express Run", description: "A courier races across the city in one night to deliver a package that could change everything.", genres: ["Action", "Thriller"], language: "English", runtime: 128, certification: "UA", releaseDate: "2026-09-12", cast: ["Aarav Mehta", "Lina Park"] },
    { movieName: "Chai Aur Chaos", description: "Three college friends open a tea stall and accidentally start a neighbourhood revolution.", genres: ["Comedy", "Drama"], language: "Hindi", runtime: 142, certification: "U", releaseDate: "2026-10-02", cast: ["Rohan Kulkarni", "Meera Iyer"] },
    { movieName: "Stars Over Pune", description: "An aspiring astronomer discovers a signal from deep space from her rooftop.", genres: ["Sci-Fi", "Drama"], language: "Marathi", runtime: 115, certification: "U", releaseDate: "2026-10-15", cast: ["Sneha Joshi"] },
    { movieName: "The Last Inning", description: "A retired cricketer returns to coach a struggling village team before the final match.", genres: ["Sports", "Drama"], language: "Hindi", runtime: 135, certification: "U", releaseDate: "2026-10-20", cast: ["Vikram Rao", "Anaya Shah"] },
  ]);
  const theatres = await Theatre.insertMany([
    { theatreName: "PVR Cinemas", location: "Pune", rows: 8, cols: 12 },
    { theatreName: "Cinepolis", location: "Mumbai", rows: 10, cols: 14 },
  ]);

  const shows = [];
  const times = ["10:30", "14:00", "18:30", "21:45"];
  for (let d = 0; d < 5; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    date.setHours(0, 0, 0, 0);
    movies.forEach((m, i) =>
      shows.push({ movie: m._id, theatre: theatres[i % 2]._id, showDate: date, showTime: times[(i + d) % 4], price: 180 + i * 40 })
    );
  }
  await Show.insertMany(shows);
  console.log(`Seeded ${movies.length} movies, ${theatres.length} theatres, ${shows.length} shows`);
  process.exit(0);
})();
