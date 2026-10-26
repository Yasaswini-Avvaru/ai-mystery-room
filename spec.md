# AI MYSTERY ROOM
## Product Requirements & Technical Specification

**Document:** `SPEC.md`  
**Project Name:** AI Mystery Room  
**Document Version:** 1.0.0  
**Status:** Ready for Development  
**Architecture:** MERN Stack + Google Gemini API  
**Development Approach:** Spec-Driven Development (SDD)  
**Primary AI Coding Agent:** OpenAI Codex

---

# 1. PROJECT OVERVIEW

## 1.1 Product Vision

AI Mystery Room is an AI-powered interactive mystery investigation platform where users become detectives and solve fictional cases generated from their own story ideas.

The user submits a short scenario or story premise. The backend uses Google Gemini to generate a fictional investigation containing a hidden culprit, suspects, evidence, witness statements, digital conversations, images, and other clues.

The user investigates the case, examines the available evidence, forms a hypothesis, and identifies the culprit.

The application then evaluates the user's accusation against the canonical case solution and reveals the complete mystery resolution.

**Core concept:** Turn any suitable story premise into an interactive, AI-generated detective investigation.

## 1.2 Problem Statement

Traditional mystery games offer fixed storylines, predictable puzzles, and limited replayability.

AI Mystery Room addresses this by enabling users to create and investigate different fictional mysteries dynamically, with AI-generated evidence and interconnected clues.

## 1.3 Product Goals

1. Allow users to create mysteries from their own scenario descriptions.
2. Generate coherent investigations with one predetermined culprit.
3. Provide multiple types of fictional evidence.
4. Let users inspect evidence and identify contradictions.
5. Support culprit selection and accusation submission.
6. Deliver a satisfying explanation of the solution.
7. Support repeated investigations with different stories.
8. Maintain consistency between the evidence, suspects, timeline, and actual culprit.
9. Provide a responsive, immersive detective-themed user interface.

## 1.4 Target Users

- Mystery and detective-story enthusiasts.
- Students interested in interactive problem-solving.
- Casual gamers.
- Users who enjoy AI-generated storytelling.
- Players who want to create their own fictional investigation scenarios.

## 1.5 Product Principles

- **Fair mysteries:** The solution must be supported by evidence available to the player.
- **One canonical truth:** The culprit and underlying events must be fixed before evidence is presented.
- **AI-generated content:** All investigation artifacts must be clearly identified as fictional.
- **User agency:** Players decide which evidence to inspect and whom to accuse.
- **Server authority:** The backend controls case truth, case state, and accusation evaluation.
- **Security by design:** Secret solutions and API keys must never be exposed through public client responses.
- **Progressive disclosure:** Reveal the solution only after an eligible accusation or an explicit solution-reveal action.

---

# 2. SCOPE AND FEATURE PRIORITIES

## 2.1 MVP Features

The first working release MUST include:

1. Landing page.
2. Mystery creation form.
3. Scenario input and generation preferences.
4. Gemini-powered mystery generation.
5. Fictional suspects and character profiles.
6. Evidence room with categorized artifacts.
7. WhatsApp-style fictional conversations.
8. AI-generated or safely sourced fictional evidence images.
9. Fictional security-camera evidence.
10. Evidence detail viewer.
11. Suspect selection and accusation submission.
12. Server-side accusation evaluation.
13. Final solution and case explanation.
14. Loading, error, empty, and retry states.
15. Responsive desktop and mobile layouts.
16. Persistent case storage in MongoDB.
17. Secure Gemini API integration.
18. Basic abuse prevention, input validation, and generation limits.

## 2.2 Post-MVP Features

These features MUST NOT block the first release:

- User registration and authentication.
- Saved investigation history and user profiles.
- Leaderboards and scoring.
- Multiplayer investigations.
- Timed detective challenges.
- Hints and progressive assistance.
- Difficulty-based scoring.
- Shareable case links.
- Community-created mysteries.
- Real-time multiplayer evidence discovery.
- Voice-based interrogations.
- Actual video generation for CCTV clips.

For the MVP, a CCTV artifact may be a sequence of generated still images, a fictional video transcript, or a simulated playback timeline. Actual AI-generated video is not required.

---

# 3. TECHNOLOGY STACK

## 3.1 Frontend

- React
- Vite
- JavaScript with JSX
- Tailwind CSS
- React Router
- Fetch API or Axios
- Lucide React icons

The implementation MUST use a consistent component structure and centralized API communication.

TypeScript is optional for the initial implementation. Unless explicitly changed, use JavaScript throughout the frontend and backend.

## 3.2 Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Google Gemini API using the official Google Gen AI SDK compatible with the selected model
- dotenv for local environment variables
- Zod or an equivalent schema validator
- A request-validation and centralized error-handling layer

## 3.3 AI Services

Google Gemini is the primary model for:

- Mystery planning.
- Suspect and character generation.
- Evidence generation.
- Witness statements.
- Timeline construction.
- Clue and contradiction planning.
- Solution explanations.
- Optional hints.

An image-generation provider is a separate, replaceable integration for creating fictional images. Gemini must not be assumed to produce image files simply because it can analyze images or generate image-related text.

The application MUST support an image-provider adapter. If no compatible image-generation provider is configured, the system must use explicitly labeled illustrative placeholders or generated text-based artifacts rather than claiming that a real image was generated.

## 3.4 Database

MongoDB stores:

- Mystery cases.
- Public investigation content.
- Private solution data.
- Suspects.
- Evidence metadata.
- Player progress.
- Accusation attempts.
- Generation status and operational metadata.

