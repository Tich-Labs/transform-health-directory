import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { MOCK_LEADERS } from "../data/mockData";

const MOCK_REQUESTS = [
  {
    id: "req_1",
    request_type: "update",
    first_name: "Jane",
    last_name: "Doe",
    email: "jane@example.com",
    linkedin: "https://linkedin.com/in/janedoe",
    changes:
      "New role: Chief Digital Officer at WHO. Please also update my bio.",
    reason: "",
    submitted_at: "2026-04-28",
    status: "pending",
    link_sent: false,
  },
  {
    id: "req_2",
    request_type: "update",
    first_name: "Amina",
    last_name: "Khan",
    email: "amina@example.com",
    linkedin: "https://linkedin.com/in/aminakhan",
    changes: "Please update my expertise to include AI & automation.",
    reason: "",
    submitted_at: "2026-04-29",
    status: "pending",
    link_sent: false,
  },
  {
    id: "req_3",
    request_type: "delete",
    first_name: "Maria",
    last_name: "Santos",
    email: "maria@example.com",
    linkedin: "",
    changes: "",
    reason: "No longer in this role.",
    submitted_at: "2026-04-29",
    status: "pending",
  },
  {
    id: "req_4",
    request_type: "delete",
    first_name: "Grace",
    last_name: "Omondi",
    email: "grace@example.com",
    linkedin: "https://linkedin.com/in/graceomondi",
    changes: "",
    reason: "Preferring not to be listed publicly.",
    submitted_at: "2026-04-30",
    status: "pending",
  },
  {
    id: "req_5",
    request_type: "update",
    first_name: "Fatima",
    last_name: "Al-Hassan",
    email: "fatima@example.com",
    linkedin: "https://linkedin.com/in/fatimaalhassan",
    changes: "Updated organisation and role.",
    reason: "",
    submitted_at: "2026-04-27",
    status: "pending",
    link_sent: true,
  },
];

const SIDEBAR_ITEMS = [
  { id: "pending", label: "Pending Submissions", icon: "inbox" },
  { id: "nominated", label: "Nominated", icon: "user-plus" },
  { id: "requests", label: "Profile Requests", icon: "mail" },
  { id: "all", label: "All Entries", icon: "list" },
];

function InboxIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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

