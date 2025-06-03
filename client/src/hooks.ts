import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function useLocalStorage<T>(key: string, defaultVal: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const lsVal = localStorage.getItem(key);
    try {
      return lsVal ? JSON.parse(lsVal) : defaultVal;
    } catch {
      return defaultVal;
    }
  });

  useEffect(() => {
    if (state === null || state === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
}

const useQuery = () => {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
};

export { useLocalStorage, useQuery };
