"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";

// ============================================================
// Types
// ============================================================
interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// ============================================================
// FAQ Data
// ============================================================
const staticFaqs: FAQ[] = [
  {
    id: "1",
    question: "What is Cready?",
    answer:
      "Cready is a digital finance platform that allows you to explore and apply for personal loans online through a simple, transparent, and completely digital process.",
  },
  {
    id: "2",
    question: "Who can apply?",
    answer:
      "Anyone working in India — including salaried, freelancers, gig-workers, and those seeking a self-employed personal loan in India can apply with basic income and identity details.",
  },
  {
    id: "3",
    question: "How fast is the approval?",
    answer:
      "Most users get personal loan instant approval through automated checks and digital verification.",
  },
  {
    id: "4",
    question: "Is Cready safe and secure?",
    answer:
      "Absolutely. Cready uses encrypted systems, OTP authentication, and approved KYC providers to ensure safe and compliant processing.",
  },
  {
    id: "5",
    question: "What is Cready's unified personal access program?",
    answer:
      "It is a single digital onboarding that supports different needs like travel, wedding, renovation, emergency expenses, debt consolidation, and instant personal requirements.",
  },
];

// ============================================================
// FAQs Page Component
// ============================================================
export default function FaqsPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-4"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-6"
      >
        <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-[#A23AFC] p-4 sm:p-6 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-white/5 rounded-full" />
          </div>

          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">
                Frequently Asked Questions
              </h1>
              <p className="text-xs sm:text-sm text-violet-100">
                We believe borrowing should come with zero confusion
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQs List */}
      <div className="space-y-3">
        {staticFaqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`rounded-xl overflow-hidden transition-all ${
              openFaq === faq.id
                ? "bg-gradient-to-r from-violet-600 to-[#A23AFC] p-[1px]"
                : "border border-gray-100"
            }`}
          >
            <div className="bg-white rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full cursor-pointer p-4 text-left flex items-center justify-between focus:outline-none hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-800 pr-8 text-sm sm:text-base">
                  {index + 1}. {faq.question}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    openFaq === faq.id ? "bg-violet-100" : "bg-gray-100"
                  }`}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openFaq === faq.id ? "rotate-180 text-violet-600" : "text-gray-500"
                    }`}
                  />
                </div>
              </button>
              <AnimatePresence>
                {openFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-100 rounded-lg px-4 py-3">
                        <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-gray-50 rounded-xl border border-gray-100 p-4 sm:p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Still have questions?</h3>
              <p className="text-xs text-gray-500">Our support team is here to help you</p>
            </div>
          </div>
          <Link
            href="/dashboard/contact-us"
            className="inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium text-white transition-all w-full sm:w-auto"
          >
            Contact Us
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
