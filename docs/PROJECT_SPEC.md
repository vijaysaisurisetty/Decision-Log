## 1. WHAT THE PROJECT IS
Project teams forget why a technical or product decision was made, so they repeat old debates. DecisionLog is a project decision record. Each decision stores: context, the options considered (with pros and cons), the chosen approach with rationale, and a review date. Decisions are linked to tasks. A decision that needs another look can be marked "Needs Reconsideration", and the app also flags it automatically when its review date has passed.

## 2. FIRST ACTION: SAVE THIS SPEC
Before writing code, create docs/PROJECT_SPEC.md. Copy sections 1 to 9 of this prompt into it word for word. Future prompts will read this file.

## 3. TECH STACK AND VERSIONS
Backend: Node.js + Express 4, Mongoose 8, express-validator 7, cors, dotenv, morgan, helmet, express-rate-limit, nodemon (dev).
Frontend (built in Prompt 2): React 18 + Vite 5, React Router 6, Axios, lucide-react.
Database: MongoDB.
Root: a package.json with "concurrently" so one command runs both apps.

## 4. FOLDER STRUCTURE (create exactly this)
decisionlog/
  README.md                      (written in Prompt 3)
  .gitignore                     (node_modules, .env, dist, logs)
  package.json                   (root scripts: "dev": runs server and client together with concurrently, "seed": npm --prefix server run seed, "install:all": installs root, server and client)
  docker-compose.yml             (mongo:7 service on port 27017 with a named volume)
  docs/PROJECT_SPEC.md
  server/
    package.json                 (scripts: dev = nodemon src/server.js, start = node src/server.js, seed = node src/seed.js, smoke = node scripts/smoke-test.js)
    .env.example
    .env                         (copy of .env.example so it runs immediately)
    scripts/smoke-test.js
    src/
      server.js                  (load env, connect DB, start listening, graceful shutdown on SIGINT/SIGTERM, handle unhandledRejection)
      app.js                     (express app, middleware, routes, 404, error handler)
      config/db.js               (mongoose.connect with clear log messages and exit(1) on failure)
      models/Decision.js
      models/Task.js
      controllers/decisionController.js
      controllers/taskController.js
      routes/decisionRoutes.js
      routes/taskRoutes.js
      middleware/validate.js
      middleware/errorHandler.js     (exports notFound and errorHandler)
      validators/decisionValidators.js
      validators/taskValidators.js
      utils/AppError.js
      utils/asyncHandler.js
      utils/sanitize.js              (stripTags and cleanString helpers)
      utils/dates.js                 (startOfToday, addDays, daysBetween)
      utils/decisionFlags.js         (withFlags helper, see section 7)
      seed.js

server/.env.example:
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/decisionlog
  CLIENT_ORIGIN=http://localhost:5173
  NODE_ENV=development
  RATE_LIMIT_MAX=1000
(In production the default RATE_LIMIT_MAX is 100 per 15 minutes per IP. In development use 1000 so normal testing is not blocked.)

## 5. DATA MODELS

### Decision (server/src/models/Decision.js)
Fields:
- title: String, required, trim, 3 to 150 chars.
- context: String, required, trim, 10 to 3000 chars.
- options: array of subdocuments with { _id: false }, minimum 2 items, maximum 10:
    - name: String, required, trim, 1 to 100 chars
    - description: String, trim, max 1000, default ""
    - pros: [String] (each trimmed, 1 to 300 chars, max 10 items)
    - cons: [String] (same rules)
  Option names must be unique inside one decision (case-insensitive). Add a schema validator for this.
- chosenOption: String, required, trim. It must equal the name of one of the options (case-sensitive, after trim). Add a schema validator using "this".
- rationale: String, required, trim, 10 to 3000 chars.
- status: enum ["Proposed","Accepted","Superseded","Deprecated"], default "Proposed".
- decidedBy: String, required, trim, 2 to 100 chars.
- decisionDate: Date, required, default Date.now.
- reviewDate: Date, required. It must be on or after decisionDate (schema validator).
- needsReconsideration: Boolean, default false.
- reconsiderationReason: String, trim, max 1000, default "". Required (min 5 chars) when needsReconsideration is true. Cleared when it is false.
- tags: [String], each lowercase and trimmed, 1 to 30 chars, maximum 10 tags, no duplicates (remove duplicates in a setter).
- linkedTasks: [{ type: ObjectId, ref: "Task" }]
- timestamps: true.

Virtuals (toJSON and toObject must have virtuals: true, and remove __v):
- isReviewOverdue: true if reviewDate is before the start of today AND status is "Accepted" or "Proposed".

Indexes:
- text index on title, context, rationale (weights: title 5, rationale 2, context 1).
- single indexes on status, reviewDate, needsReconsideration, tags.
- unique index on title with collation { locale: "en", strength: 2 } (case-insensitive unique title).

