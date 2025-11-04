"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if we have group info from previous steps
    const name = sessionStorage.getItem("groupName");
    const groupId = sessionStorage.getItem("groupId");

    if (!groupId) {
      // No group selected, redirect to home
      router.push("/");
      return;
    }

    setGroupName(name || "Your Group");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const groupId = sessionStorage.getItem("groupId");

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

      // Store admin auth and group info
      sessionStorage.setItem("adminAuth", "true");
      sessionStorage.setItem("groupId", data.group.id);
      sessionStorage.setItem("groupName", data.group.name);
      sessionStorage.setItem("inviteCode", data.group.inviteCode);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">Admin Portal</h1>
        {groupName && (
          <p className="text-gray-600 text-center mb-6">{groupName}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
