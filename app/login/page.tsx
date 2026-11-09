"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [loginCode, setLoginCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [loginMethod, setLoginMethod] = useState<"code" | "email">("code");
  const router = useRouter();

  useEffect(() => {
    // Get groupId from sessionStorage (set during join flow)
    const storedGroupId = sessionStorage.getItem("groupId");
    const storedGroupName = sessionStorage.getItem("groupName");

    if (!storedGroupId) {
      router.push("/join");
      return;
    }

    setGroupId(storedGroupId);
    setGroupName(storedGroupName || "Your Group");
  }, [router]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

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

      // Session cookie is set by the server. Clear sessionStorage group info.
      sessionStorage.removeItem("groupId");
      sessionStorage.removeItem("groupName");
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
    <div className="min-h-screen flex items-center justify-center bg-santa-dark p-4">
      <div className="bg-[#151528] p-8 rounded-2xl border border-white/10 card-glow w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎅</div>
          <h1 className="text-3xl font-bold text-santa-gold mb-2 font-display">Welcome!</h1>
          {groupName && (
            <p className="text-santa-snow mb-1 font-semibold">{groupName}</p>
          )}
          <p className="text-gray-400 text-sm">
            Choose how you&apos;d like to log in
          </p>
        </div>

        {/* Login Method Toggle */}
        <div className="flex mb-6 bg-santa-dark rounded-lg p-1 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("code");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              loginMethod === "code"
                ? "bg-[#151528] text-santa-gold shadow-sm border border-santa-gold/20"
                : "text-gray-400 hover:text-santa-snow"
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
                ? "bg-[#151528] text-santa-gold shadow-sm border border-santa-gold/20"
                : "text-gray-400 hover:text-santa-snow"
            }`}
          >
            📧 Email Link
          </button>
        </div>

        {/* Login Code Form */}
        {loginMethod === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="loginCode" className="block text-sm font-medium text-gray-300 mb-2">
                Login Code
              </label>
              <input
                type="text"
                id="loginCode"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-santa-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-santa-gold focus:border-transparent text-center font-mono text-2xl tracking-wider text-santa-snow"
                placeholder="XXXXXXXX"
                maxLength={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your 8-character login code was shared with you by the organizer
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || loginCode.length === 0}
              className="w-full bg-santa-green text-white py-3 rounded-xl font-semibold hover:bg-santa-green-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform"
            >
              {loading ? "Logging in..." : "Login with Code"}
            </button>
          </form>
        )}

        {/* Email Magic Link Form */}
        {loginMethod === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-santa-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-santa-gold focus:border-transparent text-santa-snow placeholder-gray-500"
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
              className="w-full bg-santa-gold text-santa-dark py-3 rounded-xl font-semibold hover:bg-santa-gold-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform"
            >
              {emailLoading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}

        {/* Success/Error Messages */}
        {error && (
          <div className="mt-4 bg-santa-red/10 border border-santa-red/30 text-santa-red px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-santa-green/10 border border-santa-green/30 text-santa-green px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <span className="text-santa-green mr-2">&#10003;</span>
              {success}
            </div>
            <p className="text-sm mt-2 text-gray-400">
              Check your email and click the link to log in. The link expires in 15 minutes.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-santa-gold transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
