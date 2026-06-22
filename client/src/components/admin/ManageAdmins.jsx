import { useState } from "react";
import { api } from "../../api/leaders";
import { toCsv, downloadCsv } from "../../utils/adminUtils";

function BackupSection() {
  const [status, setStatus] = useState({});

  async function handleExport(table) {
    setStatus((s) => ({ ...s, [table]: "loading" }));
    try {
      const data = table === "leaders" ? await api.exportLeaders() : await api.exportRequests();
      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(`th-${table}-${date}.csv`, toCsv(data));
      setStatus((s) => ({ ...s, [table]: "done" }));
      setTimeout(() => setStatus((s) => ({ ...s, [table]: null })), 2000);
    } catch (err) {
      setStatus((s) => ({ ...s, [table]: "error" }));
    }
  }

  const btn = (table, label) => {
    const state = status[table];
    return (
      <button
        onClick={() => handleExport(table)}
        disabled={state === "loading"}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[1.3rem] text-gray-700 font-medium transition-colors disabled:opacity-50"
      >
        {state === "loading" ? "Exporting…" : state === "done" ? "✓ Downloaded" : state === "error" ? "Error — retry" : label}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
      <h3 className="text-[1.6rem] font-semibold text-gray-800 mb-1">Database Backup</h3>
      <p className="text-[1.3rem] text-gray-500 mb-4">
        Download a CSV snapshot of each table. Run this regularly — the Supabase free tier has no automatic backups.
      </p>
      <div className="flex flex-wrap gap-3">
        {btn("leaders", "⬇ Export Leaders")}
        {btn("requests", "⬇ Export Requests")}
      </div>
    </div>
  );
}

export default function ManageAdmins({
  newAdminEmail, setNewAdminEmail,
  newAdminRole, setNewAdminRole,
  handleAddAdmin,
  manageAdminsMsg,
  adminSearch, setAdminSearch,
  loadManageAdmins, loadAdminActivity,
  manageAdminsLoading,
  manageAdmins,
  user,
  setShowConfirm,
  handleRemoveAdmin,
  adminActivityLoading,
  adminActivity,
}) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-semibold text-brand-navy tracking-heading mb-2">Manage Admin Users</h2>
      <p className="text-[1.4rem] text-gray-500 mb-6">
        Control who can access the admin console and what they can do. Only super admins can add or remove users.
      </p>

      <div className="bg-brand-sand border border-brand-blue-border rounded-lg p-5 mb-8">
        <h3 className="text-[1.5rem] font-semibold text-brand-navy mb-3">Role permissions</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Super admin",
              color: "bg-purple-100 text-purple-800 border-purple-200",
              can: ["Everything admin can do", "Add and remove other admin users"],
              cannot: [],
            },
            {
              label: "Admin",
              color: "bg-blue-100 text-blue-800 border-blue-200",
              can: ["Approve and reject submissions", "Delete leaders", "Send enrichment magic links", "View all profile data and gaps"],
              cannot: ["Manage other admin users"],
            },
            {
              label: "Editor",
              color: "bg-gray-100 text-gray-700 border-gray-200",
              can: ["View all entries and profile data", "See which profile fields are missing", "Send enrichment magic links"],
              cannot: ["Approve, reject, or delete", "Manage admin users"],
            },
          ].map(({ label, color, can, cannot }) => (
            <div key={label} className="bg-white rounded-lg p-4 border">
              <span className={`inline-block px-3 py-1 rounded-full text-[1.2rem] font-medium mb-3 ${color}`}>
                {label}
              </span>
              <div className="text-[1.2rem] leading-relaxed">
                <span className="text-gray-700">{can.join(" · ")}</span>
                {cannot.length > 0 && (
                  <span className="text-gray-400"> — cannot: {cannot.join(", ")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-brand-blue-border rounded-lg p-6">
          <h3 className="text-[1.8rem] font-semibold text-brand-navy mb-4">Add a new admin</h3>
          <input
            type="email"
            placeholder="admin@example.org"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[1.5rem] focus:outline-none focus:ring-2 focus:ring-brand-pink mb-3"
          />
          <select
            value={newAdminRole}
            onChange={(e) => setNewAdminRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[1.5rem] focus:outline-none focus:ring-2 focus:ring-brand-pink mb-3"
          >
            <option value="admin">Admin — approve, reject, delete, send magic links</option>
            <option value="editor">Editor — view only, see profile gaps (no approvals)</option>
          </select>
          <button
            onClick={handleAddAdmin}
            disabled={!newAdminEmail.trim()}
            className="px-8 py-3 text-[1.5rem] font-medium rounded-lg bg-brand-pink text-white hover:bg-brand-pink/90 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Add user
          </button>
          {manageAdminsMsg && (
            <div className={`mt-4 rounded-lg px-4 py-3 text-[1.4rem] border ${
              manageAdminsMsg.startsWith("✓")
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-800"
            }`}>
              {manageAdminsMsg}
            </div>
          )}
        </div>

        <div className="bg-white border border-brand-blue-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[1.8rem] font-semibold text-brand-navy shrink-0">Current users</h3>
            <input
              type="text"
              placeholder="Search by email…"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="mx-4 flex-1 max-w-[240px] border border-gray-300 rounded-lg px-3 py-2 text-[1.3rem] focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
            <button
              onClick={() => { loadManageAdmins(); loadAdminActivity(); }}
              className="text-[1.4rem] text-brand-pink underline hover:text-brand-pink/80 cursor-pointer shrink-0"
            >
              Refresh ↻
            </button>
          </div>
          {manageAdminsLoading ? (
            <div className="flex items-center gap-3 py-4 text-[1.4rem] text-gray-500">
              <div className="w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
              Loading…
            </div>
          ) : manageAdmins.length === 0 ? (
            <p className="text-[1.5rem] text-gray-500">No admin users found.</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {manageAdmins
                .filter((a) => !adminSearch || a.email.toLowerCase().includes(adminSearch.toLowerCase()))
                .map((a) => {
                  const roleLabel = a.role === "super_admin" ? "Super admin" : a.role === "admin" ? "Admin" : "Editor";
                  const roleDesc = a.role === "super_admin"
                    ? "Full access + manages admin users"
                    : a.role === "admin"
                      ? "Can approve, reject, delete, send magic links"
                      : "View + send enrichment magic links — no approvals";
                  const badgeColor = a.role === "super_admin"
                    ? "bg-purple-100 text-purple-800"
                    : a.role === "admin"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700";
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 hover:border-brand-pink/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center text-[1.3rem] font-bold shrink-0">
                          {(a.email?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[1.4rem] font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                            <span className="truncate">{a.email}</span>
                            {a.email === user?.email && (
                              <span className="text-[1.1rem] text-gray-400 font-normal italic shrink-0">(you)</span>
                            )}
                          </div>
                          <div className="text-[1.1rem] text-gray-500 mt-0.5">
                            Added {a.created_by ? `by ${a.created_by}` : ""} · {new Date(a.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[1.1rem] font-medium ${badgeColor}`}>
                          {roleLabel}
                        </span>
                        {a.role !== "super_admin" ? (
                          <button
                            onClick={() => {
                              setShowConfirm({
                                action: "remove-admin",
                                title: "Remove user",
                                message: `Remove ${a.email} as ${roleLabel}? They will immediately lose access to the admin console.`,
                                confirmLabel: "Remove",
                                onConfirm: () => handleRemoveAdmin(a.email),
                              });
                            }}
                            className="text-red-400 hover:text-red-600 text-[1.3rem] px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                            title="Remove user"
                          >
                            ✕
                          </button>
                        ) : (
                          <span className="w-7" />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-brand-blue-border rounded-lg p-6">
        <h3 className="text-[1.8rem] font-semibold text-brand-navy mb-4">Admin activity</h3>
        {adminActivityLoading ? (
          <div className="flex items-center gap-3 py-4 text-[1.4rem] text-gray-500">
            <div className="w-5 h-5 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
            Loading…
          </div>
        ) : adminActivity.length === 0 ? (
          <p className="text-[1.4rem] text-gray-400 italic">No activity recorded yet. Changes to admin users will appear here.</p>
        ) : (
          <div className="space-y-2">
            {adminActivity.map((entry) => {
              const isAdd = entry.action === "add_admin";
              return (
                <div key={entry.id} className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
                  <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-[1.1rem] shrink-0 ${
                    isAdd ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>
                    {isAdd ? "+" : "−"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[1.4rem] text-gray-800">
                      <span className="font-medium">{entry.target_email}</span>
                      {isAdd ? <> added as <span className="font-medium">{entry.role}</span></> : <> removed</>}
                    </div>
                    <div className="text-[1.2rem] text-gray-400 mt-0.5">
                      by {entry.performed_by} · {new Date(entry.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BackupSection />
    </div>
  );
}