### Task (server/src/models/Task.js)
- title: String, required, trim, 3 to 150 chars.
- description: String, trim, max 2000, default "".
- status: enum ["Todo","In Progress","Done"], default "Todo".
- priority: enum ["Low","Medium","High"], default "Medium".
- assignee: String, trim, max 100, default "".
- dueDate: Date, optional (null allowed).
- linkedDecisions: [{ type: ObjectId, ref: "Decision" }]
- timestamps: true.
- Indexes: text index on title and description; single indexes on status and priority.

### Link consistency (very important)
Links between Decision and Task are two-way and must always match.
- Link: Decision.updateOne({ $addToSet: { linkedTasks: taskId } }) and Task.updateOne({ $addToSet: { linkedDecisions: decisionId } }). $addToSet makes duplicate links harmless. A duplicate link returns 200 with the current decision (not an error).
- Unlink: use $pull on both sides. Unlinking something that is not linked also returns 200.
- Before linking, check both documents exist. If one is missing, return 404 with a clear message ("Task not found" or "Decision not found").
- Delete a decision: first Task.updateMany({ linkedDecisions: id }, { $pull: { linkedDecisions: id } }), then delete.
- Delete a task: first Decision.updateMany({ linkedTasks: id }, { $pull: { linkedTasks: id } }), then delete.
- Do NOT use MongoDB transactions (a local standalone MongoDB does not support them). Do the steps in a safe order.
- POST and PUT on decisions and tasks IGNORE the linkedTasks and linkedDecisions fields in the request body. Links are changed only with the link/unlink endpoints.

## 6. REST API (base path /api)
Success response shape: { "success": true, "data": ..., "message": "optional" }. List responses also have "pagination".

### Decisions
1. GET /api/decisions
   Query params (all optional, all validated):
   - search (string, max 100): uses MongoDB $text search.
   - status: one enum value.
   - tag: one tag (lowercased before matching).
   - needsReconsideration: "true" or "false".
   - overdue: "true" or "false". Overdue = reviewDate < start of today AND status in [Proposed, Accepted]. "false" means NOT overdue.
   - flagged: "true" returns decisions where needsReconsideration is true OR overdue.
   - dueWithinDays: integer 1 to 365. Returns decisions with reviewDate from start of today up to the end of day today + N, status in [Proposed, Accepted].
   - sortBy: reviewDate | decisionDate | createdAt | title (default createdAt)
   - order: asc | desc (default desc)
   - page: integer >= 1 (default 1)
   - limit: integer 1 to 50 (default 10)
   Build an array of condition objects and combine them with $and so filters never overwrite each other. Escape nothing for $text. Use .lean() and run results through withFlags (section 7). Return: { success: true, data: [...], pagination: { page, limit, total, totalPages } }.
   In list items, do not populate linkedTasks; instead add "linkedTaskCount" (the array length) and keep "linkedTasks" as an array of ids.
2. GET /api/decisions/stats returns data: { total, byStatus: { Proposed, Accepted, Superseded, Deprecated } (always all four keys, zero if none), needsReconsideration (manual count), overdueReviews, upcomingReviews (next 14 days), flagged (manual OR overdue, no double counting) }. Use countDocuments or one aggregation.
3. GET /api/decisions/tags returns data: sorted array of distinct tags (use Decision.distinct).
   IMPORTANT: register /stats and /tags BEFORE /:id so they are not treated as ids.
4. GET /api/decisions/:id returns the full decision with linkedTasks populated (select: title status priority assignee dueDate) and withFlags applied. 404 if missing.
5. POST /api/decisions creates a decision. 201. 409 if the title already exists (case-insensitive). Check first for a friendly message, and also handle Mongo duplicate key error 11000 in the error handler.
6. PUT /api/decisions/:id full update with the same validation as create. Load the document, assign allowed fields, call save() so schema validators run. 409 on duplicate title (ignore itself).
7. DELETE /api/decisions/:id removes references from tasks and deletes. Return { success: true, message: "Decision deleted" }.
8. PATCH /api/decisions/:id/reconsider with body { needsReconsideration: boolean, reason: string }. When true, reason is required (5 to 1000 chars). When false, clear the reason. Return the updated decision.
9. POST /api/decisions/:id/tasks/:taskId links a task. Returns the updated decision (populated).
10. DELETE /api/decisions/:id/tasks/:taskId unlinks a task. Returns the updated decision (populated).

