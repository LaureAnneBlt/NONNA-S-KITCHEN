import { useCallback, useEffect, useState } from 'react';

/** Mini hook de chargement. Remplaçable par TanStack Query quand l'app grossit. */
export function useAsync<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    fn().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [fn]);

  useEffect(reload, [reload]);
  return { data, error, loading, reload };
}