## 3.5 Development Tools

- VS Code.
- Git and GitHub.
- npm.
- Postman or an equivalent API testing tool.
- Codex for specification-driven implementation.

## 3.6 Dependency Rules

- Use maintained, compatible package versions.
- Commit the lockfile.
- Do not hard-code API keys.
- Do not call Gemini directly from the browser.
- Do not introduce an additional framework or database without updating this specification.
- Keep AI and image-generation providers behind service interfaces.

---

# 4. USER EXPERIENCE AND DESIGN SYSTEM

## 4.1 Visual Direction

The website MUST feel like a modern digital detective investigation room.

**Design keywords:** Cinematic, mysterious, investigative, immersive, premium, readable, responsive.

Suggested visual system:

- Background: near-black and deep charcoal.
- Primary accent: amber or muted gold.
- Secondary accent: desaturated teal.
- Surfaces: dark panels with subtle borders.
- Typography: a readable sans-serif for interface content, with an optional distinctive display font for headings.
- Evidence cards: folders, document previews, image thumbnails, timestamp labels, and source metadata.
- Motion: restrained transitions, evidence-opening animations, and subtle ambient effects.

Do not sacrifice readability for atmosphere. Evidence must remain easy to inspect.

## 4.2 Main Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/create` | Create a mystery |
| `/case/:caseId` | Investigation workspace |
| `/case/:caseId/evidence/:evidenceId` | Evidence detail view |
| `/case/:caseId/accuse` | Culprit selection and accusation |
| `/case/:caseId/solution` | Final case resolution |
| `*` | Not-found page |

Routes that do not need a separate screen may be implemented as modal or drawer states, provided the same behavior is preserved.

## 4.3 Landing Page

The landing page MUST contain:

- Product name and short description.
- Primary CTA: "Create a Mystery".
- Secondary CTA: "How It Works".
- A short explanation of the investigation experience.
- A visual preview of suspects and evidence.
- A clear fictional-content disclaimer.
- Responsive navigation.

Clicking "Create a Mystery" navigates to `/create`.

## 4.4 Mystery Creation Screen

The creation screen MUST include:

**Required fields**

- Scenario description.
- Optional mystery title.

**Optional settings**

- Difficulty: Easy, Medium, Hard.
- Genre: Crime, Theft, Disappearance, Cyber Mystery, Campus Mystery, General Mystery.
- Number of suspects: 3–6.
- Evidence richness: Standard or Detailed.

Default settings:

- Difficulty: Medium.
- Genre: General Mystery.
- Suspects: 4.
- Evidence richness: Standard.

Input constraints:

- Scenario description: 30–2,000 characters.
- Mystery title: 3–80 characters when provided.
- Reject empty or whitespace-only scenarios.
- Reject unsupported or excessively large payloads.
- Clearly communicate validation errors.

The form MUST provide:

- A visible generation/loading state.
- Duplicate-submission prevention.
- A retry path for recoverable failures.
- A warning that generation may take time.
- A fictional-content notice.

On successful generation, navigate to the new investigation workspace.

## 4.5 Investigation Workspace

The investigation workspace is the main gameplay screen.

Desktop layout:

- Left panel: case overview and suspect directory.
- Center panel: selected evidence and investigation details.
- Right panel: investigation progress, evidence filters, and action controls.

On smaller screens, panels MUST stack or become accessible through tabs or drawers.

The workspace MUST display:

- Case title.
- Case summary.
- Difficulty.
- Suspect list.
- Evidence categories.
- Evidence count.
- Investigation progress.
- Accuse Culprit action.
- Case status.

The UI MUST NOT display the hidden culprit, canonical solution, private reasoning, or solution-only metadata.

## 4.6 Evidence Room

Evidence MUST be grouped into categories:

1. Messages.
2. Images.
3. CCTV / Surveillance.
4. Witness Statements.
5. Documents.
6. Physical Clues.
7. Timeline / Digital Records.

Each evidence item MUST include:

- Title.
- Evidence type.
- Short preview.
- Source or fictional origin.
- In-universe timestamp when relevant.
- Description.
- Related suspects.
- Relevant case context.
- Investigation relevance metadata for backend use only.

Evidence cards MUST support opening a detailed viewer.

The interface MAY include filtering, sorting, and evidence-discovery indicators.

## 4.7 Evidence Detail Viewer

When a user opens evidence, display:

- Full evidence content.
- Artifact-specific presentation.
- Timestamp or source details when applicable.
- Related suspects.
- Any visible contradictions or contextual clues embedded in the artifact.
- A return-to-investigation action.

The application MUST distinguish between:

- A clue explicitly visible to the player.
- A conclusion the player must infer.
- Private backend metadata used to evaluate the mystery.

The system MUST NOT automatically reveal the intended deduction merely because an artifact is opened.

## 4.8 Accusation Screen

The player MUST be able to select exactly one suspect.

The screen MUST include:

- Suspect cards.
- Character name and profile.
- A selection indicator.
- An optional explanation field.
- A confirmation step.
- A final submission action.

The optional explanation field may be 0–1,000 characters.

The server MUST verify that the selected suspect belongs to the specified case.

On submission, the backend MUST evaluate the accusation against the stored canonical culprit.

The client MUST NOT determine whether an accusation is correct.

## 4.9 Solution Screen

The solution screen MUST show:

- Correct culprit.
- Final verdict: correct or incorrect.
- Explanation of the actual events.
- Key supporting evidence.
- Timeline of relevant events.
- Explanation of important contradictions.
- How the clues establish the solution.
- Option to return to the case.
- Option to create another mystery.

