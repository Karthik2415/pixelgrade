import { useState, useEffect } from "react";
import api from "../../lib/api";
import {
  Shield, Users, BookOpen, Flame, FileText, Settings, BarChart2,
  Trash2, Edit3, Search, RefreshCw, Save, AlertCircle, CheckCircle,
  Activity, TrendingUp, Award, Clock, ChevronDown, X
} from "lucide-react";

// ─── Tab Button ──────────────────────────────────────────────────────────
function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-medium text-sm transition-all duration-200 btn-ripple ${
        active
          ? "bg-primary text-white shadow-lg shadow-primary/30"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = "text-primary", delay = 0 }) {
  return (
    <div
      className="bg-panel border border-gray-800 rounded-xl p-5 hover-lift transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-gray-800/80 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [policies, setPolicies] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "users" && users.length === 0) fetchUsers();
    if (activeTab === "evaluations" && evaluations.length === 0) fetchEvaluations();
    if (activeTab === "policies" && Object.keys(policies).length === 0) fetchPolicies();
  }, [activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchEvaluations = async () => {
    try {
      const res = await api.get("/admin/evaluations");
      setEvaluations(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch evaluations:", err);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await api.get("/admin/policies");
      setPolicies(res.data.data || {});
    } catch (err) {
      console.error("Failed to fetch policies:", err);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, role: newRole } : u))
      );
      setEditingUser(null);
      showToast(`Role updated to ${newRole}`);
    } catch (err) {
      showToast("Failed to update role", "error");
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!confirm(`Are you sure you want to delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      showToast("User deleted");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete user", "error");
    }
  };

  const handleSavePolicies = async () => {
    setSaving(true);
    try {
      await api.put("/admin/policies", policies);
      showToast("Policies saved successfully");
    } catch (err) {
      showToast("Failed to save policies", "error");
    }
    setSaving(false);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleBadge = (role) => {
    const styles = {
      admin: "bg-red-500/20 text-red-400 border-red-500/30",
      trainer: "bg-green-500/20 text-green-400 border-green-500/30",
      student: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[role] || styles.student}`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center space-x-2 px-5 py-3 rounded-xl shadow-2xl animate-slide-in-right border ${
          toast.type === "error"
            ? "bg-red-900/90 border-red-700 text-red-200"
            : "bg-green-900/90 border-green-700 text-green-200"
        }`}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="text-red-500" size={32} />
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Manage system policies, monitor usage, and review evaluation logs</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <TabButton active={activeTab === "overview"} icon={BarChart2} label="Overview" onClick={() => setActiveTab("overview")} />
        <TabButton active={activeTab === "users"} icon={Users} label="User Management" onClick={() => setActiveTab("users")} />
        <TabButton active={activeTab === "evaluations"} icon={Activity} label="Evaluation Logs" onClick={() => setActiveTab("evaluations")} />
        <TabButton active={activeTab === "policies"} icon={Settings} label="Policy Settings" onClick={() => setActiveTab("policies")} />
      </div>

      {/* ───── Overview Tab ───── */}
      {activeTab === "overview" && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="text-blue-400" delay={0} />
            <StatCard icon={BookOpen} label="Rooms" value={stats.totalRooms} color="text-green-400" delay={60} />
            <StatCard icon={Flame} label="Contests" value={stats.totalContests} color="text-orange-400" delay={120} />
            <StatCard icon={FileText} label="Submissions" value={stats.totalSubmissions} color="text-purple-400" delay={180} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Award} label="Evaluations" value={stats.totalEvaluations} color="text-yellow-400" delay={240} />
            <StatCard icon={TrendingUp} label="Avg Score" value={stats.avgScore} color="text-cyan-400" delay={300} />
            <StatCard icon={Clock} label="Recent (7d)" value={stats.recentSubmissions} color="text-pink-400" delay={360} />
            <StatCard icon={Shield} label="Admins" value={stats.admins} color="text-red-400" delay={420} />
          </div>

          {/* User Role Breakdown */}
          <div className="bg-panel border border-gray-800 rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <h3 className="text-lg font-semibold text-white mb-4">User Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: "Students", count: stats.students, total: stats.totalUsers, color: "bg-blue-500" },
                { label: "Trainers", count: stats.trainers, total: stats.totalUsers, color: "bg-green-500" },
                { label: "Admins", count: stats.admins, total: stats.totalUsers, color: "bg-red-500" },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{bar.label}</span>
                    <span className="text-gray-400">{bar.count} / {bar.total}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${bar.color} h-full rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${bar.total > 0 ? (bar.count / bar.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───── Users Tab ───── */}
      {activeTab === "users" && (
        <div>
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-panel border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-panel border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="trainer">Trainers</option>
              <option value="admin">Admins</option>
            </select>
            <button onClick={fetchUsers} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-colors">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          <div className="bg-panel border border-gray-800 rounded-xl overflow-hidden animate-fade-in-up">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-background">
                  <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">User</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Email</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Role</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Joined</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.userId} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="text-white font-medium">{user.name || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">{user.email}</td>
                      <td className="text-center px-4 py-4">
                        {editingUser === user.userId ? (
                          <select
                            defaultValue={user.role}
                            onChange={(e) => handleUpdateRole(user.userId, e.target.value)}
                            onBlur={() => setEditingUser(null)}
                            autoFocus
                            className="bg-background border border-primary rounded px-2 py-1 text-sm text-white focus:outline-none"
                          >
                            <option value="student">Student</option>
                            <option value="trainer">Trainer</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          roleBadge(user.role)
                        )}
                      </td>
                      <td className="text-center px-4 py-4 text-sm text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="text-center px-4 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setEditingUser(user.userId)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit Role"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.userId, user.name)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-right">{filteredUsers.length} user(s) shown</p>
        </div>
      )}

      {/* ───── Evaluations Tab ───── */}
      {activeTab === "evaluations" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-400">{evaluations.length} evaluation(s) loaded (most recent 100)</p>
            <button onClick={fetchEvaluations} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          <div className="bg-panel border border-gray-800 rounded-xl overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-background">
                    <th className="text-left px-6 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Student</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">DOM</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Interaction</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Visual</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Total</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Date</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-400 uppercase tracking-wide font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">No evaluation logs yet</td>
                    </tr>
                  ) : (
                    evaluations.map((log) => (
                      <tr key={log.evaluationId} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{log.studentName}</td>
                        <td className="text-center px-4 py-4">
                          <span className="text-green-400 font-bold">{log.domScore}</span>
                          <span className="text-gray-600 text-xs">/40</span>
                        </td>
                        <td className="text-center px-4 py-4">
                          <span className="text-yellow-400 font-bold">{log.interactionScore}</span>
                          <span className="text-gray-600 text-xs">/30</span>
                        </td>
                        <td className="text-center px-4 py-4">
                          <span className="text-blue-400 font-bold">{log.visualScore}</span>
                          <span className="text-gray-600 text-xs">/30</span>
                        </td>
                        <td className="text-center px-4 py-4">
                          <span className="text-xl font-bold text-white">{log.totalScore}</span>
                        </td>
                        <td className="text-center px-4 py-4 text-sm text-gray-400">
                          {log.evaluatedAt ? new Date(log.evaluatedAt).toLocaleString() : "—"}
                        </td>
                        <td className="text-center px-4 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30">
                            <CheckCircle size={12} /> {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───── Policies Tab ───── */}
      {activeTab === "policies" && (
        <div className="max-w-2xl">
          <div className="bg-panel border border-gray-800 rounded-xl p-6 animate-fade-in-up space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings size={20} className="text-gray-400" /> System Policies
              </h3>
              <button
                onClick={handleSavePolicies}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all btn-ripple disabled:opacity-50 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.97]"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Policies"}
              </button>
            </div>

            {[
              {
                key: "maxSubmissionsPerStudent",
                label: "Max Submissions Per Student",
                description: "Maximum number of submissions a student can make per question",
                type: "number",
              },
              {
                key: "evaluationTimeoutSeconds",
                label: "Evaluation Timeout (seconds)",
                description: "Maximum time for a single evaluation before it times out",
                type: "number",
              },
              {
                key: "maxContestsActive",
                label: "Max Active Contests",
                description: "Maximum number of contests that can be active simultaneously",
                type: "number",
              },
              {
                key: "maxQuestionsPerRoom",
                label: "Max Questions Per Room",
                description: "Maximum number of questions allowed in each room",
                type: "number",
              },
              {
                key: "allowGoogleAuth",
                label: "Allow Google Authentication",
                description: "Enable or disable Google Sign-In for all users",
                type: "toggle",
              },
              {
                key: "maintenanceMode",
                label: "Maintenance Mode",
                description: "When enabled, only admin users can access the system",
                type: "toggle",
              },
            ].map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between py-4 border-b border-gray-800 last:border-0"
              >
                <div className="flex-1 mr-6">
                  <p className="text-sm font-medium text-white">{field.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                </div>
                {field.type === "number" ? (
                  <input
                    type="number"
                    value={policies[field.key] ?? ""}
                    onChange={(e) =>
                      setPolicies((prev) => ({ ...prev, [field.key]: parseInt(e.target.value) || 0 }))
                    }
                    className="w-24 bg-background border border-gray-700 rounded-lg px-3 py-2 text-white text-sm text-center focus:outline-none focus:border-primary transition-colors"
                  />
                ) : (
                  <button
                    onClick={() =>
                      setPolicies((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                    }
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                      policies[field.key] ? "bg-primary" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                        policies[field.key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                )}
              </div>
            ))}

            {policies.updatedAt && (
              <p className="text-xs text-gray-500 pt-2">
                Last updated: {new Date(policies.updatedAt).toLocaleString()} by {policies.updatedBy || "Unknown"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
