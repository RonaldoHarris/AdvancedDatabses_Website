/*
 * NEWCORP FRONTEND — HTML/CSS/vanilla JavaScript only.
 * -----------------------------------------------------------------------------
 * This is a frontend demonstration. It does NOT connect directly to SQL Server.
 * All current data/actions are mock data stored in localStorage for previewing.
 *
 * BACKEND HANDOFF:
 * 1. Set DEMO_MODE = false after your groupmate has implemented the API.
 * 2. Update API_BASE_URL and the endpoint paths in API_ROUTES below to match Flask.
 * 3. Replace the demo branches in the service functions with the agreed API calls.
 * 4. The backend must derive the authenticated user from its secure session. Never
 *    trust a User_ID or role sent by the browser as proof of identity/permission.
 * 5. Password hashing, authentication, authorization, SQL transactions, stored
 *    procedures, triggers and constraints belong on the backend/database.
 *
 * SQL-TO-UI COVERAGE:
 * Views: funding summary, donation summary, team membership, project/team,
 *        donation details, team summary, public projects.
 * Procedures: team performance, projects closing soon, donation info, user
 *        donation history, team members, register/update profile, team actions,
 *        project create/update, donations, moderation and user active status.
 * Functions: donation count and total donations (shown in project/report metrics).
 * Triggers: overfunding, closing-date, target-change and closing-date safeguards
 *           are represented as validation feedback in the demo; SQL remains authoritative.
 * Transactions: multi-record project creation/donation are presented as single actions;
 *               the backend should call the SQL procedures / use transactions.
 * Security: app roles are previewed in the UI; actual authorization is server-side.
 */

const DEMO_MODE = false;
const API_BASE_URL = "/api"; // Change to the Flask API URL later.
const API_ROUTES = {
  login: "/auth/login", logout: "/auth/logout", register: "/auth/register", profile: "/users/me",
  projects: "/projects", project: "/projects/:id", createCharityProject: "/projects/charity",
  createCommercialProject: "/projects/commercial", updateProject: "/projects/:id",
  donate: "/donations", myDonations: "/donations/me", teams: "/teams", team: "/teams/:id",
  createTeam: "/teams", joinTeam: "/teams/:id/members", leaveTeam: "/teams/:id/members/me",
  setLeader: "/teams/:id/leader", removeMember: "/teams/:id/members/:userId",
  moderateProject: "/moderation/projects/:id", setUserActive: "/moderation/users/:id/status",
  users: "/moderation/users", reports: "/reports", audit: "/moderation/audit"
};

const STORAGE_KEY = "newcorp_frontend_demo_v1";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const todayISO = () => new Date().toISOString().slice(0, 10);
const money = value => new Intl.NumberFormat("en-JM", { style: "currency", currency: "JMD", maximumFractionDigits: 0 }).format(Number(value || 0));
const dateLabel = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-JM", { day: "numeric", month: "short", year: "numeric" }) : "—";
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const initials = name => String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
const slugClass = name => String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

const seedState = {
  currentUserId: 1,
  previewRole: "user",
  users: [
    { id: 1, first: "John", last: "Brown", email: "john.brown@email.com", mobile: "8765551001", street: "Hope Road", streetNo: "15", city: "Kingston", country: "Jamaica", postal: "JMKN01", role: "RegisteredUser", active: true },
    { id: 2, first: "Lisa", last: "Johnson", email: "lisa.johnson@email.com", mobile: "8765551002", street: "Manning Avenue", streetNo: "22", city: "Kingston", country: "Jamaica", postal: "JMKN02", role: "RegisteredUser", active: true },
    { id: 3, first: "David", last: "Williams", email: "david.williams@email.com", mobile: "8765551003", street: "Main Street", streetNo: "8", city: "Spanish Town", country: "Jamaica", postal: "JMST01", role: "RegisteredUser", active: true },
    { id: 4, first: "Sarah", last: "Campbell", email: "sarah.campbell@email.com", mobile: "8765551004", street: "Church Street", streetNo: "31", city: "Montego Bay", country: "Jamaica", postal: "JMMB01", role: "RegisteredUser", active: true },
    { id: 5, first: "Michael", last: "Thompson", email: "michael.thompson@email.com", mobile: "8765551005", street: "Constant Spring Road", streetNo: "45", city: "Kingston", country: "Jamaica", postal: "JMKN03", role: "RegisteredUser", active: true },
    { id: 99, first: "Morgan", last: "Reid", email: "moderator@newcorp.demo", mobile: "", street: "", streetNo: "", city: "Kingston", country: "Jamaica", postal: "", role: "Moderator", active: true, demoOnly: true }
  ],
  teams: [
    { id: 1, name: "Community Development", created: "2026-01-10", leaderId: null },
    { id: 2, name: "Technology Innovators", created: "2026-02-15", leaderId: null },
    { id: 3, name: "Education Support", created: "2026-03-01", leaderId: null }
  ],
  memberships: [[1,1],[2,1],[2,2],[3,2],[3,3],[4,3],[5,1]],
  projects: [
    { id: 1, description: "Community Centre Renovation", posted: "2026-04-01", closing: "2026-06-30", target: 500000, teamId: 1, type: "Charity", beneficiaries: "Residents of the local community", profitMargin: null, status: "Approved", approvedBy: null, approvalDate: null, rejectionReason: "" },
    { id: 2, description: "Cybersecurity Training Programme", posted: "2026-04-15", closing: "2026-07-31", target: 750000, teamId: 2, type: "Commercial", beneficiaries: "", profitMargin: 25, status: "Approved", approvedBy: null, approvalDate: null, rejectionReason: "" },
    { id: 3, description: "School Technology Initiative", posted: "2026-05-01", closing: "2026-08-31", target: 1000000, teamId: 3, type: "Charity", beneficiaries: "Students and teachers in participating schools", profitMargin: null, status: "Approved", approvedBy: null, approvalDate: null, rejectionReason: "" },
    { id: 4, description: "Community Food Support Programme", posted: "2026-05-15", closing: "2026-09-30", target: 300000, teamId: 1, type: "Charity", beneficiaries: "Low-income families and vulnerable members of the community", profitMargin: null, status: "Approved", approvedBy: null, approvalDate: null, rejectionReason: "" }
  ],
  donations: [
    { userId: 1, number: 1, projectId: 1, date: "2026-04-10", amount: 50000 },
    { userId: 2, number: 1, projectId: 1, date: "2026-04-12", amount: 75000 },
    { userId: 2, number: 2, projectId: 2, date: "2026-04-20", amount: 100000 },
    { userId: 3, number: 1, projectId: 2, date: "2026-04-25", amount: 50000 },
    { userId: 1, number: 2, projectId: 3, date: "2026-05-10", amount: 125000 },
    { userId: 4, number: 1, projectId: 3, date: "2026-05-15", amount: 200000 },
    { userId: 5, number: 1, projectId: 4, date: "2026-05-20", amount: 25000 },
    { userId: 3, number: 2, projectId: 4, date: "2026-05-25", amount: 50000 }
  ],
  projectLog: [],
  audit: [
    { id: 1, action: "PROJECT_CREATED", table: "PROJECT", recordId: 1, actorId: 1, date: "2026-04-01", details: "Seeded demonstration project." },
    { id: 2, action: "PROJECT_CREATED", table: "PROJECT", recordId: 2, actorId: 2, date: "2026-04-15", details: "Seeded demonstration project." },
    { id: 3, action: "DONATION_ADDED", table: "DONATION", recordId: 1, actorId: 1, date: "2026-04-10", details: "Seeded demonstration donation." }
  ],
  nextUserId: 100,
  nextTeamId: 4,
  nextProjectId: 5,
  nextAuditId: 4
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(seedState);
    const parsed = JSON.parse(saved);
    return { ...structuredClone(seedState), ...parsed };
  } catch (error) {
    console.warn("Could not load demo data; using seed data.", error);
    return structuredClone(seedState);
  }
}
let state = structuredClone(seedState);
let csrfToken = "";
let serverReady = false;
state.currentUserId = null;
state.previewRole = "visitor";
state.users = [];
state.teams = [];
state.memberships = [];
state.projects = [];
state.donations = [];
state.projectLog = [];
state.audit = [];
let currentPage = "home";
let selectedProjectId = null;
let selectedTeamId = null;
let projectFilters = { query: "", type: "all", status: "all" };