If the accusation is incorrect, the application MUST reveal the actual culprit and the supported explanation only after the accusation is submitted.

If the user explicitly chooses to reveal the solution, the action must be confirmed and the case marked as solved or revealed.

## 4.10 Accessibility and Responsive Design

The application MUST:

- Work on mobile, tablet, and desktop viewports.
- Use semantic HTML.
- Provide keyboard-accessible controls.
- Display visible focus indicators.
- Provide labels for form fields.
- Provide meaningful alternative text for images.
- Avoid relying on color alone to communicate status.
- Respect reduced-motion preferences.
- Maintain readable contrast.

---

# 5. CORE GAMEPLAY RULES

## 5.1 Case Generation

The backend MUST generate a complete, internally consistent case before the player begins investigating.

The generation process MUST establish:

1. The original scenario.
2. The actual event or crime.
3. The canonical culprit.
4. The culprit's motive.
5. The timeline.
6. The suspects and their relationships.
7. Suspect alibis.
8. Evidence artifacts.
9. Red herrings.
10. Evidence-to-suspect relationships.
11. A fair deduction path.
12. The final solution.

The canonical solution MUST be generated and validated before any public evidence is returned.

## 5.2 Single Source of Truth for Case Truth

Every generated case MUST have exactly one canonical culprit.

The culprit's ID MUST match one of the generated suspect IDs.

All later AI-generated artifacts MUST be derived from the stored canonical case plan.

The system MUST NOT ask an unconstrained AI prompt to independently invent a culprit every time the user submits an accusation.

The system MUST NOT regenerate the case solution during accusation evaluation.

## 5.3 Fairness Requirements

A mystery is considered fair only if:

- At least two independent evidence items support the correct culprit.
- At least one evidence item contradicts or materially weakens the culprit's alibi or account.
- Evidence timestamps and event order are coherent.
- The solution does not depend on information unavailable to the player.
- The culprit's identity is not established solely by arbitrary narrative claims.
- Red herrings are explainable without contradicting the canonical facts.
- The final explanation cites evidence actually present in the case.

These conditions are minimum design rules, not a guarantee that every generated mystery will be perfect. The backend MUST validate the generated case and retry or reject it when essential consistency checks fail.

## 5.4 Suspect Rules

Each suspect MUST have:

- A stable ID.
- Name.
- Fictional profile.
- Relationship to the case.
- Public motive or relevant background.
- Public statement or alibi.
- Optional visible behavioral details.

Private information, such as actual involvement in the crime, MUST remain server-side.

The public API MUST return only fields appropriate for investigation.

## 5.5 Evidence Rules

Each evidence item MUST have:

- A stable ID.
- A supported evidence type.
- A title.
- Player-visible content.
- A source description.
- Optional timestamp.
- Related suspect IDs.
- A visibility status.

Private metadata MUST include, where applicable:

- Canonical fact supported.
- Intended deduction.
- Suspects supported or contradicted.
- Whether the artifact is a red herring.
- Validation status.

Private metadata MUST never be included in public evidence API responses.

## 5.6 Accusation Rules

- A case may have multiple incorrect accusations if the configured attempt policy allows them.
- The default MVP policy is one final accusation per case.
- An incorrect final accusation reveals the solution.
- Repeated HTTP submissions MUST NOT create duplicate accusation records.
- A player cannot accuse a suspect who does not belong to the case.
- A case that has not completed generation cannot accept accusations.
- A case already resolved cannot be accused again.
- The server records the verdict and final case state atomically.

---

# 6. GEMINI AI GENERATION ARCHITECTURE

## 6.1 Generation Pipeline

Use a staged generation pipeline rather than a single prompt that attempts to produce the entire website's data at once.

### Stage 1: Case Planning

Input:

- User scenario.
- Genre.
- Difficulty.
- Suspect count.
- Evidence richness.

Output:

- Structured canonical case plan.
- Actual event.
- Culprit ID.
- Motive.
- Timeline.
- Suspect identities and relationships.
- Essential facts.
- Contradictions.
- Required clues.
- Solution outline.

This output is private.

### Stage 2: Suspect Profiles

Generate consistent character profiles from the canonical case plan.

Validate all IDs, relationships, and required fields.

Separate public character information from private involvement details.

### Stage 3: Evidence Planning

Determine which artifacts are needed to support the case.

The evidence plan MUST reference established canonical facts and timeline events.

Each planned artifact MUST have a clear purpose.

### Stage 4: Artifact Generation

Generate player-visible content for:

- Fictional WhatsApp-style messages.
- Witness statements.
- Documents.
- Digital logs.
- CCTV descriptions or transcripts.
- Image-generation prompts.
- Image captions and metadata.

Artifact generation MUST NOT alter the canonical culprit or contradict established facts.

### Stage 5: Validation

Validate:

- Schema correctness.
- Suspect references.
- Evidence references.
- Timeline consistency.
- Canonical culprit existence.
- Minimum clue requirements.
- Absence of private solution fields in public content.
- Content safety.
- Artifact provenance.
- Overall mystery solvability.

### Stage 6: Optional Repair

If validation fails, the backend MAY request a targeted repair from Gemini.

Repair requests MUST identify the failing fields or constraints.

The repair MUST NOT silently replace the canonical culprit after evidence generation.

If the case remains invalid after the configured retry limit, reject the generated case and show a recoverable error.

### Stage 7: Persistence and Publication

Save the validated case to MongoDB.

Set the case status to `READY` only after all required content has passed validation.

Return the public case representation to the frontend.

## 6.2 Structured Output

Prefer Gemini's supported structured-output or JSON response capabilities when available for the selected model.

