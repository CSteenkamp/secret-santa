"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!groupName.trim()) {
      setError("Group name is required");
      setLoading(false);
      return;
    }

    if (adminPassword.length < 12) {
      setError("Admin password must be at least 12 characters with uppercase, lowercase, and a number");
      setLoading(false);
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!agreed) {
      setError("Please accept the Terms of Service and Privacy Policy to continue");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, adminPassword, year }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create group");
        setLoading(false);
        return;
      }

      // Store group info and redirect to admin login
      sessionStorage.setItem("groupId", data.group.id);
      sessionStorage.setItem("groupName", data.group.name);
      sessionStorage.setItem("inviteCode", data.group.inviteCode);
      sessionStorage.setItem("adminAuth", "pending");

      router.push("/admin");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-santa-dark p-4">
      <div className="bg-[#151528] p-8 rounded-2xl border border-white/10 card-glow w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎄</div>
          <h1 className="text-3xl font-bold text-santa-green mb-2 font-display">
            Create Your Group
          </h1>
          <p className="text-gray-400 text-sm">
            Set up a new Secret Santa event for your family or friends
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 bg-santa-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-santa-gold focus:border-transparent text-santa-snow placeholder-gray-500"
              placeholder="Smith Family Secret Santa 2024"
              required
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
              Year
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-santa-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-santa-gold focus:border-transparent text-santa-snow"
              min={2024}
              max={2030}
              required
            />
          </div>

          <div>
            <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-2 bg-santa-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-santa-gold focus:border-transparent text-santa-snow placeholder-gray-500"
              placeholder="Min 12 chars, upper+lower+number"
              required
              minLength={12}
            />
            <p className="text-xs text-gray-500 mt-1">
              You&apos;ll use this to access the admin portal
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-santa-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-santa-gold focus:border-transparent text-santa-snow placeholder-gray-500"
              placeholder="Re-enter your password"
              required
            />
          </div>

          <label className="flex items-start gap-3 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-santa-dark accent-santa-green"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-santa-gold underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" target="_blank" className="text-santa-gold underline">Privacy Policy</Link>, and I have
              permission to add the participants I invite.
            </span>
          </label>

          {error && (
            <div className="bg-santa-red/10 border border-santa-red/30 text-santa-red px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-santa-green text-white py-3 rounded-xl font-semibold hover:bg-santa-green-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform"
          >
            {loading ? "Creating Group..." : "Create Group"}
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
