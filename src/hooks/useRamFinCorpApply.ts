"use client";

// RamFinCorp is commented out - this file provides stub exports to prevent import errors

// import { useState, useCallback } from "react";
// import { saveShortLender, applyToShortRamFinCorp } from "@/lib/api";
// import { cleverTapTrackEvent, CLEVERTAP_EVENTS } from "@/lib/clevertap";

// ============================================================
// Types
// ============================================================
export type RamFinCorpApplyResult =
  | { status: "success"; redirectUrl: string }
  | { status: "sessionActive"; message: string }
  | { status: "notEligible"; message: string }
  | { status: "error"; message: string };

export interface UseRamFinCorpApplyOptions {
  /**
   * Whether to track CleverTap events (default: true)
   */
  trackEvents?: boolean;
  /**
   * Callback when apply is successful (redirected to bank)
   */
  onSuccess?: () => void;
}

// ============================================================
// Hook (commented out - RamFinCorp disabled)
// ============================================================
export function useRamFinCorpApply(_options: UseRamFinCorpApplyOptions = {}) {
  // Stub implementation - returns no-op values
  return {
    /** Call this to apply to RamFinCorp */
    apply: async (): Promise<RamFinCorpApplyResult> => ({ status: "error", message: "RamFinCorp is disabled" }),
    /** Whether the apply is in progress */
    applying: false,
    /** Session active message (null if not active) */
    sessionActiveMessage: null as string | null,
    /** Clear the session active message manually */
    clearSessionActiveMessage: () => {},
  };
}

/*
// Original implementation (commented out):

export function useRamFinCorpApply(options: UseRamFinCorpApplyOptions = {}) {
  const { trackEvents = true, onSuccess } = options;

  const [applying, setApplying] = useState(false);
  const [sessionActiveMessage, setSessionActiveMessage] = useState<string | null>(null);

  const clearSessionActiveMessage = useCallback(() => {
    setSessionActiveMessage(null);
  }, []);

  const apply = useCallback(async (): Promise<RamFinCorpApplyResult> => {
    // Prevent double-click
    if (applying) {
      return { status: "error", message: "Already applying" };
    }

    setApplying(true);

    // Track click event
    if (trackEvents) {
      console.log("[RamFinCorp] Apply clicked");
      cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_RAMFINCORP_APPLY_CLICKED);
    }

    try {
      // Save lender selection
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "RamFinCorp");

      // Call API
      const res = await applyToShortRamFinCorp();

      const outcome = res.data?.outcome;
      const flow = res.data?.flow;
      const redirectUrl = res.data?.redirectUrl?.trim() || "";

      console.log("[RamFinCorp] outcome:", outcome, "flow:", flow, "redirectUrl:", redirectUrl);

      // Case 1: Success - BRE_APPROVED or PROCEED_TO_BANK with valid redirectUrl
      if ((outcome === "BRE_APPROVED" || outcome === "PROCEED_TO_BANK") && redirectUrl) {
        console.log(`[RamFinCorp] ${outcome} - redirecting`);

        if (trackEvents) {
          cleverTapTrackEvent(
            outcome === "BRE_APPROVED"
              ? CLEVERTAP_EVENTS.EASY_RAMFINCORP_APPLY_BRE_APPROVED
              : CLEVERTAP_EVENTS.EASY_RAMFINCORP_APPLY_PROCEED_TO_BANK
          );
        }

        // Open bank page
        window.open(redirectUrl, "_blank");

        // Call success callback
        onSuccess?.();

        return { status: "success", redirectUrl };
      }

      // Case 2: Session Active
      if (flow === "sessionActive") {
        const msg = res.message || "Your previous session is still active. Please try again later.";
        console.log("[RamFinCorp] Session active - showing message:", msg);

        setSessionActiveMessage(msg);
        // Auto-hide after 5 seconds
        setTimeout(() => setSessionActiveMessage(null), 5000);

        return { status: "sessionActive", message: msg };
      }

      // Case 3: Not Eligible (BAD_REQUEST, REJECTED, or missing redirectUrl)
      console.log("[RamFinCorp] Not eligible - outcome:", outcome);

      if (trackEvents) {
        cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_RAMFINCORP_APPLY_NOT_ELIGIBLE);
      }

      const errorMsg = res.message || "You are not eligible for this offer.";
      return { status: "notEligible", message: errorMsg };

    } catch (err) {
      console.error("RamFinCorp apply failed:", err);

      if (trackEvents) {
        cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_RAMFINCORP_APPLY_NOT_ELIGIBLE);
      }

      return { status: "error", message: "Something went wrong. Please try again." };
    } finally {
      setApplying(false);
    }
  }, [applying, trackEvents, onSuccess]);

  return {
    apply,
    applying,
    sessionActiveMessage,
    clearSessionActiveMessage,
  };
}
*/
