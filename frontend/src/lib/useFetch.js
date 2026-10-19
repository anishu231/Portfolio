import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export function useFetch(path) {
  const [state, setState] = useState({ data: null, error: null, loading: !!path });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let off = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api.get(path)
      .then((data) => !off && setState({ data, error: null, loading: false }))
      .catch((error) => !off && setState({ data: null, error, loading: false }));
    return () => { off = true; };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}