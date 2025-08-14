"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trash, Info } from "lucide-react";
import { useNotifications } from "@/context/notification-context";

export default function PaymentsManagement() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const router = useRouter();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/signin");
      return;
    }
    loadPayments();
  }, [user, router]);

async function loadPayments() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8000/payments", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to load payments");
    }

    const data = await res.json();
    console.log("Payments API response:", data);

    if (Array.isArray(data)) {
      setPayments(data);
    } else if (data.payments && Array.isArray(data.payments)) {
      setPayments(data.payments);
    } else {
      setPayments([]);
      setError("Unexpected data format from payments API");
    }
  } catch (err) {
    setError(err.message || "Failed to load payments");
  }
}

  const handleUpdateStatus = async (paymentId, newStatus) => {
    const confirmed = window.confirm(`Are you sure you want to mark this payment as "${newStatus}"?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/payments/${paymentId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update status");

      addNotification({
        title: "Payment status updated",
        message: `Payment #${paymentId} marked as ${newStatus}`,
        type: "success",
      });

      // Cập nhật state local cho nhanh
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      setError(err.message || "Error updating status");
    }
  };

  const handleDelete = async (paymentId) => {
    const confirmed = window.confirm("Delete this payment record? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/payments/${paymentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Delete failed");

      addNotification({
        title: "Payment deleted",
        message: `Payment #${paymentId} deleted successfully.`,
        type: "success",
      });

      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Management</h1>
      {error && (
        <div className="bg-red-500/20 text-red-500 p-2 rounded mb-4">{error}</div>
      )}

      <div className="overflow-x-auto border rounded shadow">
        <table className="table-auto w-full text-sm border-collapse">
          <thead className="bg-muted/30 border-b-2 border-muted">
            <tr>
              <th className="px-2 py-3 text-center">Payment ID</th>
              <th className="px-2 py-3 text-center">User ID</th>
              <th className="px-2 py-3 text-center">Username</th>
              <th className="px-2 py-3 text-center">Amount (VNĐ)</th>
              <th className="px-2 py-3 text-center">Status</th>
              <th className="px-2 py-3 text-center">Created At</th>
              <th className="px-2 py-3 text-center">Actions</th>
              <th className="px-2 py-3 text-center">More</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-muted/10">
                <td className="px-2 py-3 text-center truncate max-w-[120px] border-b border-muted">{p.id}</td>
                <td className="px-2 py-3 text-center border-b border-muted">{p.user_id || "N/A"}</td>
                <td className="px-2 py-3 text-center border-b border-muted">{p.username || "N/A"}</td>
                <td className="px-2 py-3 text-center border-b border-muted">{p.amount}</td>
                <td className="capitalize px-2 py-3 text-center border-b border-muted">{p.status}</td>
                <td className="px-2 py-3 text-center border-b border-muted">{new Date(p.created_at).toLocaleString()}</td>
                <td className="px-2 py-3 text-center border-b border-muted">
                  <div className="flex flex-col sm:flex-row gap-1 justify-center items-center">
                    {p.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 text-white font-semibold shadow-sm hover:brightness-110 transition"
                          onClick={() => handleUpdateStatus(p.id, "completed")}
                        >
                          <CheckCircle size={14} className="mr-1" /> Confirm
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      className="bg-gray-700 text-white font-semibold shadow-sm hover:brightness-110 transition flex items-center"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash size={14} className="mr-1" /> Delete
                    </Button>
                  </div>
                </td>
                <td className="px-2 py-3 text-center border-b border-muted">
                  <button
                    onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                    className="text-blue-500 hover:underline flex items-center justify-center gap-1"
                  >
                    <Info size={16} />
                    <span className="hidden sm:inline">More</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Expanded Details */}
        {expandedRow && (
          <div className="border-t p-4 bg-muted/20 rounded-b">
            {(() => {
              const p = payments.find((p) => p.id === expandedRow);
              if (!p) return null;
              return (
                <div className="space-y-2 max-w-4xl">
                  <p><strong>Payment ID:</strong> {p.id}</p>
                  <p><strong>User ID:</strong> {p.user_id || "N/A"}</p>
                  <p><strong>Username:</strong> {p.username || "N/A"}</p>
                  <p><strong>Amount:</strong> {p.amount}</p>
                  <p><strong>Currency:</strong> {p.currency || "N/A"}</p>
                  <p><strong>Method:</strong> {p.method || "N/A"}</p>
                  <p><strong>Plan Type:</strong> {p.plan_type || "N/A"}</p>
                  <p><strong>Duration:</strong> {p.duration || "N/A"}</p>
                  <p><strong>Status:</strong> {p.status}</p>
                  <p><strong>Created At:</strong> {new Date(p.created_at).toLocaleString()}</p>
                  <p><strong>Checkout URL:</strong> {p.checkout_url ? (
                    <a href={p.checkout_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Link
                    </a>
                  ) : "N/A"}</p>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
