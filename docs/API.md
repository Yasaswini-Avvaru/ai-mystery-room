# API

All routes are rooted at `/api` and return JSON in `{ success, data }` or `{ success: false, error: { code, message } }` form.

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | API health |
| POST | `/cases` | Generate and save a complete case |
| GET | `/cases/:caseId` | Public case, suspects and evidence summaries |
| GET | `/cases/:caseId/status` | Generation status |
| GET | `/cases/:caseId/evidence` | Public evidence list (optional `type`, `page`, `limit`) |
| GET | `/cases/:caseId/evidence/:evidenceId` | Evidence detail |
| POST | `/cases/:caseId/accusations` | Final accusation (`suspectId`, optional `explanation`) |
| GET | `/cases/:caseId/solution` | Solution after resolution |
| POST | `/cases/:caseId/reveal-solution` | Explicitly reveal and resolve |

`POST /cases` accepts `scenario` (30–2,000 chars), optional `title` (3–80), `genre`, `difficulty`, `suspectCount` (3–6), and `evidenceRichness`. Generation is synchronous; failure returns a recoverable error and never publishes an unvalidated case.
