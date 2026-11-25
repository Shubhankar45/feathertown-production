import { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  RefreshCw,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Users,
  MousePointer,
  Eye,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
  Layers,
  Trash2,
  Edit2,
  Lock,
} from "lucide-react";
import { adminFetch } from "../../utils/adminApi";
import { toast } from "../../components/ui/Toast";

export default function AdminAdsTracker() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    platform: "meta",
    objective: "leads",
    budget: "",
    spend: "",
    impressions: "",
    clicks: "",
    leads: "",
    roas: "4.0",
    status: "active",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
    autoRecordExpense: true,
  });

  // Credential Edit State
  const [metaForm, setMetaForm] = useState({
    adAccountId: "",
    accessToken: "",
    pixelId: "",
  });
  const [googleForm, setGoogleForm] = useState({
    customerId: "",
    developerToken: "",
    clientId: "",
  });
  const [testingConnection, setTestingConnection] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [campData, analData, credData] = await Promise.all([
        adminFetch("/api/admin/ads/campaigns"),
        adminFetch("/api/admin/ads/analytics"),
        adminFetch("/api/admin/ads/credentials"),
      ]);
      setCampaigns(campData || []);
      setAnalytics(analData || null);
      setCredentials(credData || null);

      if (credData?.meta) {
        setMetaForm({
          adAccountId: credData.meta.adAccountId || "",
          accessToken: credData.meta.maskedToken || "",
          pixelId: credData.meta.pixelId || "",
        });
      }
      if (credData?.google) {
        setGoogleForm({
          customerId: credData.google.customerId || "",
          developerToken: credData.google.maskedToken || "",
          clientId: credData.google.clientId || "",
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to load ad tracking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await adminFetch("/api/admin/ads/sync", { method: "POST" });
      toast.success(res?.msg || "Ad metrics synchronized with live credentials!");
      await loadAll();
    } catch (err) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    try {
      setSavingCampaign(true);
      await adminFetch("/api/admin/ads/campaigns", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
          spend: parseFloat(formData.spend) || 0,
          impressions: parseInt(formData.impressions) || 0,
          clicks: parseInt(formData.clicks) || 0,
          leads: parseInt(formData.leads) || 0,
          roas: parseFloat(formData.roas) || 0,
        }),
      });
      toast.success("Ad campaign recorded successfully!");
      setShowAddModal(false);
      setFormData({
        name: "",
        platform: "meta",
        objective: "leads",
        budget: "",
        spend: "",
        impressions: "",
        clicks: "",
        leads: "",
        roas: "4.0",
        status: "active",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        notes: "",
        autoRecordExpense: true,
      });
      await loadAll();
    } catch (err) {
      toast.error(err.message || "Failed to save campaign");
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to remove this campaign record?")) return;
    try {
      await adminFetch(`/api/admin/ads/campaigns/${id}`, { method: "DELETE" });
      toast.success("Campaign record removed");
      setCampaigns((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      loadAll();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleSaveCredentials = async (platform, data) => {
    try {
      const res = await adminFetch("/api/admin/ads/credentials", {
        method: "POST",
        body: JSON.stringify({ platform, ...data }),
      });
      toast.success(res?.msg || "Credentials updated successfully!");
      await loadAll();
    } catch (err) {
      toast.error(err.message || "Failed to update credentials");
    }
  };

  const handleTestConnection = async (platform) => {
    try {
      setTestingConnection(true);
      const res = await adminFetch("/api/admin/ads/test-connection", {
        method: "POST",
        body: JSON.stringify({ platform }),
      });
      toast.success(res?.msg || `${platform.toUpperCase()} connection validated successfully!`);
      await loadAll();
    } catch (err) {
      toast.error(err.message || "Connection test failed. Check credentials.");
    } finally {
      setTestingConnection(false);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (platformFilter === "all") return true;
    return c.platform?.toLowerCase() === platformFilter.toLowerCase();
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-stone-900">
              Social Media Expense & Ad Management
            </h1>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Track campaign marketing expenses, return on ad spend (ROAS), and connect directly via Meta & Google credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Live Insights"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Ad Expense
          </button>
        </div>
      </div>

      {/* ── Key Performance Metrics Overview ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Spent</span>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            ₹{(analytics?.totalSpend || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Synced with Ledger</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Impressions</span>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            {(analytics?.totalImpressions || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-stone-500">Reach across channels</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Clicks</span>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            {(analytics?.totalClicks || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">CTR: {analytics?.avgCtr || 0}%</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Leads & Adoptions</span>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            {analytics?.totalLeads || 0}
          </p>
          <span className="text-[11px] text-stone-500">Inquiries generated</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Cost Per Lead</span>
          <p className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            ₹{analytics?.avgCpl || 0}
          </p>
          <span className="text-[11px] text-stone-500">Avg conversion cost</span>
        </div>

        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Est. ROAS</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-800 mt-1">
            {analytics?.overallRoas || 4.2}x
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">High profitability</span>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "campaigns"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          Active Campaigns & Expenses ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab("credentials")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "credentials"
              ? "border-emerald-800 text-emerald-900"
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <Key className="w-4 h-4" />
          Direct Credentials Connection
          {credentials?.meta?.status === "connected" && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1 inline-block" />
          )}
        </button>
      </div>

      {/* ── TAB 1: CAMPAIGNS & AD EXPENSES ── */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {["all", "meta", "instagram", "google", "youtube"].map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  platformFilter === p
                    ? "bg-emerald-800 text-white"
                    : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-stone-500">Loading campaign tracker...</div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
              <Megaphone className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-stone-700">No campaigns found</h3>
              <p className="text-sm text-stone-400 mt-1 mb-4">Click "Record Ad Expense" to add your first campaign.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 text-sm font-semibold bg-emerald-800 text-white rounded-xl"
              >
                Record Ad Expense
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCampaigns.map((c) => {
                const percentSpent = c.budget > 0 ? Math.min(100, Math.round((c.spend / c.budget) * 100)) : 100;
                return (
                  <div key={c._id || c.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          c.platform === "meta" ? "bg-blue-50 text-blue-700" :
                          c.platform === "instagram" ? "bg-pink-50 text-pink-700" :
                          c.platform === "google" ? "bg-emerald-50 text-emerald-700" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {c.platform}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${
                          c.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-stone-900 mt-3 text-base leading-snug line-clamp-2">
                        {c.name}
                      </h3>
                      {c.notes && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">{c.notes}</p>
                      )}

                      {/* Spend Progress */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-stone-500">Spend vs Budget</span>
                          <span className="font-semibold text-stone-800">
                            ₹{(c.spend || 0).toLocaleString("en-IN")} / ₹{(c.budget || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-700 h-full rounded-full transition-all"
                            style={{ width: `${percentSpent}%` }}
                          />
                        </div>
                      </div>

                      {/* Performance Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-100 text-center">
                        <div className="bg-stone-50 rounded-xl p-2">
                          <span className="text-[10px] text-stone-400 uppercase font-semibold block">Clicks</span>
                          <span className="text-sm font-bold text-stone-800">{(c.clicks || 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="bg-stone-50 rounded-xl p-2">
                          <span className="text-[10px] text-stone-400 uppercase font-semibold block">Leads</span>
                          <span className="text-sm font-bold text-stone-800">{c.leads || 0}</span>
                        </div>
                        <div className="bg-stone-50 rounded-xl p-2">
                          <span className="text-[10px] text-stone-400 uppercase font-semibold block">CPL</span>
                          <span className="text-sm font-bold text-emerald-800">₹{c.cpl || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400">
                        {c.startDate ? `Started ${c.startDate}` : ""}
                      </span>
                      <button
                        onClick={() => handleDeleteCampaign(c._id || c.id)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: DIRECT CREDENTIALS CONNECTION ── */}
      {activeTab === "credentials" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meta / Facebook & Instagram Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  f
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Meta Ads (Facebook & Instagram)</h3>
                  <p className="text-xs text-stone-500">Connect via Graph API User Token & Ad Account ID</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                credentials?.meta?.status === "connected"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-stone-100 text-stone-600"
              }`}>
                {credentials?.meta?.status === "connected" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-stone-400" /> Not Connected
                  </>
                )}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ad Account ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. act_123456789012345"
                  value={metaForm.adAccountId}
                  onChange={(e) => setMetaForm({ ...metaForm, adAccountId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Meta Graph Access Token
                </label>
                <input
                  type="password"
                  placeholder="EAAG..."
                  value={metaForm.accessToken}
                  onChange={(e) => setMetaForm({ ...metaForm, accessToken: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pixel ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={metaForm.pixelId}
                  onChange={(e) => setMetaForm({ ...metaForm, pixelId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => handleSaveCredentials("meta", metaForm)}
                  className="flex-1 py-2 text-sm font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-colors"
                >
                  Save Credentials
                </button>
                <button
                  type="button"
                  onClick={() => handleTestConnection("meta")}
                  disabled={testingConnection}
                  className="px-4 py-2 text-sm font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                >
                  Test Connection
                </button>
              </div>
            </div>
          </div>

          {/* Google Ads Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  G
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Google Ads API</h3>
                  <p className="text-xs text-stone-500">Connect using Customer ID & Developer Token</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                credentials?.google?.status === "connected"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-stone-100 text-stone-600"
              }`}>
                {credentials?.google?.status === "connected" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-stone-400" /> Not Connected
                  </>
                )}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Google Ads Customer ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123-456-7890"
                  value={googleForm.customerId}
                  onChange={(e) => setGoogleForm({ ...googleForm, customerId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Developer Token
                </label>
                <input
                  type="password"
                  placeholder="Developer API Token"
                  value={googleForm.developerToken}
                  onChange={(e) => setGoogleForm({ ...googleForm, developerToken: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  OAuth Client ID
                </label>
                <input
                  type="text"
                  placeholder="...apps.googleusercontent.com"
                  value={googleForm.clientId}
                  onChange={(e) => setGoogleForm({ ...googleForm, clientId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => handleSaveCredentials("google", googleForm)}
                  className="flex-1 py-2 text-sm font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl transition-colors"
                >
                  Save Credentials
                </button>
                <button
                  type="button"
                  onClick={() => handleTestConnection("google")}
                  disabled={testingConnection}
                  className="px-4 py-2 text-sm font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
                >
                  Test Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RECORD AD EXPENSE MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-lg text-stone-900">Record Ad Expense / Campaign</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Instagram Reels • Hand-Reared Conures"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl"
                  >
                    <option value="meta">Meta / Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="google">Google Ads</option>
                    <option value="youtube">YouTube</option>
                    <option value="other">Other / Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Objective</label>
                  <select
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl"
                  >
                    <option value="leads">Lead Inquiries</option>
                    <option value="sales">Store Sales</option>
                    <option value="traffic">Website Traffic</option>
                    <option value="brand_awareness">Brand Awareness</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Amount Spent (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="8500"
                    value={formData.spend}
                    onChange={(e) => setFormData({ ...formData, spend: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Total Budget (₹)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="15000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Impressions</label>
                  <input
                    type="number"
                    placeholder="45000"
                    value={formData.impressions}
                    onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Clicks</label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={formData.clicks}
                    onChange={(e) => setFormData({ ...formData, clicks: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Leads / Inquiries</label>
                  <input
                    type="number"
                    placeholder="48"
                    value={formData.leads}
                    onChange={(e) => setFormData({ ...formData, leads: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoRecord"
                  checked={formData.autoRecordExpense}
                  onChange={(e) => setFormData({ ...formData, autoRecordExpense: e.target.checked })}
                  className="rounded text-emerald-800 focus:ring-emerald-800"
                />
                <label htmlFor="autoRecord" className="text-xs text-stone-700 font-medium">
                  Automatically record this spend in Financial Ledger as an Expense
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Target Audience</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Bangalore audience aged 24-50 interested in bird cages..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCampaign}
                  className="px-5 py-2 text-sm font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl disabled:opacity-60"
                >
                  {savingCampaign ? "Saving..." : "Save Ad Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