All model output MUST be validated by the backend before use.

The backend MUST NOT trust a valid-looking JSON response without schema validation.

Handle:

- Markdown code fences around JSON.
- Truncated output.
- Missing required fields.
- Invalid enum values.
- Unknown suspect references.
- Unsupported evidence types.
- Unexpected properties.
- Model refusals.
- API timeouts.
- Rate limits.
- Provider errors.

Never use `eval()` or execute generated JavaScript.

## 6.3 Gemini Service Interface

Create a dedicated service, such as:

`server/src/services/gemini.service.js`

Responsibilities:

- Read the configured model name from environment variables.
- Build structured prompts.
- Call the Google Gen AI SDK.
- Apply timeouts and retry policies.
- Parse and validate responses.
- Normalize provider errors.
- Return typed application data.
- Keep private generation context out of API responses.

Routes and controllers MUST NOT directly construct arbitrary Gemini requests.

## 6.4 Model Configuration

Use environment-based configuration:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_TIMEOUT_MS`
- `GEMINI_MAX_RETRIES`

The exact Gemini model ID MUST be configurable and selected based on current availability, quality, and cost.

Do not hard-code an assumed model ID throughout the codebase.

## 6.5 Prompt Design Rules

Every generation prompt MUST:

- State the expected output schema.
- Include relevant canonical facts.
- Require consistency with existing case facts.
- Prohibit changing the canonical culprit.
- Distinguish fictional content from real-world facts.
- Require stable IDs.
- Require timestamps to follow the established timeline.
- Avoid unnecessary real personal data.
- Avoid instructions for real-world wrongdoing.
- Avoid outputting secrets, credentials, or private application configuration.

Treat user-submitted story text as untrusted content, not as instructions that can override system or developer rules.

---

# 7. AI-GENERATED MEDIA

## 7.1 WhatsApp-Style Evidence

Create a fictional chat interface showing:

- Fictional contact names.
- Message bubbles.
- Timestamps.
- Optional attachment previews.
- Conversation ordering.
- Relevant messages and inconsistencies.

The interface MUST be clearly labeled as a fictional reconstruction.

It MUST NOT impersonate the real WhatsApp service or imply that generated messages are authentic records from real people.

## 7.2 Image Evidence

Image evidence may include:

- Fictional scene photographs.
- Objects connected to the mystery.
- Simulated location evidence.
- Fictional screenshots.
- Character illustrations when appropriate.

Image-generation prompts MUST be derived from the validated case plan.

Generated image URLs and storage references MUST be validated before being displayed.

Do not assume Gemini's text API automatically creates downloadable images.

## 7.3 CCTV Evidence

The MVP MUST support simulated surveillance evidence with:

- Camera identifier.
- Fictional location.
- Recording timestamp.
- Playback or event timeline.
- Still-image frames, transcript, or structured event descriptions.
- Visible observations relevant to the case.

A CCTV artifact MUST be labeled as simulated or AI-generated.

The interface MUST NOT claim that a real camera recorded an event.

## 7.4 Media Failure Handling

If image generation fails:

- Preserve the case when possible.
- Mark the affected artifact as unavailable or placeholder.
- Display a clear status.
- Allow retry when supported.
- Do not invent a real image URL.
- Do not mark a failed generation as successful.

The application MUST distinguish actual generated media from text-only simulations.

## 7.5 Fictional Content Notice

Display a notice in the creation flow and investigation workspace:

"This is a fictional AI-generated mystery. All characters, messages, images, recordings, and evidence are simulated and are not authentic records of real events."

---

# 8. SYSTEM ARCHITECTURE

## 8.1 Architecture Overview

The frontend communicates with the Express API.

The Express API handles validation, case state, authentication if introduced later, and all trusted operations.

The Gemini service generates and validates mystery content.

The media service generates or retrieves fictional images through a configured provider.

MongoDB stores case data and investigation state.

### Request Flow

1. User submits a scenario.
2. React sends a request to the Express API.
3. Express validates the request.
4. A case record is created with status `GENERATING`.
5. The generation service creates the canonical plan.
6. Suspects and evidence are generated.
7. Validation checks consistency and fairness.
8. Validated content is saved.
9. Case status changes to `READY`.
10. The API returns a public case representation.
11. React renders the investigation workspace.
12. User submits an accusation.
13. Express evaluates the selected suspect against the stored solution.
14. The case is marked resolved.
15. The solution endpoint returns the permitted final explanation.

## 8.2 Long-Running Generation

Generation may take longer than a typical HTTP request.

The MVP MAY use synchronous generation if it remains reliable within configured timeouts.

However, the architecture SHOULD support asynchronous generation.

Recommended asynchronous behavior:

- `POST /api/cases` creates a case and returns its ID.
- Generation runs through a background job or managed task mechanism.
- `GET /api/cases/:caseId/status` reports progress.
- The frontend polls with bounded intervals and stops polling when generation completes or fails.

If a background queue is introduced, it must be documented and configured. Do not pretend that a durable queue exists if generation is running only in a request handler.

For an initial implementation without a queue, use a documented synchronous approach or a clearly identified in-process task strategy with appropriate limitations.

---

# 9. REPOSITORY STRUCTURE

Use a monorepo with separate client and server applications.

```text
ai-mystery-room/
├── SPEC.md
├── README.md
├── .gitignore
├── package.json
├── client/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── routes/
│       │   ├── HomePage.jsx
│       │   ├── CreateMysteryPage.jsx
│       │   ├── InvestigationPage.jsx
│       │   ├── EvidencePage.jsx
│       │   ├── AccusationPage.jsx
│       │   └── SolutionPage.jsx
│       ├── components/
│       │   ├── layout/
│       │   ├── common/
│       │   ├── case/
│       │   ├── suspects/
│       │   ├── evidence/
│       │   └── forms/
│       ├── hooks/
│       ├── services/
│       │   └── api.js
│       ├── utils/
│       ├── styles/
│       │   └── index.css
│       └── assets/
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       │   ├── database.js
│       │   └── env.js
│       ├── routes/
│       │   ├── health.routes.js
│       │   ├── cases.routes.js
│       │   ├── evidence.routes.js
│       │   └── accusations.routes.js
│       ├── controllers/
│       ├── services/
│       │   ├── gemini.service.js
│       │   ├── case-generation.service.js
│       │   ├── case-validation.service.js
│       │   ├── accusation.service.js
│       │   └── media.service.js
│       ├── models/
│       │   ├── Case.js
│       │   ├── Suspect.js
│       │   ├── Evidence.js
│       │   └── Accusation.js
│       ├── validators/
│       ├── middleware/
│       ├── utils/
│       └── tests/
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    └── DECISIONS.md
```

Codex MAY refine the structure when necessary, but it MUST preserve the separation of frontend, API, AI services, validation, and persistence.

---

# 10. DATA MODEL

Use Mongoose models with explicit schemas, validation, indexes, and timestamps.

The following is the logical data contract. The final database representation may use embedded subdocuments where this is simpler, but it must preserve all required fields and access-control boundaries.

## 10.1 Case

Required fields:

- `_id`: MongoDB ObjectId.
- `title`: string.
- `scenario`: string.
- `genre`: supported genre.
- `difficulty`: `EASY`, `MEDIUM`, or `HARD`.
- `status`: case lifecycle status.
- `suspectIds`: array of suspect IDs.
- `evidenceIds`: array of evidence IDs.
- `solution`: private canonical solution.
- `generationMetadata`: internal operational information.
- `createdAt`.
- `updatedAt`.

Case status values:

- `GENERATING`
- `READY`
- `GENERATION_FAILED`
- `RESOLVED`

The solution object MUST contain:

- `culpritSuspectId`
- `motive`
- `actualEvents`
- `canonicalTimeline`
- `solutionExplanation`
- `supportingEvidenceIds`
- `contradictionEvidenceIds`

All solution fields MUST be excluded from ordinary public case responses.

## 10.2 Suspect

Required fields:

- `_id`
- `caseId`
- `name`
- `ageRange` or an appropriate fictional character descriptor.
- `profile`
- `relationshipToCase`
- `publicMotive`
- `publicAlibi`
- `publicStatement`
- `privateInvolvement`, when needed.
- `createdAt`
- `updatedAt`

Private involvement data MUST never be returned by the public suspect endpoint.

Avoid collecting or generating unnecessary sensitive personal details.

## 10.3 Evidence

Required fields:

- `_id`
- `caseId`
- `title`
- `type`
- `summary`
- `content`
- `sourceLabel`
- `occurredAt`, when applicable.
- `relatedSuspectIds`
- `media`
- `visibility`
- `privateAnalysis`
- `createdAt`
- `updatedAt`

Supported evidence types:

- `MESSAGE`
- `IMAGE`
- `CCTV`
- `WITNESS_STATEMENT`
- `DOCUMENT`
- `PHYSICAL_CLUE`
- `DIGITAL_LOG`
- `TIMELINE_RECORD`

Visibility values:

- `PUBLIC`
- `INTERNAL`

Private analysis MAY contain:

- Canonical fact IDs.
- Intended deduction.
- Contradiction references.
- Red-herring designation.
- Validation findings.

## 10.4 Media

The media object MUST support:

- `kind`: `IMAGE`, `VIDEO`, `AUDIO`, or `TEXT_SIMULATION`.
- `status`: `READY`, `PENDING`, `FAILED`, or `PLACEHOLDER`.
- `provider`.
- `storageUrl`, when available.
- `mimeType`, when applicable.
- `altText`.
- `generated`: boolean.
- `fictionalLabel`.

For the MVP, actual video and audio generation are optional. The data model must not imply that unsupported media exists.

## 10.5 Accusation

Required fields:

- `_id`
- `caseId`
- `suspectId`
- `explanation`, optional.
- `isCorrect`
- `submittedAt`
- `idempotencyKey`, when used.

The canonical solution MUST NOT be copied into the accusation document.

Accusation history may be stored separately for future scoring and analytics, but the default MVP policy permits only one final accusation per case.

## 10.6 Data Integrity

- Every suspect MUST belong to exactly one case.
- Every evidence item MUST belong to exactly one case.
- Every related suspect reference MUST point to a suspect in the same case.
- The canonical culprit MUST reference a valid suspect in that case.
- All evidence references in the solution MUST exist in that case.
- Public serialization MUST use explicit allowlists.
- Never expose private fields merely by serializing an entire Mongoose document.

---

# 11. REST API CONTRACT

Base path: `/api`

All endpoints MUST return JSON.

Use consistent HTTP status codes and a common error response format.

## 11.1 Health

### `GET /api/health`

Purpose: Confirm that the API is running.

Example response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

This endpoint does not guarantee that Gemini or MongoDB is operational unless dependency health is explicitly checked.

## 11.2 Create Mystery

### `POST /api/cases`

Request:

```json
{
  "title": "The Missing Prototype",
  "scenario": "A prototype disappears from a college laboratory shortly before a major exhibition.",
  "genre": "CAMPUS_MYSTERY",
  "difficulty": "MEDIUM",
  "suspectCount": 4,
  "evidenceRichness": "STANDARD"
}
```

The title is optional.

Response on successful synchronous creation:

```json
{
  "success": true,
  "data": {
    "case": {
      "id": "case_id",
      "title": "The Missing Prototype",
      "status": "READY",
      "suspects": [],
      "evidence": []
    }
  }
}
```

The arrays above represent public case data and must be populated in actual responses.

For asynchronous creation, return HTTP `202` with the case ID and generation status instead.

Never include the private solution in this response.

## 11.3 Get Case

### `GET /api/cases/:caseId`

Returns:

- Public case overview.
- Public suspect profiles.
- Public evidence summaries.
- Case status.
- Permitted investigation metadata.

Does not return:

- Canonical culprit ID.
- Private solution.
- Private involvement.
- Internal evidence analysis.
- API keys.
- Generation prompts containing secret solution data.

## 11.4 Get Case Generation Status

### `GET /api/cases/:caseId/status`

Example response:

```json
{
  "success": true,
  "data": {
    "caseId": "case_id",
    "status": "GENERATING",
    "progress": {
      "stage": "EVIDENCE_GENERATION"
    }
  }
}
```

Progress values MUST reflect actual generation state. Do not fabricate precise percentage completion when the backend cannot measure it.

## 11.5 List Evidence

### `GET /api/cases/:caseId/evidence`

Optional query parameters:

- `type`
- `page`
- `limit`

The response MUST include only public evidence.

## 11.6 Get Evidence Detail

### `GET /api/cases/:caseId/evidence/:evidenceId`

Returns one public evidence artifact after verifying that it belongs to the specified case.

Return `404` when the case or evidence does not exist or the evidence does not belong to the case.

## 11.7 Submit Accusation

### `POST /api/cases/:caseId/accusations`

Request:

```json
{
  "suspectId": "suspect_id",
  "explanation": "The timeline conflicts with the suspect's statement."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accusationId": "accusation_id",
    "isCorrect": false,
    "caseStatus": "RESOLVED"
  }
}
```

The response MUST NOT reveal the canonical solution if the product flow requires the player to navigate to the solution screen. The solution endpoint remains the authority for revealing the full explanation.

The accusation result MUST be calculated on the server using the persisted canonical culprit ID.

## 11.8 Get Solution

### `GET /api/cases/:caseId/solution`

Returns the final solution only when the case is resolved or the user has explicitly chosen to reveal it.

The server MUST enforce this state requirement.

In the unauthenticated MVP, this is a basic gameplay gate rather than strong identity-based authorization. The limitations must be documented.

## 11.9 Reveal Solution

### `POST /api/cases/:caseId/reveal-solution`

Purpose: Allow an explicit solution-reveal action.

The backend MUST validate the case state and persist the resulting resolution state.

The endpoint MUST be idempotent.

## 11.10 Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The scenario description is invalid."
  }
}
```

