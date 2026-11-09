"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if we have group info from previous steps (sessionStorage used only for join flow)
    const storedGroupId = sessionStorage.getItem("groupId");
    const storedGroupName = sessionStorage.getItem("groupName");

    if (!storedGroupId) {
      // No group selected, send them to the invite-code step
      router.push("/join");
      return;
    }

    setGroupId(storedGroupId);
    setGroupName(storedGroupName || "Your Group");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!groupId) {
      setError("No group selected. Please start over.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, groupId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      // Session cookie set by server. Clear sessionStorage group info.
      sessionStorage.removeItem("groupId");
      sessionStorage.removeItem("groupName");
      sessionStorage.removeItem("inviteCode");
      sessionStorage.removeItem("adminAuth");
      router.push("/admin/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-santa-dark p-4">
      <div className="bg-[#151528] p-8 rounded-2xl border border-white/10 card-glow w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎅</div>
          <h1 className="text-3xl font-bold text-santa-red mb-2 font-display">Admin Portal</h1>
          {groupName && (
            <p className="text-gray-400">{groupName}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-santa-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-santa-gold focus:border-transparent text-santa-snow placeholder-gray-500"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="bg-santa-red/10 border border-santa-red/30 text-santa-red px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-santa-red text-white py-3 rounded-xl font-semibold hover:bg-santa-red-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-santa-gold transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
