"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

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
// Dummy Data (TODO: Replace with API data)
// ============================================================
const DUMMY_TIMELINE: TimelineEvent[] = [
  { event: "lead_created", label: "Application Started", at: "2024-06-15T10:30:00Z" },
  { event: "otp_verified", label: "OTP Verified", at: "2024-06-15T10:32:00Z" },
  { event: "profile_completed", label: "Profile Completed", at: "2024-06-15T10:35:00Z" },
  { event: "offers_shown", label: "Offers Displayed", at: "2024-06-15T10:36:00Z" },
  { event: "lender_applied", label: "Applied to Lender", at: "2024-06-16T14:20:00Z" },
];

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
// API Placeholder (TODO: Replace with actual API)
// ============================================================
function getStoredShortTicketOffers(): {
  data?: {
    found?: boolean;
    exists?: boolean;
    timeline?: TimelineEvent[];
    [key: string]: unknown;
  };
} | null {
  // TODO: Replace with actual API call
  return {
    data: {
      found: true,
      timeline: DUMMY_TIMELINE,
    },
  };
}

// ============================================================
// LoanJourney Component
// ============================================================
export default function LoanJourney() {
  const [steps, setSteps] = useState<JourneyStep[]>([]);

  useEffect(() => {
    const existingUserData = getStoredShortTicketOffers();
    const userExists =
      existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const timeline = existingUserData.data.timeline || [];
      const journeySteps = processTimeline(timeline);
      setSteps(journeySteps);
    }
  }, []);

  if (steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-900">Your Loan Journey</h3>
      </div>

      {/* Journey Steps Container - Scrollable when many steps */}
      <div
        className="journey-scroll relative w-full overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`
          .journey-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div
          className="relative"
          style={{ minWidth: steps.length > 5 ? `${steps.length * 80}px` : "100%" }}
        >
          {/* The Global Connector Track - Black line connecting all steps */}
          <div
            className="absolute h-[2px] bg-black"
            style={{
              top: "15px",
              left: "40px",
              right: "40px",
            }}
          />

          <div className="flex justify-between items-start w-full relative">
            {steps.map((step) => {
              const isCompleted = step.status === "completed";

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center flex-shrink-0 relative z-10"
                  style={{
                    width: steps.length > 5 ? "80px" : "auto",
                    flex: steps.length > 5 ? "none" : "1",
                  }}
                >
                  {/* Circle Indicator */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300"
                    style={{
                      backgroundColor: isCompleted ? "#10b981" : "#ffffff",
                      border: isCompleted ? "none" : "2px solid #10b981",
                    }}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>

                  {/* Label */}
                  <p
                    className={`text-[10px] font-medium text-center leading-tight px-1 max-w-[75px]
                      ${isCompleted ? "text-gray-700" : "text-emerald-600 font-semibold"}`}
                  >
                    {step.label}
                  </p>

                  {/* Timestamp */}
                  <p className="text-[9px] text-gray-400 text-center mt-1">
                    {step.timestamp}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
