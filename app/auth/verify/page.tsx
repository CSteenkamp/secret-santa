"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    // Verify the magic link token
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Store session data
          sessionStorage.setItem("personId", data.person.id);
          sessionStorage.setItem("groupId", data.person.groupId);
          sessionStorage.setItem("groupName", data.person.groupName);
          sessionStorage.setItem("personName", data.person.name);
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("loginMethod", "magic-link");

          setStatus("success");
          setMessage(`Welcome back, ${data.person.name}!`);

          // Redirect to wishlist after a short delay
          setTimeout(() => {
            router.push("/wishlist");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify login link.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("An error occurred while verifying your login link.");
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <div className="text-6xl mb-4">🎄</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Verifying Your Login
            </h1>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
            <p className="text-gray-600">Please wait while we verify your magic link...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">
              Login Successful!
            </h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting you to your wishlist...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              >
                Try Login Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Back to Home
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="font-semibold mb-1">Common issues:</p>
              <ul className="text-left list-disc list-inside space-y-1">
                <li>Link may have expired (15 minutes limit)</li>
                <li>Link can only be used once</li>
                <li>Make sure you clicked the exact link from your email</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyMagicLink() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="text-6xl mb-4">🎄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}