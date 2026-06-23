"use client";

import React, { useState } from "react";

interface EmiCalculatorProps {
  heading?: React.ReactNode;
  gradient?: string;
  showSummary?: boolean;
  showApplyButton?: boolean;
  onApply?: () => void;

  minLoan?: number;
  maxLoan?: number;
  defaultLoan?: number;

  minInterest?: number;
  maxInterest?: number;
  defaultInterest?: number;

  minTenure?: number;
  maxTenure?: number;
  defaultTenure?: number;
}

const EmiCalculator: React.FC<EmiCalculatorProps> = ({
  heading = "EMI Calculator",
  gradient = "from-[#ECF4E9] to-[#FFFFFF]",
  showSummary = true,
  showApplyButton = true,
  onApply,

  minLoan = 50000,
  maxLoan = 5000000,
  defaultLoan = 100000,

  minInterest = 0,
  maxInterest = 50,
  defaultInterest = 10.5,

  minTenure = 1,
  maxTenure = 60,
  defaultTenure = 48,
}) => {
  const [loanAmount, setLoanAmount] = useState(defaultLoan);
  const [interestRate, setInterestRate] = useState(defaultInterest);
  const [tenure, setTenure] = useState(defaultTenure);

  const calculateEmi = () => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure;

    if (monthlyRate === 0) {
      return (principal / months).toFixed(0);
    }

    const emi =
      (principal *
        monthlyRate *
        Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return emi ? emi.toFixed(0) : "0";
  };

  const emi = Number(calculateEmi());
  const totalPayable = emi * tenure;
  const interestAmount = totalPayable - loanAmount;

  return (
    <section
      className={`max-w-3xl mx-auto py-6`}
    >
      <div className="max-w-4xl mx-auto px-3">
        <h2 className="text-xl md:text-3xl font-bold text-center mb-1">
          {heading}
        </h2>

        <p className="text-center text-gray-500 text-sm mb-6">
          Smart and easy way to calculate your Loan EMI
        </p>

        <div className="flex flex-col lg:flex-row gap-5 justify-center">
          {/* Calculator Card */}
          <div
            className="bg-white border border-[#D4C7FF] rounded-xl p-5 w-full lg:max-w-[320px]"
            style={{
              boxShadow:
                "0px 6px 20px rgba(0,0,0,0.06)",
            }}
          >
            {/* Loan Amount */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-sm">
                  Loan Amount
                </span>

                <input
                  value={`₹ ${loanAmount.toLocaleString(
                    "en-IN"
                  )}`}
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(/\D/g, "");
                    setLoanAmount(Number(value));
                  }}
                  className="border rounded-md px-2 py-1.5 text-sm text-[#6232FF] bg-[#F7F4FF]"
                />
              </div>

              <input
                type="range"
                min={minLoan}
                max={maxLoan}
                step={10000}
                value={loanAmount}
                onChange={(e) =>
                  setLoanAmount(Number(e.target.value))
                }
                className="w-full accent-[#6232FF]"
              />

              <div className="flex justify-between text-[10px] mt-0.5 text-gray-500">
                <span>
                  ₹ {minLoan.toLocaleString("en-IN")}
                </span>
                <span>
                  ₹ {maxLoan.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-sm">
                  Interest Rate
                </span>

                <input
                  value={interestRate}
                  onChange={(e) =>
                    setInterestRate(
                      Number(e.target.value)
                    )
                  }
                  className="border rounded-md px-2 py-1.5 w-20 text-sm text-[#6232FF] bg-[#F7F4FF]"
                />
              </div>

              <input
                type="range"
                min={minInterest}
                max={maxInterest}
                step={0.1}
                value={interestRate}
                onChange={(e) =>
                  setInterestRate(
                    Number(e.target.value)
                  )
                }
                className="w-full accent-[#6232FF]"
              />
            </div>

            {/* Tenure */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-sm">
                  Tenure (Months)
                </span>

                <input
                  value={tenure}
                  onChange={(e) =>
                    setTenure(
                      Number(e.target.value)
                    )
                  }
                  className="border rounded-md px-2 py-1.5 w-20 text-sm text-[#6232FF] bg-[#F7F4FF]"
                />
              </div>

              <input
                type="range"
                min={minTenure}
                max={maxTenure}
                step={1}
                value={tenure}
                onChange={(e) =>
                  setTenure(
                    Number(e.target.value)
                  )
                }
                className="w-full accent-[#6232FF]"
              />
            </div>

            {/* EMI Footer */}
            <div className="bg-[#F0ECFF] rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div>
                <p className="text-xs text-gray-500">
                  Monthly EMI
                </p>

                <p className="text-xl font-bold text-[#6232FF]">
                  ₹ {emi.toLocaleString()}
                </p>
              </div>

              {showApplyButton && (
                <button
                  onClick={onApply}
                  className="bg-[#6232FF] text-white px-4 py-2 text-sm rounded-full font-medium hover:opacity-90 transition"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Summary */}
          {showSummary && (
            <div className="w-full lg:max-w-[220px]">
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-sm">
                    Principal Amount
                  </p>
                  <p className="text-[#6232FF] text-base">
                    ₹ {loanAmount.toLocaleString()}
                  </p>
                </div>

                <hr />

                <div>
                  <p className="font-semibold text-sm">
                    Interest Amount
                  </p>
                  <p className="text-[#6232FF] text-base">
                    ₹ {interestAmount.toLocaleString()}
                  </p>
                </div>

                <hr />

                <div>
                  <p className="font-semibold text-sm">
                    Total Amount Payable
                  </p>
                  <p className="text-[#6232FF] text-base">
                    ₹ {totalPayable.toLocaleString()}
                  </p>
                </div>

                <hr />

                <div>
                  <p className="font-semibold text-sm">
                    Tenure
                  </p>
                  <p className="text-[#6232FF] text-base">
                    {tenure} Months
                  </p>
                </div>

                <hr />

                <div>
                  <p className="font-semibold text-sm">
                    Per Month EMI
                  </p>
                  <p className="text-[#6232FF] text-base">
                    ₹ {emi.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EmiCalculator;