Use appropriate status codes:

- `400`: Invalid request.
- `404`: Case or resource not found.
- `409`: Invalid state transition or duplicate final accusation.
- `413`: Request payload too large.
- `429`: Rate limit exceeded.
- `502`: AI provider returned an invalid or unusable response.
- `503`: Required service temporarily unavailable.
- `504`: Upstream request timed out.
- `500`: Unexpected internal error.

Do not expose raw stack traces or private provider responses in production API errors.

---

# 12. CASE LIFECYCLE AND STATE MANAGEMENT

## 12.1 Case Lifecycle

```text
CREATED
   |
   v
GENERATING
   |
   +------> GENERATION_FAILED
   |
   v
VALIDATING
   |
   +------> GENERATION_FAILED
   |
   v
READY
   |
   +------> RESOLVED
```

`VALIDATING` is a generation-stage status. If represented in MongoDB, include it in the explicit status enum.

A case MUST NOT become `READY` until its required content has passed validation.

A case MUST NOT accept an accusation unless it is `READY`.

A case MUST NOT return to `READY` after resolution.

## 12.2 Frontend States

Each route MUST support:

- Initial loading.
- Successful content.
- Empty content where applicable.
- Validation errors.
- Recoverable server errors.
- Unrecoverable generation errors.
- Retry actions where appropriate.
- Invalid or missing case IDs.
- Case resolved.
- Duplicate submission prevention.

