"use client";

import { useState, useCallback } from "react";
import { saveShortLender, applyToShortKreditBee, applyToSmartCoin } from "@/lib/api";
import { cleverTapTrackEvent, CLEVERTAP_EVENTS } from "@/lib/clevertap";

// ============================================================
// Types
// ============================================================
export type LenderApplyResult = {
  status: "success" | "notEligible" | "error";
  message?: string;
};

interface UseLenderApplyOptions {
  onSuccess?: () => void;
  onNotEligible?: () => void;
}

// ============================================================
// KreditBee Apply Hook
// ============================================================
const DEFAULT_KREDITBEE_URL = "https://www.kreditbee.in/signin";

export function useKreditBeeApply(options: UseLenderApplyOptions = {}) {
  const [applying, setApplying] = useState(false);

  const apply = useCallback(
    async (utmLink?: string): Promise<LenderApplyResult> => {
      if (applying) {
        return { status: "error", message: "Already applying" };
      }

      setApplying(true);

      try {
        const phone = sessionStorage.getItem("userPhone") || "";
        await saveShortLender(phone, "KreditBee");

        const res = await applyToShortKreditBee();

        const kb = res.data?.KreditBee;
        const kbMessage = (kb?.message || "").toLowerCase();
        const isKbSuccess = kb?.success === true;
        const isRejected =
          kbMessage.includes("not approved") || kbMessage.includes("rejected");

        if (!isKbSuccess || isRejected) {
          options.onNotEligible?.();
          return {
            status: "notEligible",
            message: "You are not eligible for KreditBee at this time.",
          };
        }

        // Success - redirect
        const redirectUrl = utmLink || DEFAULT_KREDITBEE_URL;
        window.open(redirectUrl, "_blank");
        options.onSuccess?.();

        return { status: "success" };
      } catch (err) {
        console.error("KreditBee apply failed:", err);
        return {
          status: "error",
          message: "Something went wrong. Please try again.",
        };
      } finally {
        setApplying(false);
      }
    },
    [applying, options]
  );

  return { apply, applying };
}

// ============================================================
// SmartCoin Apply Hook
// ============================================================
export function useSmartCoinApply(options: UseLenderApplyOptions = {}) {
  const [applying, setApplying] = useState(false);

  const apply = useCallback(
    async (initialUtmLink?: string): Promise<LenderApplyResult> => {
      if (applying) {
        return { status: "error", message: "Already applying" };
      }

      setApplying(true);

      // Track click event
      console.log("[SmartCoin] Apply clicked");
      cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_SMARTCOIN_APPLY_CLICKED);

      try {
        const phone = sessionStorage.getItem("userPhone") || "";
        await saveShortLender(phone, "SmartCoin");

        const res = await applyToSmartCoin();

        const smartCoinLead = res.data?.SmartCoinLead;
        const leadMessage = smartCoinLead?.data?.response?.message || "";
        const utmLink = smartCoinLead?.utm_link || initialUtmLink;

        // Only redirect if lead was created successfully
        if (leadMessage === "Lead created successfully" && utmLink) {
          console.log("[SmartCoin] Apply success - redirecting");
          cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_SMARTCOIN_APPLY_SUCCESS);
          window.open(utmLink, "_blank");
          options.onSuccess?.();
          return { status: "success" };
        }

        // Not eligible
        console.log("[SmartCoin] Not eligible");
        cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_SMARTCOIN_APPLY_NOT_ELIGIBLE);
        options.onNotEligible?.();
        return {
          status: "notEligible",
          message: "You are not eligible for Olyv at this time.",
        };
      } catch (err) {
        console.error("SmartCoin apply failed:", err);
        cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_SMARTCOIN_APPLY_NOT_ELIGIBLE);
        return {
          status: "error",
          message: "Something went wrong. Please try again.",
        };
      } finally {
        setApplying(false);
      }
    },
    [applying, options]
  );

  return { apply, applying };
}

// ============================================================
// MMB Apply Hook
// ============================================================
// export function useMMBApply(options: UseLenderApplyOptions = {}) {
//   const [applying, setApplying] = useState(false);

//   const apply = useCallback(
//     async (utmLink?: string): Promise<LenderApplyResult> => {
//       if (applying) {
//         return { status: "error", message: "Already applying" };
//       }

//       setApplying(true);

//       try {
//         const phone = sessionStorage.getItem("userPhone") || "";
//         await saveShortLender(phone, "MMB");

//         // Directly redirect to utm_link without calling API
//         if (utmLink) {
//           window.open(utmLink, "_blank");
//           options.onSuccess?.();
//           return { status: "success" };
//         }

//         // No UTM link available
//         options.onNotEligible?.();
//         return {
//           status: "notEligible",
//           message: "MMB link not available.",
//         };
//       } catch (err) {
//         console.error("MMB apply failed:", err);
//         return {
//           status: "error",
//           message: "Something went wrong. Please try again.",
//         };
//       } finally {
//         setApplying(false);
//       }
//     },
//     [applying, options]
//   );

//   return { apply, applying };
// }

