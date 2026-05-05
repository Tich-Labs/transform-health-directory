import React, { useState, useEffect, useMemo } from "react";
import { api } from "../api/leaders";

const SIDEBAR_ITEMS = [
  { id: "pending",   label: "Pending Submissions", icon: "inbox"     },
  { id: "nominated", label: "Nominated",            icon: "user-plus" },
  { id: "requests",  label: "Profile Requests",     icon: "mail"      },
  { id: "all",       label: "All Entries",           icon: "list"      },
];

function InboxIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  );
}

const ICONS = { inbox: InboxIcon, mail: MailIcon, list: ListIcon, "user-plus": UserPlusIcon };

function getInitials(first, last) {
  return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();
}

// expertise is stored as text[] in Supabase — normalise to array for all comparisons
function toTags(expertise) {
  if (!expertise) return [];
  if (Array.isArray(expertise)) return expertise.filter(Boolean);
  return expertise.split(/,\s*/).filter(Boolean);
}

export default function Admin({ onGoToDirectory }) {
  const [pending,          setPending]          = useState([]);
  const [nominated,        setNominated]        = useState([]);
  const [all,              setAll]              = useState([]);
  const [requests,         setRequests]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [activeTab,        setActiveTab]        = useState("pending");
  const [requestSubTab,    setRequestSubTab]    = useState("updates");
  const [selectedDeletes,  setSelectedDeletes]  = useState([]);
  const [selectedPending,  setSelectedPending]  = useState([]);
  const [actionId,         setActionId]         = useState(null);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [filterCountry,    setFilterCountry]    = useState("");
  const [filterExpertise,  setFilterExpertise]  = useState("");
  const [sortOrder,        setSortOrder]        = useState("az");
  const [expandedId,       setExpandedId]       = useState(null);
  const [expandedAllId,    setExpandedAllId]    = useState(null);
  const [actionMessage,    setActionMessage]    = useState("");
  const [allPage,          setAllPage]          = useState(1);
  const [selectedRequest,  setSelectedRequest]  = useState(null);
  const [expandedNominee,  setExpandedNominee]  = useState(null);
  const [copiedId,         setCopiedId]         = useState(null);
  const [showConfirm,      setShowConfirm]      = useState(null);
  const [pendingSort,      setPendingSort]      = useState("name_az");
  const PAGE_SIZE = 15;

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [allLeaders, reqs] = await Promise.all([
        api.getLeaders("all"),
        api.getRequests(),
      ]);
      const leaders = allLeaders || [];
      setPending(leaders.filter(l => l.status === "pending" && l.branch !== "nominate"));
      setNominated(leaders.filter(l => l.status === "pending" && l.branch === "nominate"));
      setAll(leaders);
      if (reqs?.length) setRequests(reqs);
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function confirmAction(id, action) {
    setActionId(id);
    setActionMessage("");
    try {
      if (action === "approve") await api.approveRequest(id);
      else await api.rejectRequest(id);

      const item = all.find((i) => i.id === id);
      const updated = item ? { ...item, status: action === "approve" ? "live" : "rejected" } : null;
      if (updated) setAll(all.map((i) => (i.id === id ? updated : i)));
      setPending((current) => current.filter((p) => p.id !== id));
      setNominated((current) => current.filter((p) => p.id !== id));
      setActionMessage(action === "approve" ? "Profile approved and published." : "Profile rejected and removed from pending.");
      setExpandedId(null); setExpandedAllId(null); setExpandedNominee(null);
    } catch (e) {
      console.error(e);
      setActionMessage("Unable to complete action. Please try again.");
    } finally {
      setActionId(null);
    }
  }

  function handleAction(id, action) {
    const item = pending.find((i) => i.id === id) || nominatedList.find((i) => i.id === id);
    const name = `${item?.first_name || ''} ${item?.last_name || ''}`.trim();
    if (action === "approve") {
      setShowConfirm({ title: "Approve profile?", message: `${name} will be published to the public directory.`, action: "approve", confirmLabel: "Approve", onConfirm: () => confirmAction(id, action) });
    } else {
      setShowConfirm({ title: "Reject profile?", message: `${name} will be removed from the pending queue.`, action: "reject", confirmLabel: "Reject", onConfirm: () => confirmAction(id, action) });
    }
  }

  const handleRefresh = () => loadData();

  function buildOutreachMessage(item) {
    const name = item.first_name || "there";
    const nominator = item.editor_email || item.editorEmail || "a colleague";
    const role = item.role || "your work";
    const org = item.organisation || "";
    return `Hi ${name},\n\nYou've been nominated to be featured in the Transform Health Women Leaders in Digital Health Database — a global initiative to increase visibility and representation of women leaders in digital health across Africa and beyond.\n\n${org ? `We'd love to include your profile (${role} at ${org}) in the directory.\n\n` : ""}If you'd like to learn more or have your profile added, please reply to this message or visit transformhealthcoalition.org/leaders.\n\nWarm regards,\nThe Transform Health Team`;
  }

  async function handleCopyMessage(item) {
    const msg = buildOutreachMessage(item);
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = msg;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleSendUpdateLink(req) {
    setActionId(req.id);
    setActionMessage("");
    try {
      await api.requestManage({ firstName: req.first_name, lastName: req.last_name, email: req.email, linkedin: req.linkedin });
      setRequests((current) => current.map((r) => (r.id === req.id ? { ...r, link_sent: true } : r)));
      setActionMessage(`Update link sent to ${req.email}.`);
    } catch (e) {
      console.error(e);
      setRequests((current) => current.map((r) => (r.id === req.id ? { ...r, link_sent: true } : r)));
      setActionMessage(`Link marked as sent for ${req.first_name} ${req.last_name}.`);
    } finally {
      setActionId(null);
    }
  }

  function toggleDeleteSelect(id) {
    setSelectedDeletes((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }

  function toggleAllDeletes() {
    const deleteRequests = requests.filter((r) => r.request_type === "delete" && r.status === "pending");
    const allSelected = deleteRequests.every((r) => selectedDeletes.includes(r.id));
    if (allSelected) setSelectedDeletes([]);
    else setSelectedDeletes(deleteRequests.map((r) => r.id));
  }

  function togglePendingSelect(id) {
    setSelectedPending((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }

  function toggleAllPending() {
    const allSelected = filteredPending.every((r) => selectedPending.includes(r.id));
    if (allSelected) setSelectedPending([]);
    else setSelectedPending(filteredPending.map((r) => r.id));
  }

  function handleBulkPending(action) {
    if (selectedPending.length === 0) return;
    const label = action === "approve" ? "Approve" : "Reject";
    setShowConfirm({
      title: `${label} ${selectedPending.length} submission(s)?`,
      message: action === "approve" ? "These profiles will be published to the public directory." : "These profiles will be removed from the pending queue.",
      action,
      confirmLabel: `${label} ${selectedPending.length}`,
      onConfirm: () => { selectedPending.forEach((id) => confirmAction(id, action)); setSelectedPending([]); },
    });
  }

  async function handleBulkDelete() {
    if (selectedDeletes.length === 0) return;
    setShowConfirm({
      title: `Approve ${selectedDeletes.length} deletion(s)?`,
      message: "These profiles will be permanently removed from the directory.",
      action: "delete",
      confirmLabel: `Delete ${selectedDeletes.length}`,
      onConfirm: () => executeBulkDelete(),
    });
  }

  async function executeBulkDelete() {
    setActionMessage("");
    try {
      await Promise.all(selectedDeletes.map((id) => api.approveDeleteRequest(id)));
      setRequests((current) => current.map((r) => selectedDeletes.includes(r.id) ? { ...r, status: "approved" } : r));
      setActionMessage(`${selectedDeletes.length} deletion request(s) approved.`);
      setSelectedDeletes([]);
    } catch (e) {
      console.error(e);
      setActionMessage("Unable to complete bulk deletion. Please try again.");
    }
  }

  async function handleApproveSingleDelete(req) {
    setActionId(req.id);
    setActionMessage("");
    try {
      await api.approveDeleteRequest(req.id);
      setRequests((current) => current.map((r) => r.id === req.id ? { ...r, status: "approved" } : r));
      setActionMessage(`Profile for ${req.first_name} ${req.last_name} removed from directory.`);
      setSelectedRequest(null);
    } catch (e) {
      console.error(e);
      setActionMessage("Unable to complete deletion. Please try again.");
    } finally {
      setActionId(null);
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setRequestSubTab("updates");
    setSelectedDeletes([]); setSelectedPending([]);
    setExpandedId(null); setExpandedAllId(null); setExpandedNominee(null);
    setAllPage(1); setSearchQuery(""); setFilterCountry(""); setFilterExpertise("");
  };

  const pendingCount      = pending.length;
  const nominatedList     = nominated;
  const nominatedCount    = nominated.length;
  const totalPendingCount = pending.length + nominated.length;
  const updateRequests = requests.filter((r) => r.request_type === "update" && r.status === "pending");
  const deleteRequests = requests.filter((r) => r.request_type === "delete" && r.status === "pending");
  const requestsCount  = requests.filter((r) => r.status === "pending").length;
  const liveCount      = all.filter((item) => item.status === "live").length;
  const rejectedCount  = all.filter((item) => item.status === "rejected").length;
  const allCount       = all.length;

  const countries = useMemo(() => {
    const set = new Set();
    all.forEach((item) => { if (item.country) set.add(item.country); });
    return Array.from(set).sort();
  }, [all]);

  const expertiseOptions = useMemo(() => {
    const set = new Set();
    all.forEach((item) => { toTags(item.expertise).forEach((tag) => set.add(tag)); });
    return Array.from(set).sort();
  }, [all]);

  const filteredPending = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const results = pending.filter((item) => {
      const text = [item.first_name, item.last_name, item.role, item.organisation, item.editor_email, item.expertise, item.country, item.bio].filter(Boolean).join(" ").toLowerCase();
      if (query && !text.includes(query)) return false;
      if (filterCountry && item.country !== filterCountry) return false;
      if (filterExpertise) {
        const tags = toTags(item.expertise).map((tag) => tag.toLowerCase());
        if (!tags.includes(filterExpertise.toLowerCase())) return false;
      }
      return true;
    });
    return results.slice().sort((a, b) => {
      if (pendingSort === "name_az") { const l = `${a.last_name} ${a.first_name}`.toLowerCase(); const r = `${b.last_name} ${b.first_name}`.toLowerCase(); return l < r ? -1 : l > r ? 1 : 0; }
      if (pendingSort === "name_za") { const l = `${a.last_name} ${a.first_name}`.toLowerCase(); const r = `${b.last_name} ${b.first_name}`.toLowerCase(); return r < l ? -1 : r > l ? 1 : 0; }
      if (pendingSort === "date_new") { const aD = a.submitted_at || a.created_at || ""; const bD = b.submitted_at || b.created_at || ""; return bD.localeCompare(aD); }
      if (pendingSort === "date_old") { const aD = a.submitted_at || a.created_at || ""; const bD = b.submitted_at || b.created_at || ""; return aD.localeCompare(bD); }
      if (pendingSort === "expertise") { const aE = toTags(a.expertise).join(", ").toLowerCase(); const bE = toTags(b.expertise).join(", ").toLowerCase(); return aE < bE ? -1 : aE > bE ? 1 : 0; }
      return 0;
    });
  }, [pending, searchQuery, filterCountry, filterExpertise, pendingSort]);

  const filteredAll = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const results = all.filter((item) => {
      const text = [item.first_name, item.last_name, item.role, item.organisation, item.editor_email, item.expertise, item.country].filter(Boolean).join(" ").toLowerCase();
      return !query || text.includes(query);
    });
    return results.slice().sort((a, b) => {
      const l = `${a.last_name} ${a.first_name}`.toLowerCase();
      const r = `${b.last_name} ${b.first_name}`.toLowerCase();
      return sortOrder === "za" ? (r < l ? -1 : r > l ? 1 : 0) : (l < r ? -1 : l > r ? 1 : 0);
    });
  }, [all, searchQuery, sortOrder]);

  const sidebarData = [
    { ...SIDEBAR_ITEMS[0], count: pendingCount   },
    { ...SIDEBAR_ITEMS[1], count: nominatedCount },
    { ...SIDEBAR_ITEMS[2], count: requestsCount  },
    { ...SIDEBAR_ITEMS[3], count: allCount       },
  ];

  return (
    <div className="flex flex-col h-screen bg-brand-sand overflow-hidden">
      <header className="border-b border-gray-200 bg-brand-parchment shadow-sm flex-shrink-0">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 px-8 py-5">
          <div className="flex items-center gap-4 justify-start">
            <div className="w-11 h-11 rounded-full bg-brand-navy flex items-center justify-center text-white text-[1.4rem] font-bold">T</div>
            <div>
              <div className="text-xl font-semibold text-gray-900">Transform Health</div>
              <div className="text-[1.2rem] text-gray-600">Women Leaders in Digital Health Database</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">Admin Console</div>
          </div>
          <div className="flex justify-end">
            <span className="text-[1.3rem] text-gray-400 italic">Test mode — no login required</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 min-w-[24rem] border-r border-gray-200 bg-brand-parchment shadow-sm flex flex-col flex-shrink-0">
          <div className="px-6 py-5 border-b border-gray-200 border-t-[4px] border-t-brand-navy">
            <div className="flex items-center justify-center">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center rounded-md border border-brand-navy px-3 py-2 text-[1.4rem] font-medium text-brand-navy bg-brand-parchment hover:bg-brand-navy hover:text-white transition-colors"
              >
                Refresh ↻
              </button>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarData.map((item) => {
              const Icon = ICONS[item.icon];
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-lg font-medium transition-colors ${
                    isActive
                      ? "bg-brand-blue-tint text-brand-navy border border-brand-blue-border"
                      : "bg-transparent text-gray-500 border border-transparent hover:bg-gray-50"
                  }`}
                >
                  <span className={isActive ? "text-brand-navy" : "text-gray-400"}>
                    <Icon />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count !== undefined && (
                    <span className={`text-[1.4rem] font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-brand-navy text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-gray-200">
            <button
              onClick={() => onGoToDirectory?.()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-brand-pink px-3 py-2 text-[1.4rem] font-medium text-brand-pink bg-brand-parchment hover:bg-brand-pink hover:text-white transition-colors"
            >
              View directory
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Page header + stats */}
          <div className="px-8 py-6 border-b border-brand-warm-border flex-shrink-0 bg-gradient-to-br from-brand-sand to-[#ede7d8]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-brand-navy tracking-heading">
                  {sidebarData.find((s) => s.id === activeTab)?.label}
                </h2>
                <p className="text-lg text-gray-600 mt-1">
                  Review and manage member submissions, profile requests, and published entries.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center sm:text-right">
                <div className="bg-brand-parchment rounded-xl px-[1.6rem] py-[1.2rem] border border-brand-yellow-border">
                  <div className="text-[1.2rem] uppercase tracking-wider text-accent-amber">Pending</div>
                  <div className="text-xl font-semibold text-accent-amber">{totalPendingCount}</div>
                </div>
                <div className="bg-brand-parchment rounded-xl px-[1.6rem] py-[1.2rem] border border-green-300">
                  <div className="text-[1.2rem] uppercase tracking-wider text-green-600">Live</div>
                  <div className="text-xl font-semibold text-green-600">{liveCount}</div>
                </div>
                <div className="bg-brand-parchment rounded-xl px-[1.6rem] py-[1.2rem] border border-red-300">
                  <div className="text-[1.2rem] uppercase tracking-wider text-red-600">Rejected</div>
                  <div className="text-xl font-semibold text-red-600">{rejectedCount}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="px-8 py-4 border-b border-brand-parchment-border flex-shrink-0 bg-brand-parchment">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setAllPage(1); }}
                  placeholder="Search name, org, role, expertise"
                  className="min-w-[220px] rounded-lg border border-gray-300 px-4 py-2 text-lg shadow-sm focus:outline-none bg-brand-blue-tint"
                />
                {(activeTab === "pending" || activeTab === "all") && (
                  <select
                    value={filterCountry}
                    onChange={(e) => { setFilterCountry(e.target.value); setAllPage(1); }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-lg shadow-sm focus:outline-none bg-brand-blue-tint"
                  >
                    <option value="">All countries</option>
                    {countries.map((country) => <option key={country} value={country}>{country}</option>)}
                  </select>
                )}
                {(activeTab === "pending" || activeTab === "all") && (
                  <select
                    value={filterExpertise}
                    onChange={(e) => { setFilterExpertise(e.target.value); setAllPage(1); }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-lg shadow-sm focus:outline-none bg-brand-blue-tint"
                  >
                    <option value="">All expertise</option>
                    {expertiseOptions.map((expertise) => <option key={expertise} value={expertise}>{expertise}</option>)}
                  </select>
                )}
                {activeTab === "pending" && (
                  <select
                    value={pendingSort}
                    onChange={(e) => setPendingSort(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-lg shadow-sm focus:outline-none bg-brand-blue-tint"
                  >
                    <option value="name_az">Name A → Z</option>
                    <option value="name_za">Name Z → A</option>
                    <option value="date_new">Newest first</option>
                    <option value="date_old">Oldest first</option>
                    <option value="expertise">Expertise A → Z</option>
                  </select>
                )}
              </div>
              <div className="text-[1.4rem] font-medium text-brand-navy">
                {activeTab === "pending"   ? `${filteredPending.length} of ${pendingCount} self-submitted`
                : activeTab === "nominated" ? `${nominatedCount} nominated`
                : activeTab === "all"       ? `${filteredAll.length} of ${allCount} total entries`
                : activeTab === "requests"  ? `${updateRequests.length} update · ${deleteRequests.length} delete`
                : `${requestsCount} pending requests`}
              </div>
            </div>
            {actionMessage && (
              <div className="mt-4 rounded-lg px-4 py-3 text-lg border border-brand-green-border bg-green-50 text-green-800">
                {actionMessage}
              </div>
            )}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {loading ? (
              <div className="text-center py-12 text-xl text-brand-navy">Loading...</div>

            ) : activeTab === "requests" ? (
              <div className="rounded-lg overflow-hidden border-[1.5px] border-brand-warm-border bg-white">
                {/* Sub-tab bar */}
                <div className="flex border-b border-brand-warm-border bg-brand-parchment">
                  <button
                    onClick={() => setRequestSubTab("updates")}
                    className={`flex-1 px-5 py-3 text-lg font-semibold transition-colors ${
                      requestSubTab === "updates"
                        ? "bg-white text-brand-navy border-b-[3px] border-brand-navy"
                        : "bg-transparent text-gray-500 border-b-[3px] border-transparent"
                    }`}
                  >
                    Updates
                    <span className={`ml-2 text-[1.3rem] font-medium px-2 py-0.5 rounded-full ${
                      requestSubTab === "updates" ? "bg-brand-blue-tint text-brand-navy" : "bg-gray-200 text-gray-500"
                    }`}>
                      {updateRequests.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setRequestSubTab("deletes")}
                    className={`flex-1 px-5 py-3 text-lg font-semibold transition-colors ${
                      requestSubTab === "deletes"
                        ? "bg-white text-red-600 border-b-[3px] border-red-600"
                        : "bg-transparent text-gray-500 border-b-[3px] border-transparent"
                    }`}
                  >
                    Deletes
                    <span className={`ml-2 text-[1.3rem] font-medium px-2 py-0.5 rounded-full ${
                      requestSubTab === "deletes" ? "bg-red-50 text-red-600" : "bg-gray-200 text-gray-500"
                    }`}>
                      {deleteRequests.length}
                    </span>
                  </button>
                </div>

                {requestSubTab === "updates" && (
                  <>
                    {updateRequests.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="text-[4.8rem] mb-4 text-green-400">✓</div>
                        <div className="text-lg text-green-600">No pending update requests</div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-amber-50 border-amber-200">
                          <div className="text-[1.4rem] font-semibold text-amber-600">
                            {updateRequests.length} update request(s) — send self-service links
                          </div>
                        </div>

                        {updateRequests.map((req) => {
                          const isSelected = selectedRequest === req.id;
                          const linkSent = req.link_sent;
                          return (
                            <div key={req.id}>
                              <div
                                className={`flex items-center px-5 cursor-pointer transition-colors min-h-[64px] border-b border-brand-warm-row-border ${
                                  isSelected ? "bg-brand-warm-row" : "bg-white hover:bg-brand-warm-bg"
                                }`}
                                onClick={() => setSelectedRequest(isSelected ? null : req.id)}
                              >
                                <div className="flex-shrink-0 mr-4">
                                  <div className={`w-2.5 h-2.5 rounded-full ${linkSent ? "bg-gray-400" : "bg-amber-600"}`} />
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4 bg-brand-blue-tint text-brand-navy">
                                  {getInitials(req.first_name, req.last_name)}
                                </div>
                                <div className="flex-1 min-w-0 mr-4">
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-lg truncate text-brand-dark">{req.first_name} {req.last_name}</span>
                                    <span className="text-[1.4rem] truncate text-gray-500">{req.email}</span>
                                  </div>
                                  <div className="text-[1.4rem] truncate mt-0.5 text-gray-400">
                                    {req.changes?.slice(0, 80) || "Requested profile update"}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {linkSent && (
                                    <span className="text-[1.2rem] font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-500">Link sent</span>
                                  )}
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-gray-400 transition-transform ${isSelected ? "rotate-180" : "rotate-0"}`}>
                                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="px-5 py-4 bg-brand-warm-bg border-b border-brand-warm-border">
                                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                                    <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                      <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2 text-brand-navy">Request details</div>
                                      <div className="grid gap-2 text-[1.5rem] text-brand-dark-blue">
                                        <div><span className="text-brand-navy font-semibold">Email: </span>{req.email}</div>
                                        <div><span className="text-brand-navy font-semibold">LinkedIn: </span>{req.linkedin || "—"}</div>
                                        <div><span className="text-brand-navy font-semibold">Submitted: </span>{req.submitted_at}</div>
                                      </div>
                                    </div>
                                    <div className="rounded-lg p-4 bg-white border border-amber-200">
                                      <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2 text-amber-600">Requested changes</div>
                                      <div className="text-[1.5rem] text-brand-dark-blue leading-[1.7]">{req.changes || "No details provided"}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => handleSendUpdateLink(req)}
                                      disabled={actionId === req.id}
                                      className={`px-5 py-2.5 text-[1.5rem] font-medium rounded-full transition-colors disabled:opacity-50 ${
                                        linkSent
                                          ? "bg-brand-blue-tint text-brand-navy border-[1.5px] border-brand-blue-border hover:bg-blue-50"
                                          : "bg-brand-navy text-white hover:bg-brand-navy-hover"
                                      }`}
                                    >
                                      {linkSent ? "✓ Link sent — resend" : "Send update link via email"}
                                    </button>
                                    <button
                                      onClick={() => { setRequests(requests.map(r => r.id === req.id ? { ...r, status: "dismissed" } : r)); setSelectedRequest(null); }}
                                      className="px-4 py-2 text-[1.4rem] font-medium rounded-full border-[1.5px] border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                                    >
                                      Dismiss
                                    </button>
                                  </div>
                                  {linkSent && (
                                    <div className="mt-3 text-[1.4rem] text-gray-500 italic">
                                      User will receive a magic link to update their own profile. Once resubmitted, it will appear as a new pending submission.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </>
                )}

                {requestSubTab === "deletes" && (
                  <>
                    {deleteRequests.length > 0 && (
                      <div className="flex items-center justify-between px-5 py-3 border-b bg-red-50 border-red-200">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={deleteRequests.length > 0 && deleteRequests.every((r) => selectedDeletes.includes(r.id))}
                              onChange={toggleAllDeletes}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-[1.4rem] font-medium text-red-600">Select all ({deleteRequests.length})</span>
                          </label>
                        </div>
                        {selectedDeletes.length > 0 && (
                          <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 text-[1.4rem] font-semibold rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                          >
                            Approve {selectedDeletes.length} deletion(s)
                          </button>
                        )}
                      </div>
                    )}

                    {deleteRequests.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="text-[4.8rem] mb-4 text-green-400">✓</div>
                        <div className="text-lg text-green-600">No pending deletion requests</div>
                      </div>
                    ) : (
                      deleteRequests.map((req) => {
                        const isSelected = selectedRequest === req.id;
                        const isChecked  = selectedDeletes.includes(req.id);
                        return (
                          <div key={req.id}>
                            <div
                              className={`flex items-center px-5 cursor-pointer transition-colors min-h-[64px] border-b border-brand-warm-row-border ${
                                isSelected ? "bg-brand-warm-row" : isChecked ? "bg-red-50" : "bg-white hover:bg-brand-warm-bg"
                              }`}
                              onClick={() => setSelectedRequest(isSelected ? null : req.id)}
                            >
                              <div className="flex-shrink-0 mr-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => { e.stopPropagation(); toggleDeleteSelect(req.id); }}
                                  onClick={e => e.stopPropagation()}
                                  className="w-4 h-4 rounded cursor-pointer"
                                />
                              </div>
                              <div className="flex-shrink-0 mr-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                              </div>
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4 bg-red-50 text-red-600">
                                {getInitials(req.first_name, req.last_name)}
                              </div>
                              <div className="flex-1 min-w-0 mr-4">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-lg truncate text-brand-dark">{req.first_name} {req.last_name}</span>
                                  <span className="text-[1.4rem] truncate text-gray-500">{req.email}</span>
                                </div>
                                <div className="text-[1.4rem] truncate mt-0.5 text-gray-400">
                                  {req.reason?.slice(0, 80) || "Requested profile removal"}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-gray-400 transition-transform ${isSelected ? "rotate-180" : "rotate-0"}`}>
                                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="px-5 py-4 bg-brand-warm-bg border-b border-brand-warm-border">
                                <div className="grid gap-4 md:grid-cols-2 mb-4">
                                  <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                    <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2 text-brand-navy">Request details</div>
                                    <div className="grid gap-2 text-[1.5rem] text-brand-dark-blue">
                                      <div><span className="text-brand-navy font-semibold">Email: </span>{req.email}</div>
                                      <div><span className="text-brand-navy font-semibold">LinkedIn: </span>{req.linkedin || "—"}</div>
                                      <div><span className="text-brand-navy font-semibold">Submitted: </span>{req.submitted_at}</div>
                                    </div>
                                  </div>
                                  <div className="rounded-lg p-4 bg-white border border-red-200">
                                    <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2 text-red-600">Reason for removal</div>
                                    <div className="text-[1.5rem] text-red-900 leading-[1.7]">{req.reason || "No reason provided"}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleApproveSingleDelete(req)}
                                    disabled={actionId === req.id}
                                    className="px-4 py-2 text-[1.4rem] font-medium rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                                  >
                                    {actionId === req.id ? "..." : "Approve deletion"}
                                  </button>
                                  <button
                                    onClick={() => { setRequests(requests.map(r => r.id === req.id ? { ...r, status: "dismissed" } : r)); setSelectedRequest(null); }}
                                    className="px-4 py-2 text-[1.4rem] font-medium rounded-full border-[1.5px] border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>

            ) : activeTab === "nominated" ? (
              nominatedList.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-[4.8rem] mb-4 text-green-400">✓</div>
                  <div className="text-lg text-green-600">No pending nominations</div>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border-[1.5px] border-brand-warm-border bg-brand-parchment">
                  <div className="flex items-center justify-between px-5 py-3 border-b bg-pink-light border-brand-pink-border">
                    <div className="text-[1.4rem] font-semibold text-accent-pink">
                      {nominatedList.length} nominations to reach out to
                    </div>
                    <div className="text-[1.2rem] text-accent-purple">
                      Click a nominee to view details &amp; outreach message
                    </div>
                  </div>

                  {nominatedList.map((item) => {
                    const isExpanded = expandedNominee === item.id;
                    const isCopied   = copiedId === item.id;
                    return (
                      <div key={item.id}>
                        <div
                          className={`flex items-center px-5 cursor-pointer transition-colors min-h-[64px] border-b border-brand-warm-row-border ${
                            isExpanded ? "bg-brand-warm-row" : "bg-white hover:bg-brand-warm-bg"
                          }`}
                          onClick={() => setExpandedNominee(isExpanded ? null : item.id)}
                        >
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-pink" />
                          </div>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4 bg-pink-light text-accent-pink">
                            {getInitials(item.first_name, item.last_name)}
                          </div>
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-lg truncate text-brand-dark">{item.first_name} {item.last_name}</span>
                            </div>
                            <div className="text-[1.4rem] truncate mt-0.5 text-gray-400">
                              Nominated by {item.nominator_name || item.editor_email || "—"}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {item.linkedin && (
                              <a
                                href={item.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="text-[1.2rem] font-medium px-2.5 py-1 rounded-full bg-brand-blue-tint text-brand-navy hover:bg-blue-50 transition-colors"
                              >
                                LinkedIn ↗
                              </a>
                            )}
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}>
                              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-5 py-4 bg-brand-warm-bg border-b border-brand-warm-border">
                            <div className="grid gap-4 mb-4 md:grid-cols-2">
                              <div className="rounded-lg p-4 bg-brand-parchment border border-brand-pink-border">
                                <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-3 text-accent-pink">Nominator</div>
                                <div className="grid gap-2 text-[1.5rem] text-brand-dark-blue">
                                  <div><span className="text-accent-pink font-semibold">Full name: </span>{item.nominator_name || "—"}</div>
                                  <div><span className="text-accent-pink font-semibold">Email: </span>{item.editor_email || "—"}</div>
                                </div>
                              </div>
                              <div className="rounded-lg p-4 bg-brand-parchment border border-brand-blue-border">
                                <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-3 text-brand-navy">Nominee</div>
                                <div className="grid gap-2 text-[1.5rem] text-brand-dark-blue">
                                  <div><span className="text-brand-navy font-semibold">Full name: </span>{item.first_name} {item.last_name}</div>
                                  <div>
                                    <span className="text-brand-navy font-semibold">Profile link: </span>
                                    {item.nominate_link
                                      ? <a href={item.nominate_link} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-navy break-all">{item.nominate_link}</a>
                                      : "—"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleAction(item.id, "approve")}
                                disabled={actionId === item.id}
                                className="px-4 py-2 text-[1.4rem] font-medium rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {actionId === item.id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleAction(item.id, "reject")}
                                disabled={actionId === item.id}
                                className="px-4 py-2 text-[1.4rem] font-medium rounded-full border-[1.5px] border-red-400 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )

            ) : activeTab === "pending" ? (
              pending.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-[4.8rem] mb-4 text-green-400">✓</div>
                  <div className="text-lg text-green-600">No pending submissions</div>
                </div>
              ) : filteredPending.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-[4.8rem] mb-4 text-gray-400">🔍</div>
                  <div className="text-lg text-gray-500">No matching results for your filters</div>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border-[1.5px] border-brand-warm-border bg-brand-parchment">
                  {/* Inbox header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="text-[1.4rem] font-semibold text-amber-600">
                        {filteredPending.length} pending review
                      </div>
                      {selectedPending.length > 0 && (
                        <>
                          <span className="text-[1.4rem] text-amber-800">—</span>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filteredPending.every((r) => selectedPending.includes(r.id))}
                              onChange={toggleAllPending}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-[1.3rem] font-medium text-amber-800">Select all</span>
                          </label>
                        </>
                      )}
                    </div>
                    {selectedPending.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBulkPending("approve")}
                          className="px-3 py-1.5 text-[1.3rem] font-semibold rounded-full bg-green-600 text-white transition-colors"
                        >
                          Approve {selectedPending.length}
                        </button>
                        <button
                          onClick={() => handleBulkPending("reject")}
                          className="px-3 py-1.5 text-[1.3rem] font-semibold rounded-full bg-red-600 text-white transition-colors"
                        >
                          Reject {selectedPending.length}
                        </button>
                      </div>
                    )}
                  </div>

                  {filteredPending.map((item) => {
                    const isExpanded = expandedId === item.id;
                    const isChecked  = selectedPending.includes(item.id);
                    return (
                      <div key={item.id}>
                        <div
                          className={`flex items-center px-5 cursor-pointer transition-colors min-h-[64px] border-b border-brand-warm-row-border ${
                            isExpanded ? "bg-brand-warm-row" : isChecked ? "bg-brand-warm-bg" : "bg-white hover:bg-brand-warm-bg"
                          }`}
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                          <div className="flex-shrink-0 mr-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => { e.stopPropagation(); togglePendingSelect(item.id); }}
                              onClick={e => e.stopPropagation()}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                          </div>
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                          </div>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4 bg-brand-blue-tint text-brand-navy">
                            {getInitials(item.first_name, item.last_name)}
                          </div>
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-lg truncate text-brand-dark">{item.first_name} {item.last_name}</span>
                              <span className="text-[1.4rem] truncate flex-shrink-0 text-gray-500">{item.role || 'No role'} · {item.organisation || 'No org'}</span>
                            </div>
                            <div className="text-[1.4rem] truncate mt-0.5 text-gray-400">
                              {item.bio?.slice(0, 100) || "No bio provided"}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-[1.4rem] px-2.5 py-0.5 rounded-full font-medium bg-brand-blue-tint text-brand-navy">
                              {toTags(item.expertise)[0] || '—'}
                            </span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : "rotate-0"}`}>
                              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-5 py-4 bg-brand-warm-bg border-b border-brand-warm-border">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAction(item.id, "approve")}
                                  disabled={actionId === item.id}
                                  className="px-4 py-2 text-[1.4rem] font-medium rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  {actionId === item.id ? "..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleAction(item.id, "reject")}
                                  disabled={actionId === item.id}
                                  className="px-4 py-2 text-[1.4rem] font-medium rounded-full border-[1.5px] border-red-400 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>

                            <div className="grid gap-4">
                              {item.bio && (
                                <div className="rounded-lg p-4 bg-brand-parchment border border-brand-blue-border">
                                  <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2 text-brand-navy">Bio</div>
                                  <div className="text-lg text-brand-dark-blue leading-[1.7]">{item.bio}</div>
                                </div>
                              )}
                              <div className="rounded-lg p-4 bg-brand-parchment border border-brand-blue-border">
                                <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2 text-brand-navy">Profile details</div>
                                <div className="grid gap-3 md:grid-cols-2 text-lg text-brand-dark-blue">
                                  <div><span className="text-brand-navy font-semibold">Country: </span>{item.country || "—"}</div>
                                  <div><span className="text-brand-navy font-semibold">Experience: </span>{item.yearsExp || item.years_experience || "—"}</div>
                                  <div><span className="text-brand-navy font-semibold">Geo scope: </span>{item.geoScope || item.geo_scope || "—"}</div>
                                  <div><span className="text-brand-navy font-semibold">Countries: </span>{item.selectedCountries || item.countries || "—"}</div>
                                  <div><span className="text-brand-navy font-semibold">Expertise: </span>{item.expertise || "—"}</div>
                                  <div><span className="text-brand-navy font-semibold">Branch: </span>{item.branch || "self"}</div>
                                </div>
                              </div>

                              {item.notableItems && item.notableItems.length > 0 && (
                                <div className="rounded-lg p-4 bg-brand-parchment border border-brand-blue-border">
                                  <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-3 text-brand-navy">Notable achievements</div>
                                  <div className="space-y-3">
                                    {item.notableItems.map((notable, idx) => (
                                      <div key={idx} className="rounded-lg p-3 border border-brand-warm-border">
                                        <div className="text-lg font-semibold text-brand-dark">{notable.title || "Untitled"}</div>
                                        <div className="text-[1.4rem] text-gray-500">{notable.type || "—"}</div>
                                        {notable.link && (
                                          <div className="mt-1 text-[1.4rem]">
                                            <a href={notable.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-navy">{notable.link}</a>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-wrap gap-4 text-[1.4rem]">
                                <div className="text-brand-navy">
                                  <span className="font-semibold text-brand-navy">Email: </span>
                                  {item.editor_email || item.editorEmail || "—"}
                                </div>
                                {item.linkedin && (
                                  <div className="text-brand-navy">
                                    <span className="font-semibold text-brand-navy">LinkedIn: </span>
                                    <a href={item.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-navy">{item.linkedin}</a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )

            ) : activeTab === "all" ? (
              <>
                <div className="rounded-lg overflow-hidden border-[1.5px] border-brand-warm-border bg-brand-parchment">
                  <table className="w-full">
                      <thead className="border-b border-brand-blue-border bg-brand-blue-tint">
                        <tr>
                          {["Name", "Role", "Organisation", "LinkedIn Clicks", "Status"].map((h) => (
                            <th key={h} className="text-left text-[1.4rem] font-semibold uppercase tracking-wider px-5 py-3 text-brand-navy">{h}</th>
                          ))}
                        </tr>
                      </thead>
                    <tbody className="divide-y divide-[#f0ebe0]">
                      {filteredAll.slice((allPage - 1) * PAGE_SIZE, allPage * PAGE_SIZE).map((item) => {
                        const isExpanded = expandedAllId === item.id;
                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              className="transition-colors cursor-pointer bg-transparent hover:bg-brand-warm-row"
                              onClick={() => setExpandedAllId(isExpanded ? null : item.id)}
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-medium text-brand-dark">{item.first_name} {item.last_name}</span>
                                  <span className="text-[1.2rem] text-gray-500">{isExpanded ? 'Hide details' : 'View details'}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-lg text-gray-600">{item.role}</td>
                              <td className="px-5 py-3.5 text-lg text-gray-600">{item.organisation}</td>
                              <td className="px-5 py-3.5 text-lg text-gray-600 text-center">{item.linkedin_clicks || 0}</td>
                              <td className="px-5 py-3.5">
                                <span className={`text-[1.2rem] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                  item.status === "live"
                                    ? "bg-green-100 text-green-600"
                                    : item.status === "pending"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-red-50 text-red-600"
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan="4" className="px-5 py-4 bg-brand-parchment">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                      <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-3 text-brand-navy">Entry details</div>
                                      <div className="space-y-2 text-[1.5rem] text-brand-dark-blue">
                                        <div><span className="text-brand-navy font-semibold">Country: </span>{item.country || "—"}</div>
                                        <div><span className="text-brand-navy font-semibold">Expertise: </span>{item.expertise || "—"}</div>
                                        <div><span className="text-brand-navy font-semibold">LinkedIn: </span>{item.linkedin ? <a href={item.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-navy">{item.linkedin}</a> : '—'}</div>
                                        <div><span className="text-brand-navy font-semibold">Editor: </span>{item.editor_email || item.editorEmail || '—'}</div>
                                      </div>
                                    </div>
                                    <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                      <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-3 text-brand-navy">Summary</div>
                                      <div className="text-[1.5rem] text-brand-dark-blue leading-[1.7]">{item.bio || 'No bio available.'}</div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredAll.length > PAGE_SIZE && (
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-brand-warm-border flex-wrap justify-center">
                    <button
                      onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                      disabled={allPage === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded text-[1.4rem] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:border-gray-400"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.ceil(filteredAll.length / PAGE_SIZE) }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setAllPage(i + 1)}
                        className={`px-3 py-1.5 border rounded text-[1.4rem] font-medium transition-colors ${
                          allPage === i + 1
                            ? "bg-brand-navy text-white border-brand-navy"
                            : "bg-brand-parchment text-brand-dark border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setAllPage((p) => Math.min(Math.ceil(filteredAll.length / PAGE_SIZE), p + 1))}
                      disabled={allPage === Math.ceil(filteredAll.length / PAGE_SIZE)}
                      className="px-3 py-1.5 border border-gray-300 rounded text-[1.4rem] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:border-gray-400"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </main>
      </div>

      <footer className="border-t border-gray-200 bg-brand-parchment flex-shrink-0">
        <div className="max-w-[1440px] mx-auto px-8 py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-[1.4rem] text-gray-700">
            Women Leaders in Digital Health Database — Admin console
          </div>
          <div className="text-[1.3rem] text-gray-500">
            Test mode — auth will be required before launch
          </div>
        </div>
      </footer>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.45]">
          <div className="rounded-2xl px-8 py-6 shadow-xl max-w-sm mx-4 bg-white border border-brand-warm-border">
            <div className={`text-xl font-semibold mb-2 ${
              showConfirm.action === "reject" || showConfirm.action === "delete"
                ? "text-red-600"
                : "text-brand-navy"
            }`}>
              {showConfirm.title}
            </div>
            <div className="text-[1.5rem] mb-6 text-gray-600 leading-[1.6]">
              {showConfirm.message}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-5 py-2.5 text-[1.5rem] font-medium rounded-full border-[1.5px] border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowConfirm(null); if (showConfirm.onConfirm) showConfirm.onConfirm(); }}
                className={`px-5 py-2.5 text-[1.5rem] font-medium rounded-full text-white transition-colors ${
                  showConfirm.action === "reject" || showConfirm.action === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-brand-navy hover:bg-brand-navy-hover"
                }`}
              >
                {showConfirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
