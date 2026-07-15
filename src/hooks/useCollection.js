import { useEffect, useState } from 'react';
import { createFirestoreService } from '../services/firestoreService';

/** Live-subscribes to a Firestore collection. Returns { data, loading, service }. */
export function useCollection(collectionPath, { orderByField } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const service = createFirestoreService(collectionPath);

  useEffect(() => {
    const unsub = service.watchAll(
      (items) => {
        setData(items);
        setLoading(false);
      },
      { orderByField }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath]);

  return { data, loading, service };
}
