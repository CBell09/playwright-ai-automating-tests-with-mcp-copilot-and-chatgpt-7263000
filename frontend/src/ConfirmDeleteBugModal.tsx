import { useEffect } from "react";

interface ConfirmDeleteBugModalProps {
  isOpen: boolean;
  bugId: number;
  bugTitle: string;
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteBugModal({
  isOpen,
  bugId,
  bugTitle,
  confirming,
  onConfirm,
  onCancel,
}: ConfirmDeleteBugModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-stone-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-bug-modal-title"
      onClick={onCancel}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-lg w-full max-w-sm border border-stone-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-stone-200">
            <h2 id="confirm-delete-bug-modal-title" className="text-lg font-semibold text-stone-800">
              Delete bug #{bugId}?
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Close"
              disabled={confirming}
            >
              <span className="sr-only">Close</span>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="px-6 py-4 space-y-4">
            <p className="text-sm text-stone-700">
              Are you sure you want to delete bug #{bugId} (&ldquo;{bugTitle}&rdquo;)? This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded px-4 py-2 text-sm font-medium text-stone-700 bg-stone-200 hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 disabled:opacity-50"
                disabled={confirming}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={confirming}
              >
                {confirming ? "Deleting…" : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
