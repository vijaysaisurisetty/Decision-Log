import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

export const useQueryState = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = useMemo(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (value !== undefined && value !== "") {
        params[key] = value;
      }
    }
    return params;
  }, [searchParams]);

  const setQuery = useCallback(
    (newParams, options = {}) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const isChangingOnlyPage =
          Object.keys(newParams).length === 1 && "page" in newParams;

        Object.entries(newParams).forEach(([key, val]) => {
          if (val === undefined || val === null || val === "" || val === false) {
            next.delete(key);
          } else {
            next.set(key, String(val));
          }
        });

        // Reset page to 1 when any filter other than page changes
        const shouldResetPage = options.resetPage !== false;
        if (shouldResetPage && !isChangingOnlyPage && prev.has("page")) {
          next.set("page", "1");
        }

        return next;
      });
    },
    [setSearchParams]
  );

  const resetPage = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", "1");
      return next;
    });
  }, [setSearchParams]);

  const clearQuery = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Support both object destructuring { query, setQuery, resetPage, clearQuery }
  // and array destructuring [query, setQuery, clearQuery]
  const result = [query, setQuery, clearQuery];
  result.query = query;
  result.setQuery = setQuery;
  result.resetPage = resetPage;
  result.clearQuery = clearQuery;

  return result;
};

export default useQueryState;
