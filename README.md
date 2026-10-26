# AI Mystery Room

An interactive, fictional detective investigation generator built with React, Express, MongoDB, and Google Gemini. The API owns canonical case truth and evaluates accusations; the browser receives only public investigation content.

## Requirements

- Node.js 20+ and npm 10+
- MongoDB 6+ locally or a MongoDB Atlas connection string
- A Google Gemini API key for case generation

## Setup

1. Copy `server/.env.example` to `server/.env`, then set `MONGODB_URI`, `GEMINI_API_KEY`, and `GEMINI_MODEL`.
2. From the repository root run `npm install`.
3. Run `npm run dev`. Vite serves the app at <http://localhost:5173>; Express listens on port 5000.

Alternatively, run `npm run dev -w server` and `npm run dev -w client` in separate terminals. `npm run build` creates the production client bundle; `npm start` starts the API.

## Configuration

See [server/.env.example](server/.env.example). Gemini is required for case generation. Google Gemini image generation creates image evidence, and Veo creates a short CCTV clip. The server downloads generated media into ignored `server/uploads/` storage and serves it from `/media`; retain that directory in deployments or configure persistent media storage. Image/video generation can require separate model access and billing. If media generation fails, the written evidence still appears with a visible failure state.

## API

See [docs/API.md](docs/API.md). The unauthenticated MVP uses a one-final-accusation gameplay gate. Case IDs are not identity authorization, so this is not a private-user case system.

## Known limitations

- Generation currently runs synchronously in the API request. There is no durable job queue.
- Generated files use local disk storage by default; production deployments need persistent storage shared with the API.
- Veo video generation is synchronous for the MVP and can take several minutes. A durable background job queue is not configured.
- Authentication, user history, multiplayer, and actual CCTV video generation are outside MVP scope.
- Automated test suites are not yet included.
