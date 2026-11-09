"use client";

import { useEffect } from "react";

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
}

interface Props {
  request: ConfirmRequest | null;
  onClose: () => void;
}

// In-page replacement for window.confirm(): keyboard accessible, styled, and
// not blocked by browser extensions that swallow native dialogs.
export function ConfirmDialog({ request, onClose }: Props) {
  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [request, onClose]);

  if (!request) return null;

  const confirmClass =
    request.tone === "danger"
      ? "bg-santa-red hover:bg-santa-red-dark text-white"
      : "bg-santa-green hover:bg-santa-green-dark text-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onClose}
    >
      <div
        className="bg-[#151528] border border-white/10 rounded-2xl p-6 w-full max-w-md card-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-xl font-bold text-santa-snow mb-2">
          {request.title}
        </h2>
        <p className="text-gray-300 text-sm mb-6">{request.message}</p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-santa-snow hover:bg-white/10 min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            autoFocus
            onClick={async () => {
              onClose();
              await request.onConfirm();
            }}
            className={`px-4 py-2 rounded-lg font-semibold min-h-[44px] ${confirmClass}`}
          >
            {request.confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
