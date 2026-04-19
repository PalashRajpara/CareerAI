import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  adminGetStats,
  adminGetCompanies,
  adminGetJobs,
  adminCreateCompany,
  adminUpdateCompany,
  adminDeleteCompany,
  adminCreateJob,
  adminUpdateJob,
  adminDeleteJob,
  adminGetApplications,
  adminUpdateApplicationStatus,
} from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: "", email: "", address: "" });

  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    company_id: "",
    role: "",
    required_skills: "",
    description: "",
    application_method: "platform",
  });

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate("/login");
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, companiesData, jobsData, appsData] = await Promise.all([
        adminGetStats(),
        adminGetCompanies(),
        adminGetJobs(),
        adminGetApplications(),
      ]);
      setStats(statsData);
      setCompanies(companiesData);
      setJobs(jobsData);
      setApplications(appsData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // ========== COMPANY CRUD ==========
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (editingCompany) {
      await adminUpdateCompany(editingCompany.id, companyForm);
    } else {
      await adminCreateCompany(companyForm);
    }
    setShowCompanyForm(false);
    setEditingCompany(null);
    setCompanyForm({ name: "", email: "", address: "" });
    loadData();
  };

  const startEditCompany = (c) => {
    setEditingCompany(c);
    setCompanyForm({ name: c.name, email: c.email, address: c.address });
    setShowCompanyForm(true);
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm("Delete this company and all its jobs?")) {
      await adminDeleteCompany(id);
      loadData();
    }
  };

  // ========== JOB CRUD ==========
  const handleSaveJob = async (e) => {
    e.preventDefault();
    const data = { ...jobForm, company_id: parseInt(jobForm.company_id) };
    if (editingJob) {
      await adminUpdateJob(editingJob.id, data);
    } else {
      await adminCreateJob(data);
    }
    setShowJobForm(false);
    setEditingJob(null);
    setJobForm({ company_id: "", role: "", required_skills: "", description: "", application_method: "platform" });
    loadData();
  };

  const startEditJob = (j) => {
    setEditingJob(j);
    setJobForm({
      company_id: j.company_id.toString(),
      role: j.role,
      required_skills: j.required_skills,
      description: j.description,
      application_method: j.application_method,
    });
    setShowJobForm(true);
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm("Delete this job posting?")) {
      await adminDeleteJob(id);
      loadData();
    }
  };

  // ========== APPLICATION STATUS ==========
  const handleStatusChange = async (appId, status) => {
    await adminUpdateApplicationStatus(appId, status);
    loadData();
  };

  const inputClass = "w-full bg-[rgba(15,23,42,0.6)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc8] transition";
  const selectClass = "w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(0,255,200,0.15)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#00ffc8] transition appearance-none";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "companies", label: "Companies" },
    { id: "jobs", label: "Jobs" },
    { id: "applications", label: "Applications" },
  ];

  if (loading) {
    return (
      <PageWrapper title="Admin Dashboard" subtitle="">
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Admin Dashboard" subtitle="Manage companies, jobs, and applications">
      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg font-medium transition text-sm ${
              activeTab === tab.id
                ? "bg-[#00ffc8] text-black"
                : "glass text-gray-300 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== OVERVIEW ==================== */}
      {activeTab === "overview" && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Companies", value: stats.total_companies, color: "#06b6d4" },
              { label: "Job Postings", value: stats.total_jobs, color: "#00ffc8" },
              { label: "Users", value: stats.total_users, color: "#f59e0b" },
              { label: "Applications", value: stats.total_applications, color: "#10b981" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 text-center"
              >
                <p className="text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent Applications */}
          <GlassCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Applications</h3>
              <div className="space-y-2">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                    <div>
                      <p className="text-white text-sm">{app.user_name}</p>
                      <p className="text-gray-500 text-xs">{app.job_role} at {app.company_name}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      app.status === "Accepted" ? "bg-[#10b981]/10 text-[#10b981]" :
                      app.status === "Rejected" ? "bg-[#ef4444]/10 text-[#ef4444]" :
                      app.status === "Pending" ? "bg-[#f59e0b]/10 text-[#f59e0b]" :
                      "bg-[#06b6d4]/10 text-[#06b6d4]"
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ==================== COMPANIES ==================== */}
      {activeTab === "companies" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">{companies.length} Companies</h2>
            <button
              onClick={() => {
                setEditingCompany(null);
                setCompanyForm({ name: "", email: "", address: "" });
                setShowCompanyForm(true);
              }}
              className="btn-cyber px-4 py-2 rounded-lg text-black text-sm font-medium"
            >
              + Add Company
            </button>
          </div>

          {/* Company Form Modal */}
          {showCompanyForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <GlassCard>
                <form onSubmit={handleSaveCompany} className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {editingCompany ? "Edit Company" : "Add Company"}
                  </h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      required
                      className={inputClass}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Company Email</label>
                    <input
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      required
                      className={inputClass}
                      placeholder="hr@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Address</label>
                    <input
                      type="text"
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                      required
                      className={inputClass}
                      placeholder="City, State"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-cyber px-6 py-2 rounded-lg text-black text-sm font-medium">
                      {editingCompany ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCompanyForm(false); setEditingCompany(null); }}
                      className="px-6 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-white transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}

          <div className="space-y-3">
            {companies.map((c, i) => (
              <GlassCard key={c.id} delay={i * 0.03}>
                <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <p className="text-white font-semibold">{c.name}</p>
                    <p className="text-gray-400 text-sm">{c.email} • {c.address}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-[#06b6d4]">{c.job_count} jobs</span>
                      {c.avg_rating && (
                        <span className="text-xs text-[#f59e0b]">★ {c.avg_rating}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditCompany(c)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(0,255,200,0.2)] text-[#00ffc8] hover:bg-[rgba(0,255,200,0.1)] transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(c.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ==================== JOBS ==================== */}
      {activeTab === "jobs" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">{jobs.length} Job Postings</h2>
            <button
              onClick={() => {
                setEditingJob(null);
                setJobForm({ company_id: "", role: "", required_skills: "", description: "", application_method: "platform" });
                setShowJobForm(true);
              }}
              className="btn-cyber px-4 py-2 rounded-lg text-black text-sm font-medium"
            >
              + Add Job
            </button>
          </div>

          {/* Job Form Modal */}
          {showJobForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <GlassCard>
                <form onSubmit={handleSaveJob} className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {editingJob ? "Edit Job" : "Add Job Posting"}
                  </h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Company</label>
                    <select
                      value={jobForm.company_id}
                      onChange={(e) => setJobForm({ ...jobForm, company_id: e.target.value })}
                      required
                      className={selectClass}
                    >
                      <option value="">Select a company</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Job Role / Position</label>
                    <input
                      type="text"
                      value={jobForm.role}
                      onChange={(e) => setJobForm({ ...jobForm, role: e.target.value })}
                      required
                      className={inputClass}
                      placeholder="e.g. Python Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Required Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={jobForm.required_skills}
                      onChange={(e) => setJobForm({ ...jobForm, required_skills: e.target.value })}
                      required
                      className={inputClass}
                      placeholder="python,flask,sql"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Job Description</label>
                    <textarea
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      required
                      rows={4}
                      className={`${inputClass} resize-none`}
                      placeholder="Describe the role..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Application Method</label>
                    <select
                      value={jobForm.application_method}
                      onChange={(e) => setJobForm({ ...jobForm, application_method: e.target.value })}
                      className={selectClass}
                    >
                      <option value="platform">Apply through platform (resume upload)</option>
                      <option value="email">Apply via company email</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-cyber px-6 py-2 rounded-lg text-black text-sm font-medium">
                      {editingJob ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowJobForm(false); setEditingJob(null); }}
                      className="px-6 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-white transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}

          <div className="space-y-3">
            {jobs.map((j, i) => (
              <GlassCard key={j.id} delay={i * 0.03}>
                <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-white font-semibold">{j.role}</p>
                    <p className="text-[#06b6d4] text-sm">{j.company_name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {j.required_skills.split(",").map((s, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(6,182,212,0.1)] text-[#06b6d4]">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs text-gray-500">{j.applications_count} applications</span>
                      <span className={`text-xs ${j.application_method === "platform" ? "text-[#00ffc8]" : "text-[#f59e0b]"}`}>
                        {j.application_method === "platform" ? "Platform" : "Email"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditJob(j)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[rgba(0,255,200,0.2)] text-[#00ffc8] hover:bg-[rgba(0,255,200,0.1)] transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(j.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ==================== APPLICATIONS ==================== */}
      {activeTab === "applications" && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-6">{applications.length} Applications</h2>
          <div className="space-y-3">
            {applications.map((app, i) => (
              <GlassCard key={app.id} delay={i * 0.03}>
                <div className="p-5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-white font-semibold">{app.user_name}</p>
                    <p className="text-gray-400 text-sm">{app.user_email}</p>
                    <p className="text-[#06b6d4] text-sm mt-1">
                      {app.job_role} at {app.company_name}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="bg-[rgba(15,23,42,0.8)] border border-[rgba(0,255,200,0.15)] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#00ffc8] appearance-none"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
