# API reference

Base URL: `http://localhost:5000/api`

All request bodies use JSON. Dates should be ISO 8601 strings, for example `2027-02-20T10:00:00.000Z`.

## Health
- `GET /health` — API status.

## Events
- `GET /events` — list events. Optional filters: `category`, `status`, `from`, `to`, `search`, `page`, `limit`.
- `POST /events` — create an event.
- `GET /events/:id` — event details and current registration count.
- `PATCH /events/:id` — update an event.
- `DELETE /events/:id` — delete an event and its registrations/feedback.
- `GET /events/:id/summary` — registration count and feedback rating summary.

Example event body:
```json
{
  "title": "Intro to Network Security",
  "description": "A beginner-friendly session on safe networking.",
  "category": "Workshop",
  "venue": "Lab 1",
  "startsAt": "2027-02-20T10:00:00.000Z",
  "endsAt": "2027-02-20T12:00:00.000Z",
  "capacity": 35,
  "organizer": "Computer Science Department",
  "status": "published"
}
```

## Registrations
- `POST /registrations` — register a participant.
- `GET /registrations` — list registrations. Optional filters: `event`, `email`, `status`.
- `PATCH /registrations/:id` — update status/name/phone.
- `DELETE /registrations/:id` — remove a registration.

Example:
```json
{
  "event": "REPLACE_WITH_EVENT_OBJECT_ID",
  "participantName": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "9876543210"
}
```

## Feedback
- `POST /feedback` — submit a rating from 1 to 5.
- `GET /feedback` — list feedback. Optional filters: `event`, `minRating`.
- `DELETE /feedback/:id` — delete feedback.

Example:
```json
{
  "event": "REPLACE_WITH_EVENT_OBJECT_ID",
  "participantName": "Aarav Sharma",
  "rating": 5,
  "comment": "The hands-on examples made the topic easy to follow."
}
```

## Typical status codes
- `200` request succeeded
- `201` resource created
- `400` invalid input or ID
- `404` resource or route not found
- `409` duplicate registration or event capacity reached
- `500` unexpected server error
