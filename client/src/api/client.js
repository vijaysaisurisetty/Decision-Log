import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : 0;
    let message = "Something went wrong. Please try again.";
    const fieldErrors = {};

    if (!error.response) {
      message = "Cannot reach the server. Check that the backend is running.";
    } else if (error.response.data) {
      const data = error.response.data;
      if (data.message) {
        message = data.message;
      }
      if (Array.isArray(data.errors)) {
        data.errors.forEach((err) => {
          if (err && err.field) {
            fieldErrors[err.field] = err.message;
          }
        });
      }
    }

    const normalizedError = {
      status,
      message,
      fieldErrors
    };

    return Promise.reject(normalizedError);
  }
);

// Decision Endpoints
export const getDecisions = async (params) => {
  const res = await api.get("/decisions", { params });
  return res.data;
};

export const getDecisionStats = async () => {
  const res = await api.get("/decisions/stats");
  return res.data;
};

export const getDecisionTags = async () => {
  const res = await api.get("/decisions/tags");
  return res.data;
};

export const getDecision = async (id) => {
  const res = await api.get(`/decisions/${id}`);
  return res.data;
};

export const createDecision = async (body) => {
  const res = await api.post("/decisions", body);
  return res.data;
};

export const updateDecision = async (id, body) => {
  const res = await api.put(`/decisions/${id}`, body);
  return res.data;
};

export const deleteDecision = async (id) => {
  const res = await api.delete(`/decisions/${id}`);
  return res.data;
};

export const setReconsideration = async (id, { needsReconsideration, reason }) => {
  const res = await api.patch(`/decisions/${id}/reconsider`, { needsReconsideration, reason });
  return res.data;
};

export const linkTask = async (decisionId, taskId) => {
  const res = await api.post(`/decisions/${decisionId}/tasks/${taskId}`);
  return res.data;
};

export const unlinkTask = async (decisionId, taskId) => {
  const res = await api.delete(`/decisions/${decisionId}/tasks/${taskId}`);
  return res.data;
};

// Task Endpoints
export const getTasks = async (params) => {
  const res = await api.get("/tasks", { params });
  return res.data;
};

export const getTask = async (id) => {
  const res = await api.get(`/tasks/${id}`);
  return res.data;
};

export const createTask = async (body) => {
  const res = await api.post("/tasks", body);
  return res.data;
};

export const updateTask = async (id, body) => {
  const res = await api.put(`/tasks/${id}`, body);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};

// Health Check Endpoint
export const getHealth = async () => {
  try {
    const res = await axios.get("/api/health", {
      timeout: 5000,
      headers: {
        "Content-Type": "application/json"
      }
    });
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 503 && err.response.data) {
      return err.response.data;
    }
    throw err;
  }
};

export default {
  getDecisions,
  getDecisionStats,
  getDecisionTags,
  getDecision,
  createDecision,
  updateDecision,
  deleteDecision,
  setReconsideration,
  linkTask,
  unlinkTask,
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getHealth
};

