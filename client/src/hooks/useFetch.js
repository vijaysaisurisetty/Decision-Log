import { useState, useEffect, useRef, useCallback } from "react";

export const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const execute = useCallback(async () => {
    const currentId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      if (currentId === requestIdRef.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (currentId === requestIdRef.current) {
        setError(err);
        setLoading(false);
      }
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    reload: execute
  };
};

export default useFetch;

