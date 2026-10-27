import { useEffect, useState } from 'react';

const COMPACT_QUERY = '(max-width: 1100px)';

export function useCompactLayout() {
  const [compact, setCompact] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(COMPACT_QUERY).matches
  ));

  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY);
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return compact;
}
