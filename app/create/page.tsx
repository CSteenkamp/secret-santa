"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
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

    if (adminPassword.length < 6) {
      setError("Admin password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError("Passwords do not match");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-green-600 mb-2 text-center">
          Create Your Secret Santa Group
        </h1>
        <p className="text-gray-600 mb-6 text-center text-sm">
          Set up a new Secret Santa event for your family or friends
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              placeholder="Smith Family Secret Santa 2024"
              required
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="number"
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              min={2024}
              max={2030}
              required
            />
          </div>

          <div>
            <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              id="adminPassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              You'll use this to access the admin portal
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              placeholder="Re-enter your password"
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
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Group..." : "Create Group"}
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
