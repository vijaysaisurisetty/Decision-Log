import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DecisionList from "./pages/DecisionList";
import DecisionDetail from "./pages/DecisionDetail";
import DecisionForm from "./pages/DecisionForm";
import TaskList from "./pages/TaskList";
import TaskForm from "./pages/TaskForm";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ScrollToTop />
      <Navbar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/decisions" element={<DecisionList />} />
          <Route path="/decisions/new" element={<DecisionForm />} />
          <Route path="/decisions/:id" element={<DecisionDetail />} />
          <Route path="/decisions/:id/edit" element={<DecisionForm />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id/edit" element={<TaskForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}