function saveState() {
  if (DEMO_MODE) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function currentUser() { return state.users.find(user => user.id === state.currentUserId) || null; }
function isModerator() { return currentUser()?.role === "Moderator"; }
function isVisitor() { return !currentUser(); }
function fullName(user) { return user ? `${user.first} ${user.last}` : "Unknown user"; }
function getUser(id) { return state.users.find(user => user.id === Number(id)); }
function getTeam(id) { return state.teams.find(team => team.id === Number(id)); }
function getProject(id) { return state.projects.find(project => project.id === Number(id)); }
function teamMembers(teamId) { return state.memberships.filter(pair => pair[1] === Number(teamId)).map(pair => getUser(pair[0])).filter(Boolean); }
function userTeams(userId) { return state.memberships.filter(pair => pair[0] === Number(userId)).map(pair => getTeam(pair[1])).filter(Boolean); }
function isMember(userId, teamId) { return state.memberships.some(pair => pair[0] === Number(userId) && pair[1] === Number(teamId)); }
function donationsForProject(projectId) { return state.donations.filter(donation => donation.projectId === Number(projectId)); }
function totalRaised(projectId) { return donationsForProject(projectId).reduce((sum, donation) => sum + Number(donation.amount), 0); }
function donationCount(projectId) { return donationsForProject(projectId).length; } // Mirrors dbo.GetDonationCount.
function totalDonations(projectId) { return totalRaised(projectId); } // Mirrors dbo.GetTotalDonations.
function progressPercent(project) { return project.target > 0 ? Math.min(100, totalRaised(project.id) / project.target * 100) : 0; }
function projectIsOpen(project) { return project.status === "Approved" && project.closing >= todayISO() && totalRaised(project.id) < project.target; }
function daysRemaining(project) { return Math.ceil((new Date(`${project.closing}T00:00:00`) - new Date(`${todayISO()}T00:00:00`)) / 86400000); }
function teamName(teamId) { return getTeam(teamId)?.name || "Unassigned team"; }
function projectIcon(project) { return project.type === "Commercial" ? "↗" : project.description.toLowerCase().includes("school") ? "⌂" : project.description.toLowerCase().includes("food") ? "♡" : "✳"; }
function statusBadge(status) {
  const cls = status === "Approved" || status === "Active" ? "green" : status === "Pending" ? "gold" : status === "Rejected" || status === "Inactive" ? "red" : "";
  return `<span class="badge ${cls}">${escapeHTML(status)}</span>`;
}
function projectCard(project) {
  const raised = totalRaised(project.id), pct = progressPercent(project), open = projectIsOpen(project);
  const cover = project.type === "Commercial" ? "tech" : project.description.toLowerCase().includes("school") ? "education" : project.description.toLowerCase().includes("food") ? "food" : "";
  return `<article class="card project-card">
    <div class="project-cover ${cover}"><span class="cover-symbol">${projectIcon(project)}</span>${statusBadge(project.status)}</div>
    <div class="project-body">
      <span class="badge">${escapeHTML(project.type)}</span>
      <h3>${escapeHTML(project.description)}</h3>
      <p>Led by ${escapeHTML(teamName(project.teamId))}</p>
      <div class="progress-meta"><span>${money(raised)} raised</span><span>${pct.toFixed(0)}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="project-footer"><div class="amount">${money(project.target)}<small>Funding target</small></div><button class="btn btn-secondary btn-sm" data-action="view-project" data-id="${project.id}">View project ↗</button></div>
      <div class="tiny muted" style="margin-top:10px">${open ? `${Math.max(0, daysRemaining(project))} days remaining` : project.closing < todayISO() ? `Closed ${dateLabel(project.closing)}` : project.status === "Pending" ? "Awaiting review" : project.status === "Rejected" ? "Not approved" : "Target achieved"} · ${donationCount(project.id)} donations</div>
    </div>
  </article>`;
}
function emptyState(icon, title, text, action = "") {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><strong>${escapeHTML(title)}</strong><p class="small-text">${escapeHTML(text)}</p>${action}</div>`;
}
function pageHeading(eyebrow, title, description, actions = "") {
  return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h2>${title}</h2><p>${description}</p></div>${actions ? `<div class="heading-actions">${actions}</div>` : ""}</div>`;
}
function metric(label, value, foot, icon) {
  return `<div class="card metric-card"><div class="metric-top"><span>${label}</span><span class="metric-icon">${icon}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></div>`;
}
function audit(action, table, recordId, details) {
  state.audit.unshift({ id: state.nextAuditId++, action, table, recordId, actorId: currentUser()?.id || null, date: todayISO(), details });
  saveState();
}
function showToast(message, type = "success") {
  const root = $("#toastRoot");
  const toast = document.createElement("div"); toast.className = `toast ${type === "error" ? "error" : ""}`; toast.textContent = message;
  root.appendChild(toast); setTimeout(() => toast.remove(), 3600);
}
function openModal(title, subtitle, body, onReady) {
  const root = $("#modalRoot");
  root.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal-top"><div><p class="eyebrow">NEWCORP</p><h2>${title}</h2>${subtitle ? `<p class="muted small-text">${subtitle}</p>` : ""}</div><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></div>${body}</div>`;
  root.onclick = event => { if (event.target === root) closeModal(); };
  onReady?.(root);
}
function closeModal() { $("#modalRoot").innerHTML = ""; }
function setPage(page) {
  currentPage = page;
  if (page !== "project-detail") selectedProjectId = null;
  if (page !== "team-detail") selectedTeamId = null;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function render() {
  const app = $("#app");
  const renderers = {
    home: renderHome, projects: renderProjects, "project-detail": renderProjectDetail,
    teams: renderTeams, "team-detail": renderTeamDetail, dashboard: renderDashboard,
    donations: renderDonations, reports: renderReports, moderator: renderModerator,
    users: renderUsers, audit: renderAudit, profile: renderProfile, login: renderLogin,
    register: renderRegister
  };
  app.innerHTML = (renderers[currentPage] || renderHome)();
  updateNavigation();
  const user = currentUser();
  $("#accountButton").textContent = isVisitor() ? "Sign in" : isModerator() ? "MOD" : initials(fullName(user));
  $("#logoutButton").hidden = isVisitor();
  const login = document.querySelector("#accountNavLink");
  if (login) {
    login.textContent = isVisitor() ? "Sign in" : "Dashboard";
    login.dataset.nav = isVisitor() ? "login" : "dashboard";
    login.href = isVisitor() ? "#login" : "#dashboard";
  }
}
function updateNavigation() {
  $$("[data-nav]").forEach(link => link.classList.toggle("active", link.dataset.nav === currentPage || (currentPage === "project-detail" && link.dataset.nav === "projects") || (currentPage === "team-detail" && link.dataset.nav === "teams")));
}
function requireUser() {
  if (isVisitor()) { showToast("Please sign in to use this feature.", "error"); setPage("login"); return false; }
  if (!currentUser()?.active && !isModerator()) { showToast("This demo account is inactive.", "error"); return false; }
  return true;
}
function requireModerator() {
  if (!isModerator()) { showToast("Moderator access is required.", "error"); setPage("home"); return false; }
  return true;
}

function renderHome() {
  const featured = state.projects.filter(project => project.status === "Approved").slice(0, 3);
  const raised = state.donations.reduce((sum, donation) => sum + donation.amount, 0);
  const activeProjects = state.projects.filter(project => projectIsOpen(project)).length;
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">Community, powered together</p><h1>Good things happen when we <span style="color:#d9ef9a">work together.</span></h1><p>Discover local initiatives, join teams making a difference, and help promising projects move from idea to impact.</p><div class="hero-actions"><button class="btn btn-primary" data-action="navigate" data-page="projects">Explore projects <span>↗</span></button><button class="btn btn-outline" data-action="navigate" data-page="teams">Meet the teams</button></div></div><div class="hero-art"><div class="orbit"><span class="orbit-chip one">✳</span><span class="orbit-chip two">♡</span><span class="orbit-chip three">⌂</span><div class="orbit-center">N</div></div></div></section>
    <section class="grid grid-3 section-block">${metric("Projects accepting support", activeProjects, "Approved projects still open", "↗")}${metric("Community contributions", money(raised), "Across the demonstration dataset", "♡")}${metric("Community teams", state.teams.length, "People organising around shared goals", "⌂")}</section>
    <section class="section-block"><div class="section-title"><div><p class="eyebrow">Make an impact</p><h2>Featured projects</h2><p>Explore the initiatives supported by NewCorp teams.</p></div><button class="btn btn-outline" data-action="navigate" data-page="projects">All projects ↗</button></div><div class="grid grid-3">${featured.length ? featured.map(projectCard).join("") : emptyState("✳", "No projects yet", "Approved projects will appear here.")}</div></section>
    <section class="grid grid-2 section-block"><div class="card card-pad"><p class="eyebrow">Find your people</p><h2>Progress is a team effort.</h2><p class="muted small-text">Join a team, contribute your skills, and help shape projects that matter to your community.</p><button class="btn btn-primary" data-action="navigate" data-page="teams">Explore teams ↗</button></div><div class="card card-pad" style="background:#edf4e9"><p class="eyebrow">Your NewCorp account</p><h2>Keep your impact in view.</h2><p class="muted small-text">Track your donations, manage your memberships and keep your profile up to date.</p><button class="btn btn-secondary" data-action="navigate" data-page="dashboard">Open dashboard ↗</button></div></section>`;
}
function renderProjects() {
  let projects = state.projects.filter(project => project.status === "Approved" || isModerator() || (currentUser() && isMember(currentUser().id, project.teamId)));
  if (projectFilters.query) projects = projects.filter(project => `${project.description} ${teamName(project.teamId)}`.toLowerCase().includes(projectFilters.query.toLowerCase()));
  if (projectFilters.type !== "all") projects = projects.filter(project => project.type === projectFilters.type);
  if (projectFilters.status !== "all") projects = projects.filter(project => project.status === projectFilters.status);
  projects.sort((a,b) => new Date(b.posted) - new Date(a.posted));
  return `${pageHeading("Discover", "Explore projects", "Browse initiatives, review their funding goals and see which teams are behind them.", `<button class="btn btn-primary" data-action="create-project">＋ Create a project</button>`)}
    <div class="toolbar"><div class="search-field"><span class="search-symbol">⌕</span><input id="projectSearch" type="search" placeholder="Search projects or teams…" value="${escapeHTML(projectFilters.query)}" /></div><select id="projectTypeFilter"><option value="all">All project types</option><option value="Charity" ${projectFilters.type === "Charity" ? "selected" : ""}>Charity</option><option value="Commercial" ${projectFilters.type === "Commercial" ? "selected" : ""}>Commercial</option></select><select id="projectStatusFilter"><option value="all">All statuses</option><option value="Approved" ${projectFilters.status === "Approved" ? "selected" : ""}>Approved</option><option value="Pending" ${projectFilters.status === "Pending" ? "selected" : ""}>Pending</option><option value="Rejected" ${projectFilters.status === "Rejected" ? "selected" : ""}>Rejected</option></select></div>
    <div id="projectGrid" class="grid grid-3">${projects.length ? projects.map(projectCard).join("") : emptyState("⌕", "No matching projects", "Try changing your search or filters.")}</div>`;
}
function renderProjectDetail() {
  const project = getProject(selectedProjectId);
  if (!project) return `${pageHeading("Projects", "Project not found", "This project may have been removed.")}<button class="btn btn-outline" data-action="navigate" data-page="projects">Back to projects</button>`;
  const raised = totalRaised(project.id), pct = progressPercent(project), team = getTeam(project.teamId), open = projectIsOpen(project);
  const cover = project.type === "Commercial" ? "tech" : project.description.toLowerCase().includes("school") ? "education" : project.description.toLowerCase().includes("food") ? "food" : "";
  const donationRows = donationsForProject(project.id).sort((a,b) => b.date.localeCompare(a.date)).map(d => `<tr><td>${dateLabel(d.date)}</td><td>${escapeHTML(fullName(getUser(d.userId)))}</td><td>${money(d.amount)}</td></tr>`).join("");
  const canEdit = currentUser() && isMember(currentUser().id, project.teamId);
  return `<div class="page-heading"><div><button class="btn btn-quiet" data-action="navigate" data-page="projects">← All projects</button><p class="eyebrow" style="margin-top:12px">Project ${project.id} · ${escapeHTML(project.type)}</p><h2>${escapeHTML(project.description)}</h2><p>Managed by ${escapeHTML(team?.name || "Unknown team")}</p></div><div class="heading-actions">${canEdit ? `<button class="btn btn-outline" data-action="edit-project" data-id="${project.id}">Edit project</button>` : ""}</div></div>
    <div class="detail-layout"><div class="stack"><div class="detail-hero ${cover}"><span class="cover-symbol">${projectIcon(project)}</span></div><div class="card card-pad"><div class="card-header"><div><h3>About this project</h3><p>Project overview and key information</p></div>${statusBadge(project.status)}</div><p>${escapeHTML(project.description)} is an initiative coordinated by ${escapeHTML(team?.name || "a NewCorp team")}.</p><div class="grid grid-2" style="margin-top:18px"><div><span class="muted tiny">Project type</span><div><strong>${escapeHTML(project.type)}</strong></div></div><div><span class="muted tiny">Posted</span><div><strong>${dateLabel(project.posted)}</strong></div></div><div><span class="muted tiny">Closing date</span><div><strong>${dateLabel(project.closing)}</strong></div></div><div><span class="muted tiny">Team</span><div><strong>${escapeHTML(team?.name || "—")}</strong></div></div>${project.type === "Charity" ? `<div class="full"><span class="muted tiny">Beneficiaries</span><div><strong>${escapeHTML(project.beneficiaries)}</strong></div></div>` : `<div><span class="muted tiny">Profit margin</span><div><strong>${Number(project.profitMargin || 0).toFixed(2)}%</strong></div></div>`}</div></div>
    <div class="card card-pad"><div class="card-header"><div><h3>Donation activity</h3><p>${donationCount(project.id)} contributions recorded</p></div><span class="badge">Donation details</span></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Contributor</th><th>Amount</th></tr></thead><tbody>${donationRows || `<tr><td colspan="3" class="muted">No donations have been recorded.</td></tr>`}</tbody></table></div></div>
    <div class="card card-pad"><div class="card-header"><div><h3>Project activity log</h3><p>Project_Log trigger demonstration</p></div></div>${state.projectLog.filter(log=>log.projectId===project.id).length ? state.projectLog.filter(log=>log.projectId===project.id).map(log=>`<div class="list-row"><div class="list-icon">≋</div><div class="list-main"><strong>${escapeHTML(fullName(getUser(log.teamMemberId)))}</strong><span>${escapeHTML(log.description)} · ${dateLabel(log.dateLogged)}</span></div></div>`).join("") : `<p class="muted small-text">No project log entries are available in this preview.</p>`}</div>
    ${isModerator() && project.status === "Pending" ? `<div class="card card-pad"><div class="card-header"><div><h3>Moderator review</h3><p>This project is awaiting a decision.</p></div>${statusBadge(project.status)}</div><button class="btn btn-primary" data-action="moderate-project" data-id="${project.id}">Review submission</button></div>` : ""}</div>
    <aside class="stack detail-side-sticky"><div class="card card-pad"><p class="eyebrow">Funding progress</p><div class="metric-value">${money(raised)}</div><p class="muted small-text">raised of ${money(project.target)}</p><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><div class="progress-meta"><span>${pct.toFixed(1)}% funded</span><span>${money(Math.max(0, project.target - raised))} to go</span></div><div class="grid grid-2" style="margin-top:18px"><div><strong>${donationCount(project.id)}</strong><div class="muted tiny">Donations</div></div><div><strong>${open ? `${daysRemaining(project)} days` : "Closed"}</strong><div class="muted tiny">Time remaining</div></div></div><button class="btn btn-primary" style="width:100%;margin-top:20px" data-action="donate" data-id="${project.id}" ${open && !isVisitor() ? "" : "disabled"}>${open ? "Make a donation" : "Donations closed"}</button>${isVisitor() && open ? `<p class="muted tiny" style="margin:9px 0 0">Sign in to make a donation.</p>` : ""}</div><div class="card card-pad"><h3>About the team</h3><p class="muted small-text">${escapeHTML(team?.name || "—")}</p><p class="muted tiny">${teamMembers(project.teamId).length} team members</p><button class="btn btn-outline" style="width:100%" data-action="view-team" data-id="${project.teamId}">View team ↗</button></div></aside></div>`;
}
function renderTeams() {
  const cards = state.teams.map(team => {
    const members = teamMembers(team.id), projects = state.projects.filter(project => project.teamId === team.id);
    const joined = currentUser() && isMember(currentUser().id, team.id);
    return `<article class="card card-pad"><div class="card-header"><div><span class="badge">Team ${team.id}</span><h3 style="margin-top:10px">${escapeHTML(team.name)}</h3><p>Created ${dateLabel(team.created)}</p></div><div class="list-icon">⌂</div></div><div class="grid grid-2"><div><strong>${members.length}</strong><div class="muted tiny">Members</div></div><div><strong>${projects.length}</strong><div class="muted tiny">Projects</div></div></div><div class="list-row" style="margin-top:13px"><div class="team-dot">${team.leaderId ? initials(fullName(getUser(team.leaderId))) : "—"}</div><div class="list-main"><strong>${escapeHTML(team.leaderId ? fullName(getUser(team.leaderId)) : "Not assigned")}</strong><span>Team leader</span></div></div><div class="project-footer"><button class="btn btn-outline btn-sm" data-action="view-team" data-id="${team.id}">View team</button>${joined ? `<span class="badge green">Member</span>` : `<button class="btn btn-secondary btn-sm" data-action="join-team" data-id="${team.id}" ${isVisitor() ? "disabled" : ""}>＋ Join team</button>`}</div></article>`;
  }).join("");
  return `${pageHeading("Community", "Meet the teams", "Find a group whose goals align with yours. Members can belong to more than one team.", `<button class="btn btn-primary" data-action="create-team">＋ Create a team</button>`)}<div class="grid grid-3">${cards || emptyState("⌂", "No teams yet", "Create the first team.")}</div>`;
}
function renderTeamDetail() {
  const team = getTeam(selectedTeamId);
  if (!team) return `${pageHeading("Teams", "Team not found", "This team may have been removed.")}<button class="btn btn-outline" data-action="navigate" data-page="teams">Back to teams</button>`;
  const members = teamMembers(team.id), projects = state.projects.filter(project => project.teamId === team.id);
  const joined = currentUser() && isMember(currentUser().id, team.id), leader = currentUser() && team.leaderId === currentUser().id;
  const memberRows = members.map(user => `<tr><td><strong>${escapeHTML(fullName(user))}</strong><div class="muted tiny">${escapeHTML(user.email)}</div></td><td>${team.leaderId === user.id ? `<span class="badge green">Leader</span>` : `<span class="badge">Member</span>`}</td><td>${isModerator() || leader ? `<div class="table-actions">${team.leaderId !== user.id ? `<button class="btn btn-outline btn-sm" data-action="set-leader" data-team="${team.id}" data-user="${user.id}">Make leader</button><button class="btn btn-danger btn-sm" data-action="remove-member" data-team="${team.id}" data-user="${user.id}">Remove</button>` : ""}</div>` : "—"}</td></tr>`).join("");
  return `<div class="page-heading"><div><button class="btn btn-quiet" data-action="navigate" data-page="teams">← All teams</button><p class="eyebrow" style="margin-top:12px">Team ${team.id}</p><h2>${escapeHTML(team.name)}</h2><p>Created ${dateLabel(team.created)} · ${members.length} members · ${projects.length} projects</p></div><div class="heading-actions">${joined ? `<button class="btn btn-outline" data-action="leave-team" data-id="${team.id}" ${leader ? "disabled title='Assign another leader before leaving'" : ""}>Leave team</button>` : `<button class="btn btn-primary" data-action="join-team" data-id="${team.id}" ${isVisitor() ? "disabled" : ""}>Join team</button>`}</div></div>
  <div class="grid grid-2"><div class="card card-pad"><div class="card-header"><div><h3>Team members</h3><p>Membership and leadership</p></div><span class="badge">${members.length} members</span></div><div class="table-wrap"><table><thead><tr><th>Member</th><th>Position</th><th>Actions</th></tr></thead><tbody>${memberRows || `<tr><td colspan="3">No members.</td></tr>`}</tbody></table></div>${leader ? `<p class="field-help" style="margin-top:12px">As team leader, you can appoint another member or remove members. You must appoint a new leader before leaving.</p>` : ""}</div><div class="card card-pad"><div class="card-header"><div><h3>Team projects</h3><p>Projects associated with this team</p></div>${joined ? `<button class="btn btn-primary btn-sm" data-action="create-project" data-team="${team.id}">＋ Create</button>` : ""}</div>${projects.length ? projects.map(project => `<div class="list-row"><div class="list-icon">${projectIcon(project)}</div><div class="list-main"><strong>${escapeHTML(project.description)}</strong><span>${escapeHTML(project.type)} · ${statusBadge(project.status)}</span></div><button class="btn btn-outline btn-sm" data-action="view-project" data-id="${project.id}">View</button></div>`).join("") : emptyState("✳", "No projects yet", "This team has not created any projects.")}</div></div>`;
}
function renderDashboard() {
  if (isVisitor()) return `${pageHeading("Your space", "Welcome to NEWCORP", "Sign in to view your personal dashboard.")}<div class="card card-pad">${emptyState("◎", "Your dashboard is waiting", "Sign in to your account to view your dashboard.", `<button class="btn btn-primary" data-action="navigate" data-page="login">Open sign in preview</button>`)}</div>`;
  const user = currentUser(), mine = state.donations.filter(d => d.userId === user.id), myTeams = userTeams(user.id), myProjects = state.projects.filter(p => isMember(user.id, p.teamId));
  const donated = mine.reduce((sum,d) => sum + d.amount, 0);
  const recent = mine.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,4);
  return `${pageHeading("Your space", `Welcome back, ${escapeHTML(user.first)}.`, "Here's a quick look at your contributions and team activity.", `<button class="btn btn-outline" data-action="navigate" data-page="profile">Edit profile</button>`)}
  <div class="grid grid-4">${metric("Your donations", money(donated), `${mine.length} recorded contributions`, "♡")}${metric("Your teams", myTeams.length, "Memberships across teams", "⌂")}${metric("Team projects", myProjects.length, "Projects managed by your teams", "↗")}${metric("Account status", user.active ? "Active" : "Inactive", user.role === "Moderator" ? "Moderator account" : "Registered user", "◎")}</div>
  <div class="dashboard-grid section-block"><div class="stack"><div class="card card-pad"><div class="card-header"><div><h3>Recent donations</h3><p>Your latest contribution activity</p></div><button class="btn btn-quiet" data-action="navigate" data-page="donations">View history ↗</button></div>${recent.length ? recent.map(d => `<div class="list-row"><div class="list-icon">♡</div><div class="list-main"><strong>${escapeHTML(getProject(d.projectId)?.description || "Project")}</strong><span>${dateLabel(d.date)} · Donation #${d.number}</span></div><strong>${money(d.amount)}</strong></div>`).join("") : emptyState("♡", "No donations yet", "Explore projects and make your first contribution.")}</div>
  <div class="card card-pad"><div class="card-header"><div><h3>Projects from your teams</h3><p>Projects you can help manage</p></div><button class="btn btn-quiet" data-action="navigate" data-page="projects">Browse projects ↗</button></div>${myProjects.length ? myProjects.slice(0,4).map(p => `<div class="list-row"><div class="list-icon">${projectIcon(p)}</div><div class="list-main"><strong>${escapeHTML(p.description)}</strong><span>${escapeHTML(teamName(p.teamId))} · ${p.status}</span></div><button class="btn btn-outline btn-sm" data-action="view-project" data-id="${p.id}">View</button></div>`).join("") : emptyState("✳", "No team projects", "Join a team to collaborate on projects.")}</div></div>
  <aside class="stack"><div class="card card-pad"><div class="card-header"><div><h3>My teams</h3><p>Your current memberships</p></div></div>${myTeams.length ? myTeams.map(t => `<div class="list-row"><div class="list-icon">⌂</div><div class="list-main"><strong>${escapeHTML(t.name)}</strong><span>${teamMembers(t.id).length} members ${t.leaderId === user.id ? "· You lead this team" : ""}</span></div><button class="btn btn-outline btn-sm" data-action="view-team" data-id="${t.id}">View</button></div>`).join("") : emptyState("⌂", "No teams yet", "Find a team to join.")}</div><div class="card card-pad" style="background:#edf4e9"><p class="eyebrow">Quick action</p><h3>Have an idea?</h3><p class="muted small-text">Create a team and bring people together around a shared project.</p><button class="btn btn-primary" data-action="create-team">Create a team ↗</button></div></aside></div>`;
}
function renderDonations() {
  if (isVisitor()) return `${pageHeading("Your activity", "My donations", "Sign in to view donation history.")}<div class="card card-pad">${emptyState("♡", "Sign in to view your donations", "Your donation history will appear here.")}</div>`;
  const rows = state.donations.filter(d => d.userId === currentUser().id).sort((a,b) => b.date.localeCompare(a.date)).map(d => `<tr><td>${dateLabel(d.date)}</td><td><strong>${escapeHTML(getProject(d.projectId)?.description || "Project")}</strong></td><td>${d.number}</td><td>${money(d.amount)}</td></tr>`).join("");
  const total = state.donations.filter(d => d.userId === currentUser().id).reduce((sum,d) => sum + d.amount, 0);
  return `${pageHeading("Your activity", "My donations", "A record of the contributions you've made to NewCorp projects.", `<button class="btn btn-primary" data-action="navigate" data-page="projects">Explore projects</button>`)}<div class="grid grid-3">${metric("Total contributed", money(total), "Your recorded contributions", "♡")}${metric("Number of donations", state.donations.filter(d => d.userId === currentUser().id).length, "Each contribution is recorded separately", "↗")}${metric("Projects supported", new Set(state.donations.filter(d => d.userId === currentUser().id).map(d => d.projectId)).size, "Unique projects supported", "✳")}</div><div class="card card-pad section-block"><div class="card-header"><div><h3>Donation history</h3><p>Corresponds to the user donation history and donation details records.</p></div></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Project</th><th>Donation #</th><th>Amount</th></tr></thead><tbody>${rows || `<tr><td colspan="4">You haven't made any donations yet.</td></tr>`}</tbody></table></div></div>`;
}
function renderReports() {
  const projectSummary = state.projects.map(p => ({ project:p, raised:totalRaised(p.id), count:donationCount(p.id) }));
  const teamPerf = state.teams.map(t => {
    const ps = state.projects.filter(p => p.teamId === t.id);
    const target = ps.reduce((s,p) => s + p.target,0), raised = ps.reduce((s,p) => s + totalRaised(p.id),0);
    return { team:t, count:ps.length, target, raised, pct:target ? raised/target*100 : 0 };
  });
  const closingSoon = state.projects.filter(p => p.closing >= todayISO() && daysRemaining(p) <= 90).sort((a,b) => a.closing.localeCompare(b.closing));
  const rows = projectSummary.map(({project:p,raised,count}) => `<tr><td><strong>${escapeHTML(p.description)}</strong><div class="muted tiny">Project #${p.id}</div></td><td>${money(p.target)}</td><td>${money(raised)}</td><td>${money(Math.max(0,p.target-raised))}</td><td>${count}</td><td>${p.target ? (raised/p.target*100).toFixed(1) : "0.0"}%</td></tr>`).join("");
  return `${pageHeading("Insights", "Reports & performance", "Operational summaries based on the SQL views, stored procedures and scalar functions.", `<button class="btn btn-outline" data-action="export-report">Export CSV ↓</button>`)}
  <div class="grid grid-3">${metric("Total donations", money(state.donations.reduce((s,d)=>s+d.amount,0)), "Equivalent to GetTotalDonations aggregated", "♡")}${metric("Donation records", state.donations.length, "Equivalent to GetDonationCount aggregated", "↗")}${metric("Projects", state.projects.length, "Across all approval statuses", "✳")}</div>
  <div class="card card-pad section-block"><div class="card-header"><div><h3>Project funding summary</h3><p>View_Project_Funding_Summary · View_Project_Donation_Summary · sp_DonationInfo</p></div></div><div class="table-wrap"><table><thead><tr><th>Project</th><th>Target</th><th>Total raised</th><th>Remaining</th><th>Donations</th><th>Funded</th></tr></thead><tbody>${rows}</tbody></table></div></div>
  <div class="grid grid-2 section-block"><div class="card card-pad"><div class="card-header"><div><h3>Team performance</h3><p>sp_TeamPerformance and View_Team_Summary</p></div></div>${teamPerf.map(item => `<div style="margin-bottom:18px"><div class="progress-meta"><strong style="color:var(--ink)">${escapeHTML(item.team.name)}</strong><span>${item.pct.toFixed(1)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,item.pct)}%"></div></div><div class="muted tiny" style="margin-top:6px">${item.count} projects · ${money(item.raised)} raised of ${money(item.target)}</div></div>`).join("")}</div>
  <div class="card card-pad"><div class="card-header"><div><h3>Projects closing soon</h3><p>sp_ProjectsClosingSoon · 90-day window</p></div></div>${closingSoon.length ? closingSoon.map(p => `<div class="list-row"><div class="list-icon">◷</div><div class="list-main"><strong>${escapeHTML(p.description)}</strong><span>Closes ${dateLabel(p.closing)} · ${daysRemaining(p)} days left</span></div><strong class="small-text">${money(Math.max(0,p.target-totalRaised(p.id)))} left</strong></div>`).join("") : emptyState("◷", "No upcoming deadlines", "No projects close within the next 90 days.")}</div></div>
  <div class="notice info section-block">These reports are calculated from current database records loaded through Flask.</div>`;
}
function renderModerator() {
  if (!requireModerator()) return "";
  const pending = state.projects.filter(p => p.status === "Pending"), activeUsers = state.users.filter(u => !u.demoOnly && u.active).length;
  return `${pageHeading("Moderator workspace", "Moderation overview", "Review submitted projects, manage user accounts and inspect activity records.", `<button class="btn btn-outline" data-action="navigate" data-page="audit">View audit log ↗</button>`)}<div class="grid grid-4">${metric("Pending projects", pending.length, "Awaiting moderator decision", "◷")}${metric("Registered accounts", state.users.filter(u=>!u.demoOnly).length, "Website user records", "◎")}${metric("Active accounts", activeUsers, "Accounts currently enabled", "✓")}${metric("Audit entries", state.audit.length, "Recorded system activities", "≋")}</div><div class="grid grid-2 section-block"><div class="card card-pad"><div class="card-header"><div><h3>Pending project review</h3><p>Review project submissions before public listing.</p></div><span class="badge gold">${pending.length} pending</span></div>${pending.length ? pending.map(p => `<div class="list-row"><div class="list-icon">✳</div><div class="list-main"><strong>${escapeHTML(p.description)}</strong><span>${escapeHTML(teamName(p.teamId))} · ${escapeHTML(p.type)} · ${money(p.target)}</span></div><button class="btn btn-outline btn-sm" data-action="view-project" data-id="${p.id}">Review</button></div>`).join("") : emptyState("✓", "You're all caught up", "There are no pending project submissions.")}</div><div class="card card-pad"><div class="card-header"><div><h3>Administration</h3><p>Website moderation tools</p></div></div><div class="list-row"><div class="list-icon">◎</div><div class="list-main"><strong>User management</strong><span>View and activate/deactivate accounts</span></div><button class="btn btn-outline btn-sm" data-action="navigate" data-page="users">Open</button></div><div class="list-row"><div class="list-icon">▤</div><div class="list-main"><strong>Reports</strong><span>Funding, team performance and deadlines</span></div><button class="btn btn-outline btn-sm" data-action="navigate" data-page="reports">Open</button></div><div class="list-row"><div class="list-icon">≋</div><div class="list-main"><strong>Audit history</strong><span>Actions recorded in AUDIT_LOG</span></div><button class="btn btn-outline btn-sm" data-action="navigate" data-page="audit">Open</button></div></div></div>`;
}
function renderUsers() {
  if (!requireModerator()) return "";
  const rows = state.users.filter(u => !u.demoOnly).map(user => `<tr><td><strong>${escapeHTML(fullName(user))}</strong><div class="muted tiny">${escapeHTML(user.email)}</div></td><td>${user.id}</td><td>${user.role === "Moderator" ? "Moderator" : "Registered user"}</td><td>${statusBadge(user.active ? "Active" : "Inactive")}</td><td><button class="btn ${user.active ? "btn-danger" : "btn-secondary"} btn-sm" data-action="toggle-user" data-id="${user.id}" ${currentUser()?.id === user.id ? "disabled" : ""}>${user.active ? "Deactivate" : "Activate"}</button></td></tr>`).join("");
  return `${pageHeading("Moderation", "User management", "Review account status. Actual moderator authorization must be enforced by Flask and SQL Server.", `<button class="btn btn-outline" data-action="navigate" data-page="moderator">← Moderator overview</button>`)}<div class="card card-pad"><div class="table-wrap"><table><thead><tr><th>User</th><th>User ID</th><th>Website role</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}
function renderAudit() {
  if (!requireModerator()) return "";
  const rows = state.audit.slice().sort((a,b)=>b.id-a.id).map(entry => `<tr><td>${entry.id}</td><td><strong>${escapeHTML(entry.action)}</strong><div class="muted tiny">${escapeHTML(entry.details)}</div></td><td>${escapeHTML(entry.table)}</td><td>${entry.recordId ?? "—"}</td><td>${escapeHTML(fullName(getUser(entry.actorId)))}</td><td>${dateLabel(entry.date)}</td></tr>`).join("");
  return `${pageHeading("Moderation", "Audit history", "A readable frontend representation of AUDIT_LOG and related project activity records.", `<button class="btn btn-outline" data-action="navigate" data-page="moderator">← Moderator overview</button>`)}<div class="card card-pad"><div class="table-wrap"><table><thead><tr><th>Log ID</th><th>Action / details</th><th>Table</th><th>Record ID</th><th>Actor</th><th>Date</th></tr></thead><tbody>${rows || `<tr><td colspan="6">No audit records.</td></tr>`}</tbody></table></div></div>`;
}
function renderProfile() {
  if (isVisitor()) return `${pageHeading("Account", "Your profile", "Sign in to view profile details.")}`;
  const user = currentUser();
  return `${pageHeading("Account", "Profile settings", "Update your contact information. Password changes and authentication are handled securely by the backend.")}
  <div class="card card-pad" style="max-width:800px"><form id="profileForm"><div class="form-grid"><div class="field"><label>First name</label><input name="first" maxlength="50" required value="${escapeHTML(user.first)}"></div><div class="field"><label>Last name</label><input name="last" maxlength="50" required value="${escapeHTML(user.last)}"></div><div class="field"><label>Email address</label><input name="email" type="email" maxlength="50" required value="${escapeHTML(user.email)}"></div><div class="field"><label>Mobile number</label><input name="mobile" maxlength="20" value="${escapeHTML(user.mobile)}"></div><div class="field"><label>Street name</label><input name="street" maxlength="100" value="${escapeHTML(user.street)}"></div><div class="field"><label>Street number</label><input name="streetNo" maxlength="10" value="${escapeHTML(user.streetNo)}"></div><div class="field"><label>City</label><input name="city" maxlength="50" value="${escapeHTML(user.city)}"></div><div class="field"><label>Country</label><input name="country" maxlength="50" value="${escapeHTML(user.country)}"></div><div class="field"><label>Postal zone</label><input name="postal" maxlength="20" value="${escapeHTML(user.postal)}"></div><div class="field"><label>Website role</label><input disabled value="${escapeHTML(user.role)}"></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">Save profile</button></div></form><div class="notice info" style="margin-top:18px">Password hashes are never displayed or edited in the browser. The backend should use a secure password-change/reset endpoint.</div></div>`;
}
function renderLogin() {
  return `<div class="card auth-card"><p class="eyebrow">Welcome back</p><h2>Sign in to NEWCORP</h2><p class="muted small-text">Sign in using the email address and password for your NEWCORP account.</p><form id="loginForm" class="stack"><div class="field"><label>Email address</label><input type="email" name="email" placeholder="you@example.com" required></div><div class="field"><label>Password</label><input type="password" name="password" placeholder="Password" required></div><button class="btn btn-primary" type="submit">Continue</button></form><div class="notice warning" style="margin-top:18px">Credentials are checked by Flask. Passwords are never stored by the browser.</div><p class="small-text muted" style="margin:18px 0 0">New to NEWCORP? <button class="btn btn-quiet" data-action="navigate" data-page="register">Create an account</button></p></div>`;
}
function renderRegister() {
  return `<div class="card auth-card"><p class="eyebrow">Join the community</p><h2>Create your account</h2><p class="muted small-text">Register to donate, join teams and collaborate on projects.</p><form id="registerForm" class="stack"><div class="form-grid"><div class="field"><label>First name *</label><input name="first" maxlength="50" required></div><div class="field"><label>Last name *</label><input name="last" maxlength="50" required></div><div class="field full"><label>Email address *</label><input type="email" name="email" maxlength="50" required></div><div class="field"><label>Password *</label><input type="password" name="password" minlength="8" required></div><div class="field"><label>Mobile number</label><input name="mobile" maxlength="20"></div><div class="field"><label>Street name</label><input name="street" maxlength="100"></div><div class="field"><label>Street number</label><input name="streetNo" maxlength="10"></div><div class="field"><label>City</label><input name="city" maxlength="50"></div><div class="field"><label>Country</label><input name="country" maxlength="50" value="Jamaica"></div><div class="field"><label>Postal zone</label><input name="postal" maxlength="20"></div></div><button class="btn btn-primary" type="submit">Create account</button></form><div class="notice warning" style="margin-top:16px">The Flask backend securely hashes your password before storing it in SQL Server.</div></div>`;
}

/* Forms and demo operations */
function createProjectForm(teamId = "") {
  if (!requireUser()) return;
  const eligibleTeams = userTeams(currentUser().id);
  if (teamId && isMember(currentUser().id, Number(teamId)) && !eligibleTeams.some(t=>t.id===Number(teamId))) eligibleTeams.push(getTeam(teamId));
  if (!eligibleTeams.length) { showToast("Join or create a team before submitting a project.", "error"); return; }
  openModal("Submit a project", "New submissions are placed in Pending status for moderator review.", `<form id="projectForm"><div class="form-grid"><div class="field full"><label>Project description *</label><input name="description" maxlength="500" required placeholder="Describe the initiative"></div><div class="field"><label>Project type *</label><select name="type" id="newProjectType"><option value="Charity">Charity</option><option value="Commercial">Commercial</option></select></div><div class="field"><label>Team *</label><select name="teamId" required>${eligibleTeams.map(t=>`<option value="${t.id}" ${Number(teamId)===t.id?"selected":""}>${escapeHTML(t.name)}</option>`).join("")}</select></div><div class="field"><label>Funding target (JMD) *</label><input name="target" type="number" min="1" step="0.01" required></div><div class="field"><label>Closing date *</label><input name="closing" type="date" min="${todayISO()}" required></div><div class="field full" id="beneficiariesField"><label>Beneficiaries *</label><textarea name="beneficiaries" maxlength="500" placeholder="Who will benefit from this project?"></textarea></div><div class="field full" id="profitMarginField" hidden><label>Profit margin (%) *</label><input name="profitMargin" type="number" min="0" max="100" step="0.01"></div></div><div class="notice info" style="margin-top:15px">The project will not appear in public listings until a moderator approves it.</div><div class="form-actions"><button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Submit for review</button></div></form>`, root => {
    const type = $("#newProjectType", root);
    type.addEventListener("change", () => {
      const charity = type.value === "Charity";
      $("#beneficiariesField", root).hidden = !charity;
      $("#profitMarginField", root).hidden = charity;
      $("[name=beneficiaries]", root).required = charity;
      $("[name=profitMargin]", root).required = !charity;
    });
  });
}
function createTeamForm() {
  if (!requireUser()) return;
  openModal("Create a team", "You will automatically become the team's first member and leader.", `<form id="teamForm"><div class="field"><label>Team name *</label><input name="name" maxlength="50" required placeholder="e.g. Community Gardeners"></div><div class="form-actions"><button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Create team</button></div></form>`);
}
function donateForm(projectId) {
  if (!requireUser()) return;
  const project = getProject(projectId);
  if (!project || !projectIsOpen(project)) { showToast("This project is not currently accepting donations.", "error"); return; }
  const remaining = project.target - totalRaised(project.id);
  openModal("Make a donation", `Support ${project.description}. This action records a donation in the database; it does not collect payment.`, `<form id="donationForm"><div class="notice info" style="margin-bottom:15px">Funding remaining: <strong>${money(remaining)}</strong>. The database prevents donations that exceed the target or arrive after the closing date.</div><div class="field"><label>Donation amount (JMD) *</label><input name="amount" type="number" min="1" max="${remaining}" step="0.01" required placeholder="Enter amount"></div><div class="field" style="margin-top:14px"><label>Payment method</label><select disabled><option>Payment integration not configured</option></select><span class="field-help">No real payment is collected by this frontend.</span></div><div class="form-actions"><button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Record donation</button></div></form>`);
}
function editProjectForm(projectId) {
  if (!requireUser()) return;
  const project = getProject(projectId);
  if (!project || !isMember(currentUser().id, project.teamId)) { showToast("Only members of the project's team can edit it.", "error"); return; }
  openModal("Edit project", "Target and closing-date changes are subject to database safeguards.", `<form id="editProjectForm"><div class="form-grid"><div class="field full"><label>Description *</label><input name="description" maxlength="500" required value="${escapeHTML(project.description)}"></div><div class="field"><label>Funding target (JMD) *</label><input name="target" type="number" min="${totalRaised(project.id)}" step="0.01" required value="${project.target}"></div><div class="field"><label>Closing date *</label><input name="closing" type="date" min="${state.donations.filter(d=>d.projectId===project.id).reduce((max,d)=>d.date>max?d.date:max,project.posted)}" required value="${project.closing}"></div></div><div class="notice warning" style="margin-top:15px">The target cannot be lowered below funds already raised. The closing date cannot precede an existing donation date.</div><div class="form-actions"><button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Save changes</button></div></form>`);
}
function moderateProject(projectId) {
  const project = getProject(projectId);
  if (!project || project.status !== "Pending") return;
  openModal("Review project", project.description, `<form id="moderateForm"><div class="field"><label>Decision *</label><select name="decision"><option value="APPROVE">Approve</option><option value="REJECT">Reject</option></select></div><div class="field" style="margin-top:14px"><label>Rejection reason (required if rejected)</label><textarea name="reason" maxlength="500" placeholder="Explain why the project cannot be approved"></textarea></div><div class="form-actions"><button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Submit decision</button></div></form>`);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken, ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
  return data;
}
async function refreshFromServer() {
  const loaded = await apiRequest('/bootstrap');
  Object.assign(state, loaded);
  state.previewRole = currentUser()?.role === "Moderator" ? "moderator" : isVisitor() ? "visitor" : "user";
  render();
}
async function sessionFromServer() {
  const info = await apiRequest('/session');
  csrfToken = info.csrf;
  return info;
}
async function runAndRefresh(task) {
  const result = await task();
  await refreshFromServer();
  return result;
}
// Service adapter: the UI calls these functions, not raw SQL. Replace demo branches with Flask calls.
const Services = {
  async getProjects() { return DEMO_MODE ? state.projects : apiRequest(API_ROUTES.projects); },
  async register(payload) { return DEMO_MODE ? demoRegister(payload) : apiRequest(API_ROUTES.register, { method:"POST", body:JSON.stringify(payload) }); },
  async updateProfile(payload) { return DEMO_MODE ? demoUpdateProfile(payload) : apiRequest(API_ROUTES.profile, { method:"PUT", body:JSON.stringify(payload) }); },
  async createTeam(name) { return DEMO_MODE ? demoCreateTeam(name) : apiRequest(API_ROUTES.createTeam, { method:"POST", body:JSON.stringify({ team_name:name }) }); },
  async joinTeam(teamId) { return DEMO_MODE ? demoJoinTeam(teamId) : apiRequest(API_ROUTES.joinTeam.replace(":id",teamId), { method:"POST", body:JSON.stringify({}) }); },
  async leaveTeam(teamId) { return DEMO_MODE ? demoLeaveTeam(teamId) : apiRequest(API_ROUTES.leaveTeam.replace(":id",teamId), { method:"DELETE" }); },
  async createProject(payload) { return DEMO_MODE ? demoCreateProject(payload) : apiRequest(payload.type === "Charity" ? API_ROUTES.createCharityProject : API_ROUTES.createCommercialProject, { method:"POST", body:JSON.stringify(payload) }); },
  async updateProject(projectId, payload) { return DEMO_MODE ? demoUpdateProject(projectId,payload) : apiRequest(API_ROUTES.updateProject.replace(":id",projectId), { method:"PUT", body:JSON.stringify(payload) }); },
  async donate(projectId, amount) { return DEMO_MODE ? demoDonate(projectId,amount) : apiRequest(API_ROUTES.donate, { method:"POST", body:JSON.stringify({ project_id:projectId, donation_amount:amount }) }); },
  async moderate(projectId, decision, reason) { return DEMO_MODE ? demoModerate(projectId,decision,reason) : apiRequest(API_ROUTES.moderateProject.replace(":id",projectId), { method:"POST", body:JSON.stringify({ decision, rejection_reason:reason }) }); },
  async setUserActive(userId, active) { return DEMO_MODE ? demoSetUserActive(userId,active) : apiRequest(API_ROUTES.setUserActive.replace(":id",userId), { method:"PATCH", body:JSON.stringify({ is_active:active }) }); },
  async setLeader(teamId,userId) { return DEMO_MODE ? demoSetLeader(teamId,userId) : apiRequest(API_ROUTES.setLeader.replace(":id",teamId), { method:"PUT", body:JSON.stringify({ new_leader_user_id:userId }) }); },
  async removeMember(teamId,userId) { return DEMO_MODE ? demoRemoveMember(teamId,userId) : apiRequest(API_ROUTES.removeMember.replace(":id",teamId).replace(":userId",userId), { method:"DELETE" }); }
};
// In connected mode, every state-changing action refreshes SQL-backed page data.
for (const name of ["updateProfile", "createTeam", "joinTeam", "leaveTeam", "createProject", "updateProject", "donate", "moderate", "setUserActive", "setLeader", "removeMember"]) {
  const old = Services[name];
  Services[name] = (...args) => runAndRefresh(() => old(...args));
}
function demoRegister(payload) {
  if (state.users.some(user=>user.email.toLowerCase()===payload.email.toLowerCase())) throw new Error("An account with this email address already exists.");
  const user = { id:state.nextUserId++, ...payload, role:"RegisteredUser", active:true };
  delete user.password;
  state.users.push(user); audit("USER_REGISTERED","USER_",user.id,"New demo account registered."); saveState(); return user;
}
function demoUpdateProfile(payload) {
  const user = currentUser();
  if (state.users.some(other=>other.id!==user.id && other.email.toLowerCase()===payload.email.toLowerCase())) throw new Error("That email address is already in use.");
  Object.assign(user,payload); audit("PROFILE_UPDATED","USER_",user.id,"User profile updated."); saveState(); return user;
}
function demoCreateTeam(name) {
  if (state.teams.some(team=>team.name.toLowerCase()===name.toLowerCase())) throw new Error("A team with that name already exists.");
  const team = { id:state.nextTeamId++, name, created:todayISO(), leaderId:currentUser().id };
  state.teams.push(team); state.memberships.push([currentUser().id,team.id]); audit("TEAM_CREATED","TEAM",team.id,"Team created; creator assigned as leader."); saveState(); return team;
}
function demoJoinTeam(teamId) {
  if (!getTeam(teamId)) throw new Error("The selected team does not exist.");
  if (isMember(currentUser().id,teamId)) throw new Error("You are already a member of this team.");
  state.memberships.push([currentUser().id,Number(teamId)]); audit("TEAM_MEMBER_JOINED","TEAM_MEMBERSHIP",teamId,"User joined a team."); saveState();
}
function demoLeaveTeam(teamId) {
  const team = getTeam(teamId);
  if (!isMember(currentUser().id,teamId)) throw new Error("You are not a member of this team.");
  if (team.leaderId === currentUser().id) throw new Error("Appoint another team leader before leaving.");
  state.memberships = state.memberships.filter(pair=>!(pair[0]===currentUser().id && pair[1]===Number(teamId))); audit("TEAM_MEMBER_LEFT","TEAM_MEMBERSHIP",teamId,"User left a team."); saveState();
}
function demoCreateProject(payload) {
  if (!isMember(currentUser().id,payload.teamId)) throw new Error("You must belong to the selected team.");
  if (payload.closing < todayISO()) throw new Error("Closing date must be today or later.");
  const project = { id:state.nextProjectId++, posted:todayISO(), status:"Pending", approvedBy:null, approvalDate:null, rejectionReason:"", ...payload };
  state.projects.push(project);
  // Mirrors trg_NewProjectLog: one log row is created for each current team member.
  teamMembers(project.teamId).forEach(member => state.projectLog.push({ projectId:project.id, teamMemberId:member.id, projectDate:project.posted, description:project.description, dateLogged:todayISO() }));
  audit("PROJECT_CREATED","PROJECT",project.id,`${project.type} project submitted for moderator approval.`); saveState(); return project;
}
function demoUpdateProject(projectId,payload) {
  const project = getProject(projectId);
  if (!project || !isMember(currentUser().id,project.teamId)) throw new Error("Only a member of the project's team can edit it.");
  if (payload.target < totalRaised(project.id)) throw new Error("Target amount cannot be lower than the amount already raised.");
  const latestDonation = state.donations.filter(d=>d.projectId===project.id).reduce((max,d)=>d.date>max?d.date:max,project.posted);
  if (payload.closing < latestDonation) throw new Error("Closing date cannot be before an existing donation date.");
  Object.assign(project,payload); audit("PROJECT_UPDATED","PROJECT",project.id,"Project details updated by a team member."); saveState(); return project;
}
function demoDonate(projectId,amount) {
  const project = getProject(projectId);
  if (!currentUser()?.active) throw new Error("An active user account is required to donate.");
  if (!project || project.status !== "Approved") throw new Error("Donations are accepted only for approved projects.");
  if (project.closing < todayISO()) throw new Error("The project has passed its closing date.");
  if (amount <= 0) throw new Error("Donation amount must be greater than zero.");
  if (totalRaised(project.id)+amount > project.target) throw new Error("The donation would cause the project to exceed its funding target.");
  const number = Math.max(0,...state.donations.filter(d=>d.userId===currentUser().id).map(d=>d.number))+1;
  const donation = { userId:currentUser().id, number, projectId:project.id, date:todayISO(), amount };
  state.donations.push(donation); audit("DONATION_ADDED","DONATION",number,`Donation recorded for Project_ID ${project.id}; amount: ${amount}.`); saveState(); return donation;
}
function demoModerate(projectId,decision,reason) {
  if (!isModerator()) throw new Error("Moderator privileges are required.");
  const project = getProject(projectId);
  if (!project || project.status !== "Pending") throw new Error("Only pending projects can be moderated.");
  if (decision === "REJECT" && !reason.trim()) throw new Error("A reason is required when rejecting a project.");
  project.status = decision === "APPROVE" ? "Approved" : "Rejected"; project.approvedBy = currentUser()?.id || 99; project.approvalDate = new Date().toISOString(); project.rejectionReason = decision === "REJECT" ? reason : "";
  audit(decision === "APPROVE" ? "PROJECT_APPROVED" : "PROJECT_REJECTED","PROJECT",project.id,decision === "APPROVE" ? "Project approved for public display." : `Project rejected. Reason: ${reason}`); saveState();
}
function demoSetUserActive(userId,active) {
  if (!isModerator()) throw new Error("Moderator privileges are required.");
  const user = getUser(userId); if (!user) throw new Error("User account not found.");
  if (currentUser()?.id===user.id && !active) throw new Error("A moderator cannot deactivate their own account.");
  user.active=active; audit(active?"USER_ACTIVATED":"USER_DEACTIVATED","USER_",user.id,`User account ${active?"activated":"deactivated"}.`); saveState();
}
function demoSetLeader(teamId,userId) {
  const team=getTeam(teamId); if (!team) throw new Error("Team not found.");
  if (!(isModerator() || team.leaderId===currentUser()?.id)) throw new Error("Only the team leader or moderator can change leadership.");
  if (!isMember(userId,teamId)) throw new Error("The new leader must already belong to this team.");
  team.leaderId=Number(userId); audit("TEAM_LEADER_CHANGED","TEAM",team.id,`New leader assigned: ${fullName(getUser(userId))}.`); saveState();
}
function demoRemoveMember(teamId,userId) {
  const team=getTeam(teamId); if (!(isModerator() || team?.leaderId===currentUser()?.id)) throw new Error("Only the team leader or moderator can remove members.");
  if (team.leaderId===Number(userId)) throw new Error("Change the team leader before removing this member.");
  const before=state.memberships.length; state.memberships=state.memberships.filter(pair=>!(pair[0]===Number(userId)&&pair[1]===Number(teamId)));
  if (before===state.memberships.length) throw new Error("The selected user is not a member of this team.");
  audit("TEAM_MEMBER_REMOVED","TEAM_MEMBERSHIP",teamId,`${fullName(getUser(userId))} removed from ${team.name}.`); saveState();
}

/* Event delegation */
document.addEventListener("click", async event => {
  const actionEl = event.target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action, id = Number(actionEl.dataset.id);
  try {
    switch (action) {
      case "navigate": setPage(actionEl.dataset.page); break;
      case "view-project": selectedProjectId=id; setPage("project-detail"); break;
      case "view-team": selectedTeamId=id; setPage("team-detail"); break;
      case "create-project": createProjectForm(actionEl.dataset.team || ""); break;
      case "create-team": createTeamForm(); break;
      case "donate": donateForm(id); break;
      case "edit-project": editProjectForm(id); break;
      case "moderate-project": selectedProjectId=id; moderateProject(id); break;
      case "close-modal": closeModal(); break;
      case "join-team": if (requireUser()) { await Services.joinTeam(id); render(); showToast("You joined the team."); } break;
      case "leave-team": if (requireUser() && confirm("Leave this team?")) { await Services.leaveTeam(id); render(); showToast("You left the team."); } break;
      case "set-leader": await Services.setLeader(Number(actionEl.dataset.team),Number(actionEl.dataset.user)); render(); showToast("Team leader updated."); break;
      case "remove-member": if (confirm("Remove this member from the team?")) { await Services.removeMember(Number(actionEl.dataset.team),Number(actionEl.dataset.user)); render(); showToast("Team member removed."); } break;
      case "toggle-user": { const user=getUser(id); await Services.setUserActive(id,!user.active); render(); showToast(`Account ${user.active?"deactivated":"activated"}.`); break; }
      case "export-report": exportReportCSV(); break;
      default: break;
    }
  } catch (error) { showToast(error.message || "Something went wrong.","error"); }
});

document.addEventListener("submit", async event => {
  const form = event.target;
  if (!form.matches("form")) return;
  event.preventDefault(); const data = Object.fromEntries(new FormData(form).entries());
  try {
    if (form.id === "teamForm") {
      await Services.createTeam(data.name.trim()); closeModal(); render(); showToast("Team created. You are its first member and leader.");
    } else if (form.id === "projectForm") {
      const payload = { description:data.description.trim(), type:data.type, teamId:Number(data.teamId), target:Number(data.target), closing:data.closing, beneficiaries:data.type==="Charity"?data.beneficiaries.trim():"", profitMargin:data.type==="Commercial"?Number(data.profitMargin):null };
      if (!payload.description || payload.target<=0 || !payload.closing) throw new Error("Complete all required fields with valid values.");
      if (payload.type==="Commercial" && (payload.profitMargin<0 || payload.profitMargin>100)) throw new Error("Profit margin must be between 0 and 100.");
      await Services.createProject(payload); closeModal(); render(); showToast("Project submitted. It is pending moderator approval.");
    } else if (form.id === "editProjectForm") {
      await Services.updateProject(selectedProjectId,{description:data.description.trim(),target:Number(data.target),closing:data.closing}); closeModal(); render(); showToast("Project updated.");
    } else if (form.id === "donationForm") {
      const amount=Number(data.amount); await Services.donate(selectedProjectId,amount); closeModal(); render(); showToast("Donation recorded successfully (no payment collected).");
    } else if (form.id === "moderateForm") {
      await Services.moderate(selectedProjectId,data.decision,data.reason || ""); closeModal(); render(); showToast(data.decision === "APPROVE" ? "Project approved." : "Project rejected.");
    } else if (form.id === "profileForm") {
      await Services.updateProfile(data); render(); showToast("Profile updated.");
    } else if (form.id === "registerForm") {
      const result = await Services.register(data);
      csrfToken = result.csrf;
      await refreshFromServer(); setPage("dashboard"); showToast("Account created successfully.");
    } else if (form.id === "loginForm") {
      const result = await apiRequest(API_ROUTES.login, {method:"POST",body:JSON.stringify(data)});
      csrfToken = result.csrf;
      await refreshFromServer(); setPage(result.user.role === "Moderator" ? "moderator" : "dashboard");
      showToast("Signed in successfully.");
    }
  } catch (error) { showToast(error.message || "Unable to complete the action.","error"); }
});

document.addEventListener("input", event => {
  if (event.target.id === "projectSearch") {
    projectFilters.query=event.target.value;
    const cursor=event.target.selectionStart;
    const temp=document.createElement("div"); temp.innerHTML=renderProjects();
    const next=temp.querySelector("#projectGrid"); $("#projectGrid").innerHTML=next.innerHTML;
    event.target.focus(); event.target.setSelectionRange(cursor,cursor);
  }
});
document.addEventListener("change", event => {
  if (event.target.id === "projectTypeFilter") { projectFilters.type=event.target.value; render(); }
  if (event.target.id === "projectStatusFilter") { projectFilters.status=event.target.value; render(); }

});
$("#mobileMenuButton").addEventListener("click", () => {
  const nav=$("#mainNav"); const open=nav.classList.toggle("open"); $("#mobileMenuButton").setAttribute("aria-expanded",String(open));
});
$("#accountButton").addEventListener("click", () => setPage(isModerator()?"moderator":isVisitor()?"login":"dashboard"));
$("#footerYear").textContent=new Date().getFullYear();

function exportReportCSV() {
  const headers=["Project ID","Project","Team","Type","Status","Target Amount","Amount Raised","Amount Remaining","Donation Count"];
  const rows=state.projects.map(p=>[p.id,p.description,teamName(p.teamId),p.type,p.status,p.target,totalRaised(p.id),Math.max(0,p.target-totalRaised(p.id)),donationCount(p.id)]);
  const csv=[headers,...rows].map(row=>row.map(value=>`"${String(value??"").replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download="newcorp_project_funding_report.csv"; link.click(); URL.revokeObjectURL(url);
  showToast("Report exported as CSV.");
}

// Header navigation is separate from the data-action buttons.
document.addEventListener("click", event => {
  const link = event.target.closest("a[data-nav], a.brand[href^='#']");
  if (!link) return;
  event.preventDefault();
  const page = link.dataset.nav || "home";
  if (location.hash !== `#${page}`) location.hash = page;
  else setPage(page);
  $("#mainNav")?.classList.remove("open");
  $("#mobileMenuButton")?.setAttribute("aria-expanded", "false");
});
window.addEventListener("hashchange", () => {
  const requested = location.hash.slice(1);
  if (["home","projects","teams","reports","dashboard","donations","moderator","users","audit","profile","login","register"].includes(requested)) setPage(requested);
});

// Real authentication, no browser-side role impersonation.
document.addEventListener("click", async event => {
  if (!event.target.closest('[data-action="logout"]')) return;
  try {
    const answer = await apiRequest(API_ROUTES.logout, {method:"POST",body:"{}"});
    csrfToken = answer.csrf;
    await refreshFromServer(); setPage("home"); showToast("Signed out.");
  } catch (error) { showToast(error.message, "error"); }
});

async function startApp() {
  try {
    await sessionFromServer();
    await refreshFromServer();
    const hash = location.hash.slice(1);
    if (["home","projects","teams","reports","dashboard","donations","moderator","users","audit","profile","login","register"].includes(hash)) setPage(hash);
    serverReady = true;
  } catch (error) {
    console.error(error);
    $("#app").innerHTML = `<div class="card card-pad"><h2>Cannot connect to NEWCORP</h2><p class="muted">${escapeHTML(error.message)}</p><p>Check that Flask is running and the SQL connection is configured. Reload after fixing the issue.</p></div>`;
  }
}
startApp();
