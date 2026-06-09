import React, { useState, useEffect, useMemo } from "react";
import { api } from "../api/leaders";
import { COUNTRY_TO_REGION, REGION_LABELS, ALL_COUNTRIES } from "../utils/countries";
import AdminManual from "./AdminManual";
// import AdminFixes from "./AdminFixes";

const SIDEBAR_ITEMS = [
  { id: "all", label: "All Entries", icon: "list" },
  { id: "requests", label: "Profile Requests", icon: "mail" },
  { id: "nominated", label: "Nominated", icon: "user-plus" },
  { id: "activity", label: "Activity Log", icon: "activity" },
  { id: "divider", label: "", icon: "divider" },
  // { id: "tests", label: "Test Results", icon: "test" },
  // { id: "fixes", label: "Test Fixes", icon: "fixes" },
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

function TestIcon() {
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
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function FixesIcon() {
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
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function ManualIcon() {
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
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

const ICONS = {
  inbox: InboxIcon,
  mail: MailIcon,
  list: ListIcon,
  "user-plus": UserPlusIcon,
  activity: ActivityIcon,
  test: TestIcon,
  fixes: FixesIcon,
  manual: ManualIcon,
};

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
  const [pending, setPending] = useState([]);
  const [nominated, setNominated] = useState([]);
  const [all, setAll] = useState([]);
  const [requests, setRequests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [requestSubTab, setRequestSubTab] = useState("new");
  const [selectedAll, setSelectedAll] = useState([]);
  const [actionId, setActionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [filterExpertise, setFilterExpertise] = useState("");
  const [filterClicks, setFilterClicks] = useState(""); // "", "high", "low", "least"
  const [filterStatus, setFilterStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("az");
  const [activityFilter, setActivityFilter] = useState("all"); // "all", "update", "delete"
  const [activitySearch, setActivitySearch] = useState("");
  const [activityDateRange, setActivityDateRange] = useState("all"); // "all", "7", "14", "30", "custom"
  const [activityDateFrom, setActivityDateFrom] = useState("");
  const [activityDateTo, setActivityDateTo] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [expandedAllId, setExpandedAllId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionIsError, setActionIsError] = useState(false);
  const [allPage, setAllPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandedNominee, setExpandedNominee] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [expandedTester, setExpandedTester] = useState(null);
  const [expandedTestSection, setExpandedTestSection] = useState(null);
  const [testFilterTester, setTestFilterTester] = useState("");
  const [testFilterStatus, setTestFilterStatus] = useState("");
  const [testFilterSearch, setTestFilterSearch] = useState("");
  const PAGE_SIZE = 15;

  useEffect(() => {
    loadData();
    loadActiveTabData();

    const interval = setInterval(() => {
      loadActiveTabData();
    }, 30000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadActiveTabData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    loadActiveTabData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      const [allLeaders, reqs, tests] = await Promise.all([
        api.getLeaders("all"),
        api.getRequests(),
        api.getTestResults(),
      ]);
      const leaders = allLeaders || [];
      setPending(
        leaders.filter((l) => l.status === "pending" && l.branch !== "nominate")
      );
      setNominated(
        leaders.filter((l) => l.status === "pending" && l.branch === "nominate")
      );
      setAll(leaders);
      if (reqs?.length) setRequests(reqs);
      if (tests?.length) setTestResults(tests);
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadActiveTabData() {
    try {
      if (activeTab === "all" || activeTab === "nominated") {
        const allLeaders = (await api.getLeaders("all")) || [];
        setAll(allLeaders);
        setPending(
          allLeaders.filter(
            (l) => l.status === "pending" && l.branch !== "nominate"
          )
        );
        setNominated(
          allLeaders.filter(
            (l) => l.status === "pending" && l.branch === "nominate"
          )
        );
      } else if (activeTab === "requests") {
        const reqs = await api.getRequests();
        if (reqs?.length) setRequests(reqs);
      // } else if (activeTab === "tests") {
      //   const tests = await api.getTestResults();
      //   if (tests?.length) setTestResults(tests);
      }
    } catch (e) {
      console.error("Failed to load tab data:", e);
    }
  }

  async function confirmAction(id, action) {
    setActionId(id);
    setActionMessage("");
    setActionIsError(false);
    try {
      if (action === "approve") await api.approveRequest(id);
      else await api.rejectRequest(id);

      const item = all.find((i) => i.id === id);
      const updated = item
        ? { ...item, status: action === "approve" ? "live" : "rejected" }
        : null;
      if (updated) setAll(all.map((i) => (i.id === id ? updated : i)));
      setPending((current) => current.filter((p) => p.id !== id));
      setNominated((current) => current.filter((p) => p.id !== id));
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
      setActionIsError(true);
      setActionMessage("Unable to complete action. Please try again.");
    } finally {
      setActionId(null);
    }
  }

  function handleAction(id, action) {
    const item =
      pending.find((i) => i.id === id) ||
      nominatedList.find((i) => i.id === id);
    const name = `${item?.first_name || ""} ${item?.last_name || ""}`.trim();
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

  function handleDeleteTestResult(id, scenario) {
    setShowConfirm({
      title: "Delete test result?",
      message: `"${scenario}" will be permanently removed.`,
      action: "delete",
      confirmLabel: "Delete",
      onConfirm: async () => {
        setShowConfirm(null);
        try {
          await api.deleteTestResult(id);
          setTestResults((prev) => prev.filter((r) => r.id !== id));
          setActionMessage("Test result deleted.");
        } catch (e) {
          setActionIsError(true);
          setActionMessage("Delete failed.");
        }
      },
    });
  }

  function handleClearTesterResults(name) {
    setShowConfirm({
      title: "Clear all results for this tester?",
      message: `All test results for "${name}" will be permanently removed. This cannot be undone.`,
      action: "delete",
      confirmLabel: "Clear all",
      onConfirm: async () => {
        setShowConfirm(null);
        try {
          await api.deleteTestResultsForTester(name);
          setTestResults((prev) => prev.filter((r) => r.tester_name !== name));
          setExpandedTester((prev) => (prev === name ? null : prev));
          setActionMessage(`All results cleared for ${name}.`);
        } catch (e) {
          setActionIsError(true);
          setActionMessage("Clear failed.");
        }
      },
    });
  }

  const handleRefresh = () => loadData();

  function buildOutreachMessage(item) {
    const name = item.first_name || "there";
    const nominator = item.editor_email || item.editorEmail || "a colleague";
    const role = item.role || "your work";
    const org = item.organisation || "";
    return `Hi ${name},\n\nYou've been nominated to be featured in the Transform Health Women Leaders in Digital Health Database — a global initiative to increase visibility and representation of women leaders in digital health across Africa and beyond.\n\n${
      org
        ? `We'd love to include your profile (${role} at ${org}) in the directory.\n\n`
        : ""
    }If you'd like to learn more or have your profile added, please reply to this message or visit transformhealthcoalition.org/leaders.\n\nWarm regards,\nThe Transform Health Team`;
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
    setActionIsError(false);
    try {
      // Use leader_email from the leaders table (admin-only field)
      const { data: leader } = await api
        .getLeaders("all")
        .then((all) => ({ data: all.find((l) => l.id === req.leader_id) }));

      if (!leader?.leader_email) {
        throw new Error("Leader email not found");
      }

      await api.requestManage({
        leaderId: req.leader_id,
        firstName: req.first_name,
        lastName: req.last_name,
        linkedin: req.linkedin,
      });
      setRequests((current) =>
        current.map((r) => (r.id === req.id ? { ...r, link_sent: true } : r))
      );
      setActionMessage(`Update link sent to ${leader.leader_email}.`);
    } catch (e) {
      console.error(e);
      setRequests((current) =>
        current.map((r) => (r.id === req.id ? { ...r, link_sent: true } : r))
      );
      setActionMessage(
        `Link marked as sent for ${req.first_name} ${req.last_name}.`
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDeleteLeader(id, name) {
    setShowConfirm({
      title: "Delete entry permanently?",
      message: `"${name}" will be permanently removed from the database. This cannot be undone.`,
      action: "delete",
      confirmLabel: "Delete",
      onConfirm: async () => {
        setShowConfirm(null);
        setActionIsError(false);
        try {
          await api.deleteLeader(id);
          setAll((prev) => prev.filter((l) => l.id !== id));
          setExpandedAllId(null);
          setActionMessage("Entry permanently deleted.");
        } catch (e) {
          setActionIsError(true);
          setActionMessage(
            "Delete failed — run the missing RLS policy in Supabase (see scripts/add-delete-policy.sql)."
          );
        }
      },
    });
  }

  function toggleDeleteSelect(id) {
    setSelectedDeletes((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  function toggleAllSelect(id) {
    setSelectedAll((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  }

  function toggleAllEntries() {
    const pendingRows = filteredAll.filter((r) => r.status === "pending");
    const allSelected = pendingRows.every((r) => selectedAll.includes(r.id));
    if (allSelected) setSelectedAll([]);
    else setSelectedAll(pendingRows.map((r) => r.id));
  }

  function handleBulkAllEntries(action) {
    if (selectedAll.length === 0) return;
    const label = action === "approve" ? "Approve" : "Reject";
    setShowConfirm({
      title: `${label} ${selectedAll.length} submission(s)?`,
      message:
        action === "approve"
          ? "These profiles will be published to the public directory."
          : "These profiles will be removed from the pending queue.",
      action,
      confirmLabel: `${label} ${selectedAll.length}`,
      onConfirm: () => {
        selectedAll.forEach((id) => confirmAction(id, action));
        setSelectedAll([]);
      },
    });
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setRequestSubTab("new");
    setFilterStatus("");
    setSelectedAll([]);
    setExpandedId(null);
    setExpandedAllId(null);
    setExpandedNominee(null);
    setExpandedTester(null);
    setExpandedTestSection(null);
    setTestFilterTester("");
    setTestFilterStatus("");
    setTestFilterSearch("");
    setActivityFilter("all");
    setActivitySearch("");
    setActivityDateRange("all");
    setActivityDateFrom("");
    setActivityDateTo("");
    setAllPage(1);
    setSearchQuery("");
    setFilterCountry("");
    setFilterRegion("");
    setFilterExpertise("");
  };

  const pendingCount = pending.length;
  const nominatedList = nominated;
  const nominatedCount = nominated.length;
  const requestsCount = requests.filter((r) => r.status === "pending").length;
  const totalPendingCount = pending.length + requestsCount;
  const liveCount = all.filter((item) => item.status === "live").length;
  const rejectedCount = all.filter((item) => item.status === "rejected").length;
  const allCount = all.length;

  const countries = useMemo(() => {
    const set = new Set();
    all.forEach((item) => {
      if (item.country) set.add(item.country);
    });
    return Array.from(set).sort();
  }, [all]);

  const countriesByRegion = useMemo(() => {
    const grouped = {};
    ALL_COUNTRIES.forEach((country) => {
      const key = COUNTRY_TO_REGION[country] || "other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(country);
    });
    return Object.entries(grouped)
      .map(([key, list]) => ({
        key,
        label: REGION_LABELS[key] || "Other",
        countries: list.sort(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const filteredCountries = useMemo(() => {
    if (!filterRegion) return countriesByRegion;
    return countriesByRegion.filter((r) => r.key === filterRegion);
  }, [countriesByRegion, filterRegion]);

  const expertiseOptions = useMemo(() => {
    const set = new Set();
    all.forEach((item) => {
      toTags(item.expertise).forEach((tag) => set.add(tag));
    });
    return Array.from(set).sort();
  }, [all]);

  const liveNames = useMemo(() => {
    const set = new Set();
    all
      .filter((l) => l.status === "live")
      .forEach((l) => {
        set.add(
          `${l.first_name?.trim()?.toLowerCase() ?? ""} ${
            l.last_name?.trim()?.toLowerCase() ?? ""
          }`
        );
      });
    return set;
  }, [all]);

  const filteredAll = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const results = all.filter((item) => {
      const text = [
        item.first_name,
        item.last_name,
        item.role,
        item.organisation,
        item.editor_email,
        item.leader_email,
        item.expertise,
        item.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (query && !text.includes(query)) return false;
      if (filterCountry && item.country !== filterCountry) return false;
      // Expertise filter
      if (filterExpertise) {
        const tags = toTags(item.expertise);
        if (!tags.includes(filterExpertise)) return false;
      }
      // LinkedIn clicks filter
      if (filterClicks === "high") {
        if ((item.linkedin_clicks || 0) < 1) return false;
      } else if (filterClicks === "low") {
        if ((item.linkedin_clicks || 0) > 0) return false;
      }
      // Status filter
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
    return results.slice().sort((a, b) => {
      // Sort by clicks first if clicks filter is active
      if (filterClicks === "high") {
        return (b.linkedin_clicks || 0) - (a.linkedin_clicks || 0);
      }
      if (filterClicks === "low") {
        return (a.linkedin_clicks || 0) - (b.linkedin_clicks || 0);
      }
      const l = `${a.last_name} ${a.first_name}`.toLowerCase();
      const r = `${b.last_name} ${b.first_name}`.toLowerCase();
      return sortOrder === "za"
        ? r < l
          ? -1
          : r > l
          ? 1
          : 0
        : l < r
        ? -1
        : l > r
        ? 1
        : 0;
    });
  }, [
    all,
    searchQuery,
    filterCountry,
    filterExpertise,
    filterClicks,
    filterStatus,
    sortOrder,
  ]);

  const activityLog = useMemo(() => {
    return requests
      .filter(r => r.status === "approved" && (r.request_type === "update" || r.request_type === "delete"))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [requests]);

  const filteredActivityLog = useMemo(() => {
    return activityLog.filter(entry => {
      if (activityFilter !== "all" && 
          ((activityFilter === "delete" && entry.request_type !== "delete") ||
           (activityFilter === "update" && entry.request_type !== "update")))
        return false;
      if (activitySearch) {
        const name = `${entry.first_name} ${entry.last_name}`.toLowerCase();
        if (!name.includes(activitySearch.toLowerCase())) return false;
      }
      if (activityDateRange !== "all" && entry.created_at) {
        const entryDate = new Date(entry.created_at);
        const now = new Date();
        if (activityDateRange === "7") {
          const cutoff = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
          if (entryDate < cutoff) return false;
        } else if (activityDateRange === "14") {
          const cutoff = new Date(now.getTime() - 14 * 24 * 3600 * 1000);
          if (entryDate < cutoff) return false;
        } else if (activityDateRange === "30") {
          const cutoff = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
          if (entryDate < cutoff) return false;
        } else if (activityDateRange === "custom") {
          if (activityDateFrom) {
            const from = new Date(activityDateFrom);
            from.setHours(0, 0, 0, 0);
            if (entryDate < from) return false;
          }
          if (activityDateTo) {
            const to = new Date(activityDateTo);
            to.setHours(23, 59, 59, 999);
            if (entryDate > to) return false;
          }
        }
      }
      return true;
    });
  }, [activityLog, activityFilter, activitySearch, activityDateRange, activityDateFrom, activityDateTo]);

  const sidebarData = [
    { ...SIDEBAR_ITEMS[0], count: allCount },
    { ...SIDEBAR_ITEMS[1], count: pending.length },
    { ...SIDEBAR_ITEMS[2], count: nominatedCount },
    { ...SIDEBAR_ITEMS[3], count: activityLog.length },
    SIDEBAR_ITEMS[4], // divider (no count)
    // { ...SIDEBAR_ITEMS[5], count: testResults.length },
    // { ...SIDEBAR_ITEMS[6], count: 21 },
  ];

  return (
    <div className="flex flex-col h-screen bg-brand-sand overflow-hidden">
      <header className="border-b-4 border-brand-pink bg-white shadow-md flex-shrink-0">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 px-8 py-4">
          <div className="flex items-center gap-4">
            <img
              src="https://transformhealthcoalition.org/wp-content/themes/th/assets/images/main_logo.svg"
              alt="Transform Health"
              className="h-12 block"
            />
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-brand-navy">
              Admin Console
            </div>
          </div>
          <div className="flex justify-end">
            <span className="text-[1.3rem] text-brand-navy font-semibold italic">
              Test mode
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`w-80 min-w-[24rem] border-r-4 border-brand-pink bg-brand-navy shadow-md flex flex-col flex-shrink-0 ${
          activeTab === "manual" ? "hidden" : ""
        }`}>
          <div className="px-6 py-5 border-b-2 border-brand-pink">
            <div className="flex items-center justify-center">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center rounded-lg border-2 border-brand-yellow px-4 py-3 text-[1.6rem] font-bold text-brand-yellow bg-transparent hover:bg-brand-pink hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2"
              >
                Refresh ↻
              </button>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {sidebarData.map((item) => {
              // Divider row
              if (item.id === "divider") {
                return (
                  <hr
                    key="divider"
                    className="my-2 border-t border-brand-pink border-opacity-30"
                  />
                );
              }

              const Icon = ICONS[item.icon];
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  title={{
                    all: "Browse and manage the full database",
                    requests: "Review and approve new submissions",
                    nominated: "Reach out to third-party nominations",
                    activity: "Track self-service updates and deletions",
                    documentation: "Guides, workflows, and admin reference",
                  }[item.id] || item.label}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-xl font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-brand-pink text-white border border-brand-pink"
                      : "bg-transparent text-white border border-transparent hover:bg-brand-pink hover:bg-opacity-20"
                  }`}
                >
                  <span
                    className={isActive ? "text-white" : "text-brand-yellow"}
                  >
                    <Icon />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {(item.id === "tests" || item.id === "fixes") && (
                    <span
                      className={`text-[1.2rem] font-bold px-2 py-1 rounded tracking-wider ${
                        isActive
                          ? "bg-amber-200 text-amber-800"
                          : "bg-amber-400/80 text-amber-900"
                      }`}
                    >
                      DEV
                    </span>
                  )}
                  {item.count !== undefined && (
                    <span
                      className={`text-[1.6rem] font-bold px-2 py-0.5 rounded-lg ${
                        isActive
                          ? "bg-white text-brand-navy"
                          : "bg-brand-yellow text-brand-navy"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-gray-200 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("manual")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-3 text-[1.6rem] font-medium text-gray-600 bg-white hover:bg-gray-50 hover:text-brand-navy transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
            >
              <ManualIcon />
              Documentation
            </button>
            <button
              onClick={() => onGoToDirectory?.()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-brand-pink px-3 py-3 text-[1.6rem] font-medium text-brand-pink bg-brand-parchment hover:bg-brand-pink hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
            >
              View directory
            </button>
          </div>
        </aside>

        <main className={`flex-1 flex flex-col overflow-hidden ${
          activeTab === "manual" ? "w-full" : ""
        }`}>
          {/* Page header + stats - hidden for Tests tab */}
          {activeTab !== "tests" &&
            activeTab !== "manual" &&
            activeTab !== "fixes" && (
              <div className="px-8 py-6 border-b border-brand-warm-border flex-shrink-0 bg-gradient-to-br from-brand-sand to-[#ede7d8]">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-brand-navy tracking-heading">
                      {sidebarData.find((s) => s.id === activeTab)?.label}
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center sm:text-right">
                    <div className="bg-brand-orange rounded-lg px-[1.6rem] py-[1.2rem] border-2 border-brand-orange" title="New profile submissions waiting for approval">
                      <div className="text-[1.4rem] font-bold uppercase tracking-wider text-white">
                        Pending
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {totalPendingCount}
                      </div>
                    </div>
                    <div className="bg-green-500 rounded-lg px-[1.6rem] py-[1.2rem] border-2 border-green-600" title="Approved profiles published to the public directory">
                      <div className="text-[1.4rem] font-bold uppercase tracking-wider text-white">
                        Live
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {liveCount}
                      </div>
                    </div>
                    <div className="bg-red-600 rounded-lg px-[1.6rem] py-[1.2rem] border-2 border-red-700" title="Profiles that have been declined">
                      <div className="text-[1.4rem] font-bold uppercase tracking-wider text-white">
                        Rejected
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {rejectedCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Filter bar - hidden for manual/docs and activity tabs */}
          {activeTab !== "tests" &&
            activeTab !== "manual" &&
            activeTab !== "fixes" &&
            activeTab !== "activity" && (
              <div className="px-8 py-4 border-b-2 border-brand-navy flex-shrink-0 bg-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-3 items-center">
                    <input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setAllPage(1);
                      }}
                      placeholder="Search name, org, role, expertise"
                      className="min-w-[220px] rounded-lg border-2 border-gray-400 px-4 py-2 text-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus:border-brand-navy bg-white text-gray-900"
                    />
                    <select
                      value={filterRegion}
                      onChange={(e) => {
                        setFilterRegion(e.target.value);
                        setFilterCountry("");
                        setAllPage(1);
                      }}
                      className="rounded-lg border-2 border-gray-400 px-3 py-2 text-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus:border-brand-navy bg-white text-gray-900"
                    >
                      <option value="">All regions</option>
                      {countriesByRegion.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filterCountry}
                      onChange={(e) => {
                        setFilterCountry(e.target.value);
                        setAllPage(1);
                      }}
                      className="rounded-lg border-2 border-gray-400 px-3 py-2 text-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus:border-brand-navy bg-white text-gray-900"
                    >
                      <option value="">All countries{filterRegion ? ` in ${REGION_LABELS[filterRegion] || ""}` : ""}</option>
                      {filteredCountries.map((region) => (
                        <optgroup key={region.key} label={region.label}>
                          {region.countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <select
                      value={filterExpertise}
                      onChange={(e) => {
                        setFilterExpertise(e.target.value);
                        setAllPage(1);
                      }}
                      className="rounded-lg border-2 border-gray-400 px-3 py-2 text-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus:border-brand-navy bg-white text-gray-900"
                    >
                      <option value="">All expertise</option>
                      {expertiseOptions.map((expertise) => (
                        <option key={expertise} value={expertise}>
                          {expertise}
                        </option>
                      ))}
                    </select>
                    {activeTab === "all" && (
                      <select
                        value={filterClicks}
                        onChange={(e) => {
                          setFilterClicks(e.target.value);
                          setAllPage(1);
                        }}
                        className="rounded-lg border-2 border-gray-400 px-3 py-2 text-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus:border-brand-navy bg-white text-gray-900"
                      >
                        <option value="">All click counts</option>
                        <option value="high">🔥 Most clicked (high)</option>
                        <option value="low">📉 Least clicked (low)</option>
                      </select>
                    )}
                    {activeTab === "all" && (
                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                          setAllPage(1);
                        }}
                        className="rounded-lg border-2 border-gray-400 px-3 py-2 text-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus:border-brand-navy bg-white text-gray-900"
                      >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="live">Live</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}
                  </div>
                  <div className="text-[1.4rem] font-bold text-brand-navy">
                    {activeTab === "all"
                      ? `${filteredAll.length} of ${allCount} total entries`
                      : activeTab === "nominated"
                      ? `${nominatedCount} nominated`
                      : activeTab === "requests"
                      ? `${pending.length} new`
                      : activeTab === "activity"
                      ? `${activityLog.length} events`
                      : `${requestsCount} pending requests`}
                  </div>
                </div>
                {actionMessage && (
                  <div
                    className={`mt-4 rounded-lg px-4 py-3 text-lg border ${
                      actionIsError
                        ? "border-red-300 bg-red-50 text-red-800"
                        : "border-brand-green-border bg-green-50 text-green-800"
                    }`}
                  >
                    {actionMessage}
                  </div>
                )}
              </div>
            )}

          {/* Activity Log filter bar — replaces general filter bar for activity tab */}
          {activeTab === "activity" && (
            <div className="px-8 py-3 border-b-2 border-brand-navy flex-shrink-0 bg-white">
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="rounded-lg border-2 border-gray-400 px-3 py-2 text-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus:border-brand-navy bg-white text-gray-900"
                >
                  <option value="all">All actions</option>
                  <option value="update">Updates</option>
                  <option value="delete">Deletes</option>
                </select>
                <select
                  value={activityDateRange}
                  onChange={(e) => setActivityDateRange(e.target.value)}
                  className="rounded-lg border-2 border-gray-400 px-3 py-2 text-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus:border-brand-navy bg-white text-gray-900"
                >
                  <option value="all">All time</option>
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="custom">Custom range…</option>
                </select>
                {activityDateRange === "custom" && (
                  <>
                    <input
                      type="date"
                      value={activityDateFrom}
                      onChange={(e) => setActivityDateFrom(e.target.value)}
                      className="rounded-lg border-2 border-gray-400 px-3 py-2 text-lg font-medium shadow-sm bg-white text-gray-900"
                    />
                    <span className="text-lg text-gray-500">to</span>
                    <input
                      type="date"
                      value={activityDateTo}
                      onChange={(e) => setActivityDateTo(e.target.value)}
                      className="rounded-lg border-2 border-gray-400 px-3 py-2 text-lg font-medium shadow-sm bg-white text-gray-900"
                    />
                  </>
                )}
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="min-w-[180px] rounded-lg border-2 border-gray-400 px-4 py-2 text-lg font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus:border-brand-navy bg-white text-gray-900 placeholder-gray-400"
                />
                {(activityFilter !== "all" || activitySearch || activityDateRange !== "all") && (
                  <button
                    onClick={() => { setActivityFilter("all"); setActivitySearch(""); setActivityDateRange("all"); setActivityDateFrom(""); setActivityDateTo(""); }}
                    className="text-[1.3rem] text-brand-pink font-medium hover:underline whitespace-nowrap cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 bg-white">
            {loading ? (
              <div className="text-center py-12 text-xl text-brand-navy">
                Loading...
              </div>
            ) : activeTab === "requests" ? (
              <div className="rounded-lg overflow-hidden border-2 border-brand-navy bg-white">
                {/* Sub-tab bar */}
                <div className="flex border-b-2 border-brand-navy bg-brand-navy">
                  <button
                    onClick={() => setRequestSubTab("new")}
                    title="New profile submissions waiting for approval"
                    className={`flex-1 px-5 py-3 text-lg font-bold transition-colors ${
                      requestSubTab === "new"
                        ? "bg-white text-green-700 border-b-[4px] border-green-500"
                        : "bg-transparent text-white border-b-[4px] border-transparent hover:bg-white hover:bg-opacity-15"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <circle cx="7" cy="7" r="7" fill="#22c55e" />
                      </svg>
                      New
                      <span
                        className={`text-[1.3rem] font-medium px-2 py-0.5 rounded-full ${
                          requestSubTab === "new"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {pending.length}
                      </span>
                    </span>
                  </button>
                </div>
                {/* Updates and Deletes sub-tabs removed — self-service actions now in Activity Log */}
                {requestSubTab === "new" && (
                  <>
                    {pending.length === 0 ? (
                      <div className="text-center py-20">
                        <div className="text-[4.8rem] mb-4 text-green-400">
                          ✓
                        </div>
                        <div className="text-lg text-green-600">
                          No new submissions
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg overflow-hidden border-[1.5px] border-brand-warm-border bg-brand-parchment">
                        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-brand-navy bg-brand-navy">
                          <div className="text-[1.4rem] font-bold text-white">
                            {pending.length} pending submission(s)
                          </div>
                        </div>
                        {pending.map((item) => {
                          const isExpanded = expandedId === item.id;
                          return (
                            <div key={item.id}>
                              <div
                                role="button"
                                tabIndex={0}
                                aria-expanded={isExpanded}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setExpandedId(isExpanded ? null : item.id);
                                  }
                                }}
                                className={`flex items-center px-5 cursor-pointer transition-colors min-h-[64px] border-b border-brand-warm-row-border ${
                                  isExpanded
                                    ? "bg-brand-warm-row"
                                    : "bg-white hover:bg-brand-warm-bg"
                                } ${
                                  !isExpanded
                                    ? "focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset"
                                    : ""
                                }`}
                                onClick={() =>
                                  setExpandedId(isExpanded ? null : item.id)
                                }
                              >
                                <div className="flex-shrink-0 mr-4">
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4 bg-brand-blue-tint text-brand-navy">
                                  {getInitials(item.first_name, item.last_name)}
                                </div>
                                <div className="flex-1 min-w-0 mr-4">
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-lg truncate text-brand-dark">
                                      {item.first_name} {item.last_name}
                                    </span>
                                    <span className="text-[1.4rem] truncate text-gray-500">
                                      {item.role}
                                    </span>
                                  </div>
                                  <div className="text-[1.4rem] truncate mt-0.5 text-gray-400">
                                    {item.organisation}
                                  </div>
                                </div>
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  className={`text-gray-400 transition-transform ${
                                    isExpanded ? "rotate-180" : "rotate-0"
                                  }`}
                                >
                                  <path
                                    d="M4 6l4 4 4-4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              {isExpanded && (
                                <div className="px-5 py-4 bg-brand-warm-bg border-b border-brand-warm-border">
                                  <div className="grid gap-4 mb-4 md:grid-cols-2">
                                    <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                      <div className="text-[1.4rem] font-semibold uppercase tracking-wider mb-2 text-brand-navy">
                                        Personal
                                      </div>
                                      <div className="grid gap-2 text-[1.5rem] text-brand-dark-blue">
                                        <div>
                                          <span className="text-brand-navy font-semibold">
                                            Email:{" "}
                                          </span>
                                          {item.editor_email ||
                                            item.email ||
                                            "—"}
                                        </div>
                                        <div>
                                          <span className="text-brand-navy font-semibold">
                                            Role:{" "}
                                          </span>
                                          {item.role || "—"}
                                        </div>
                                        <div>
                                          <span className="text-brand-navy font-semibold">
                                            Organisation:{" "}
                                          </span>
                                          {item.organisation || "—"}
                                        </div>
                                        <div>
                                          <span className="text-brand-navy font-semibold">
                                            Country:{" "}
                                          </span>
                                          {item.country || "—"}
                                        </div>
                                        <div>
                                          <span className="text-brand-navy font-semibold">
                                            Experience:{" "}
                                          </span>
                                          {item.years_experience ||
                                            item.yearsExp ||
                                            "—"}
                                        </div>
                                        <div>
                                          <span className="text-brand-navy font-semibold">
                                            Geo scope:{" "}
                                          </span>
                                          {item.geo_scope || "—"}
                                        </div>
                                        <div>
                                          <span className="text-brand-navy font-semibold">
                                            Works across:{" "}
                                          </span>
                                          {item.countries || "—"}
                                        </div>
                                        <div>
                                          <span className="text-brand-navy font-semibold">
                                            Submitted:{" "}
                                          </span>
                                          {item.created_at
                                            ? new Date(
                                                item.created_at
                                              ).toLocaleString()
                                            : "—"}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                      <div className="text-[1.4rem] font-semibold uppercase tracking-wider mb-2 text-brand-navy">
                                        Expertise
                                      </div>
                                      <div className="mb-3">
                                        {toTags(item.expertise).length > 0 ? (
                                          <div className="flex flex-wrap gap-1.5">
                                            {toTags(item.expertise).map(
                                              (tag, i) => (
                                                <span
                                                  key={i}
                                                  title={tag}
                                                  className="inline-block bg-brand-blue-tint text-brand-navy text-[1.3rem] font-medium px-2.5 py-0.5 rounded-full border border-brand-blue-border"
                                                >
                                                  {tag}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          "—"
                                        )}
                                      </div>
                                      <div className="text-[1.4rem] font-semibold uppercase tracking-wider mb-2 text-brand-navy">
                                        LinkedIn
                                      </div>
                                      <div className="mb-3 text-[1.5rem]">
                                        {item.linkedin ? (
                                          <a
                                            href={item.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline text-brand-navy break-all"
                                          >
                                            {item.linkedin}
                                          </a>
                                        ) : (
                                          "—"
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid gap-4 mb-4 md:grid-cols-2">
                                    <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                      <div className="text-[1.4rem] font-semibold uppercase tracking-wider mb-2 text-brand-navy">
                                        Bio
                                      </div>
                                      <div className="text-[1.5rem] text-brand-dark-blue leading-[1.7] break-words">
                                        {item.bio || "—"}
                                      </div>
                                    </div>
                                    <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                      <div className="text-[1.4rem] font-semibold uppercase tracking-wider mb-2 text-brand-navy">
                                        Notable items
                                      </div>
                                      {(() => {
                                        const raw =
                                          item.notable_items ||
                                          item.notableItems;
                                        const items = Array.isArray(raw)
                                          ? raw
                                          : typeof raw === "string"
                                          ? (() => {
                                              try {
                                                return JSON.parse(raw);
                                              } catch {
                                                return [];
                                              }
                                            })()
                                          : [];
                                        return items.length > 0 ? (
                                          <div className="flex flex-col gap-2">
                                            {items.map((ni, i) => (
                                              <div
                                                key={i}
                                                className="text-[1.5rem] text-brand-dark-blue"
                                              >
                                                <span className="font-semibold">
                                                  {ni.title || "—"}
                                                </span>
                                                {ni.type && (
                                                  <span className="text-gray-500">
                                                    {" "}
                                                    ({ni.type})
                                                  </span>
                                                )}
                                                {ni.link && (
                                                  <span>
                                                    {" "}
                                                    —{" "}
                                                    <a
                                                      href={ni.link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="hover:underline text-brand-navy break-all"
                                                    >
                                                      {ni.link}
                                                    </a>
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          "—"
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleAction(item.id, "approve")
                                      }
                                      disabled={actionId === item.id}
                                      className="px-4 py-2 text-[1.4rem] font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                      {actionId === item.id ? "..." : "Approve"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAction(item.id, "reject")
                                      }
                                      disabled={actionId === item.id}
                                      className="px-4 py-2 text-[1.4rem] font-medium rounded-lg border-[1.5px] border-red-400 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
                    )}
                  </>
                )}

              </div>
            ) : activeTab === "activity" ? (
              filteredActivityLog.length === 0 && activityLog.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-[4.8rem] mb-4 text-gray-300">—</div>
                  <div className="text-lg text-gray-500">
                    No self-service activity yet
                  </div>
                  <div className="text-[1.4rem] text-gray-400 mt-2">
                    Updates and deletions by leaders will appear here
                  </div>
                </div>
              ) : filteredActivityLog.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-[4.8rem] mb-4 text-gray-300">—</div>
                  <div className="text-lg text-gray-500">
                    No results match the current filters
                  </div>
                  <button
                    onClick={() => { setActivityFilter("all"); setActivitySearch(""); setActivityDateRange("all"); setActivityDateFrom(""); setActivityDateTo(""); }}
                    className="mt-3 text-[1.4rem] text-brand-pink font-medium hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border-[1.5px] border-brand-blue-border bg-white">
                  <div className="flex items-center justify-between px-5 py-3 border-b-2 border-brand-navy bg-brand-navy">
                    <div className="text-[1.4rem] font-bold text-white">
                      Self-service activity log
                    </div>
                    <div className="text-[1.3rem] text-gray-300">
                      {filteredActivityLog.length} event(s)
                    </div>
                  </div>
                  <div className="divide-y divide-brand-warm-row-border">
                    {filteredActivityLog.map((entry) => {
                      const isDelete = entry.request_type === "delete";
                      return (
                        <div
                          key={entry.id}
                          className="px-5 py-4 bg-white hover:bg-brand-warm-bg transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 ${
                              isDelete
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                            }`}>
                              {getInitials(entry.first_name, entry.last_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg text-brand-dark">
                                  {entry.first_name} {entry.last_name}
                                </span>
                                <span className={`text-[1.2rem] font-semibold px-2 py-0.5 rounded-full ${
                                  isDelete
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                  {isDelete ? "Deleted" : "Updated"}
                                </span>
                              </div>
                              <div className="text-[1.3rem] text-gray-400 mt-0.5">
                                {entry.created_at
                                  ? new Date(entry.created_at).toLocaleString()
                                  : "—"}
                              </div>
                            </div>
                          </div>
                          {isDelete && entry.changes && (
                            <div className="mt-3 ml-14 rounded-lg p-3 bg-red-50 border border-red-200">
                              <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-1 text-gray-500">
                                Reason
                              </div>
                              <p className="text-[1.3rem] text-brand-dark-blue">
                                {entry.changes}
                              </p>
                            </div>
                          )}
                          {!isDelete && entry.changes && (
                            <div className="mt-3 ml-14 rounded-lg p-3 bg-gray-50 border border-gray-200">
                              <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-1 text-gray-500">
                                Changes
                              </div>
                              {!isDelete && entry.changes && (
                                <div className="mt-3 ml-14 rounded-lg p-3 bg-gray-50 border border-gray-200">
                                  <div className="text-[1.2rem] font-semibold uppercase tracking-wider mb-1 text-gray-500">
                                    Changes
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    {Object.entries(
                                      typeof entry.changes === "string"
                                        ? JSON.parse(entry.changes)
                                        : entry.changes
                                    ).map(([field, val]) => (
                                      <div key={field} className="text-[1.3rem] leading-[1.6]">
                                        <span className="font-medium text-brand-dark capitalize">
                                          {field.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-gray-400 mx-1.5">·</span>
                                        <span className="line-through text-gray-400">{val.old || "—"}</span>
                                        <span className="text-gray-400 mx-1.5">→</span>
                                        <span className="text-brand-dark-blue">{val.new || "—"}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : activeTab === "nominated" ? (
              nominatedList.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-[4.8rem] mb-4 text-green-400">✓</div>
                  <div className="text-lg text-green-600">
                    No pending nominations
                  </div>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border-[1.5px] border-brand-warm-border bg-brand-parchment">
                  <div className="flex items-center justify-between px-5 py-3 border-b bg-pink-light border-brand-pink-border">
                    <div className="text-[1.4rem] font-semibold text-accent-pink">
                      {nominatedList.length} nominations to reach out to
                    </div>
                    <div className="text-[1.3rem] text-accent-purple">
                      Click a nominee to view details
                    </div>
                  </div>

                  {nominatedList.map((item) => {
                    const isExpanded = expandedNominee === item.id;
                    const isCopied = copiedId === item.id;
                    return (
                      <div key={item.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setExpandedNominee(isExpanded ? null : item.id);
                            }
                          }}
                          className={`flex items-center px-5 cursor-pointer transition-colors min-h-[64px] border-b border-brand-warm-row-border ${
                            isExpanded
                              ? "bg-brand-warm-row"
                              : "bg-white hover:bg-brand-warm-bg"
                          } ${
                            !isExpanded
                              ? "focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset"
                              : ""
                          }`}
                          onClick={() =>
                            setExpandedNominee(isExpanded ? null : item.id)
                          }
                        >
                          <div className="flex-shrink-0 mr-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-pink" />
                          </div>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[1.4rem] font-medium flex-shrink-0 mr-4 bg-pink-light text-accent-pink">
                            {getInitials(item.first_name, item.last_name)}
                          </div>
                          <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-lg truncate text-brand-dark">
                                {item.first_name} {item.last_name}
                              </span>
                            </div>
                            <div className="text-[1.4rem] truncate mt-0.5 text-gray-400">
                              Nominated by{" "}
                              {item.nominator_name || item.editor_email || "—"}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {item.linkedin && (
                              <a
                                href={item.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[1.3rem] font-medium px-2.5 py-1 rounded-lg bg-brand-blue-tint text-brand-navy hover:bg-blue-50 transition-colors"
                              >
                                LinkedIn ↗
                              </a>
                            )}
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              className={`text-gray-400 transition-transform ${
                                isExpanded ? "rotate-180" : "rotate-0"
                              }`}
                            >
                              <path
                                d="M4 6l4 4 4-4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-5 py-4 bg-brand-warm-bg border-b border-brand-warm-border">
                            <div className="grid gap-4 mb-4 md:grid-cols-2">
                              <div className="rounded-lg p-4 bg-brand-parchment border border-brand-pink-border">
                                <div className="text-[1.4rem] font-semibold uppercase tracking-wider mb-3 text-accent-pink">
                                  Nominator
                                </div>
                                <div className="grid gap-2 text-[1.5rem] text-brand-dark-blue">
                                  <div>
                                    <span className="text-accent-pink font-semibold">
                                      Full name:{" "}
                                    </span>
                                    {item.nominator_name || "—"}
                                  </div>
                                  <div>
                                    <span className="text-accent-pink font-semibold">
                                      Email:{" "}
                                    </span>
                                    {item.editor_email || "—"}
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-lg p-4 bg-brand-parchment border border-brand-blue-border">
                                <div className="text-[1.4rem] font-semibold uppercase tracking-wider mb-3 text-brand-navy">
                                  Nominee
                                </div>
                                <div className="grid gap-2 text-[1.5rem] text-brand-dark-blue">
                                  <div>
                                    <span className="text-brand-navy font-semibold">
                                      Full name:{" "}
                                    </span>
                                    {item.first_name} {item.last_name}
                                  </div>
                                  <div>
                                    <span className="text-brand-navy font-semibold">
                                      Profile link:{" "}
                                    </span>
                                    {item.nominate_link ? (
                                      <a
                                        href={item.nominate_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline text-brand-navy break-all"
                                      >
                                        {item.nominate_link}
                                      </a>
                                    ) : (
                                      "—"
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleAction(item.id, "approve")}
                                disabled={actionId === item.id}
                                className="px-4 py-2 text-[1.4rem] font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {actionId === item.id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleAction(item.id, "reject")}
                                disabled={actionId === item.id}
                                className="px-4 py-2 text-[1.4rem] font-medium rounded-lg border-[1.5px] border-red-400 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
            ) : activeTab === "all" ? (
              <>
                <div className="rounded-lg overflow-hidden border-[1.5px] border-brand-warm-border bg-brand-parchment">
                  {selectedAll.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-3 border-b-2 border-brand-navy bg-brand-navy">
                      <div className="flex items-center gap-3">
                        <div className="text-[1.4rem] font-bold text-white">
                          {selectedAll.length} pending selected
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filteredAll
                              .filter((r) => r.status === "pending")
                              .every((r) => selectedAll.includes(r.id))}
                            onChange={toggleAllEntries}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-[1.3rem] font-medium text-amber-800">
                            Select all
                          </span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBulkAllEntries("approve")}
                          className="px-3 py-1.5 text-[1.3rem] font-semibold rounded-lg bg-green-600 text-white transition-colors"
                        >
                          Approve {selectedAll.length}
                        </button>
                        <button
                          onClick={() => handleBulkAllEntries("reject")}
                          className="px-3 py-1.5 text-[1.3rem] font-semibold rounded-lg bg-red-600 text-white transition-colors"
                        >
                          Reject {selectedAll.length}
                        </button>
                      </div>
                    </div>
                  )}
                  <table className="w-full">
                    <thead className="border-b-2 border-brand-navy bg-brand-navy">
                      <tr>
                        <th className="w-10 px-2 py-3"></th>
                        {[
                          "Name",
                          "Expertise",
                          "LinkedIn Clicks",
                          "Details",
                          "Status",
                          "Date Joined",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left text-[1.4rem] font-bold uppercase tracking-wider px-5 py-3 text-white"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0ebe0]">
                      {filteredAll
                        .slice((allPage - 1) * PAGE_SIZE, allPage * PAGE_SIZE)
                        .map((item) => {
                          const isExpanded = expandedAllId === item.id;
                          const isPending = item.status === "pending";
                          const isDuplicate =
                            isPending &&
                            liveNames.has(
                              `${
                                item.first_name?.trim()?.toLowerCase() ?? ""
                              } ${item.last_name?.trim()?.toLowerCase() ?? ""}`
                            );
                          return (
                            <React.Fragment key={item.id}>
                              <tr
                                tabIndex={0}
                                aria-expanded={isExpanded}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    setExpandedAllId(
                                      isExpanded ? null : item.id
                                    );
                                  }
                                }}
                                className="transition-colors cursor-pointer bg-transparent hover:bg-brand-warm-row focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset"
                                onClick={() =>
                                  setExpandedAllId(isExpanded ? null : item.id)
                                }
                              >
                                <td className="px-2 py-3.5">
                                  {isPending && (
                                    <input
                                      type="checkbox"
                                      checked={selectedAll.includes(item.id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleAllSelect(item.id);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 rounded cursor-pointer"
                                    />
                                  )}
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg font-medium text-brand-dark">
                                      {item.first_name} {item.last_name}
                                    </span>
                                    {isDuplicate && (
                                      <span className="flex-shrink-0 text-[1.3rem] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                                        ⚠ Possible duplicate
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex flex-wrap gap-1">
                                    {toTags(item.expertise).slice(0, 3).map((tag, i) => (
                                      <span key={i} className="inline-block bg-brand-blue-tint text-brand-navy text-[1.2rem] font-medium px-2 py-0.5 rounded-full border border-brand-blue-border">
                                        {tag}
                                      </span>
                                    ))}
                                    {toTags(item.expertise).length > 3 && (
                                      <span className="text-[1.2rem] text-gray-400">+{toTags(item.expertise).length - 3}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-lg text-gray-600 text-center">
                                  {item.linkedin_clicks || 0}
                                </td>
                                <td className="px-2 py-3.5 text-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedAllId(isExpanded ? null : item.id);
                                    }}
                                    className="text-[1.2rem] font-medium px-3 py-1.5 rounded-lg transition-colors bg-brand-blue-tint text-brand-navy border border-brand-blue-border hover:bg-blue-100 cursor-pointer"
                                  >
                                    {isExpanded ? "Hide" : "View"}
                                  </button>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span
                                    className={`text-[1.3rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                      item.status === "live"
                                        ? "bg-green-600 text-white"
                                        : item.status === "pending"
                                        ? "bg-yellow-500 text-white"
                                        : "bg-red-600 text-white"
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-[1.3rem] text-gray-500 whitespace-nowrap">
                                  {item.created_at
                                    ? new Date(item.created_at).toLocaleDateString()
                                    : "—"}
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td
                                    colSpan="7"
                                    className="px-5 py-4 bg-brand-parchment"
                                  >
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                        <div className="text-[1.4rem] font-semibold uppercase tracking-wider mb-3 text-brand-navy">
                                          Entry details
                                        </div>
                                        <div className="space-y-2 text-[1.5rem] text-brand-dark-blue">
                                          <div>
                                            <span className="text-brand-navy font-semibold">
                                              Country:{" "}
                                            </span>
                                            {item.country || "—"}
                                          </div>
                                          <div>
                                            <span className="text-brand-navy font-semibold">
                                              Expertise:{" "}
                                            </span>
                                            {toTags(item.expertise).length >
                                            0 ? (
                                              <div className="flex flex-wrap gap-1.5 mt-1">
                                                {toTags(item.expertise).map(
                                                  (tag, i) => (
                                                    <span
                                                      key={i}
                                                      title={tag}
                                                      className="inline-block bg-brand-blue-tint text-brand-navy text-[1.3rem] font-medium px-2.5 py-0.5 rounded-full border border-brand-blue-border"
                                                    >
                                                      {tag}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            ) : (
                                              "—"
                                            )}
                                          </div>
                                          <div>
                                            <span className="text-brand-navy font-semibold">
                                              LinkedIn:{" "}
                                            </span>
                                            {item.linkedin ? (
                                              <a
                                                href={item.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:underline text-brand-navy"
                                              >
                                                {item.linkedin}
                                              </a>
                                            ) : (
                                              "—"
                                            )}
                                          </div>
                                          <div>
                                            <span className="text-brand-navy font-semibold">
                                              Editor:{" "}
                                            </span>
                                            {item.editor_email ||
                                              item.editorEmail ||
                                              "—"}
                                          </div>
                                          <div>
                                            <span className="text-brand-navy font-semibold">
                                              Leader email:{" "}
                                            </span>
                                            {item.leader_email || "—"}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="rounded-lg p-4 bg-white border border-brand-blue-border">
                                        <div className="text-[1.4rem] font-semibold uppercase tracking-wider mb-3 text-brand-navy">
                                          Summary
                                        </div>
                                        <div className="text-[1.5rem] text-brand-dark-blue leading-[1.7]">
                                          {item.bio || "No bio available."}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-end gap-3">
                                      {isPending && (
                                        <>
                                          <button
                                            onClick={() =>
                                              handleAction(item.id, "approve")
                                            }
                                            disabled={actionId === item.id}
                                            className="px-4 py-2 text-[1.4rem] font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                          >
                                            {actionId === item.id
                                              ? "..."
                                              : "Approve"}
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleAction(item.id, "reject")
                                            }
                                            disabled={actionId === item.id}
                                            className="px-4 py-2 text-[1.4rem] font-medium rounded-lg border-[1.5px] border-red-400 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteLeader(
                                            item.id,
                                            `${item.first_name} ${item.last_name}`
                                          );
                                        }}
                                        className="text-[1.3rem] font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-1.5 rounded-lg transition-colors"
                                      >
                                        Delete entry
                                      </button>
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
                    {Array.from(
                      { length: Math.ceil(filteredAll.length / PAGE_SIZE) },
                      (_, i) => (
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
                      )
                    )}
                    <button
                      onClick={() =>
                        setAllPage((p) =>
                          Math.min(
                            Math.ceil(filteredAll.length / PAGE_SIZE),
                            p + 1
                          )
                        )
                      }
                      disabled={
                        allPage === Math.ceil(filteredAll.length / PAGE_SIZE)
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded text-[1.4rem] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:border-gray-400"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : activeTab === "manual" ? (
              <AdminManual onBackToAdmin={() => handleTabChange("all")} />
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
            <div
              className={`text-xl font-semibold mb-2 ${
                showConfirm.action === "reject" ||
                showConfirm.action === "delete"
                  ? "text-red-600"
                  : "text-brand-navy"
              }`}
            >
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
                onClick={() => {
                  setShowConfirm(null);
                  if (showConfirm.onConfirm) showConfirm.onConfirm();
                }}
                className={`px-5 py-2.5 text-[1.5rem] font-medium rounded-full text-white transition-colors ${
                  showConfirm.action === "reject" ||
                  showConfirm.action === "delete"
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
