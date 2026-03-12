import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/api";

export default function SetupProfile() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("pennywise_user") || "null");

  const [form, setForm] = useState({
    phoneNumber: stored?.phoneNumber || "",
    accountNumber: stored?.accountNumber || "",
    ifscCode: stored?.ifscCode || "",
    upiId: stored?.upiId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // if not logged in, redirect to login
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await updateProfile(form);
      const user = res.data.user;
      // update stored user
      localStorage.setItem("pennywise_user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">Complete your profile</h2>
          <p className="text-sm text-slate-400 mb-6">Enter your banking details to enable payments.</p>

          {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone number (10 digits)" className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/40 text-white" />
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account number" className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/40 text-white" />
            <input name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="IFSC code" className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/40 text-white" />
            <input name="upiId" value={form.upiId} onChange={handleChange} placeholder="UPI ID (e.g. user@upi)" className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/40 text-white" />

            <button type="submit" disabled={loading} className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold">
              {loading ? "Saving…" : "Save & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
