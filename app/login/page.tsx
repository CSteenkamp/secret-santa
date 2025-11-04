"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [loginCode, setLoginCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const name = sessionStorage.getItem("groupName");
    const groupId = sessionStorage.getItem("groupId");

    if (!groupId) {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginCode: loginCode.trim().toUpperCase(), groupId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid login code");
        setLoading(false);
        return;
      }

      // Store person data in session storage
      sessionStorage.setItem("personId", data.person.id);
      sessionStorage.setItem("personName", data.person.name);
      sessionStorage.setItem("loginCode", data.person.loginCode);
      sessionStorage.setItem("groupId", data.person.group.id);
      sessionStorage.setItem("groupName", data.person.group.name);
      router.push("/wishlist");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-600 mb-2 text-center">Welcome!</h1>
        {groupName && (
          <p className="text-gray-700 mb-2 text-center font-semibold">{groupName}</p>
        )}
        <p className="text-gray-600 mb-6 text-center text-sm">Enter your unique login code</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="loginCode" className="block text-sm font-medium text-gray-700 mb-2">
              Login Code
            </label>
            <input
              type="text"
              id="loginCode"
              value={loginCode}
              onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center font-mono text-2xl tracking-wider text-gray-900"
              placeholder="XXXXX"
              maxLength={8}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your login code was provided by the admin
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || loginCode.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
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
