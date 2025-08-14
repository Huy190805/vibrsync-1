"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function ArtistEarnings() {
  const { user, loading: authLoading } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "artist") {
      router.push("/signin");
      return;
    }
    async function fetchEarnings() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/artist/earnings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setEarnings(data);
      } catch (err) {
        console.error(err);
      }
    }
    if (!authLoading) fetchEarnings();
  }, [user, authLoading, router]);

  if (authLoading || !earnings) {
    return <div>Loading earnings...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Earnings Overview</h1>
      <div className="bg-white p-6 rounded shadow">
        <p className="text-gray-600">Total Earnings</p>
        <p className="text-3xl font-bold text-green-600">${earnings.total.toFixed(2)}</p>
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Recent Payments</h2>
          <ul className="space-y-2">
            {earnings.recentPayments.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.date}</span>
                <span className="text-green-600">${p.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
