import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Thin, generic wrapper around a Firestore collection. Every admin page
 * (products, categories, companies, ...) uses one of these instead of
 * hand-writing Firestore calls everywhere.
 */
export function createFirestoreService(collectionPath) {
  const col = collection(db, collectionPath);

  return {
    /** Subscribes to live updates. Returns an unsubscribe function. */
    watchAll(callback, { orderByField } = {}) {
      const q = orderByField ? query(col, orderBy(orderByField)) : col;
      return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    },

    async getById(id) {
      const snap = await getDoc(doc(db, collectionPath, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    async add(data) {
      const ref = await addDoc(col, { ...data, createdAt: serverTimestamp() });
      return ref.id;
    },

    async update(id, data) {
      await updateDoc(doc(db, collectionPath, id), data);
    },

    async remove(id) {
      await deleteDoc(doc(db, collectionPath, id));
    },
  };
}
