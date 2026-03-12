import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Goals ────────────────────────────────────────────────
const goalsCol = (uid) =>
  query(
    collection(db, "goals"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

export async function fetchGoals(uid) {
  const snap = await getDocs(goalsCol(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addGoal(uid, goal) {
  const ref = await addDoc(collection(db, "goals"), {
    ...goal,
    uid,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...goal, uid };
}

export async function removeGoal(id) {
  await deleteDoc(doc(db, "goals", id));
}

// ─── Transactions / Round-Ups ─────────────────────────────
const txCol = (uid) =>
  query(
    collection(db, "transactions"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

export async function fetchTransactions(uid) {
  const snap = await getDocs(txCol(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addTransaction(uid, tx) {
  const ref = await addDoc(collection(db, "transactions"), {
    ...tx,
    uid,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...tx, uid };
}
