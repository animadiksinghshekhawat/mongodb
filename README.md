# EventHub — MongoDB Backend Project

EventHub is a small REST API for managing college events, participant registrations, and feedback. It is designed as a project that can be run locally, tested, and extended rather than as a one-file demo.

## What it includes

- CRUD operations for events, registrations, and feedback
- Filtering, pagination, text search, aggregation summaries, and indexes
- Duplicate registration protection and event capacity checks
- Request validation through Mongoose schemas
- Basic API hardening with Helmet, CORS, JSON body limits, and rate limiting
- Automated smoke tests for the health and unknown-route endpoints
- Docker setup with a three-member MongoDB replica set
- Backup and restore scripts using MongoDB Database Tools

## Stack

- Node.js 20+
- Express
- MongoDB 7
- Mongoose
- Jest and Supertest
- Docker Compose (optional)

## Run locally

1. Install Node.js 20 or later and MongoDB Community Server.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` to your MongoDB connection string.
4. Install dependencies and start the API:

   ```bash
   npm install
   npm run seed
   npm run dev
   ```

5. Open `http://localhost:5000/api/health`.

The API listens on port `5000` by default. If you already have something on that port, set another `PORT` in `.env`.

## Run tests

```bash
npm test
```

The included automated tests check the health route and the 404 response. The remaining endpoints should also be manually tested using the examples in [`docs/API.md`](docs/API.md). Tests that require a live MongoDB instance are not included in the default smoke-test suite.

## Try the API

Create an event with `POST http://localhost:5000/api/events` and the JSON body below:

```json
{
  "title": "Intro to Network Security",
  "description": "A practical session about common network threats and prevention.",
  "category": "Workshop",
  "venue": "Computer Lab 1",
  "startsAt": "2027-02-20T10:00:00.000Z",
  "endsAt": "2027-02-20T12:00:00.000Z",
  "capacity": 35,
  "organizer": "Computer Science Department",
  "status": "published"
}
```

Copy the returned `_id` and use it for registrations and feedback. More endpoint examples and filters are in [`docs/API.md`](docs/API.md).

## Query and index choices

Indexes are declared with the schemas:

- `events`: `{ status: 1, startsAt: 1 }` supports the common published/upcoming event listing.
- `events`: `{ category: 1, startsAt: 1 }` supports category filtering and date sorting.
- `events`: a text index over title, description, and venue supports keyword search.
- `registrations`: `{ event: 1, email: 1 }` is unique, preventing the same email from registering twice for one event.
- `registrations`: `{ email: 1, createdAt: -1 }` helps retrieve a participant's recent registrations.
- `feedback`: `{ event: 1, createdAt: -1 }` supports event feedback pages.

Use `explain("executionStats")` in `mongosh` to compare query plans with and without an index. Indexes improve some reads but use disk and memory, and add work to writes, so real workload measurements matter.

Example:
```javascript
db.events.find({ status: "published" }).sort({ startsAt: 1 }).explain("executionStats")
```

## Replication with Docker Compose

The Compose file starts three MongoDB members and the API. Initialize the replica set after the containers are running:

```bash
docker compose up -d mongo1 mongo2 mongo3
docker compose exec mongo1 mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"mongo1:27017"},{_id:1,host:"mongo2:27017"},{_id:2,host:"mongo3:27017"}]})'
```

Wait for an elected primary:
```bash
docker compose exec mongo1 mongosh --eval 'rs.status().members.map(m => ({name:m.name,state:m.stateStr}))'
```

Then start the API:
```bash
docker compose up -d --build api
```

The replica set connection string is configured in `docker-compose.yml`. A replica set improves availability by maintaining copies of the data and electing a new primary if the current primary fails. **Replication is not a backup**: accidental deletes can replicate too.

> For a classroom/local demonstration only: the Compose example does not configure MongoDB authentication, TLS, or production secrets. Do not expose its database ports to the public internet. For real deployment, enable authentication, restrict network access, use managed secrets, and configure TLS.

## Backup and restore

Install MongoDB Database Tools (`mongodump` and `mongorestore`) and set `MONGODB_URI`.

```bash
chmod +x scripts/backup.sh scripts/restore.sh
MONGODB_URI='mongodb://127.0.0.1:27017/eventhub' ./scripts/backup.sh
MONGODB_URI='mongodb://127.0.0.1:27017/eventhub' ./scripts/restore.sh backups/eventhub_YYYYMMDD_HHMMSS.archive.gz
```

The restore script uses `--drop` for the selected database, so confirm the target URI and keep a copy before restoring. A practical backup plan should include scheduled backups, off-machine storage, retention rules, restricted access, and periodic restore drills. Do not commit real backups or credentials to GitHub.

## Deployment notes

The included Dockerfile packages the API. You can deploy the container to a host or container platform that supports Docker. Set `MONGODB_URI`, `PORT`, `NODE_ENV`, and `CLIENT_ORIGIN` as environment variables in the hosting dashboard. Use a managed MongoDB service or a secured replica set, and never commit `.env`.

This repository includes deployment configuration, but no cloud deployment has been performed automatically. After deployment, check `/api/health` and test the CRUD routes against the deployed URL.

## Suggested manual test checklist

- [ ] Health endpoint returns `200`
- [ ] Create an event and confirm it appears in `GET /api/events`
- [ ] Update the venue with `PATCH /api/events/:id`
- [ ] Search/filter events and test pagination
- [ ] Register a participant; try the same email twice for the same event
- [ ] Submit feedback and check the event summary
- [ ] Delete an event and confirm related records are removed
- [ ] Inspect an index-backed query using `explain("executionStats")`
- [ ] Confirm replica-set status and perform a backup/restore drill

## Repository structure

```text
eventhub-mongodb-backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── tests/
├── docs/API.md
├── scripts/
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── package.json
```

## Next improvements

For a production version, add authentication and role-based permissions, transactional registration capacity checks, audit logging, structured logging, schema-based request validation, and integration tests against a disposable MongoDB replica set.
