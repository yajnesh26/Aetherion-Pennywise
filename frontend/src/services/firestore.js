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
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Users ────────────────────────────────────────────────
export async function fetchUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function updateUserBalances(uid, bankDelta, savingsDelta) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    bankBalance: increment(bankDelta),
    walletSavings: increment(savingsDelta),
  });
}

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

export async function allocateSavingToGoal(goalId, amount) {
  const ref = doc(db, "goals", goalId);
  await updateDoc(ref, {
    saved: increment(amount)
  });
}

export async function updateTransactionWithGoal(transactionId, goalId) {
  const ref = doc(db, "transactions", transactionId);
  await updateDoc(ref, {
    goalId: goalId
  });
}

export async function distributeSavingsToGoals(uid, amount) {
  // Keeping for backward compatibility but making it handle manual selection if possible
  // Find the first goal that isn't finished yet
  const q = query(
    collection(db, "goals"),
    where("uid", "==", uid)
  );
  const snap = await getDocs(q);
  
  if (snap.empty) return null;

  const goals = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

  const activeGoal = goals.find(g => (g.saved || 0) < (g.target || 0));
  
  if (activeGoal) {
    await allocateSavingToGoal(activeGoal.id, amount);
    return activeGoal.id;
  }
  return null;
}
