import { useState, useEffect, useRef, useCallback } from "react";
import { getHealth } from "../api/client";

const formatTimeString = (date) => {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

export function useHealth() {
  const [state, setState] = useState("checking"); // "checking" | "online" | "degraded" | "offline"
  const [uptime, setUptime] = useState(0);
  const [checkedAt, setCheckedAt] = useState("");

  const mountedRef = useRef(true);
  const intervalRef = useRef(null);
  const isCheckingRef = useRef(false);

  const check = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const data = await getHealth();
      if (!mountedRef.current) return;

      setCheckedAt(formatTimeString(new Date()));

      if (data && data.status === "ok" && data.database === "connected") {
        setState("online");
        setUptime(Number(data.uptime) || 0);
      } else if (
        data &&
        (data.status === "degraded" || data.database === "disconnected")
      ) {
        setState("degraded");
        setUptime(Number(data.uptime) || 0);
      } else {
        setState("offline");
      }
    } catch {
      if (!mountedRef.current) return;
      setCheckedAt(formatTimeString(new Date()));
      setState("offline");
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        check();
      }
    }, 15000);
  }, [check]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const checkNow = useCallback(() => {
    check();
  }, [check]);

  useEffect(() => {
    mountedRef.current = true;

    // Check on mount
    check();
    startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        check();
        startPolling();
      } else {
        stopPolling();
      }
    };

    const handleOnline = () => {
      check();
    };

    const handleOffline = () => {
      if (!mountedRef.current) return;
      setCheckedAt(formatTimeString(new Date()));
      setState("offline");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      mountedRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [check, startPolling, stopPolling]);

  return { state, uptime, checkedAt, checkNow };
}

export default useHealth;