Do not display blank screens or infinite loading spinners when an API call fails.

## 12.3 Client State

Use React state and hooks for:

- Current case data.
- Selected evidence.
- Filters.
- Selected suspect.
- Accusation submission state.
- Generation status.
- Error messages.

The backend remains authoritative for persistent case state and verdicts.

---

# 13. SECURITY AND PRIVACY

## 13.1 API Keys

- Store `GEMINI_API_KEY` only on the server.
- Keep real environment files out of version control.
- Provide a `.env.example` containing placeholder values.
- Never expose secrets through `VITE_*` variables.
- Never send provider keys to the frontend.
- Never log API keys.
- Rotate keys if accidentally exposed.

## 13.2 Input Validation

Validate all incoming requests at the API boundary.

Apply:

- Maximum request-body sizes.
- Scenario length limits.
- Supported enum checks.
- MongoDB ObjectId validation.
- Suspect ownership checks.
- Evidence ownership checks.
- Accusation state checks.
- Text sanitization or safe rendering.

React MUST render AI-generated text as text by default. Do not render arbitrary model-generated HTML.

If rich text is introduced, use a carefully constrained renderer or sanitizer.

## 13.3 Rate Limiting and Cost Controls

Implement rate limits for expensive operations, especially case creation.

Include:

- Per-IP request limits.
- Generation concurrency limits.
- Provider timeouts.
- Bounded retry policies.
- Maximum scenario size.
- Maximum generated suspect and evidence counts.
- Configurable generation limits.

