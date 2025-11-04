"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGroup() {
  const [inviteCode, setInviteCode] = useState("");
  const [userType, setUserType] = useState<"admin" | "participant" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState<{ id: string; name: string; year: number } | null>(null);
  const router = useRouter();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/groups/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid invite code");
        setLoading(false);
        return;
      }

      setGroupInfo(data.group);
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleProceed = (type: "admin" | "participant") => {
    if (!groupInfo) return;

    // Store group info in session storage
    sessionStorage.setItem("groupId", groupInfo.id);
    sessionStorage.setItem("groupName", groupInfo.name);
    sessionStorage.setItem("inviteCode", inviteCode.toUpperCase());

    if (type === "admin") {
      router.push("/admin");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">
          Join a Secret Santa Group
        </h1>
        <p className="text-gray-600 mb-6 text-center text-sm">
          Enter the invite code you received
        </p>

        {!groupInfo ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                Group Invite Code
              </label>
              <input
                type="text"
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-mono text-2xl tracking-wider text-gray-900"
                placeholder="XXXXXX"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                6-character code provided by the group admin
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || inviteCode.length !== 6}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-1">Group Found!</h2>
              <p className="text-gray-700">{groupInfo.name}</p>
              <p className="text-sm text-gray-600">Year: {groupInfo.year}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-700 text-center font-medium">
                How would you like to continue?
              </p>

              <button
                onClick={() => handleProceed("admin")}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Admin Portal
              </button>

              <button
                onClick={() => handleProceed("participant")}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Participant Login
              </button>
            </div>
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