export default function Admin({ onGoToDirectory }) {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [requestSubTab, setRequestSubTab] = useState("updates");
  const [selectedDeletes, setSelectedDeletes] = useState([]);
  const [selectedPending, setSelectedPending] = useState([]);
  const [actionId, setActionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [expandedId, setExpandedId] = useState(null);
  const [expandedAllId, setExpandedAllId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [allPage, setAllPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandedNominee, setExpandedNominee] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [pendingSort, setPendingSort] = useState("name_az");
  const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  const PAGE_SIZE = 15;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      if (appsScriptUrl) {
        const [pendingRes, allRes] = await Promise.all([
          axios.get(appsScriptUrl + "?api=entries&status=pending"),
          axios.get(appsScriptUrl + "?api=entries"),
        ]);
        setPending(pendingRes.data || []);
        setAll(allRes.data || []);
      } else {
        const mockPending = [
          {
            id: "th_p1",
            first_name: "Jane",
            last_name: "Doe",
            role: "Health Tech Lead",
            organisation: "HealthCorp",
            bio: "Digital health innovator building AI solutions.",
            expertise: "AI",
            linkedin: "https://linkedin.com/in/janedoe",
            editor_email: "jane@example.com",
            status: "pending",
            branch: "self",
          },
          {
            id: "th_p2",
            first_name: "Maria",
            last_name: "Santos",
            role: "CEO",
            organisation: "MedTech Africa",
            bio: "Building health solutions for Africa.",
            expertise: "Digital health innovation",
            linkedin: "https://linkedin.com/in/mariasantos",
            editor_email: "maria@example.com",
            status: "pending",
            branch: "nominate",
          },
          {
            id: "th_p3",
            first_name: "Amina",
            last_name: "Khan",
            role: "Digital Health Director",
            organisation: "AfriHealth",
            bio: "Leading digital transformation in maternal health across East Africa.",
            expertise: "mHealth, Health systems",
            linkedin: "https://linkedin.com/in/aminakhan",
            editor_email: "nominator@example.com",
            status: "pending",
            branch: "nominate",
          },
        ];
        const mockAll = [
          ...MOCK_LEADERS.map((l) => ({ ...l, editor_email: "" })),
          ...mockPending,
        ];
        setPending(mockPending);
        setAll(mockAll);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function confirmAction(id, action) {
    setActionId(id);
    setActionMessage("");
    try {
      if (appsScriptUrl) {
        await axios.post(
          appsScriptUrl,
          { action, id, adminPassword: "demo" },
          { headers: { "Content-Type": "application/json" } }
        );
      }
      const item = all.find((i) => i.id === id);
      const updated = item
        ? { ...item, status: action === "approve" ? "live" : "rejected" }
        : null;
      if (updated) {
        setAll(all.map((i) => (i.id === id ? updated : i)));
      }
      setPending((current) => current.filter((p) => p.id !== id));
      setActionMessage(
        action === "approve"
          ? "Profile approved and published."
          : "Profile rejected and removed from pending."
      );
      setExpandedId(null);
      setExpandedAllId(null);
      setExpandedNominee(null);
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
      setShowConfirm({
        title: "Approve profile?",
        message: `${name} will be published to the public directory.`,
        action: "approve",
        confirmLabel: "Approve",
        onConfirm: () => confirmAction(id, action),
      });
    } else {
      setShowConfirm({
        title: "Reject profile?",
        message: `${name} will be removed from the pending queue.`,
        action: "reject",
        confirmLabel: "Reject",
        onConfirm: () => confirmAction(id, action),
      });
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
      if (appsScriptUrl) {
        await axios.post(appsScriptUrl, {
          action: "sendProfileLink",
          firstName: req.first_name,
          lastName: req.last_name,
          email: req.email,
          linkedin: req.linkedin,
        }, { headers: { "Content-Type": "application/json" } });
      }
      setRequests((current) =>
        current.map((r) => (r.id === req.id ? { ...r, link_sent: true } : r))
      );
      setActionMessage(`Update link sent to ${req.email}.`);
    } catch (e) {
      console.error(e);
      setRequests((current) =>
        current.map((r) => (r.id === req.id ? { ...r, link_sent: true } : r))
      );
      setActionMessage(`Link marked as sent for ${req.first_name} ${req.last_name}.`);
    } finally {
      setActionId(null);
    }
  }

  function toggleDeleteSelect(id) {
    setSelectedDeletes((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  function toggleAllDeletes() {
    const deleteRequests = requests.filter(
      (r) => r.request_type === "delete" && r.status === "pending"
    );
    const allSelected = deleteRequests.every((r) =>
      selectedDeletes.includes(r.id)
    );
    if (allSelected) {
      setSelectedDeletes([]);
    } else {
      setSelectedDeletes(deleteRequests.map((r) => r.id));
    }
  }

  function togglePendingSelect(id) {
    setSelectedPending((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  function toggleAllPending() {
    const allSelected = filteredPending.every((r) =>
      selectedPending.includes(r.id)
    );
    if (allSelected) {
      setSelectedPending([]);
    } else {
      setSelectedPending(filteredPending.map((r) => r.id));
    }
  }

  function handleBulkPending(action) {
    if (selectedPending.length === 0) return;
    const label = action === "approve" ? "Approve" : "Reject";
    setShowConfirm({
      title: `${label} ${selectedPending.length} submission(s)?`,
      message: action === "approve"
        ? `These profiles will be published to the public directory.`
        : `These profiles will be removed from the pending queue.`,
      action,
      confirmLabel: `${label} ${selectedPending.length}`,
      onConfirm: () => {
        selectedPending.forEach((id) => confirmAction(id, action));
        setSelectedPending([]);
      },
    });
  }

  async function handleBulkDelete() {
    if (selectedDeletes.length === 0) return;
    setShowConfirm({
      title: `Approve ${selectedDeletes.length} deletion(s)?`,
      message: `These profiles will be permanently removed from the directory.`,
      action: "delete",
      confirmLabel: `Delete ${selectedDeletes.length}`,
      onConfirm: () => executeBulkDelete(),
    });
  }

  async function executeBulkDelete() {
    setActionMessage("");
    try {
      if (appsScriptUrl) {
        await Promise.all(
          selectedDeletes.map((id) =>
            axios.post(appsScriptUrl, { action: "approve", id, adminPassword: "demo" }, { headers: { "Content-Type": "application/json" } })
          )
        );
      }
      setRequests((current) =>
        current.map((r) =>
          selectedDeletes.includes(r.id) ? { ...r, status: "approved" } : r
        )
      );
      setActionMessage(`${selectedDeletes.length} deletion request(s) approved.`);
      setSelectedDeletes([]);
    } catch (e) {
      console.error(e);
      setActionMessage("Unable to complete bulk deletion. Please try again.");
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setRequestSubTab("updates");
    setSelectedDeletes([]);
    setSelectedPending([]);
    setExpandedId(null);
    setExpandedAllId(null);
    setExpandedNominee(null);
    setAllPage(1);
    setSearchQuery("");
    setFilterCountry("");
    setFilterExpertise("");
  };

  const pendingCount = pending.length;
  const nominatedList = useMemo(() => pending.filter((item) => item.branch === "nominate"), [pending]);
  const nominatedCount = nominatedList.length;
  const updateRequests = requests.filter((r) => r.request_type === "update" && r.status === "pending");
  const deleteRequests = requests.filter((r) => r.request_type === "delete" && r.status === "pending");
  const requestsCount = requests.filter((r) => r.status === "pending").length;
  const liveCount = all.filter((item) => item.status === "live").length;
  const rejectedCount = all.filter((item) => item.status === "rejected").length;
  const allCount = all.length;

  const countries = useMemo(() => {
    const set = new Set();
    [...pending, ...all].forEach((item) => {
      if (item.country) set.add(item.country);
    });
    return Array.from(set).sort();
  }, [pending, all]);

  const expertiseOptions = useMemo(() => {
    const set = new Set();
    [...pending, ...all].forEach((item) => {
      (item.expertise || "")
        .split(/,\s*/)
        .filter(Boolean)
        .forEach((tag) => set.add(tag));
    });
    return Array.from(set).sort();
  }, [pending, all]);

  const filteredPending = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const results = pending.filter((item) => {
      const text = [
        item.first_name,
        item.last_name,
        item.role,
        item.organisation,
        item.editor_email,
        item.expertise,
        item.country,
        item.bio,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (query && !text.includes(query)) return false;
      if (filterCountry && item.country !== filterCountry) return false;
      if (filterExpertise) {
        const tags = (item.expertise || "")
          .split(/,\s*/)
          .map((tag) => tag.toLowerCase());
        if (!tags.includes(filterExpertise.toLowerCase())) return false;
      }
      return true;
    });

    return results.slice().sort((a, b) => {
      if (pendingSort === "name_az") {
        const left = `${a.last_name} ${a.first_name}`.toLowerCase();
        const right = `${b.last_name} ${b.first_name}`.toLowerCase();
        return left < right ? -1 : left > right ? 1 : 0;
      }
      if (pendingSort === "name_za") {
        const left = `${a.last_name} ${a.first_name}`.toLowerCase();
        const right = `${b.last_name} ${b.first_name}`.toLowerCase();
        return right < left ? -1 : right > left ? 1 : 0;
      }
      if (pendingSort === "date_new") {
        const aDate = a.submitted_at || a.created_at || "";
        const bDate = b.submitted_at || b.created_at || "";
        return bDate.localeCompare(aDate);
      }
      if (pendingSort === "date_old") {
        const aDate = a.submitted_at || a.created_at || "";
        const bDate = b.submitted_at || b.created_at || "";
        return aDate.localeCompare(bDate);
      }
      if (pendingSort === "expertise") {
        const aExp = (a.expertise || "").toLowerCase();
        const bExp = (b.expertise || "").toLowerCase();
        return aExp < bExp ? -1 : aExp > bExp ? 1 : 0;
      }
      return 0;
    });
  }, [pending, searchQuery, filterCountry, filterExpertise, pendingSort]);

  const filteredAll = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const results = all.filter((item) => {
      const text = [
        item.first_name,
        item.last_name,
        item.role,
        item.organisation,
        item.editor_email,
        item.expertise,
        item.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return !query || text.includes(query);
    });

    return results.slice().sort((a, b) => {
      const left = `${a.last_name} ${a.first_name}`.toLowerCase();
      const right = `${b.last_name} ${b.first_name}`.toLowerCase();
      return sortOrder === "za" ? (right < left ? -1 : right > left ? 1 : 0) : (left < right ? -1 : left > right ? 1 : 0);
    });
  }, [all, searchQuery, sortOrder]);

  const sidebarData = [
    { ...SIDEBAR_ITEMS[0], count: pendingCount },
    { ...SIDEBAR_ITEMS[1], count: nominatedCount },
    { ...SIDEBAR_ITEMS[2], count: requestsCount },
    { ...SIDEBAR_ITEMS[3], count: allCount },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f5efe0] overflow-hidden">
      <header className="border-b border-gray-200 bg-[#f7f3ec] shadow-sm flex-shrink-0">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 px-8 py-5">
          <div className="flex items-center gap-4 justify-start">
            <div className="w-11 h-11 rounded-full bg-[#02598e] flex items-center justify-center text-white text-[1.4rem] font-bold">
              T
            </div>
            <div>
              <div className="text-[1.8rem] font-semibold text-gray-900">
                Transform Health
              </div>
              <div className="text-[1.2rem] text-gray-600">
                Women Leaders in Digital Health Database
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-[1.8rem] font-semibold text-gray-900">
              Admin Console
            </div>
          </div>
          <div className="flex justify-end">
            <button
              disabled
              className="rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-[1.4rem] font-medium text-gray-500 cursor-not-allowed"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + content row */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 min-w-[24rem] border-r border-gray-200 bg-[#f7f3ec] shadow-sm flex flex-col flex-shrink-0">
          <div className="px-6 py-5 border-b border-gray-200" style={{ borderTop: '4px solid #02598e' }}>
            <div className="flex items-center justify-center">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-[1.4rem] font-medium transition-colors"
                style={{ borderColor: '#02598e', color: '#02598e', background: '#f7f3ec' }}
                onMouseEnter={e => { e.target.style.background = '#02598e'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#02598e'; }}
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[1.6rem] font-medium transition-colors"
                  style={isActive
                    ? { background: '#eef3fb', color: '#02598e', border: '1px solid #c8ddf3' }
                    : { background: 'transparent', color: '#6b7280', border: '1px solid transparent' }
                  }
                  onMouseEnter={e => { if (!isActive) e.target.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { if (!isActive) e.target.style.background = 'transparent'; }}
                >
                  <span style={{ color: isActive ? '#02598e' : '#9ca3af' }}>
                    <Icon />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className="text-[1.4rem] font-semibold px-2 py-0.5 rounded-full"
                      style={isActive
                        ? { background: '#02598e', color: '#fff' }
                        : { background: '#e5e7eb', color: '#6b7280' }
                      }
                    >
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-[1.4rem] font-medium transition-colors"
              style={{ borderColor: '#F85A8E', color: '#F85A8E', background: '#f7f3ec' }}
              onMouseEnter={e => { e.target.style.background = '#F85A8E'; e.target.style.color = '#fff'; }}
              onMouseLeave={e => { e.target.style.background = '#f7f3ec'; e.target.style.color = '#F85A8E'; }}
            >
              View directory
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Page header + stats — fixed */}
          <div className="px-8 py-6 border-b flex-shrink-0" style={{ borderColor: '#e8e0d0', background: 'linear-gradient(135deg, #f5efe0 0%, #ede7d8 100%)' }}>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-[2.4rem] font-semibold" style={{ color: '#02598e', letterSpacing: '-0.042em' }}>
                    {sidebarData.find((s) => s.id === activeTab)?.label}
                  </h2>
                  <p className="text-[1.6rem] text-gray-600 mt-1">
                    Review and manage member submissions, profile requests, and published entries.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center sm:text-right">
                  <div style={{ background: '#f7f3ec', borderRadius: 12, padding: '1.2rem 1.6rem', border: '1px solid #f0c64a' }}>
                    <div className="text-[1.2rem] uppercase tracking-wider" style={{ color: '#b8860b' }}>
                      Pending
                    </div>
                    <div className="text-[1.8rem] font-semibold" style={{ color: '#b8860b' }}>
                      {pendingCount}
                    </div>
                  </div>
                  <div style={{ background: '#f7f3ec', borderRadius: 12, padding: '1.2rem 1.6rem', border: '1px solid #4ade80' }}>
                    <div className="text-[1.2rem] uppercase tracking-wider" style={{ color: '#16a34a' }}>
                      Live
                    </div>
                    <div className="text-[1.8rem] font-semibold" style={{ color: '#16a34a' }}>
                      {liveCount}
                    </div>
                  </div>
                  <div style={{ background: '#f7f3ec', borderRadius: 12, padding: '1.2rem 1.6rem', border: '1px solid #f87171' }}>
                    <div className="text-[1.2rem] uppercase tracking-wider" style={{ color: '#dc2626' }}>
                      Rejected
                    </div>
                    <div className="text-[1.8rem] font-semibold" style={{ color: '#dc2626' }}>
                      {rejectedCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter bar — fixed */}
            <div className="px-8 py-4 border-b flex-shrink-0" style={{ borderColor: '#d0c2b3', background: '#f7f3ec' }}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setAllPage(1);
                    }}
                    placeholder="Search name, org, role, expertise"
                    className="min-w-[220px] rounded-lg border px-4 py-2 text-[1.6rem] shadow-sm focus:outline-none"
                    style={{ borderColor: '#d1d5db', background: '#eef3fb' }}
                  />
                  {(activeTab === "pending" || activeTab === "all") && (
                    <select
                      value={filterCountry}
                      onChange={(e) => {
                        setFilterCountry(e.target.value);
                        setAllPage(1);
                      }}
                      className="rounded-lg border px-3 py-2 text-[1.6rem] shadow-sm focus:outline-none"
                      style={{ borderColor: '#d1d5db', background: '#eef3fb' }}
                    >
                      <option value="">All countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  )}
                  {(activeTab === "pending" || activeTab === "all") && (
                    <select
                      value={filterExpertise}
                      onChange={(e) => {
                        setFilterExpertise(e.target.value);
                        setAllPage(1);
                      }}
                      className="rounded-lg border px-3 py-2 text-[1.6rem] shadow-sm focus:outline-none"
                      style={{ borderColor: '#d1d5db', background: '#eef3fb' }}
                    >
                      <option value="">All expertise</option>
                      {expertiseOptions.map((expertise) => (
                        <option key={expertise} value={expertise}>
                          {expertise}
                        </option>
                      ))}
                    </select>
                  )}
                  {activeTab === "pending" && (
                    <select
                      value={pendingSort}
                      onChange={(e) => setPendingSort(e.target.value)}
                      className="rounded-lg border px-3 py-2 text-[1.6rem] shadow-sm focus:outline-none"
                      style={{ borderColor: '#d1d5db', background: '#eef3fb' }}
                    >
                      <option value="name_az">Name A → Z</option>
                      <option value="name_za">Name Z → A</option>
                      <option value="date_new">Newest first</option>
                      <option value="date_old">Oldest first</option>
                      <option value="expertise">Expertise A → Z</option>
                    </select>
                  )}
                </div>
                <div className="text-[1.4rem]" style={{ color: '#02598e', fontWeight: 500 }}>
                  {activeTab === "pending"
                    ? `${filteredPending.length} of ${pendingCount} pending submissions`
                    : activeTab === "nominated"
                    ? `${nominatedList.length} nominations`
                    : activeTab === "all"
                    ? `${filteredAll.length} of ${allCount} entries`
                    : activeTab === "requests"
                    ? `${updateRequests.length} update · ${deleteRequests.length} delete`
                    : `${requestsCount} pending requests`}
                </div>
              </div>
              {actionMessage && (
                <div className="mt-4 rounded-lg px-4 py-3 text-[1.6rem]" style={{ border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534' }}>
                  {actionMessage}
                </div>
              )}
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {loading ? (
                <div className="text-center py-12 text-[1.8rem]" style={{ color: '#02598e' }}>
                  Loading...
                </div>
              ) : activeTab === "requests" ? (
                <div className="rounded-lg overflow-hidden" style={{ border: '1.5px solid #e8e0d0', background: '#fff' }}>
                  {/* Sub-tab bar */}
                  <div className="flex border-b" style={{ borderColor: '#e8e0d0', background: '#f7f3ec' }}>
                    <button
                      onClick={() => setRequestSubTab("updates")}
                      className="flex-1 px-5 py-3 text-[1.6rem] font-semibold transition-colors"
                      style={requestSubTab === "updates"
                        ? { background: '#fff', color: '#02598e', borderBottom: '3px solid #02598e' }
                        : { background: 'transparent', color: '#6b7280', borderBottom: '3px solid transparent' }
                      }
                    >
                      Updates
                      <span className="ml-2 text-[1.3rem] font-medium px-2 py-0.5 rounded-full"
                        style={requestSubTab === "updates"
                          ? { background: '#eef3fb', color: '#02598e' }
                          : { background: '#e5e7eb', color: '#6b7280' }
                        }
                      >
                        {updateRequests.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setRequestSubTab("deletes")}
                      className="flex-1 px-5 py-3 text-[1.6rem] font-semibold transition-colors"
                      style={requestSubTab === "deletes"
                        ? { background: '#fff', color: '#dc2626', borderBottom: '3px solid #dc2626' }
                        : { background: 'transparent', color: '#6b7280', borderBottom: '3px solid transparent' }
                      }
                    >
                      Deletes
                      <span className="ml-2 text-[1.3rem] font-medium px-2 py-0.5 rounded-full"
                        style={requestSubTab === "deletes"
                          ? { background: '#fef2f2', color: '#dc2626' }
                          : { background: '#e5e7eb', color: '#6b7280' }
                        }
                      >
                        {deleteRequests.length}
                      </span>
                    </button>
                  </div>

                  {/* Updates sub-tab */}
                  {requestSubTab === "updates" && (
                    <>
                      {updateRequests.length === 0 ? (
                        <div className="text-center py-20">
                          <div className="text-[4.8rem] mb-4" style={{ color: '#4ade80' }}>✓</div>
                          <div className="text-[1.6rem]" style={{ color: '#16a34a' }}>No pending update requests</div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: '#fef3c7', borderColor: '#fde68a' }}>
                            <div className="text-[1.4rem] font-semibold" style={{ color: '#d97706' }}>
                              {updateRequests.length} update request(s) — send self-service links
                            </div>
                          </div>

                          {updateRequests.map((req) => {
                            const isSelected = selectedRequest === req.id;
                            const linkSent = req.link_sent;
                            return (
                              <div key={req.id}>
                                <div
                                  className="flex items-center px-5 cursor-pointer transition-colors"
                                  style={{
                                    minHeight: 64,
                                    background: isSelected ? '#f9f7f1' : '#fff',
                                    borderBottom: '1px solid #f0ebe0',
                                  }}
                                  onClick={() => setSelectedRequest(isSelected ? null : req.id)}
                                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#faf8f3'; }}
                                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff'; }}
                                >
                                  <div className="flex-shrink-0 mr-4">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: linkSent ? '#9ca3af' : '#d97706' }} />
                                  </div>

                                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4" style={{ background: '#eef3fb', color: '#02598e' }}>
                                    {getInitials(req.first_name, req.last_name)}
                                  </div>

                                  <div className="flex-1 min-w-0 mr-4">
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold text-[1.6rem] truncate" style={{ color: '#111' }}>
                                        {req.first_name} {req.last_name}
                                      </span>
                                      <span className="text-[1.4rem] truncate" style={{ color: '#6b7280' }}>
                                        {req.email}
                                      </span>
                                    </div>
                                    <div className="text-[1.4rem] truncate mt-0.5" style={{ color: '#9ca3af' }}>
                                      {req.changes?.slice(0, 80) || "Requested profile update"}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    {linkSent && (
                                      <span className="text-[1.2rem] font-medium px-2 py-1 rounded-full" style={{ background: '#e5e7eb', color: '#6b7280' }}>
                                        Link sent
                                      </span>
                                    )}
                                    <svg
                                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                                      style={{ transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#9ca3af' }}
                                    >
                                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="px-5 py-4" style={{ background: '#faf8f3', borderBottom: '1px solid #e8e0d0' }}>
                                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                                      <div className="rounded-lg p-4" style={{ background: '#fff', border: '1px solid #c8ddf3' }}>
                                        <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2" style={{ color: '#02598e' }}>
                                          Request details
                                        </div>
                                        <div className="grid gap-2 text-[1.5rem]" style={{ color: '#1e3a5f' }}>
                                          <div><span style={{ color: '#02598e', fontWeight: 600 }}>Email: </span>{req.email}</div>
                                          <div><span style={{ color: '#02598e', fontWeight: 600 }}>LinkedIn: </span>{req.linkedin || "—"}</div>
                                          <div><span style={{ color: '#02598e', fontWeight: 600 }}>Submitted: </span>{req.submitted_at}</div>
                                        </div>
                                      </div>

                                      <div className="rounded-lg p-4" style={{ background: '#fff', border: '1px solid #fde68a' }}>
                                        <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2" style={{ color: '#d97706' }}>
                                          Requested changes
                                        </div>
                                        <div className="text-[1.5rem]" style={{ color: '#1e3a5f', lineHeight: 1.7 }}>
                                          {req.changes || "No details provided"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => handleSendUpdateLink(req)}
                                        disabled={actionId === req.id}
                                        className="px-5 py-2.5 text-[1.5rem] font-medium rounded-full transition-colors disabled:opacity-50"
                                        style={linkSent
                                          ? { background: '#eef3fb', color: '#02598e', border: '1.5px solid #c8ddf3' }
                                          : { background: '#02598e', color: '#fff' }
                                        }
                                        onMouseEnter={e => { if (actionId !== req.id && !linkSent) e.target.style.background = '#014a75'; }}
                                        onMouseLeave={e => { e.target.style.background = linkSent ? '#eef3fb' : '#02598e'; }}
                                      >
                                        {linkSent ? "✓ Link sent — resend" : "Send update link via email"}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setRequests(requests.map(r => r.id === req.id ? { ...r, status: "dismissed" } : r));
                                          setSelectedRequest(null);
                                        }}
                                        className="px-4 py-2 text-[1.4rem] font-medium rounded-full transition-colors"
                                        style={{ border: '1.5px solid #d1d5db', color: '#6b7280' }}
                                        onMouseEnter={e => { e.target.style.background = '#f3f4f6'; }}
                                        onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                                      >
                                        Dismiss
                                      </button>
                                    </div>

                                    {linkSent && (
                                      <div className="mt-3 text-[1.4rem]" style={{ color: '#6b7280', fontStyle: 'italic' }}>
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

                  {/* Deletes sub-tab */}
                  {requestSubTab === "deletes" && (
                    <>
                      {/* Bulk action bar */}
                      {deleteRequests.length > 0 && (
                        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={deleteRequests.length > 0 && deleteRequests.every((r) => selectedDeletes.includes(r.id))}
                                onChange={toggleAllDeletes}
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-[1.4rem] font-medium" style={{ color: '#dc2626' }}>
                                Select all ({deleteRequests.length})
                              </span>
                            </label>
                          </div>
                          {selectedDeletes.length > 0 && (
                            <button
                              onClick={handleBulkDelete}
                              className="px-4 py-2 text-[1.4rem] font-semibold rounded-full transition-colors"
                              style={{ background: '#dc2626', color: '#fff' }}
                              onMouseEnter={e => { e.target.style.background = '#b91c1c'; }}
                              onMouseLeave={e => { e.target.style.background = '#dc2626'; }}
                            >
                              Approve {selectedDeletes.length} deletion(s)
                            </button>
                          )}
                        </div>
                      )}

                      {deleteRequests.length === 0 ? (
                        <div className="text-center py-20">
                          <div className="text-[4.8rem] mb-4" style={{ color: '#4ade80' }}>✓</div>
                          <div className="text-[1.6rem]" style={{ color: '#16a34a' }}>No pending deletion requests</div>
                        </div>
                      ) : (
                        deleteRequests.map((req) => {
                          const isSelected = selectedRequest === req.id;
                          const isChecked = selectedDeletes.includes(req.id);
                          return (
                            <div key={req.id}>
                              <div
                                className="flex items-center px-5 cursor-pointer transition-colors"
                                style={{
                                  minHeight: 64,
                                  background: isSelected ? '#f9f7f1' : isChecked ? '#fef2f2' : '#fff',
                                  borderBottom: '1px solid #f0ebe0',
                                }}
                                onClick={() => setSelectedRequest(isSelected ? null : req.id)}
                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = isChecked ? '#fef2f2' : '#faf8f3'; }}
                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isChecked ? '#fef2f2' : '#fff'; }}
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
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#dc2626' }} />
                                </div>

                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4" style={{ background: '#fef2f2', color: '#dc2626' }}>
                                  {getInitials(req.first_name, req.last_name)}
                                </div>

                                <div className="flex-1 min-w-0 mr-4">
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-[1.6rem] truncate" style={{ color: '#111' }}>
                                      {req.first_name} {req.last_name}
                                    </span>
                                    <span className="text-[1.4rem] truncate" style={{ color: '#6b7280' }}>
                                      {req.email}
                                    </span>
                                  </div>
                                  <div className="text-[1.4rem] truncate mt-0.5" style={{ color: '#9ca3af' }}>
                                    {req.reason?.slice(0, 80) || "Requested profile removal"}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <svg
                                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                                    style={{ transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#9ca3af' }}
                                  >
                                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="px-5 py-4" style={{ background: '#faf8f3', borderBottom: '1px solid #e8e0d0' }}>
                                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                                    <div className="rounded-lg p-4" style={{ background: '#fff', border: '1px solid #c8ddf3' }}>
                                      <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2" style={{ color: '#02598e' }}>
                                        Request details
                                      </div>
                                      <div className="grid gap-2 text-[1.5rem]" style={{ color: '#1e3a5f' }}>
                                        <div><span style={{ color: '#02598e', fontWeight: 600 }}>Email: </span>{req.email}</div>
                                        <div><span style={{ color: '#02598e', fontWeight: 600 }}>LinkedIn: </span>{req.linkedin || "—"}</div>
                                        <div><span style={{ color: '#02598e', fontWeight: 600 }}>Submitted: </span>{req.submitted_at}</div>
                                      </div>
                                    </div>

                                    <div className="rounded-lg p-4" style={{ background: '#fff', border: '1px solid #fecaca' }}>
                                      <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2" style={{ color: '#dc2626' }}>
                                        Reason for removal
                                      </div>
                                      <div className="text-[1.5rem]" style={{ color: '#7f1d1d', lineHeight: 1.7 }}>
                                        {req.reason || "No reason provided"}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => {
                                        setRequests(requests.map(r => r.id === req.id ? { ...r, status: "approved" } : r));
                                        setSelectedRequest(null);
                                      }}
                                      className="px-4 py-2 text-[1.4rem] font-medium rounded-full transition-colors"
                                      style={{ background: '#dc2626', color: '#fff' }}
                                      onMouseEnter={e => { e.target.style.background = '#b91c1c'; }}
                                      onMouseLeave={e => { e.target.style.background = '#dc2626'; }}
                                    >
                                      Approve deletion
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRequests(requests.map(r => r.id === req.id ? { ...r, status: "dismissed" } : r));
                                        setSelectedRequest(null);
                                      }}
                                      className="px-4 py-2 text-[1.4rem] font-medium rounded-full transition-colors"
                                      style={{ border: '1.5px solid #d1d5db', color: '#6b7280' }}
                                      onMouseEnter={e => { e.target.style.background = '#f3f4f6'; }}
                                      onMouseLeave={e => { e.target.style.background = 'transparent'; }}
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
                    <div className="text-[4.8rem] mb-4" style={{ color: '#4ade80' }}>✓</div>
                    <div className="text-[1.6rem]" style={{ color: '#16a34a' }}>No pending nominations</div>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden" style={{ border: '1.5px solid #e8e0d0', background: '#f7f3ec' }}>
                    <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: '#fdf2f8', borderColor: '#f9a8d4' }}>
                      <div className="text-[1.4rem] font-semibold" style={{ color: '#be185d' }}>
                        {nominatedList.length} nominations to reach out to
                      </div>
                      <div className="text-[1.2rem]" style={{ color: '#9d174d' }}>
                        Click a nominee to view details &amp; outreach message
                      </div>
                    </div>

                    {nominatedList.map((item) => {
                      const isExpanded = expandedNominee === item.id;
                      const isCopied = copiedId === item.id;
                      return (
                        <div key={item.id}>
                          <div
                            className="flex items-center px-5 cursor-pointer transition-colors"
                            style={{
                              minHeight: 64,
                              background: isExpanded ? '#f9f7f1' : '#fff',
                              borderBottom: '1px solid #f0ebe0',
                            }}
                            onClick={() => setExpandedNominee(isExpanded ? null : item.id)}
                            onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = '#faf8f3'; }}
                            onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = '#fff'; }}
                          >
                            <div className="flex-shrink-0 mr-4">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F85A8E' }} />
                            </div>

                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4" style={{ background: '#fdf2f8', color: '#be185d' }}>
                              {getInitials(item.first_name, item.last_name)}
                            </div>

                            <div className="flex-1 min-w-0 mr-4">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-[1.6rem] truncate" style={{ color: '#111' }}>
                                  {item.first_name} {item.last_name}
                                </span>
                                <span className="text-[1.4rem] truncate flex-shrink-0" style={{ color: '#6b7280' }}>
                                  {item.role || 'No role'} · {item.organisation || 'No org'}
                                </span>
                              </div>
                              <div className="text-[1.4rem] truncate mt-0.5" style={{ color: '#9ca3af' }}>
                                {item.bio?.slice(0, 100) || "No bio provided"}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              {item.linkedin && (
                                <a
                                  href={item.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="text-[1.2rem] font-medium px-2.5 py-1 rounded-full transition-colors"
                                  style={{ background: '#eef3fb', color: '#02598e' }}
                                  onMouseEnter={e => { e.target.style.background = '#dbeafe'; }}
                                  onMouseLeave={e => { e.target.style.background = '#eef3fb'; }}
                                >
                                  LinkedIn ↗
                                </a>
                              )}
                              <svg
                                width="16" height="16" viewBox="0 0 16 16" fill="none"
                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#9ca3af' }}
                              >
                                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-5 py-4" style={{ background: '#faf8f3', borderBottom: '1px solid #e8e0d0' }}>
                              <div className="grid gap-4 mb-4 md:grid-cols-2">
                                <div className="rounded-lg p-4" style={{ background: '#f7f3ec', border: '1px solid #c8ddf3' }}>
                                  <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2" style={{ color: '#02598e' }}>
                                    Profile
                                  </div>
                                  <div className="grid gap-2 text-[1.5rem]" style={{ color: '#1e3a5f' }}>
                                    <div><span style={{ color: '#02598e', fontWeight: 600 }}>Role: </span>{item.role || "—"}</div>
                                    <div><span style={{ color: '#02598e', fontWeight: 600 }}>Org: </span>{item.organisation || "—"}</div>
                                    <div><span style={{ color: '#02598e', fontWeight: 600 }}>Country: </span>{item.country || "—"}</div>
                                    <div><span style={{ color: '#02598e', fontWeight: 600 }}>Expertise: </span>{item.expertise || "—"}</div>
                                  </div>
                                </div>
                                <div className="rounded-lg p-4" style={{ background: '#f7f3ec', border: '1px solid #f9a8d4' }}>
                                  <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2" style={{ color: '#be185d' }}>
                                    Contact
                                  </div>
                                  <div className="grid gap-2 text-[1.5rem]" style={{ color: '#1e3a5f' }}>
                                    <div><span style={{ color: '#be185d', fontWeight: 600 }}>Nominator: </span>{item.editor_email || item.editorEmail || "—"}</div>
                                    {item.linkedin && (
                                      <div>
                                        <span style={{ color: '#be185d', fontWeight: 600 }}>LinkedIn: </span>
                                        <a href={item.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#02598e' }}>{item.linkedin}</a>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {item.bio && (
                                <div className="rounded-lg p-4 mb-4" style={{ background: '#f7f3ec', border: '1px solid #c8ddf3' }}>
                                  <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2" style={{ color: '#02598e' }}>
                                    Bio
                                  </div>
                                  <div className="text-[1.6rem]" style={{ color: '#1e3a5f', lineHeight: 1.7 }}>
                                    {item.bio}
                                  </div>
                                </div>
                              )}

                              <div className="rounded-lg overflow-hidden" style={{ border: '1.5px solid #f9a8d4' }}>
                                <div className="flex items-center justify-between px-4 py-3" style={{ background: '#fdf2f8' }}>
                                  <div className="text-[1.4rem] font-semibold" style={{ color: '#be185d' }}>
                                    Outreach message
                                  </div>
                                  <button
                                    onClick={() => handleCopyMessage(item)}
                                    className="px-3 py-1.5 text-[1.3rem] font-semibold rounded-full transition-colors"
                                    style={isCopied
                                      ? { background: '#16a34a', color: '#fff' }
                                      : { background: '#be185d', color: '#fff' }
                                    }
                                    onMouseEnter={e => { if (!isCopied) e.target.style.background = '#9d174d'; }}
                                    onMouseLeave={e => { e.target.style.background = '#be185d'; }}
                                  >
                                    {isCopied ? "✓ Copied" : "Copy message"}
                                  </button>
                                </div>
                                <div className="px-4 py-3 text-[1.5rem]" style={{ background: '#f7f3ec', color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                  {buildOutreachMessage(item)}
                                </div>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={() => handleAction(item.id, "approve")}
                                  disabled={actionId === item.id}
                                  className="px-4 py-2 text-[1.4rem] font-medium rounded-full transition-colors disabled:opacity-50"
                                  style={{ background: '#16a34a', color: '#fff' }}
                                  onMouseEnter={e => { if (actionId !== item.id) e.target.style.background = '#15803d'; }}
                                  onMouseLeave={e => { e.target.style.background = '#16a34a'; }}
                                >
                                  {actionId === item.id ? "..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleAction(item.id, "reject")}
                                  disabled={actionId === item.id}
                                  className="px-4 py-2 text-[1.4rem] font-medium rounded-full transition-colors disabled:opacity-50"
                                  style={{ border: '1.5px solid #f87171', color: '#dc2626' }}
                                  onMouseEnter={e => { e.target.style.background = '#fef2f2'; }}
                                  onMouseLeave={e => { e.target.style.background = 'transparent'; }}
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
                    <div className="text-[4.8rem] mb-4" style={{ color: '#4ade80' }}>✓</div>
                    <div className="text-[1.6rem]" style={{ color: '#16a34a' }}>
                      No pending submissions
                    </div>
                  </div>
                ) : filteredPending.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-[4.8rem] mb-4" style={{ color: '#9ca3af' }}>🔍</div>
                    <div className="text-[1.6rem]" style={{ color: '#6b7280' }}>
                      No matching results for your filters
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden" style={{ border: '1.5px solid #e8e0d0', background: '#f7f3ec' }}>
                    {/* Inbox header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b" style={{ background: '#fef3c7', borderColor: '#fde68a' }}>
                      <div className="flex items-center gap-3">
                        <div className="text-[1.4rem] font-semibold" style={{ color: '#d97706' }}>
                          {filteredPending.length} pending review
                        </div>
                        {selectedPending.length > 0 && (
                          <>
                            <span className="text-[1.4rem]" style={{ color: '#92400e' }}>—</span>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filteredPending.every((r) => selectedPending.includes(r.id))}
                                onChange={toggleAllPending}
                                className="w-4 h-4 rounded"
                              />
                              <span className="text-[1.3rem] font-medium" style={{ color: '#92400e' }}>
                                Select all
                              </span>
                            </label>
                          </>
                        )}
                      </div>
                      {selectedPending.length > 0 && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBulkPending("approve")}
                            className="px-3 py-1.5 text-[1.3rem] font-semibold rounded-full transition-colors"
                            style={{ background: '#16a34a', color: '#fff' }}
                          >
                            Approve {selectedPending.length}
                          </button>
                          <button
                            onClick={() => handleBulkPending("reject")}
                            className="px-3 py-1.5 text-[1.3rem] font-semibold rounded-full transition-colors"
                            style={{ background: '#dc2626', color: '#fff' }}
                          >
                            Reject {selectedPending.length}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inbox rows */}
                    {filteredPending.map((item) => {
                      const isExpanded = expandedId === item.id;
                      const isChecked = selectedPending.includes(item.id);
                      return (
                        <div key={item.id}>
                          <div
                            className="flex items-center px-5 cursor-pointer transition-colors"
                            style={{
                              minHeight: 64,
                              background: isExpanded ? '#f9f7f1' : isChecked ? '#fefce8' : '#fff',
                              borderBottom: '1px solid #f0ebe0',
                            }}
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = isChecked ? '#fefce8' : '#faf8f3'; }}
                            onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = isChecked ? '#fefce8' : '#fff'; }}
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

                            {/* Unread dot */}
                            <div className="flex-shrink-0 mr-4">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#d97706' }} />
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4" style={{ background: '#eef3fb', color: '#02598e' }}>
                              {getInitials(item.first_name, item.last_name)}
                            </div>

                            {/* Sender & preview */}
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-[1.6rem] truncate" style={{ color: '#111' }}>
                                  {item.first_name} {item.last_name}
                                </span>
                                <span className="text-[1.4rem] truncate flex-shrink-0" style={{ color: '#6b7280' }}>
                                  {item.role || 'No role'} · {item.organisation || 'No org'}
                                </span>
                              </div>
                              <div className="text-[1.4rem] truncate mt-0.5" style={{ color: '#9ca3af' }}>
                                {item.bio?.slice(0, 100) || "No bio provided"}
                              </div>
                            </div>

                            {/* Date & expand arrow */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-[1.4rem] px-2.5 py-0.5 rounded-full font-medium" style={{ background: '#eef3fb', color: '#02598e' }}>
                                {item.expertise?.split(',')[0] || '—'}
                              </span>
                              <svg
                                width="16" height="16" viewBox="0 0 16 16" fill="none"
                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#9ca3af' }}
                              >
                                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </div>

                          {/* Expanded detail panel */}
                          {isExpanded && (
                            <div className="px-5 py-4" style={{ background: '#faf8f3', borderBottom: '1px solid #e8e0d0' }}>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAction(item.id, "approve")}
                                    disabled={actionId === item.id}
                                    className="px-4 py-2 text-[1.4rem] font-medium rounded-full transition-colors disabled:opacity-50"
                                    style={{ background: '#16a34a', color: '#fff' }}
                                    onMouseEnter={e => { if (actionId !== item.id) e.target.style.background = '#15803d'; }}
                                    onMouseLeave={e => { e.target.style.background = '#16a34a'; }}
                                  >
                                    {actionId === item.id ? "..." : "Approve"}
                                  </button>
                                  <button
                                    onClick={() => handleAction(item.id, "reject")}
                                    disabled={actionId === item.id}
                                    className="px-4 py-2 text-[1.4rem] font-medium rounded-full transition-colors disabled:opacity-50"
                                    style={{ border: '1.5px solid #f87171', color: '#dc2626' }}
                                    onMouseEnter={e => { e.target.style.background = '#fef2f2'; }}
                                    onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>

                              <div className="grid gap-4">
                                {/* Bio */}
                                {item.bio && (
                                  <div className="rounded-lg p-4" style={{ background: '#f7f3ec', border: '1px solid #c8ddf3' }}>
                                    <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2" style={{ color: '#02598e' }}>
                                      Bio
                                    </div>
                                    <div className="text-[1.6rem]" style={{ color: '#1e3a5f', lineHeight: 1.7 }}>
                                      {item.bio}
                                    </div>
                                  </div>
                                )}

                                {/* Details grid */}
                                <div className="rounded-lg p-4" style={{ background: '#f7f3ec', border: '1px solid #c8ddf3' }}>
                                  <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-2" style={{ color: '#02598e' }}>
                                    Profile details
                                  </div>
                                  <div className="grid gap-3 md:grid-cols-2 text-[1.6rem]" style={{ color: '#1e3a5f' }}>
                                    <div>
                                      <span style={{ color: '#02598e', fontWeight: 600 }}>Country: </span>
                                      {item.country || "—"}
                                    </div>
                                    <div>
                                      <span style={{ color: '#02598e', fontWeight: 600 }}>Experience: </span>
                                      {item.yearsExp || item.years_experience || "—"}
                                    </div>
                                    <div>
                                      <span style={{ color: '#02598e', fontWeight: 600 }}>Geo scope: </span>
                                      {item.geoScope || item.geo_scope || "—"}
                                    </div>
                                    <div>
                                      <span style={{ color: '#02598e', fontWeight: 600 }}>Countries: </span>
                                      {item.selectedCountries || item.countries || "—"}
                                    </div>
                                    <div>
                                      <span style={{ color: '#02598e', fontWeight: 600 }}>Expertise: </span>
                                      {item.expertise || "—"}
                                    </div>
                                    <div>
                                      <span style={{ color: '#02598e', fontWeight: 600 }}>Branch: </span>
                                      {item.branch || "self"}
                                    </div>
                                  </div>
                                </div>

                                {/* Notable achievements */}
                                {item.notableItems && item.notableItems.length > 0 && (
                                  <div className="rounded-lg p-4" style={{ background: '#f7f3ec', border: '1px solid #c8ddf3' }}>
                                    <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-3" style={{ color: '#02598e' }}>
                                      Notable achievements
                                    </div>
                                    <div className="space-y-3">
                                      {item.notableItems.map((notable, idx) => (
                                        <div key={idx} className="rounded-lg p-3" style={{ border: '1px solid #e8e0d0' }}>
                                          <div className="text-[1.6rem] font-semibold" style={{ color: '#111' }}>
                                            {notable.title || "Untitled"}
                                          </div>
                                          <div className="text-[1.4rem]" style={{ color: '#6b7280' }}>
                                            {notable.type || "—"}
                                          </div>
                                          {notable.link && (
                                            <div className="mt-1 text-[1.4rem]">
                                              <a href={notable.link} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#02598e' }}>
                                                {notable.link}
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Contact */}
                                <div className="flex flex-wrap gap-4 text-[1.4rem]">
                                  <div style={{ color: '#02598e' }}>
                                    <span style={{ fontWeight: 600, color: '#02598e' }}>Email: </span>
                                    {item.editor_email || item.editorEmail || "—"}
                                  </div>
                                  {item.linkedin && (
                                    <div style={{ color: '#02598e' }}>
                                      <span style={{ fontWeight: 600, color: '#02598e' }}>LinkedIn: </span>
                                      <a href={item.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#02598e' }}>
                                        {item.linkedin}
                                      </a>
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
                  <div className="rounded-lg overflow-hidden" style={{ border: '1.5px solid #e8e0d0', background: '#f7f3ec' }}>
                    <table className="w-full">
                      <thead className="border-b" style={{ background: '#eef3fb', borderColor: '#c8ddf3' }}>
                        <tr>
                          <th className="text-left text-[1.4rem] font-semibold uppercase tracking-wider px-5 py-3" style={{ color: '#02598e' }}>
                            Name
                          </th>
                          <th className="text-left text-[1.4rem] font-semibold uppercase tracking-wider px-5 py-3" style={{ color: '#02598e' }}>
                            Role
                          </th>
                          <th className="text-left text-[1.4rem] font-semibold uppercase tracking-wider px-5 py-3" style={{ color: '#02598e' }}>
                            Organisation
                          </th>
                          <th className="text-left text-[1.4rem] font-semibold uppercase tracking-wider px-5 py-3" style={{ color: '#02598e' }}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: '#f0ebe0' }}>
                        {filteredAll
                          .slice((allPage - 1) * PAGE_SIZE, allPage * PAGE_SIZE)
                          .map((item) => {
                            const isExpanded = expandedAllId === item.id;
                            return (
                              <React.Fragment key={item.id}>
                                <tr
                                  className="transition-colors cursor-pointer"
                                  style={{ background: 'transparent' }}
                                  onClick={() => setExpandedAllId(isExpanded ? null : item.id)}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#f9f7f1'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                      <span className="text-[1.6rem] font-medium" style={{ color: '#111' }}>
                                        {item.first_name} {item.last_name}
                                      </span>
                                      <span className="text-[1.2rem] text-gray-500" style={{ color: '#6b7280' }}>
                                        {isExpanded ? 'Hide details' : 'View details'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5 text-[1.6rem]" style={{ color: '#444' }}>
                                    {item.role}
                                  </td>
                                  <td className="px-5 py-3.5 text-[1.6rem]" style={{ color: '#444' }}>
                                    {item.organisation}
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span
                                      className="text-[1.2rem] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                      style={item.status === "live"
                                        ? { background: '#dcfce7', color: '#16a34a' }
                                        : item.status === "pending"
                                        ? { background: '#fef3c7', color: '#d97706' }
                                        : { background: '#fef2f2', color: '#dc2626' }
                                      }
                                    >
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr>
                                    <td colSpan="4" className="px-5 py-4" style={{ background: '#f7f3ec' }}>
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg p-4" style={{ background: '#fff', border: '1px solid #c8ddf3' }}>
                                          <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-3" style={{ color: '#02598e' }}>
                                            Entry details
                                          </div>
                                          <div className="space-y-2 text-[1.5rem]" style={{ color: '#1e3a5f' }}>
                                            <div><span style={{ color: '#02598e', fontWeight: 600 }}>Country: </span>{item.country || "—"}</div>
                                            <div><span style={{ color: '#02598e', fontWeight: 600 }}>Expertise: </span>{item.expertise || "—"}</div>
                                            <div><span style={{ color: '#02598e', fontWeight: 600 }}>LinkedIn: </span>{item.linkedin ? <a href={item.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#02598e' }}>{item.linkedin}</a> : '—'}</div>
                                            <div><span style={{ color: '#02598e', fontWeight: 600 }}>Editor: </span>{item.editor_email || item.editorEmail || '—'}</div>
                                          </div>
                                        </div>
                                        <div className="rounded-lg p-4" style={{ background: '#fff', border: '1px solid #c8ddf3' }}>
                                          <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-3" style={{ color: '#02598e' }}>
                                            Summary
                                          </div>
                                          <div className="text-[1.5rem]" style={{ color: '#1e3a5f', lineHeight: 1.7 }}>
                                            {item.bio || 'No bio available.'}
                                          </div>
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
                    <div className="flex items-center gap-2 mt-6 pt-4 flex-wrap justify-center" style={{ borderTop: '1px solid #e8e0d0' }}>
                      <button
                        onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                        disabled={allPage === 1}
                        className="px-3 py-1.5 border rounded text-[1.4rem] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        style={{ borderColor: '#d1d5db' }}
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: Math.ceil(filteredAll.length / PAGE_SIZE) }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setAllPage(i + 1)}
                          className="px-3 py-1.5 border rounded text-[1.4rem] font-medium transition-colors"
                          style={allPage === i + 1
                            ? { background: '#02598e', color: '#fff', borderColor: '#02598e' }
                            : { background: '#f7f3ec', color: '#111', borderColor: '#d1d5db' }
                          }
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setAllPage((p) => Math.min(Math.ceil(filteredAll.length / PAGE_SIZE), p + 1))}
                        disabled={allPage === Math.ceil(filteredAll.length / PAGE_SIZE)}
                        className="px-3 py-1.5 border rounded text-[1.4rem] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        style={{ borderColor: '#d1d5db' }}
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

      <footer className="border-t border-gray-200 bg-[#f7f3ec] flex-shrink-0">
        <div className="max-w-[1440px] mx-auto px-8 py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-[1.4rem] text-gray-700">
            Women Leaders in Digital Health Database — Admin console
          </div>
          <div className="text-[1.3rem] text-gray-500">
            Admin access will require login in the next iteration.
          </div>
        </div>
      </footer>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="rounded-2xl px-8 py-6 shadow-xl max-w-sm mx-4" style={{ background: '#fff', border: '1px solid #e8e0d0' }}>
            <div className="text-[1.8rem] font-semibold mb-2" style={{ color: showConfirm.action === "reject" || showConfirm.action === "delete" ? '#dc2626' : '#02598e' }}>
              {showConfirm.title}
            </div>
            <div className="text-[1.5rem] mb-6" style={{ color: '#4b5563', lineHeight: 1.6 }}>
              {showConfirm.message}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-5 py-2.5 text-[1.5rem] font-medium rounded-full transition-colors"
                style={{ border: '1.5px solid #d1d5db', color: '#6b7280' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(null);
                  if (showConfirm.onConfirm) showConfirm.onConfirm();
                }}
                className="px-5 py-2.5 text-[1.5rem] font-medium rounded-full transition-colors"
                style={showConfirm.action === "reject" || showConfirm.action === "delete"
                  ? { background: '#dc2626', color: '#fff' }
                  : { background: '#02598e', color: '#fff' }
                }
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
