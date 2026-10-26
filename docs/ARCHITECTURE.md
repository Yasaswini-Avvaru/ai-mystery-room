# Architecture

React/Vite communicates with an Express API. The API validates inputs, generates one canonical plan through the Gemini service, validates suspect/evidence references and clue fairness, then stores the case in MongoDB. Public serializers are explicit allowlists. Accusations compare against persisted case truth, and solution access is gated by the resolved state.

The initial implementation embeds suspects, evidence and canonical solution in one Mongoose case document so the one-accusation state transition can be persisted atomically. Generation is synchronous and bounded by provider timeout/retries. No durable queue is claimed.
