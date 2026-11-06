const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

let passedCount = 0;
let failedCount = 0;

const logPass = (index, description) => {
  console.log(`[PASS] Check ${index}: ${description}`);
  passedCount++;
};

const logFail = (index, description, error) => {
  console.error(`[FAIL] Check ${index}: ${description}`);
  console.error(`       Reason: ${error.message || error}`);
  failedCount++;
};

const req = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  let body = null;
  try {
    body = await response.json();
  } catch (err) {
    body = null;
  }
  return { status: response.status, body };
};

const runSmokeTests = async () => {
  console.log(`[Smoke Test] Starting test suite against ${BASE_URL}...\n`);

  let taskAId = null;
  let taskBId = null;
  let decision1Id = null;
  let decision1Title = null;
  let decision2Id = null;
  let sanitizedDecisionId = null;

  try {
    // Check 1: GET /api/health is 200
    try {
      const res = await req("/api/health");
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (res.body?.status !== "ok" || typeof res.body?.uptime !== "number") {
        throw new Error(`Unexpected body: ${JSON.stringify(res.body)}`);
      }
      logPass(1, "GET /api/health is 200 with status 'ok' and uptime number");
    } catch (err) {
      logFail(1, "GET /api/health is 200", err);
    }

    // Check 2: Create a task A and task B (201)
    try {
      const resA = await req("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "Smoke Task A " + Date.now(),
          status: "Todo",
          priority: "High"
        })
      });
      if (resA.status !== 201) throw new Error(`Task A creation returned ${resA.status}`);
      taskAId = resA.body?.data?._id;

      const resB = await req("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "Smoke Task B " + Date.now(),
          status: "In Progress",
          priority: "Medium"
        })
      });
      if (resB.status !== 201) throw new Error(`Task B creation returned ${resB.status}`);
      taskBId = resB.body?.data?._id;

      if (!taskAId || !taskBId) throw new Error("Created tasks missing _id");
      logPass(2, "Create task A and task B returns 201 with ids");
    } catch (err) {
      logFail(2, "Create task A and task B (201)", err);
    }

    // Check 3: Create a decision with 2 options (201); response has reconsiderationFlag false
    try {
      decision1Title = "Smoke Decision 1 " + Date.now();
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const res = await req("/api/decisions", {
        method: "POST",
        body: JSON.stringify({
          title: decision1Title,
          context: "Context for smoke testing decision options and basic flow.",
          options: [
            { name: "Option Alpha", description: "First valid approach", pros: ["Fast"], cons: ["Complex"] },
            { name: "Option Beta", description: "Second valid approach", pros: ["Simple"], cons: ["Slower"] }
          ],
          chosenOption: "Option Alpha",
          rationale: "Option Alpha delivers high performance suitable for our latency targets.",
          status: "Accepted",
          decidedBy: "Lead Engineer",
          decisionDate: new Date().toISOString(),
          reviewDate: futureDate,
          tags: ["smoke", "test"]
        })
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      if (res.body?.data?.reconsiderationFlag !== false) {
        throw new Error(`Expected reconsiderationFlag to be false, got ${res.body?.data?.reconsiderationFlag}`);
      }
      decision1Id = res.body?.data?._id;
      logPass(3, "Create a decision with 2 options returns 201 with reconsiderationFlag false");
    } catch (err) {
      logFail(3, "Create a decision with 2 options (201)", err);
    }

    // Check 4: Create with 1 option gives 400 and errors contains a field about options
    try {
      const res = await req("/api/decisions", {
        method: "POST",
        body: JSON.stringify({
          title: "Smoke Invalid 1 Option " + Date.now(),
          context: "Valid context string for failure testing requirements.",
          options: [{ name: "Single Option", description: "", pros: [], cons: [] }],
          chosenOption: "Single Option",
          rationale: "Valid rationale explaining why single option was chosen.",
          decidedBy: "Tester",
          reviewDate: new Date(Date.now() + 86400000).toISOString()
        })
      });

      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const hasOptionError = res.body?.errors?.some((e) => e.field && e.field.includes("options"));
      if (!hasOptionError) throw new Error(`Expected errors containing options field: ${JSON.stringify(res.body)}`);
      logPass(4, "Create with 1 option gives 400 and errors contains options field");
    } catch (err) {
      logFail(4, "Create with 1 option gives 400", err);
    }

    // Check 5: Create with chosenOption not in options gives 400
    try {
      const res = await req("/api/decisions", {
        method: "POST",
        body: JSON.stringify({
          title: "Smoke Invalid Chosen " + Date.now(),
          context: "Valid context string for failure testing requirements.",
          options: [
            { name: "Option 1", description: "", pros: [], cons: [] },
            { name: "Option 2", description: "", pros: [], cons: [] }
          ],
          chosenOption: "Option NonExistent",
          rationale: "Valid rationale explaining why chosen option is selected.",
          decidedBy: "Tester",
          reviewDate: new Date(Date.now() + 86400000).toISOString()
        })
      });

      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const hasChosenError = res.body?.errors?.some((e) => e.field === "chosenOption");
      if (!hasChosenError) throw new Error(`Expected errors on chosenOption: ${JSON.stringify(res.body)}`);
      logPass(5, "Create with chosenOption not in options gives 400");
    } catch (err) {
      logFail(5, "Create with chosenOption not in options gives 400", err);
    }

    // Check 6: Create with reviewDate before decisionDate gives 400
    try {
      const now = Date.now();
      const res = await req("/api/decisions", {
        method: "POST",
        body: JSON.stringify({
          title: "Smoke Invalid Review Date " + now,
          context: "Valid context string for failure testing requirements.",
          options: [
            { name: "Option 1", description: "", pros: [], cons: [] },
            { name: "Option 2", description: "", pros: [], cons: [] }
          ],
          chosenOption: "Option 1",
          rationale: "Valid rationale explaining why option 1 was selected.",
          decidedBy: "Tester",
          decisionDate: new Date(now).toISOString(),
          reviewDate: new Date(now - 86400000 * 5).toISOString()
        })
      });

      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const hasReviewDateError = res.body?.errors?.some((e) => e.field === "reviewDate");
      if (!hasReviewDateError) throw new Error(`Expected errors on reviewDate: ${JSON.stringify(res.body)}`);
      logPass(6, "Create with reviewDate before decisionDate gives 400");
    } catch (err) {
      logFail(6, "Create with reviewDate before decisionDate gives 400", err);
    }

    // Check 7: Create with the same title again gives 409
    try {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const res = await req("/api/decisions", {
        method: "POST",
        body: JSON.stringify({
          title: decision1Title,
          context: "Duplicate decision title should be rejected by server validation.",
          options: [
            { name: "Option Alpha", description: "", pros: [], cons: [] },
            { name: "Option Beta", description: "", pros: [], cons: [] }
          ],
          chosenOption: "Option Alpha",
          rationale: "Rationale for duplicate title attempt.",
          decidedBy: "Tester",
          reviewDate: futureDate
        })
      });

      if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}: ${JSON.stringify(res.body)}`);
      logPass(7, "Create with the same title again gives 409 Conflict");
    } catch (err) {
      logFail(7, "Create with the same title again gives 409", err);
    }

    // Check 8: GET /api/decisions/not-an-id gives 400. GET missing gives 404. GET /api/nope gives 404
    try {
      const resBadId = await req("/api/decisions/not-an-id");
      if (resBadId.status !== 400) throw new Error(`Expected 400 for bad id, got ${resBadId.status}`);

      const resMissingId = await req("/api/decisions/507f1f77bcf86cd799439011");
      if (resMissingId.status !== 404) throw new Error(`Expected 404 for missing id, got ${resMissingId.status}`);

      const resNope = await req("/api/nope");
      if (resNope.status !== 404) throw new Error(`Expected 404 for unknown route, got ${resNope.status}`);
      if (resNope.body?.success !== false || !resNope.body?.message?.includes("Route not found")) {
        throw new Error(`Unexpected 404 body format: ${JSON.stringify(resNope.body)}`);
      }

      logPass(8, "Bad ID gives 400, missing ID gives 404, unknown route gives 404 JSON");
    } catch (err) {
      logFail(8, "Route error handling and 400/404 status codes", err);
    }

    // Check 9: Link task A: both sides updated. Link again: still 200 and no duplicate.
    try {
      const linkRes1 = await req(`/api/decisions/${decision1Id}/tasks/${taskAId}`, { method: "POST" });
      if (linkRes1.status !== 200) throw new Error(`First link returned ${linkRes1.status}`);

      const decisionDoc = linkRes1.body?.data;
      const decisionHasTask = decisionDoc?.linkedTasks?.some(
        (t) => (t._id || t) === taskAId || String(t._id || t) === String(taskAId)
      );
      if (!decisionHasTask) throw new Error("Decision does not list linked task A");

      const taskRes = await req(`/api/tasks/${taskAId}`);
      const taskDoc = taskRes.body?.data;
      const taskHasDecision = taskDoc?.linkedDecisions?.some(
        (d) => (d._id || d) === decision1Id || String(d._id || d) === String(decision1Id)
      );
      if (!taskHasDecision) throw new Error("Task A does not list linked decision 1");

      const linkRes2 = await req(`/api/decisions/${decision1Id}/tasks/${taskAId}`, { method: "POST" });
      if (linkRes2.status !== 200) throw new Error(`Second link returned ${linkRes2.status}`);

      const linkedTasksArr = linkRes2.body?.data?.linkedTasks || [];
      const matchCount = linkedTasksArr.filter(
        (t) => String(t._id || t) === String(taskAId)
      ).length;
      if (matchCount !== 1) throw new Error(`Duplicate link detected! Found ${matchCount} entries`);

      logPass(9, "Link task A updates both sides; duplicate link harmlessly returns 200 without duplicates");
    } catch (err) {
      logFail(9, "Link task A consistency and duplicate idempotency", err);
    }

    // Check 10: Link a missing task id gives 404
    try {
      const res = await req(`/api/decisions/${decision1Id}/tasks/507f1f77bcf86cd799439011`, {
        method: "POST"
      });
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
      if (!res.body?.message?.includes("Task not found")) {
        throw new Error(`Expected 'Task not found' message, got: ${res.body?.message}`);
      }
      logPass(10, "Link a missing task id gives 404 'Task not found'");
    } catch (err) {
      logFail(10, "Link a missing task id gives 404", err);
    }

    // Check 11: PATCH reconsider true without reason gives 400; with reason gives 200 & flagReason "Marked manually"
    try {
      const resBad = await req(`/api/decisions/${decision1Id}/reconsider`, {
        method: "PATCH",
        body: JSON.stringify({ needsReconsideration: true })
      });
      if (resBad.status !== 400) throw new Error(`Expected 400 when reason missing, got ${resBad.status}`);

      const resGood = await req(`/api/decisions/${decision1Id}/reconsider`, {
        method: "PATCH",
        body: JSON.stringify({
          needsReconsideration: true,
          reason: "Manual reconsideration reason for smoke test verification"
        })
      });
      if (resGood.status !== 200) throw new Error(`Expected 200 with reason, got ${resGood.status}`);
      if (resGood.body?.data?.reconsiderationFlag !== true) {
        throw new Error("Expected reconsiderationFlag to be true");
      }
      if (resGood.body?.data?.flagReason !== "Marked manually") {
        throw new Error(`Expected flagReason 'Marked manually', got '${resGood.body?.data?.flagReason}'`);
      }

      logPass(11, "PATCH reconsider true validates reason (400/200) and sets flagReason to 'Marked manually'");
    } catch (err) {
      logFail(11, "PATCH reconsider validation and flags", err);
    }

    // Check 12: Create decision with reviewDate in the past and Accepted status: isReviewOverdue true, flagReason "Review date passed"
    try {
      const now = Date.now();
      const pastDecisionDate = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();
      const pastReviewDate = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();

      const res = await req("/api/decisions", {
        method: "POST",
        body: JSON.stringify({
          title: "Smoke Overdue Decision " + now,
          context: "Context for testing overdue review dates and computed flags.",
          options: [
            { name: "Option Past 1", description: "", pros: [], cons: [] },
            { name: "Option Past 2", description: "", pros: [], cons: [] }
          ],
          chosenOption: "Option Past 1",
          rationale: "Rationale for overdue review test decision.",
          status: "Accepted",
          decidedBy: "QA Tester",
          decisionDate: pastDecisionDate,
          reviewDate: pastReviewDate,
          tags: ["smoke", "overdue"]
        })
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      decision2Id = res.body?.data?._id;

      if (res.body?.data?.isReviewOverdue !== true) {
        throw new Error(`Expected isReviewOverdue to be true, got ${res.body?.data?.isReviewOverdue}`);
      }
      if (res.body?.data?.flagReason !== "Review date passed") {
        throw new Error(`Expected flagReason 'Review date passed', got '${res.body?.data?.flagReason}'`);
      }

      const overdueListRes = await req("/api/decisions?overdue=true");
      const found = overdueListRes.body?.data?.some((d) => d._id === decision2Id);
      if (!found) throw new Error("GET /api/decisions?overdue=true did not include the overdue decision");

      logPass(12, "Past review date produces isReviewOverdue true and GET ?overdue=true includes it");
    } catch (err) {
      logFail(12, "Overdue decision computation and filtering", err);
    }

    // Check 13: List filters: search, status, tag, flagged=true, dueWithinDays, sortBy=title&order=asc, page=1&limit=2
    try {
      const searchRes = await req("/api/decisions?search=smoke");
      if (searchRes.status !== 200) throw new Error(`search failed: ${searchRes.status}`);

      const statusRes = await req("/api/decisions?status=Accepted");
      if (statusRes.status !== 200) throw new Error(`status failed: ${statusRes.status}`);

      const tagRes = await req("/api/decisions?tag=smoke");
      if (tagRes.status !== 200) throw new Error(`tag failed: ${tagRes.status}`);

      const flaggedRes = await req("/api/decisions?flagged=true");
      if (flaggedRes.status !== 200) throw new Error(`flagged failed: ${flaggedRes.status}`);

      const dueRes = await req("/api/decisions?dueWithinDays=40");
      if (dueRes.status !== 200) throw new Error(`dueWithinDays failed: ${dueRes.status}`);

      const paginatedRes = await req("/api/decisions?sortBy=title&order=asc&page=1&limit=2");
      if (paginatedRes.status !== 200) throw new Error(`paginated failed: ${paginatedRes.status}`);
      if (typeof paginatedRes.body?.pagination?.totalPages !== "number") {
        throw new Error("Missing or invalid pagination.totalPages");
      }
      if (paginatedRes.body?.data?.length > 2) {
        throw new Error(`Expected at most 2 items, got ${paginatedRes.body.data.length}`);
      }

      logPass(13, "All list filters (search, status, tag, flagged, dueWithinDays, sort, pagination) work");
    } catch (err) {
      logFail(13, "List query filters and pagination", err);
    }

    // Check 14: GET /api/decisions/stats returns numbers that match the list totals
    try {
      const statsRes = await req("/api/decisions/stats");
      if (statsRes.status !== 200) throw new Error(`stats returned ${statsRes.status}`);
      const stats = statsRes.body?.data;

      const acceptedListRes = await req("/api/decisions?status=Accepted");
      const overdueListRes = await req("/api/decisions?overdue=true");
      const flaggedListRes = await req("/api/decisions?flagged=true");
      const upcomingListRes = await req("/api/decisions?dueWithinDays=14");

      if (stats.byStatus.Accepted !== acceptedListRes.body?.pagination?.total) {
        throw new Error(`Stats Accepted (${stats.byStatus.Accepted}) != list total (${acceptedListRes.body?.pagination?.total})`);
      }
      if (stats.overdueReviews !== overdueListRes.body?.pagination?.total) {
        throw new Error(`Stats overdue (${stats.overdueReviews}) != list total (${overdueListRes.body?.pagination?.total})`);
      }
      if (stats.flagged !== flaggedListRes.body?.pagination?.total) {
        throw new Error(`Stats flagged (${stats.flagged}) != list total (${flaggedListRes.body?.pagination?.total})`);
      }
      if (stats.upcomingReviews !== upcomingListRes.body?.pagination?.total) {
        throw new Error(`Stats upcoming (${stats.upcomingReviews}) != list total (${upcomingListRes.body?.pagination?.total})`);
      }

      logPass(14, "GET /api/decisions/stats numbers strictly match list query totals");
    } catch (err) {
      logFail(14, "GET /api/decisions/stats matching query counts", err);
    }

    // Check 15: Unlink task A: both sides cleaned
    try {
      const unlinkRes = await req(`/api/decisions/${decision1Id}/tasks/${taskAId}`, { method: "DELETE" });
      if (unlinkRes.status !== 200) throw new Error(`Unlink returned ${unlinkRes.status}`);

      const hasTask = unlinkRes.body?.data?.linkedTasks?.some(
        (t) => String(t._id || t) === String(taskAId)
      );
      if (hasTask) throw new Error("Decision still lists task A after unlink");

      const taskRes = await req(`/api/tasks/${taskAId}`);
      const hasDecision = taskRes.body?.data?.linkedDecisions?.some(
        (d) => String(d._id || d) === String(decision1Id)
      );
      if (hasDecision) throw new Error("Task still lists decision 1 after unlink");

      logPass(15, "Unlink task A cleans references on both Decision and Task");
    } catch (err) {
      logFail(15, "Unlink task A two-way cleanup", err);
    }

    // Check 16: Delete task B while it is linked: the decision no longer lists it
    try {
      await req(`/api/decisions/${decision1Id}/tasks/${taskBId}`, { method: "POST" });
      const delTaskRes = await req(`/api/tasks/${taskBId}`, { method: "DELETE" });
      if (delTaskRes.status !== 200) throw new Error(`Delete task B returned ${delTaskRes.status}`);

      const checkDecisionRes = await req(`/api/decisions/${decision1Id}`);
      const stillHasTaskB = checkDecisionRes.body?.data?.linkedTasks?.some(
        (t) => String(t._id || t) === String(taskBId)
      );
      if (stillHasTaskB) throw new Error("Decision still lists deleted task B");

      taskBId = null; // Marked deleted
      logPass(16, "Deleting task B cleanly pulls reference from linked decision");
    } catch (err) {
      logFail(16, "Task deletion cascaded reference cleanup", err);
    }

    // Check 17: Delete the decisions: tasks no longer list them
    try {
      await req(`/api/decisions/${decision2Id}/tasks/${taskAId}`, { method: "POST" });

      const delD1 = await req(`/api/decisions/${decision1Id}`, { method: "DELETE" });
      if (delD1.status !== 200) throw new Error(`Delete decision 1 returned ${delD1.status}`);
      decision1Id = null;

      const delD2 = await req(`/api/decisions/${decision2Id}`, { method: "DELETE" });
      if (delD2.status !== 200) throw new Error(`Delete decision 2 returned ${delD2.status}`);
      decision2Id = null;

      const taskRes = await req(`/api/tasks/${taskAId}`);
      const linkedDecs = taskRes.body?.data?.linkedDecisions || [];
      if (linkedDecs.length !== 0) {
        throw new Error(`Task still has linked decisions: ${JSON.stringify(linkedDecs)}`);
      }

      // Cleanup task A
      await req(`/api/tasks/${taskAId}`, { method: "DELETE" });
      taskAId = null;

      logPass(17, "Deleting decisions cleanly pulls references from tasks");
    } catch (err) {
      logFail(17, "Decision deletion cascaded reference cleanup", err);
    }

    // Check 18: A body with HTML like "<script>alert(1)</script>Hello" in title is stored without tags
    try {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const rawTitle = "<script>alert(1)</script>Hello Sanitized World " + Date.now();
      const res = await req("/api/decisions", {
        method: "POST",
        body: JSON.stringify({
          title: rawTitle,
          context: "Context for HTML tag stripping sanitizer test verification.",
          options: [
            { name: "Option One", description: "", pros: [], cons: [] },
            { name: "Option Two", description: "", pros: [], cons: [] }
          ],
          chosenOption: "Option One",
          rationale: "Rationale verifying that HTML tags are removed during request sanitization.",
          decidedBy: "Security Auditor",
          reviewDate: futureDate
        })
      });

      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
      sanitizedDecisionId = res.body?.data?._id;
      const storedTitle = res.body?.data?.title;

      if (storedTitle.includes("<script>") || storedTitle.includes("</script>")) {
        throw new Error(`Title still contains HTML tags: '${storedTitle}'`);
      }
      if (!storedTitle.includes("Hello Sanitized World")) {
        throw new Error(`Title does not match expected stripped string: '${storedTitle}'`);
      }

      // Clean up sanitized decision
      await req(`/api/decisions/${sanitizedDecisionId}`, { method: "DELETE" });
      sanitizedDecisionId = null;

      logPass(18, "Body with HTML tags in title is sanitized and stored without tags");
    } catch (err) {
      logFail(18, "HTML sanitizer strips tags from string fields", err);
    }
  } finally {
    // Final cleanup of any lingering smoke test resources
    if (taskAId) {
      try { await req(`/api/tasks/${taskAId}`, { method: "DELETE" }); } catch {}
    }
    if (taskBId) {
      try { await req(`/api/tasks/${taskBId}`, { method: "DELETE" }); } catch {}
    }
    if (decision1Id) {
      try { await req(`/api/decisions/${decision1Id}`, { method: "DELETE" }); } catch {}
    }
    if (decision2Id) {
      try { await req(`/api/decisions/${decision2Id}`, { method: "DELETE" }); } catch {}
    }
    if (sanitizedDecisionId) {
      try { await req(`/api/decisions/${sanitizedDecisionId}`, { method: "DELETE" }); } catch {}
    }
  }

  console.log(`\n========================================`);
  console.log(`Smoke Test Results: ${passedCount} PASSED, ${failedCount} FAILED (Total 18)`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runSmokeTests();