Do not assume per-user limits are enforceable without authentication or a reliable identity mechanism.

## 13.4 Database Security

- Keep MongoDB credentials server-side.
- Use environment-based connection configuration.
- Avoid unrestricted public database access.
- Use appropriate indexes.
- Avoid unsafe dynamic query construction.
- Restrict database permissions.
- Do not expose raw database errors.

## 13.5 Fictional Identity and Media

- Do not present generated artifacts as authentic evidence.
- Avoid generating realistic private documents containing real people's sensitive information.
- Do not generate real login credentials, bank records, or government identity documents.
- Prefer fictional names and fictional organizations.
- Do not create deceptive real-person impersonation content.

## 13.6 CORS and Deployment

Configure CORS for the actual frontend origin.

Do not use unrestricted production CORS as a substitute for proper configuration.

Use HTTPS in deployment.

---

# 14. TESTING REQUIREMENTS

## 14.1 Unit Tests

Test:

- Request validators.
- Case-plan validation.
- Canonical culprit validation.
- Evidence reference validation.
- Timeline consistency rules.
- Public serialization.
- Accusation evaluation.
- Case lifecycle transitions.
- Error normalization.

## 14.2 Integration Tests

Test:

- Case creation with a mocked Gemini provider.
- Valid generation and persistence.
- Invalid generation and rejection.
- Failed AI provider requests.
- Retrieval of a public case.
- Retrieval of evidence.
- Correct accusation.
- Incorrect accusation.
- Duplicate accusation.
- Accusation against a suspect from another case.
- Solution access before resolution.
- Solution access after resolution.
- Missing case handling.
- MongoDB failures.

Tests MUST NOT require a paid Gemini request by default. Use a deterministic mock provider for routine automated tests.

## 14.3 Frontend Tests

Test:

- Form validation.
- Loading indicators.
- API error messages.
- Suspect selection.
- Evidence category filtering.
- Evidence detail opening.
- Accusation confirmation.
- Solution rendering.
- Responsive navigation where practical.

## 14.4 End-to-End Acceptance Test

A complete end-to-end test MUST verify:

1. Open the landing page.
2. Navigate to Create Mystery.
3. Enter a valid scenario.
4. Submit the scenario.
5. Wait for generation to complete.
6. Open the investigation workspace.
7. Inspect suspects.
8. Open at least one message artifact.
9. Open at least one image or clearly labeled image placeholder.
10. Inspect a CCTV or simulated surveillance artifact.
11. Select a suspect.
12. Submit an accusation.
13. View the verdict.
14. Open the solution.
15. Verify that the explanation references actual case evidence.

The test MUST verify that the private culprit ID is not present in pre-resolution public API responses.

---

# 15. ACCEPTANCE CRITERIA

The MVP is considered complete only when all critical criteria pass.

### AC-01: Project Setup

- Client and server install successfully.
- Both start using documented commands.
- Environment variables are documented.
- MongoDB connection works.

### AC-02: Mystery Creation

- A valid scenario can be submitted.
- Invalid scenarios are rejected with understandable errors.
- Duplicate submissions are controlled.
- The generation state is visible.

### AC-03: Mystery Quality

- A case has one canonical culprit.
- At least three suspects are generated.
- Required evidence is present.
- At least two independent clues support the solution.
- The generated timeline and alibis pass validation.
- Failed cases do not become playable.

### AC-04: Evidence

- Messages, image evidence, and CCTV-style evidence are represented.
- Each artifact is labeled as fictional.
- Evidence details are readable.
- Failed media generation is handled without crashing the case.
- Private evidence metadata remains hidden.

### AC-05: Accusation

- A player can select a suspect.
- The backend validates case and suspect ownership.
- The verdict is based on persisted case truth.
- Repeated submissions cannot create multiple final accusations.
- The resolved state is persisted.

### AC-06: Solution

- The solution remains inaccessible through ordinary public case and evidence endpoints before resolution.
- The final solution reveals the actual culprit.
- The explanation references supporting evidence.
- The resolved state survives a page refresh.

### AC-07: Security

- No Gemini key is included in frontend assets or API responses.
- User-generated text is rendered safely.
- API inputs are validated.
- Generation endpoints have basic rate limits.
- Internal errors do not leak secrets.

### AC-08: UI Quality

- The website works on desktop and mobile.
- Loading and error states are implemented.
- Navigation works.
- Core interactions are functional.
- No major page contains placeholder buttons that falsely appear operational.

### AC-09: Documentation

- README includes setup instructions.
- `.env.example` lists required configuration.
- API endpoints are documented.
- Tests and build commands are documented.
- Known limitations are disclosed.

---

# 16. ENVIRONMENT CONFIGURATION

Create `server/.env.example`.

```dotenv
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room

GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_TIMEOUT_MS=60000
GEMINI_MAX_RETRIES=2

CLIENT_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=30
CASE_GENERATION_LIMIT=5
```

These values are development defaults, not universal production settings.

The implementation MUST validate required environment variables at startup.

Never commit the real `.env` file.

Use separate environment files for client and server only when needed. Client-side environment variables must never contain secrets.

---

# 17. LOCAL DEVELOPMENT REQUIREMENTS

The README MUST explain:

