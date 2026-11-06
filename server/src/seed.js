import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Decision from "./models/Decision.js";
import Task from "./models/Task.js";
import { startOfToday, addDays } from "./utils/dates.js";

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("[Seed] Clearing existing decisions and tasks...");
    await Decision.deleteMany({});
    await Task.deleteMany({});

    const today = startOfToday();

    console.log("[Seed] Creating tasks...");
    const rawTasks = [
      {
        title: "Setup MongoDB schema and Mongoose models",
        description: "Design and implement the Decision and Task models with strict validation and indexes.",
        status: "Done",
        priority: "High",
        assignee: "Sarah Chen",
        dueDate: addDays(today, -10)
      },
      {
        title: "Implement database connection pooling and retry logic",
        description: "Ensure resilient MongoDB connections with automated reconnect and error logging.",
        status: "In Progress",
        priority: "Medium",
        assignee: "Alex Rivera",
        dueDate: addDays(today, 7)
      },
      {
        title: "Bootstrap React 18 client with Vite and Tailwind",
        description: "Configure modern frontend tooling, routing structure, and UI component layout.",
        status: "Done",
        priority: "High",
        assignee: "Priya Patel",
        dueDate: addDays(today, -5)
      },
      {
        title: "Implement JWT token rotation and cookie security",
        description: "Audit authentication flow for refresh token reuse detection and secure cookies.",
        status: "Todo",
        priority: "High",
        assignee: "David Kim",
        dueDate: addDays(today, 3)
      },
      {
        title: "Create Dockerfile and test Render deployment blueprint",
        description: "Containerize the Node.js application and prepare environment variables for Render.",
        status: "In Progress",
        priority: "Medium",
        assignee: "Elena Rostova",
        dueDate: addDays(today, 4)
      },
      {
        title: "Evaluate Turborepo pipeline caching bottlenecks",
        description: "Investigate build cache invalidation issues causing slow monorepo CI runtimes.",
        status: "Todo",
        priority: "Low",
        assignee: "Marcus Vance",
        dueDate: addDays(today, 10)
      },
      {
        title: "Migrate legacy GraphQL endpoints to REST resource controllers",
        description: "Standardize API responses and error formatting across all RESTful routes.",
        status: "Done",
        priority: "Low",
        assignee: "Jordan Lee",
        dueDate: addDays(today, -20)
      },
      {
        title: "Decommission self-hosted Jenkins worker instances",
        description: "Archive remaining build artifacts and shut down legacy EC2 build agents safely.",
        status: "Done",
        priority: "Low",
        assignee: "Elena Rostova",
        dueDate: addDays(today, -25)
      },
      {
        title: "Audit npm dependencies for critical security vulnerabilities",
        description: "Run npm audit fix and review third-party package licensing compliance.",
        status: "Todo",
        priority: "Medium",
        assignee: "Sarah Chen",
        dueDate: addDays(today, 14)
      },
      {
        title: "Configure end-to-end user acceptance testing suite",
        description: "Setup browser automation smoke tests to verify critical path workflows.",
        status: "Todo",
        priority: "Low",
        assignee: "Alex Rivera",
        dueDate: addDays(today, 21)
      }
    ];

    const createdTasks = await Task.insertMany(rawTasks);

    console.log("[Seed] Creating decisions...");
    const rawDecisions = [
      {
        title: "Use MongoDB instead of PostgreSQL",
        context:
          "The team evaluated database engines for storing flexible decision records and dynamic metadata. Rapid schema evolution is required during the early phases of the product.",
        options: [
          {
            name: "MongoDB",
            description: "Document database with flexible BSON schemas and powerful aggregation pipelines.",
            pros: ["Schemaless agility for evolving models", "Native JSON-like document querying", "Great Node.js ecosystem support"],
            cons: ["Lacks strict relational integrity", "Higher memory footprint compared to SQL"]
          },
          {
            name: "PostgreSQL",
            description: "Mature relational database with ACID compliance and JSONB capabilities.",
            pros: ["Strict referential integrity", "Rock-solid ecosystem and tooling"],
            cons: ["Schema migrations require stricter release planning", "More boilerplate for nested subdocuments"]
          },
          {
            name: "CouchDB",
            description: "NoSQL document store built for peer-to-peer web replication.",
            pros: ["Built-in HTTP REST API", "Offline synchronization capabilities"],
            cons: ["Smaller community and fewer maintained client libraries", "Less expressive aggregation engine"]
          }
        ],
        chosenOption: "MongoDB",
        rationale:
          "MongoDB provides the speed of iteration needed for polymorphic decision structures and options subdocuments. Its native document model aligns cleanly with Node.js and Express.",
        status: "Accepted",
        decidedBy: "Sarah Chen",
        decisionDate: addDays(today, -60),
        reviewDate: addDays(today, 45),
        needsReconsideration: false,
        reconsiderationReason: "",
        tags: ["database", "backend"],
        linkedTasks: [createdTasks[0]._id, createdTasks[1]._id]
      },
      {
        title: "Adopt React over Vue for the web client",
        context:
          "We evaluated single page application frameworks for DecisionLog's frontend. We needed high team velocity, excellent developer tooling, and strong ecosystem support.",
        options: [
          {
            name: "React",
            description: "Declarative component-based UI library backed by Meta and an extensive open-source community.",
            pros: ["Dominant industry standard with vast component ecosystem", "High team familiarity across existing engineers"],
            cons: ["Requires external libraries for routing and state management", "Frequent ecosystem shifts"]
          },
          {
            name: "Vue",
            description: "Progressive JavaScript framework featuring single-file components and official state solutions.",
            pros: ["Gentle learning curve and intuitive template syntax", "Official routing and state solutions"],
            cons: ["Smaller talent pool within our current organization", "Fewer enterprise third-party component suites"]
          }
        ],
        chosenOption: "React",
        rationale:
          "The engineering team already has deep production expertise with React 18, Vite, and standard hook patterns. Choosing React eliminates training overhead and accelerates feature delivery.",
        status: "Accepted",
        decidedBy: "Priya Patel",
        decisionDate: addDays(today, -40),
        reviewDate: addDays(today, 90),
        needsReconsideration: false,
        reconsiderationReason: "",
        tags: ["frontend"],
        linkedTasks: [createdTasks[0]._id, createdTasks[2]._id]
      },
      {
        title: "Use JWT for authentication",
        context:
          "A stateless authentication mechanism was requested to ease API scaling and facilitate multi-service access. Token lifetime and revocation complexity need ongoing monitoring.",
        options: [
          {
            name: "JWT",
            description: "Signed JSON Web Tokens passed in Authorization headers or HTTP-only cookies.",
            pros: ["Stateless validation without database lookups", "Compact and self-contained payload structure"],
            cons: ["Revocation before expiration requires a denylist", "Increased payload size per request"]
          },
          {
            name: "Session Cookies",
            description: "Opaque session identifiers validated against a centralized Redis or database store.",
            pros: ["Instant revocation on logout or compromise", "Minimal cookie overhead on the wire"],
            cons: ["Requires centralized shared session storage", "More operational complexity for horizontal scaling"]
          }
        ],
        chosenOption: "JWT",
        rationale:
          "JWT allowed simple initial decoupling of backend services without requiring a dedicated Redis cluster. It met immediate release deadlines while keeping the backend infrastructure lean.",
        status: "Accepted",
        decidedBy: "David Kim",
        decisionDate: addDays(today, -80),
        reviewDate: addDays(today, -12),
        needsReconsideration: false,
        reconsiderationReason: "",
        tags: ["security", "backend"],
        linkedTasks: [createdTasks[3]._id]
      },
      {
        title: "Deploy with Docker on Render",
        context:
          "We needed a predictable container runtime with zero DevOps overhead for staging and production web services. Render provides managed PostgreSQL, Redis, and Web Services.",
        options: [
          {
            name: "Render with Docker",
            description: "Containerized deployments managed via Git push hooks on Render cloud platform.",
            pros: ["Zero Kubernetes overhead for our current scale", "Automatic TLS certificates and preview environments"],
            cons: ["Vendor lock-in on custom features", "Limited fine-grained VPC networking controls"]
          },
          {
            name: "AWS ECS",
            description: "Elastic Container Service running Docker tasks on managed Fargate instances.",
            pros: ["Highly scalable enterprise infrastructure", "Direct integration with comprehensive AWS services"],
            cons: ["Significant IAM and CloudFormation setup overhead", "Higher baseline monthly operational cost"]
          }
        ],
        chosenOption: "Render with Docker",
        rationale:
          "Render provides standard Docker container support with zero server maintenance overhead. It enables fast continuous deployment while remaining portable enough to migrate to AWS later.",
        status: "Proposed",
        decidedBy: "Elena Rostova",
        decisionDate: addDays(today, -10),
        reviewDate: addDays(today, 5),
        needsReconsideration: false,
        reconsiderationReason: "",
        tags: ["devops"],
        linkedTasks: [createdTasks[4]._id]
      },
      {
        title: "Switch to a monorepo",
        context:
          "Managing separate repositories for the frontend client, backend server, and shared contracts created integration lag. A unified monorepo was proposed to synchronize pull requests.",
        options: [
          {
            name: "Monorepo with Turborepo",
            description: "Unified repository containing root orchestration, server, client, and shared packages.",
            pros: ["Atomic cross-boundary pull requests and commits", "Shared linting, formatting, and build caching"],
            cons: ["Increased repository clone size and CI complexity", "Tooling friction across mixed language teams"]
          },
          {
            name: "Polyrepo",
            description: "Independent Git repositories for each distinct service and frontend client application.",
            pros: ["Granular permissions and isolated deployment triggers", "Simpler standalone Git histories"],
            cons: ["High friction when breaking API contract changes happen", "Duplicated configuration across codebases"]
          }
        ],
        chosenOption: "Monorepo with Turborepo",
        rationale:
          "Consolidating frontend and backend code into one workspace streamlines developer onboarding and end-to-end testing. It prevents mismatched API contracts from reaching staging.",
        status: "Proposed",
        decidedBy: "Marcus Vance",
        decisionDate: addDays(today, -20),
        reviewDate: addDays(today, 11),
        needsReconsideration: true,
        reconsiderationReason:
          "Engineering velocity dipped after monorepo adoption due to flaky cache invalidation in CI and git merge conflicts.",
        tags: ["tooling"],
        linkedTasks: [createdTasks[5]._id]
      },
      {
        title: "Use REST instead of GraphQL",
        context:
          "An early proof-of-concept considered GraphQL for fine-grained field selection in mobile and web clients. The team reassessed architectural simplicity and HTTP caching benefits.",
        options: [
          {
            name: "REST",
            description: "Standard HTTP RESTful endpoints returning resource-oriented JSON representations.",
            pros: ["Ubiquitous HTTP caching, CDN compatibility, and simplicity", "Zero schema compiler overhead"],
            cons: ["Potential for over-fetching or under-fetching", "Multiple endpoints required for compound resources"]
          },
          {
            name: "GraphQL",
            description: "Schema-driven query language allowing clients to declare exact data requirements.",
            pros: ["Single round-trip queries for complex relational graphs", "Strongly-typed introspection"],
            cons: ["Complex server-side caching and rate-limiting", "N+1 database query pitfalls without DataLoader"]
          }
        ],
        chosenOption: "REST",
        rationale:
          "Standard REST endpoints combined with Express validators proved dramatically simpler to build and debug. The caching advantages and low tooling overhead outweighed GraphQL's query flexibility.",
        status: "Superseded",
        decidedBy: "Jordan Lee",
        decisionDate: addDays(today, -150),
        reviewDate: addDays(today, 120),
        needsReconsideration: false,
        reconsiderationReason: "",
        tags: ["api"],
        linkedTasks: [createdTasks[6]._id]
      },
      {
        title: "Use Jenkins for CI",
        context:
          "Initial CI/CD pipelines ran on an internal self-hosted Jenkins server configured with bespoke Groovy scripts. Maintenance overhead and server patching became unsustainable.",
        options: [
          {
            name: "Jenkins",
            description: "Self-hosted open-source automation server supporting extensible custom plugins.",
            pros: ["Fully customizable pipeline scripts and local compute", "No per-minute cloud billing constraints"],
            cons: ["Heavy server maintenance, patching, and disk maintenance", "Fragile plugin dependency conflicts"]
          },
          {
            name: "GitHub Actions",
            description: "Cloud-hosted workflow runners integrated directly with GitHub pull requests.",
            pros: ["Zero infrastructure maintenance for hosted runners", "Seamless GitHub marketplace action integration"],
            cons: ["Execution minute quotas and billing management", "Limited on-premise runner customization"]
          }
        ],
        chosenOption: "Jenkins",
        rationale:
          "Jenkins was selected initially due to existing internal infrastructure and zero external license fees. However, ongoing maintenance burden led to its deprecation in favor of modern managed CI.",
        status: "Deprecated",
        decidedBy: "Elena Rostova",
        decisionDate: addDays(today, -200),
        reviewDate: addDays(today, -30),
        needsReconsideration: false,
        reconsiderationReason: "",
        tags: ["devops", "tooling"],
        linkedTasks: [createdTasks[7]._id]
      }
    ];

    const createdDecisions = await Decision.insertMany(rawDecisions);

    console.log("[Seed] Syncing two-way links between Decisions and Tasks...");
    // Link tasks to decisions
    // Task 0 is linked to Decision 0 and Decision 1
    await Task.updateOne(
      { _id: createdTasks[0]._id },
      { $addToSet: { linkedDecisions: { $each: [createdDecisions[0]._id, createdDecisions[1]._id] } } }
    );
    // Task 1 -> Decision 0
    await Task.updateOne(
      { _id: createdTasks[1]._id },
      { $addToSet: { linkedDecisions: createdDecisions[0]._id } }
    );
    // Task 2 -> Decision 1
    await Task.updateOne(
      { _id: createdTasks[2]._id },
      { $addToSet: { linkedDecisions: createdDecisions[1]._id } }
    );
    // Task 3 -> Decision 2
    await Task.updateOne(
      { _id: createdTasks[3]._id },
      { $addToSet: { linkedDecisions: createdDecisions[2]._id } }
    );
    // Task 4 -> Decision 3
    await Task.updateOne(
      { _id: createdTasks[4]._id },
      { $addToSet: { linkedDecisions: createdDecisions[3]._id } }
    );
    // Task 5 -> Decision 4
    await Task.updateOne(
      { _id: createdTasks[5]._id },
      { $addToSet: { linkedDecisions: createdDecisions[4]._id } }
    );
    // Task 6 -> Decision 5
    await Task.updateOne(
      { _id: createdTasks[6]._id },
      { $addToSet: { linkedDecisions: createdDecisions[5]._id } }
    );
    // Task 7 -> Decision 6
    await Task.updateOne(
      { _id: createdTasks[7]._id },
      { $addToSet: { linkedDecisions: createdDecisions[6]._id } }
    );
    // Task 8 and Task 9 remain unlinked (2 unlinked tasks)

    console.log(`[Seed] Successfully seeded:`);
    console.log(`  - ${createdDecisions.length} Decisions`);
    console.log(`  - ${createdTasks.length} Tasks`);
    console.log(`  - 2 unlinked tasks (Task 9, Task 10)`);
    console.log(`  - 1 task linked to 2 decisions (Task 1)`);

    await mongoose.connection.close();
    console.log("[Seed] Database disconnected. Seeding complete.");
  } catch (error) {
    console.error("[Seed Error] Failed to seed database:", error);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  seedDatabase();
}

export default seedDatabase;

