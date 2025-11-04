"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [loginCode, setLoginCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loginMethod, setLoginMethod] = useState<"code" | "email">("code");
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

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("loginMethod", "code");
      router.push("/wishlist");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setEmailLoading(true);

    const groupId = sessionStorage.getItem("groupId");

    if (!groupId) {
      setError("No group selected. Please start over.");
      setEmailLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), groupId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send magic link");
        setEmailLoading(false);
        return;
      }

      setSuccess(data.message);
      setEmailLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-600 mb-2 text-center">Welcome!</h1>
        {groupName && (
          <p className="text-gray-700 mb-2 text-center font-semibold">{groupName}</p>
        )}
        <p className="text-gray-600 mb-6 text-center text-sm">
          Choose how you&apos;d like to log in
        </p>

        {/* Login Method Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("code");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              loginMethod === "code"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🔑 Login Code
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("email");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              loginMethod === "email"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📧 Email Link
          </button>
        </div>

        {/* Login Code Form */}
        {loginMethod === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading || loginCode.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login with Code"}
            </button>
          </form>
        )}

        {/* Email Magic Link Form */}
        {loginMethod === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="your.email@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the email address the admin added for you
              </p>
            </div>

            <button
              type="submit"
              disabled={emailLoading || email.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}

        {/* Success/Error Messages */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              {success}
            </div>
            <p className="text-sm mt-2">
              Check your email and click the link to log in. The link expires in 15 minutes.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
