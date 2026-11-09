"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function JoinGroupInner() {
  const searchParams = useSearchParams();
  const [inviteCode, setInviteCode] = useState("");
  const [userType, setUserType] = useState<"admin" | "participant" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupInfo, setGroupInfo] = useState<{ id: string; name: string; year: number } | null>(null);
  const router = useRouter();

  const verifyCode = useCallback(async (code: string) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/groups/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code.trim().toUpperCase() }),
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
  }, []);

  // Support shareable links like /join?code=ABC123: prefill and verify automatically.
  useEffect(() => {
    const fromLink = (searchParams.get("code") || "").trim().toUpperCase();
    if (fromLink.length === 6) {
      setInviteCode(fromLink);
      verifyCode(fromLink);
    }
  }, [searchParams, verifyCode]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyCode(inviteCode);
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
    <div className="min-h-screen flex items-center justify-center bg-santa-dark p-4">
      <div className="bg-[#151528] p-8 rounded-2xl border border-white/10 card-glow w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎁</div>
          <h1 className="text-3xl font-bold text-santa-red mb-2 font-display">
            Join a Secret Santa Group
          </h1>
          <p className="text-gray-400 text-sm">
            Enter the invite code you received
          </p>
        </div>

        {!groupInfo ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-300 mb-2">
                Group Invite Code
              </label>
              <input
                type="text"
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-santa-dark border border-white/10 rounded-lg focus:ring-2 focus:ring-santa-gold focus:border-transparent text-center font-mono text-2xl tracking-wider text-santa-snow"
                placeholder="XXXXXX"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                6-character code provided by the group admin
              </p>
            </div>

            {error && (
              <div className="bg-santa-red/10 border border-santa-red/30 text-santa-red px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || inviteCode.length !== 6}
              className="w-full bg-santa-red text-white py-3 rounded-xl font-semibold hover:bg-santa-red-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-santa-green/10 border border-santa-green/30 p-4 rounded-lg">
              <h2 className="font-semibold text-santa-green mb-1">Group Found!</h2>
              <p className="text-santa-snow">{groupInfo.name}</p>
              <p className="text-sm text-gray-400">Year: {groupInfo.year}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleProceed("participant")}
                className="w-full bg-santa-green text-white py-3 rounded-xl font-semibold hover:bg-santa-green-dark transition-all duration-300 hover:scale-105 transform"
              >
                I&apos;m a participant &rarr; Log in
              </button>
              <p className="text-xs text-gray-500 text-center">
                You&apos;ll need the personal login code the organizer sent you.
              </p>

              <div className="pt-2 border-t border-white/5 text-center">
                <button
                  onClick={() => handleProceed("admin")}
                  className="text-sm text-gray-400 hover:text-santa-gold transition-colors underline underline-offset-2 min-h-[44px]"
                >
                  I&apos;m the organizer &rarr; Admin Portal
                </button>
              </div>
            </div>
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

export default function JoinGroup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-santa-dark" />}>
      <JoinGroupInner />
    </Suspense>
  );
}
