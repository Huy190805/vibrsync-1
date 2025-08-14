"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PremiumPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch("/plans")
      .then((res) => res.json())
      .then((data) => setPlans(data));
  }, []);

  return (
    <main className="text-white bg-black">
      {/* Hero Section */}
      <section className="min-h-[70vh] bg-gradient-to-r from-[#4B0082] to-[#000080] flex flex-col items-center justify-center text-center px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Listen without limits. Try 2 months of Premium for{" "}
          <span className="text-white">₫59,000</span>.
        </h1>
        <p className="text-lg mb-6">
          Only ₫59,000/month after. Cancel anytime.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">
            Try 2 months for ₫59,000
          </button>
          <Link
            href="#plans"
            className="px-6 py-3 border border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition"
          >
            View all plans
          </Link>
        </div>
        <p className="text-xs text-white/80 mt-4 max-w-xl">
          ₫59,000 for 2 months, then ₫59,000 per month after. Offer only
          available if you haven't tried Premium before.{" "}
          <Link href="#" className="underline">
            Terms apply
          </Link>.
        </p>
      </section>

      {/* Plus & Premium Plans */}
      <section
        id="plans"
        className="py-16 px-6 bg-gradient-to-b from-black to-[#0e0b1d] flex justify-center"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[20px] p-8 shadow-lg flex flex-col justify-between h-full ${
                plan.type === "plus"
                  ? "bg-gradient-to-b from-[#6B21A8] to-[#4C1D95]"
                  : "bg-gradient-to-b from-[#D97706] to-[#92400E]"
              }`}
            >
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  VibeSync{" "}
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${
                      plan.type === "plus"
                        ? "bg-[#A855F7] text-white"
                        : "bg-yellow-400 text-black"
                    }`}
                  >
                    {plan.label}
                  </span>
                </h2>
                <p className="mt-2 text-gray-200">{plan.description}</p>
                <p className="mt-6 text-2xl font-bold">
                  {plan.price.toLocaleString()}đ / tháng
                </p>
              </div>
              <div className="flex flex-col h-full justify-between">
                <Link
                  href={`/upgrade?type=${plan.type}`}
                  className={`mt-6 w-full py-3 rounded-full font-semibold text-lg text-center ${
                    plan.type === "plus"
                      ? "bg-[#C084FC] hover:bg-[#A855F7] text-white"
                      : "bg-yellow-400 hover:bg-yellow-300 text-black"
                  }`}
                >
                  ĐĂNG KÝ GÓI
                </Link>
                <hr className="my-6 border-white/20" />
                <ul className="space-y-3 text-gray-100">
                  {plan.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span
                        className={`text-center font-bold ${
                          plan.type === "plus" ? "text-purple-500" : "text-yellow-400"
                        }`}
                      >
                        ✓
                      </span>{" "}
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}