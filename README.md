# iMovies - Movie ticket booking made simple

A MERN stack movie ticket booking app. Users browse movies, pick a show and seats, pay, and manage tickets. Admins manage movies, theatres and shows.

## Tech stack
- **Frontend:** React (Vite), React Router, Axios, custom CSS
- **Backend:** Node.js, Express, JWT auth, bcrypt, MVC structure (models / controllers-in-routes / routes)
- **Database:** MongoDB + Mongoose

## Features
- User and admin registration / login (JWT, role-based route protection)
- Movie listing with search, genre and language filters
- Showtimes grouped by date and theatre
- Live seat map with atomic seat locking (no double booking)
- Booking, cancellation with refund status, booking history
- Simulated payment step (card / UPI / net banking) with transaction ID
- Watchlist (favorites) and movie reviews with average ratings
- Admin dashboard: stats and revenue, manage movies, theatres, shows, view all bookings

## Folder structure
```
imovies/
  server/   config, middleware, models, routes, utils, index.js, seed.js
  client/   src/pages, src/components, AuthContext.jsx, api.js
```

## Run locally
Needs Node.js 18+ and MongoDB running locally (or a MongoDB Atlas URL).

**1. Backend**
```
cd server
npm install
# .env is already included; edit MONGO_URI if needed
npm run seed      # optional: sample movies, theatres, shows
npm run dev       # http://localhost:8000
```

**2. Frontend** (new terminal)
```
cd client
npm install
npm run dev       # http://localhost:5173
```

## Environment variables (`server/.env`)
| Name | Purpose |
|------|---------|
| PORT | API port (default 8000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret used to sign tokens |
| ADMIN_KEY | Key required to register an admin account |

## Create an admin
Open Sign up, tick **Register as admin**, enter the `ADMIN_KEY` from `.env`.

## API overview
| Route | Access |
|-------|--------|
| POST /api/auth/register, /login | public |
| POST /api/auth/admin/register, /admin/login | admin key / public |
| GET /api/movies, /api/movies/:id | public |
| POST/PUT/DELETE /api/movies | admin |
| GET /api/shows, /api/shows/:id | public |
| POST/DELETE /api/shows, /api/theatres | admin |
| POST /api/bookings, GET /api/bookings/my, PUT /api/bookings/:id/cancel | user |
| GET /api/bookings/all, GET /api/admin/stats | admin |
| GET/POST /api/favorites | user |
| GET/POST /api/reviews/movie/:id | public / user |

## Notes
Payment is a demo: no real money moves. To go live, replace the payment block in `server/routes/bookingRoutes.js` with Razorpay or Stripe.
