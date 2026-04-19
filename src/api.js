const API_BASE = "http://127.0.0.1:5001";

function getHeaders(includeAuth = true) {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ========== AUTH ==========
export async function registerUser(name, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_BASE}/api/auth/profile`, { headers: getHeaders() });
  return res.json();
}

export async function updateProfile(data) {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function uploadResumeAuth(file) {
  const formData = new FormData();
  formData.append("resume", file);
  const res = await fetch(`${API_BASE}/api/auth/upload-resume`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  return res.json();
}

// ========== COMPANIES (PUBLIC) ==========
export async function getCompanies() {
  const res = await fetch(`${API_BASE}/api/companies`);
  return res.json();
}

// ========== JOBS (PUBLIC) ==========
export async function getJobs(search = "", skill = "") {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (skill) params.append("skill", skill);
  const res = await fetch(`${API_BASE}/api/jobs?${params.toString()}`);
  return res.json();
}

export async function getJobDetail(jobId) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
  return res.json();
}

// ========== SKILL MATCH ==========
export async function getSkillMatch(jobId) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/skill-match`, { headers: getHeaders() });
  return res.json();
}

// ========== RECOMMENDATIONS ==========
export async function getRecommendations() {
  const res = await fetch(`${API_BASE}/api/recommendations`, { headers: getHeaders() });
  return res.json();
}

// ========== APPLICATIONS ==========
export async function getApplications() {
  const res = await fetch(`${API_BASE}/api/applications`, { headers: getHeaders() });
  return res.json();
}

export async function applyForJob(jobId) {
  const res = await fetch(`${API_BASE}/api/applications`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ job_id: jobId }),
  });
  return res.json();
}

// ========== SAVED JOBS ==========
export async function getSavedJobs() {
  const res = await fetch(`${API_BASE}/api/saved-jobs`, { headers: getHeaders() });
  return res.json();
}

export async function saveJob(jobId) {
  const res = await fetch(`${API_BASE}/api/saved-jobs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ job_id: jobId }),
  });
  return res.json();
}

export async function unsaveJob(savedId) {
  const res = await fetch(`${API_BASE}/api/saved-jobs/${savedId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.json();
}

// ========== REVIEWS ==========
export async function getReviews(companyId) {
  const res = await fetch(`${API_BASE}/api/companies/${companyId}/reviews`);
  return res.json();
}

export async function createReview(companyId, rating, comment) {
  const res = await fetch(`${API_BASE}/api/companies/${companyId}/reviews`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ rating, comment }),
  });
  return res.json();
}

// ========== NOTIFICATIONS ==========
export async function getNotifications() {
  const res = await fetch(`${API_BASE}/api/notifications`, { headers: getHeaders() });
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
    method: "PUT",
    headers: getHeaders(),
  });
  return res.json();
}

// ========== CAREER INSIGHTS ==========
export async function getCareerInsights() {
  const res = await fetch(`${API_BASE}/api/career-insights`, { headers: getHeaders() });
  return res.json();
}

// ========== LEARNING HUB ==========
export async function getLearningHub() {
  const res = await fetch(`${API_BASE}/api/learning-hub`, { headers: getHeaders() });
  return res.json();
}

export async function getLearningResources(skill = "", platform = "", difficulty = "") {
  const params = new URLSearchParams();
  if (skill) params.append("skill", skill);
  if (platform) params.append("platform", platform);
  if (difficulty) params.append("difficulty", difficulty);
  const res = await fetch(`${API_BASE}/api/learning-hub/resources?${params.toString()}`, { headers: getHeaders() });
  return res.json();
}

// ========== SKILL ROADMAPS ==========
export async function getSkillRoadmaps() {
  const res = await fetch(`${API_BASE}/api/roadmaps`, { headers: getHeaders() });
  return res.json();
}

export async function getSkillRoadmap(skillName) {
  const res = await fetch(`${API_BASE}/api/roadmaps/${encodeURIComponent(skillName)}`, { headers: getHeaders() });
  return res.json();
}

export async function getSuggestedRoadmaps() {
  const res = await fetch(`${API_BASE}/api/roadmaps/suggested`, { headers: getHeaders() });
  return res.json();
}

// ========== ADMIN: COMPANIES ==========
export async function adminGetCompanies() {
  const res = await fetch(`${API_BASE}/api/admin/companies`, { headers: getHeaders() });
  return res.json();
}

export async function adminGetCompany(id) {
  const res = await fetch(`${API_BASE}/api/admin/companies/${id}`, { headers: getHeaders() });
  return res.json();
}

export async function adminCreateCompany(data) {
  const res = await fetch(`${API_BASE}/api/admin/companies`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminUpdateCompany(id, data) {
  const res = await fetch(`${API_BASE}/api/admin/companies/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteCompany(id) {
  const res = await fetch(`${API_BASE}/api/admin/companies/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.json();
}

// ========== ADMIN: JOBS ==========
export async function adminGetJobs() {
  const res = await fetch(`${API_BASE}/api/admin/jobs`, { headers: getHeaders() });
  return res.json();
}

export async function adminCreateJob(data) {
  const res = await fetch(`${API_BASE}/api/admin/jobs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminUpdateJob(id, data) {
  const res = await fetch(`${API_BASE}/api/admin/jobs/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteJob(id) {
  const res = await fetch(`${API_BASE}/api/admin/jobs/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return res.json();
}

// ========== ADMIN: APPLICATIONS ==========
export async function adminGetApplications() {
  const res = await fetch(`${API_BASE}/api/admin/applications`, { headers: getHeaders() });
  return res.json();
}

export async function adminUpdateApplicationStatus(id, status) {
  const res = await fetch(`${API_BASE}/api/admin/applications/${id}/status`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// ========== ADMIN: STATS ==========
export async function adminGetStats() {
  const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: getHeaders() });
  return res.json();
}

// ========== LEGACY ==========
export async function uploadResumeLegacy(file) {
  const formData = new FormData();
  formData.append("resume", file);
  const res = await fetch(`${API_BASE}/upload-resume`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}
