"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Info, Trash } from "lucide-react";
import { useNotifications } from "@/context/notification-context";
import Select from "react-select"; // Thêm React-Select
import PaymentsManagement from "./PaymentsManagement";

export default function ArtistRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [allArtists, setAllArtists] = useState([]);
  const [selectedArtistInfo, setSelectedArtistInfo] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/signin");
      return;
    }

    async function loadRequests() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/artist_requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setRequests(data || []);
      } catch (err) {
        setError(err.message);
      }
    }

    loadRequests();
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "admin" && selectedRequest) {
      fetchArtists();
    }
  }, [user, selectedRequest]);

  const fetchArtists = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8000/api/artists", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    // Chuyển đổi dữ liệu nghệ sĩ thành định dạng phù hợp với React-Select
    setAllArtists(
      Array.isArray(data.artists)
        ? data.artists.map((artist) => ({
            value: artist.id,
            label: `${artist.name} (${artist.genres?.join(", ") || "N/A"})`,
            artist, // Lưu toàn bộ thông tin nghệ sĩ để sử dụng sau
          }))
        : []
    );
  };

  useEffect(() => {
    const fetchSelectedArtistInfo = async () => {
      if (!selectedArtistId) {
        setSelectedArtistInfo(null);
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/artists/${selectedArtistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedArtistInfo(data);
    };

    fetchSelectedArtistInfo();
  }, [selectedArtistId]);

  const handleApprove = async (requestId) => {
    const confirmed = window.confirm("Are you sure you want to approve this artist request?");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/artist_requests/${requestId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ matched_artist_id: selectedArtistId || null }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to approve");

      const approvedRequest = requests.find((r) => r.id === requestId);

      const notify = async (user_id, title, message, type) => {
        const res = await fetch("http://localhost:8000/api/notifications", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, title, message, type }),
        });
        const notif = await res.json();
        if (!res.ok) throw new Error("Notification failed");
        addNotification(notif);
      };

      await notify(
        approvedRequest.user_id,
        "Artist request approved",
        "Your artist application has been approved!",
        "artist_request"
      );
      await notify(
        user.id,
        "Artist approved",
        `You approved the artist request from ${approvedRequest.name}`,
        "admin_action"
      );

      alert("✅ Approved successfully!");
      setSelectedRequest(null);
      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (requestId) => {
    const confirmed = window.confirm("Reject this request?");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/artist_requests/${requestId}/reject`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const rejectedRequest = requests.find((r) => r.id === requestId);
      const notify = async (user_id, title, message, type) => {
        const res = await fetch("http://localhost:8000/api/notifications", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, title, message, type }),
        });
        const notif = await res.json();
        if (!res.ok) throw new Error("Notification failed");
        addNotification(notif);
      };

      await notify(
        rejectedRequest.user_id,
        "Artist request rejected",
        "Your artist application was rejected.",
        "artist_request"
      );
      await notify(
        user.id,
        "Artist rejected",
        `You rejected the artist request from ${rejectedRequest.name}`,
        "admin_action"
      );

      alert("❌ Rejected successfully!");
      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (requestId) => {
    const confirmed = window.confirm("Delete this request? This action cannot be undone.");
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/artist_requests/${requestId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Delete failed");

      alert("🗑️ Request deleted successfully!");
      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Artist Requests</h1>
      {error && <div className="bg-red-500/20 text-red-500 p-2 rounded mb-4">{error}</div>}
      <div className="overflow-x-auto border rounded shadow">
        <table className="table-auto w-full text-sm border-collapse">
          <thead className="bg-muted/30 border-b-2 border-muted">
            <tr>
              <th className="px-2 py-3 text-center">User ID</th>
              <th className="px-2 py-3 text-center">Name</th>
              <th className="px-2 py-3 text-center">Email</th>
              <th className="px-2 py-3 text-center">Phone</th>
              <th className="px-2 py-3 text-center">Status</th>
              <th className="px-2 py-3 text-center">Actions</th>
              <th className="px-2 py-3 text-center">More</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-muted/10">
                <td className="px-2 py-3 text-center truncate max-w-[100px] border-b border-muted">{req.id}</td>
                <td className="px-2 py-3 text-center truncate max-w-[120px] border-b border-muted">{req.name}</td>
                <td className="px-2 py-3 text-center truncate max-w-[160px] border-b border-muted">{req.email}</td>
                <td className="px-2 py-3 text-center border-b border-muted">{req.phone || "N/A"}</td>
                <td className="capitalize px-2 py-3 text-center border-b border-muted">{req.status}</td>
                <td className="px-2 py-3 text-center border-b border-muted">
                  <div className="flex flex-col sm:flex-row gap-1 justify-center items-center">
                    {req.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-700 text-white font-semibold shadow-sm hover:brightness-105 transition"
                          onClick={() => {
                            setSelectedRequest(req);
                            fetchArtists();
                          }}
                        >
                          Merge / Approve
                        </Button>
                        <Button size="sm" onClick={() => handleReject(req.id)} className="bg-red-600">
                          <XCircle size={14} className="mr-1" /> Reject
                        </Button>
                      </>
                    )}
                      <Button
                      size="sm"
                      onClick={() => handleDelete(req.id)}
                      className="bg-gradient-to-r from-gray-500 via-gray-700 to-gray-900 text-white font-semibold shadow-sm hover:brightness-105 transition flex items-center"
                    >
                  <Trash size={14} className="mr-1" /> Delete
                  </Button>
                  </div>
                </td>
                <td className="px-2 py-3 text-center border-b border-muted">
                  <button
                    onClick={() => setExpandedRow(expandedRow === req.id ? null : req.id)}
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

        {/* Request Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
            <div className="bg-white text-black p-6 rounded-xl w-full max-w-3xl shadow-xl space-y-4">
              <h2 className="text-xl font-bold">Approve Artist Request: {selectedRequest.name}</h2>

              <label className="block font-medium">Merge into Existing Artist?</label>
              <Select
                options={[{ value: "", label: "Create New Artist" }, ...allArtists]}
                value={allArtists.find((artist) => artist.value === selectedArtistId) || {
                  value: "",
                  label: "Create New Artist",
                }}
                onChange={(selectedOption) => setSelectedArtistId(selectedOption?.value || "")}
                placeholder="Search for an artist..."
                isClearable
                isSearchable
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#d1d5db",
                    borderRadius: "0.375rem",
                    padding: "0.25rem",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />

              {/* Comparison View */}
              {selectedArtistInfo && (
               <div className="mt-4 grid grid-cols-2 gap-4 border rounded p-4 bg-gray-50 max-h-[400px] overflow-y-auto">
               <div>
              <h3 className="font-semibold mb-2">🎤 User Request</h3>
               <p><strong>Name:</strong> {selectedRequest.name}</p>
               <p>
              <strong>Bio:</strong>{" "}
              {selectedRequest.bio?.length > 200
                ? `${selectedRequest.bio.slice(0, 200)}... See more...`
                : selectedRequest.bio || "N/A"}
              </p>
              <p><strong>Phone:</strong> {selectedRequest.phone || "N/A"}</p>
              <p><strong>Genres:</strong> {selectedRequest.genres?.join(", ") || "N/A"}</p>
              </div>
              <div>
            <h3 className="font-semibold mb-2">📀 Existing Artist</h3>
            <p><strong>Name:</strong> {selectedArtistInfo.name}</p>
            <p>
              <strong>Bio:</strong>{" "}
              {selectedArtistInfo.bio?.length > 200
                ? `${selectedArtistInfo.bio.slice(0, 200)}.... See more...`
                : selectedArtistInfo.bio || "N/A"}
             </p>
             <p><strong>Phone:</strong> {selectedArtistInfo.phone || "N/A"}</p>
             <p><strong>Genres:</strong> {selectedArtistInfo.genres?.join(", ") || "N/A"}</p>
             </div>
             </div>
             )}
              <div className="flex justify-end gap-3 mt-4">
                <Button className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-white font-semibold px-4 py-2 rounded-md shadow-md hover:brightness-105 transition"
                onClick={() => handleApprove(selectedRequest.id)}>
                  ✅ Approve
                </Button>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  ❌ Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Expand Details Section */}
        {expandedRow && (
          <div className="border-t p-4 bg-muted/20 rounded-b">
            {(() => {
              const r = requests.find((r) => r.id === expandedRow);
              return (
                <div className="space-y-2">
                  <p><strong>User ID:</strong> {r.id}</p>
                  <p><strong>Bio:</strong> {r.bio || "N/A"}</p>
                  <p><strong>Social Links:</strong></p>
                  {r.social_links?.length > 0 ? (
                    <ul className="list-disc ml-5">
                      {r.social_links.map((s, i) => (
                        <li key={i}>
                          <a href={s} target="_blank" className="text-purple-400 hover:underline">{s}</a>
                        </li>
                      ))}
                    </ul>
                  ) : <p>N/A</p>}
                </div>
              );
            })()}
          </div>
        )}
      </div>
  <div className="mt-12"> {/* Thêm khoảng cách 12 (3rem) ở trên */}
    <PaymentsManagement />
  </div>
    </div>
    
  );
}