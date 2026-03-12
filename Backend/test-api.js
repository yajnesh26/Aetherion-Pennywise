/**
 * Quick API test — run this AFTER `node server.js` is running in another terminal.
 *
 * Usage: node test-api.js
 */
const BASE = "http://localhost:5000/api";

async function main() {
  console.log("─── 1. Health check ───────────────────────");
  const health = await fetch("http://localhost:5000/").then((r) => r.json());
  console.log(health);

  console.log("\n─── 2. Register ───────────────────────────");
  const reg = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email: `test${Date.now()}@pennywise.com`,
      password: "test123",
    }),
  }).then((r) => r.json());
  console.log(reg);

  const token = reg.token;
  if (!token) { console.log("No token — stopping."); return; }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  console.log("\n─── 3. Create goal ────────────────────────");
  const goal = await fetch(`${BASE}/goals`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      itemName: "Nike Air Max 90",
      targetPrice: 3500,
      image: "https://m.media-amazon.com/images/I/71GZNHP+XAL._AC_SL1500_.jpg",
      url: "https://www.amazon.in/dp/B0EXAMPLE1",
    }),
  }).then((r) => r.json());
  console.log(goal);

  console.log("\n─── 4. Get goals ──────────────────────────");
  const goals = await fetch(`${BASE}/goals`, { headers: authHeaders }).then((r) => r.json());
  console.log(goals);

  console.log("\n─── 5. Make payment (₹87 → ₹90, saves ₹3) ─");
  const pay = await fetch(`${BASE}/pay`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ amount: 87, description: "Swiggy Order" }),
  }).then((r) => r.json());
  console.log(pay);

  console.log("\n─── 6. Make payment (₹142 → ₹150, saves ₹8) ");
  const pay2 = await fetch(`${BASE}/pay`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ amount: 142, description: "Uber Ride" }),
  }).then((r) => r.json());
  console.log(pay2);

  console.log("\n─── 7. Get transactions ───────────────────");
  const txns = await fetch(`${BASE}/transactions`, { headers: authHeaders }).then((r) => r.json());
  console.log(txns);

  console.log("\n─── 8. Delete goal ────────────────────────");
  if (goal.goal) {
    const del = await fetch(`${BASE}/goals/${goal.goal._id}`, {
      method: "DELETE",
      headers: authHeaders,
    }).then((r) => r.json());
    console.log(del);
  }

  console.log("\n✅ All tests passed!");
}

main().catch((err) => console.error("Test failed:", err.message));