1. Required Node.js version.
2. Required npm version or supported package manager.
3. MongoDB local installation or Atlas configuration.
4. How to obtain and configure a Gemini API key.
5. How to create environment files.
6. How to install dependencies.
7. How to start the backend.
8. How to start the frontend.
9. How to run tests.
10. How to troubleshoot common failures.

Expected development commands:

```bash
# Install dependencies from the repository root
npm install

# Start frontend and backend using the documented scripts
npm run dev
```

The root script MUST actually be configured to start both applications if the README advertises this command.

Also document separate client and server commands as a fallback.

---

# 18. SPEC-DRIVEN DEVELOPMENT WORKFLOW FOR CODEX

`SPEC.md` is the authoritative product and technical specification.

Codex MUST follow this workflow.

## Phase 1: Inspect and Plan

1. Read `SPEC.md` completely.
2. Inspect the existing repository before changing files.
3. Identify missing implementation components.
4. Create a concise implementation plan.
5. Identify ambiguities, dependencies, and architectural decisions.
6. Do not overwrite existing working code without inspection.

## Phase 2: Foundation

Implement:

- Repository configuration.
- Client and server setup.
- Environment validation.
- MongoDB connection.
- Express application.
- React routing.
- Tailwind configuration.
- Shared error handling.
- Health endpoint.

Verify that both applications start.

## Phase 3: Domain and API

Implement:

- Mongoose schemas.
- Request validators.
- Public serializers.
- Case routes.
- Evidence routes.
- Accusation routes.
- State transitions.
- Unit tests.

Do not begin by building only static UI screens.

## Phase 4: AI Integration

Implement:

- Gemini service.
- Structured generation prompts.
- Canonical case planning.
- Suspect generation.
- Evidence generation.
- Validation and bounded repair.
- Persistence.
- Mock provider for automated tests.

Verify the complete generation pipeline before integrating all frontend features.

## Phase 5: Frontend

Implement:

- Landing page.
- Mystery creation.
- Investigation workspace.
- Suspect directory.
- Evidence room.
- Evidence detail viewer.
- Accusation interface.
- Solution screen.
- Loading and error states.
- Responsive behavior.

Connect each screen to the actual backend API.

## Phase 6: Media

Implement the media-provider abstraction and the supported image-generation workflow.

Ensure that placeholder media is explicitly labeled and that failures do not corrupt otherwise valid cases.

## Phase 7: Testing and Hardening

Run:

- Linting.
- Unit tests.
- Integration tests.
- Production build.
- End-to-end acceptance checks where configured.

Fix critical failures before declaring the application complete.

## Phase 8: Documentation and Handoff

Update:

- README.
- API documentation.
- Environment example.
- Architecture notes.
- Decision records for meaningful deviations.

Report what is implemented, what has been tested, which commands succeeded, and which integrations require credentials.

## 18.1 Codex Rules

Codex MUST:

- Read the specification before implementation.
- Use this document as the default decision authority.
- Build working functionality, not merely a visual mockup.
- Avoid hard-coded fake API responses in production code.
- Use mocks only in tests or explicitly labeled development demos.
- Keep the canonical solution server-side.
- Use reusable components and services.
- Validate all model-generated content.
- Avoid adding unrequested frameworks or services.
- Run relevant tests after changing behavior.
- Report unimplemented features honestly.
- Never claim a test passed unless it was actually executed successfully.

If a requirement is genuinely ambiguous, document the assumption in `docs/DECISIONS.md`. Prefer the smallest implementation consistent with this specification.

If a proposed change materially alters a requirement, update `SPEC.md` first or together with the implementation.

Do not silently change the product contract.

---

# 19. DEFINITION OF DONE

A feature is complete only when:

1. Its behavior matches this specification.
2. Required frontend and backend integration works.
3. Input validation and error handling are implemented.
4. Sensitive information remains protected.
5. Relevant tests pass.
6. The feature works with actual application state.
7. Loading and failure states are implemented.
8. Documentation is updated when needed.

The project is complete when all MVP acceptance criteria pass and the application can be run locally using the documented instructions.

A polished landing page alone does not constitute a completed project.

---

# 20. FUTURE EXTENSIBILITY

Design the initial system so future features can be added without rewriting the core mystery engine.

Potential extensions include:

- Accounts and authentication.
- Persistent user libraries.
- Multiple attempts and scoring modes.
- Hint generation.
- Difficulty calibration.
- Evidence dependency graphs.
- Branching interrogations.
- Voice and audio evidence.
- Actual video generation.
- Multiplayer investigations.
- Community case sharing.
- Case ratings and quality feedback.
- Analytics for generation quality and failure rates.

These extensions MUST NOT be implemented ahead of critical MVP functionality unless they are needed to support a core requirement.

---

# 21. FINAL PRODUCT CONTRACT

The following rules are non-negotiable:

1. AI Mystery Room creates fictional investigations from user-provided scenarios.
2. The stack is React, Node.js, Express, MongoDB, and Google Gemini.
3. The backend owns case generation, canonical truth, validation, persistence, and verdict evaluation.
4. Every playable case has exactly one canonical culprit.
5. All public evidence must be consistent with the canonical case plan.
6. The player receives enough evidence to make a reasoned accusation.
7. The solution remains private until the configured reveal condition is satisfied.
8. AI-generated messages, images, and surveillance artifacts are clearly labeled as fictional.
9. The website must be functional, responsive, and secure enough for its intended MVP use.
10. Tests must verify critical behavior rather than only whether pages render.
11. API keys and private solution data must never be exposed to the frontend.
12. Any significant change to these rules requires an explicit specification update.

**This document is the single source of truth for AI Mystery Room. Codex must use it to plan, implement, validate, test, and document the application.**

End of specification.