### Tasks
1. GET /api/tasks with query: status, priority, search (text), unlinked ("true" = tasks with no linked decisions), page, limit (default 10, max 50), sortBy (createdAt | dueDate | title | priority; default createdAt), order. Populate linkedDecisions with select "title status" so the UI can show links. Return with pagination.
2. GET /api/tasks/:id with linkedDecisions populated (title status reviewDate).
3. POST /api/tasks (201).
4. PUT /api/tasks/:id (full update).
5. DELETE /api/tasks/:id (cleans references).

### Other
GET /api/health returns { "status": "ok", "uptime": <seconds> }.
Unknown routes return 404 in the standard error shape: { success:false, message:"Route not found: GET /api/xyz" }.

## 7. COMPUTED FIELDS (utils/decisionFlags.js)
Export withFlags(decisionObject). Lean queries do not include virtuals, so this helper adds, on a plain object:
- isReviewOverdue (boolean, same rule as the virtual)
- daysUntilReview (integer; negative when overdue; computed from start of today to the start of the reviewDate day)
- reconsiderationFlag: true if needsReconsideration OR isReviewOverdue
- flagReason: "Marked manually" if needsReconsideration is true; otherwise "Review date passed" if overdue; otherwise null. (If both are true, use "Marked manually".)
Use withFlags in every decision response (list, detail, create, update, patch, link, unlink).

## 8. VALIDATION, SANITIZING, ERRORS, SECURITY

### Validation (validators/*.js + middleware/validate.js)
- Validate every body field, every :id param (isMongoId), and every query param. Unknown enum values are rejected with 400. Unknown query params are ignored.
- validate.js collects results with validationResult and throws AppError(400, "Validation failed", errors) where errors = [{ field, message }]. Field names use express-validator paths such as "title" or "options[1].name".
- Messages must be human friendly, for example "Title must be 3-150 characters", "Add at least 2 options", "Chosen option must match one of the options", "Review date cannot be before the decision date", "Reason is required when marking for reconsideration".
- Custom checks: options array length 2 to 10; option names unique (case-insensitive); chosenOption equals one option name; reviewDate >= decisionDate; tags max 10 and each 1 to 30 chars; dates must be valid ISO dates.
- Sanitizing: for every string, strip HTML tags with a small function (replace /<[^>]*>/g with "") and trim. Do this in the validators with .customSanitizer(). Do NOT HTML-escape (React already escapes on render, and escaping would show &amp; in the UI).

### Error format (ONE format everywhere)
{ "success": false, "message": "Validation failed", "errors": [ { "field": "title", "message": "Title must be 3-150 characters" } ] }
"errors" is omitted for non-validation errors.
- AppError(statusCode, message, errors?) class. asyncHandler wraps all controllers (no try/catch in controllers).
- errorHandler converts: Mongoose ValidationError to 400 with per-field errors; CastError to 400 "Invalid <field>: <value>"; duplicate key 11000 to 409 "A decision with this title already exists"; malformed JSON body to 400 "Invalid JSON body"; payload too large to 413; everything else to 500 "Something went wrong".
- In production (NODE_ENV=production) never send stack traces. In development include "stack" in the 500 response only.
- Status codes: 200, 201, 400, 404, 409, 413, 500.

### Security and middleware order (app.js)
helmet, cors({ origin: CLIENT_ORIGIN, credentials: true }), express.json({ limit: "100kb" }), morgan("dev") in development, rate limiter on /api (windowMs 15 minutes, max from RATE_LIMIT_MAX, standard JSON error body on limit), routes, notFound, errorHandler.

## 9. SEED DATA (src/seed.js)
- Connect, delete all Decisions and Tasks, insert data, link them in BOTH directions, print a summary, disconnect.
- Use dates relative to today (use utils/dates.js) so the data stays correct whenever it runs.
- Insert at least 7 realistic decisions (titles must be unique):
  1. "Use MongoDB instead of PostgreSQL" (Accepted, review in +45 days, 3 options, tags: database, backend)
  2. "Adopt React over Vue for the web client" (Accepted, review in +90 days, tags: frontend)
  3. "Use JWT for authentication" (Accepted, OVERDUE: review date 12 days ago, tags: security, backend)
  4. "Deploy with Docker on Render" (Proposed, review in +5 days, tags: devops)
  5. "Switch to a monorepo" (Proposed, review in +11 days, MANUALLY FLAGGED with reconsiderationReason, tags: tooling)
  6. "Use REST instead of GraphQL" (Superseded, review in +120 days, tags: api)
  7. "Use Jenkins for CI" (Deprecated, review in -30 days, tags: devops, tooling)
  Each decision has 2 to 3 options with 1 to 3 pros and cons each, a meaningful context and rationale (at least 2 sentences), a realistic decidedBy name, and a decisionDate in the past.
- Insert at least 10 tasks with a mix of status and priority, assignees, and due dates; 2 tasks must have no linked decisions. Every decision links to 1 to 3 tasks. One task links to two decisions.

