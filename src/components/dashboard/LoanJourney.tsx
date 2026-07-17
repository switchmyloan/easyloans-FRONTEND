"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, History, X } from "lucide-react";
import { getStoredShortExistingUserOffers } from "@/lib/api";

// ============================================================
// Types
// ============================================================
interface TimelineEvent {
  event: string;
  label: string;
  at: string;
}

interface JourneyStep {
  id: string;
  label: string;
  timestamp: string;
  status: "completed" | "in_progress";
}

// ============================================================
// Utility Functions
// ============================================================
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function processTimeline(timeline: TimelineEvent[]): JourneyStep[] {
  if (!timeline || timeline.length === 0) return [];

  const sorted = [...timeline].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  // Deduplicate: keep only the first occurrence of each unique label
  const seenLabels = new Set<string>();
  const deduplicated = sorted.filter((event) => {
    if (seenLabels.has(event.label)) {
      return false;
    }
    seenLabels.add(event.label);
    return true;
  });

  return deduplicated.map((event, index) => ({
    id: `${event.event}-${index}`,
    label: event.label,
    timestamp: formatTimestamp(event.at),
    status: index === deduplicated.length - 1 ? "in_progress" : "completed",
  }));
}

// ============================================================
// History Modal Component
// ============================================================
function HistoryModal({
  steps,
  onClose,
}: {
  steps: JourneyStep[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">
              Your Complete Journey
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content - Vertical Timeline */}
          <div
            className="p-4 overflow-y-auto max-h-[60vh]"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#d1d5db transparent" }}
          >
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />

              <div className="space-y-4">
                {steps.map((step, index) => {
                  const isCompleted = step.status === "completed";
                  const isLast = index === steps.length - 1;

                  return (
                    <div key={step.id} className="flex items-start gap-4 relative">
                      {/* Circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm
                          ${isCompleted ? "bg-emerald-500" : "bg-white border-2 border-emerald-500"}`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 pb-4 ${isLast ? "pb-0" : ""}`}>
                        <p
                          className={`text-sm font-medium ${
                            isCompleted ? "text-gray-700" : "text-emerald-600"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {step.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// LoanJourney Component
// ============================================================
export default function LoanJourney() {
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists =
      existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const timeline = (existingUserData.data.timeline || []) as TimelineEvent[];
      const journeySteps = processTimeline(timeline);
      setSteps(journeySteps);
    }
  }, []);

  if (steps.length === 0) return null;

  // Show last 4 steps max in main view
  const visibleSteps = steps.slice(-4);
  const hasMoreHistory = steps.length > 4;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Your Loan Journey</h3>
          {hasMoreHistory && (
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              View History
            </button>
          )}
        </div>

        {/* Recent Steps - Horizontal Timeline */}
        <div className="relative">
          {/* Connector line */}
          <div
            className="absolute h-0.5 bg-gray-200"
            style={{
              top: "12px",
              left: "12px",
              right: "12px",
            }}
          />

          <div className="flex justify-between items-start relative">
            {visibleSteps.map((step) => {
              const isCompleted = step.status === "completed";

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center flex-1 relative z-10"
                >
                  {/* Circle Indicator */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 shadow-sm
                      ${isCompleted ? "bg-emerald-500" : "bg-white border-2 border-emerald-500"}`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>

                  {/* Label */}
                  <p
                    className={`text-[10px] font-medium text-center leading-tight px-1 max-w-[70px]
                      ${isCompleted ? "text-gray-600" : "text-emerald-600 font-semibold"}`}
                  >
                    {step.label}
                  </p>

                  {/* Timestamp */}
                  <p className="text-[9px] text-gray-400 text-center mt-0.5">
                    {step.timestamp}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* History Modal */}
      {showHistory && (
        <HistoryModal steps={steps} onClose={() => setShowHistory(false)} />
      )}
    </>
  );
}
