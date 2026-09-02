const app = document.getElementById("app");
const nav = document.getElementById("nav");

const state = {
    token: localStorage.getItem("nys_token"),
    user: JSON.parse(
        localStorage.getItem("nys_user") || "null"
    )
};

// ========================================
// API
// ========================================

async function api(url, options = {}) {
    options.headers = {
        ...(options.headers || {}),
        "Content-Type": "application/json"
    };

    if (state.token) {
        options.headers.Authorization =
            "Bearer " + state.token;
    }

    const response = await fetch(url, options);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Request failed"
        );
    }

    return data;
}

// ========================================
// SESSION
// ========================================

function setSession(data) {
    state.token = data.token;
    state.user = data.user;

    localStorage.setItem(
        "nys_token",
        data.token
    );

    localStorage.setItem(
        "nys_user",
        JSON.stringify(data.user)
    );
}

// ========================================
// NAVIGATION
// ========================================

function layoutNav() {
    if (state.user) {
        nav.innerHTML = `
            <button onclick="dashboard()">Dashboard</button>
            <button onclick="logout()">Logout</button>
        `;
    } else {
        nav.innerHTML = `
            <button onclick="home()">Home</button>
            <button onclick="login()">Login</button>
            <button onclick="register()">Register</button>
        `;
    }
}

// ========================================
// HOME
// ========================================

function home() {
    layoutNav();

    app.innerHTML = `
        <section class="hero">

            <div>
                <span class="hero-badge">
                    AI-Powered Public Safety Platform
                </span>

                <h1>
                    Your Voice.<br>
                    Your Rights.<br>
                    Your Digital Path to Justice.
                </h1>

                <p>
                    NyayaShieldAI enables citizens to securely
                    submit complaints while helping authorities
                    prioritize cases through intelligent risk analysis.
                </p>

                <div class="hero-actions">
                    <button class="btn" onclick="register()">
                        Create Citizen Account
                    </button>

                    <button class="btn secondary" onclick="login()">
                        Secure Login
                    </button>
                </div>
            </div>

        </section>


        <div class="feature-grid">

            <div class="feature-card">
                <div class="feature-icon">🤖</div>
                <h3>AI Risk Intelligence</h3>
                <p>
                    Intelligent analysis helps prioritize
                    potentially urgent complaints.
                </p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">🔐</div>
                <h3>Secure Access</h3>
                <p>
                    Role-based access for citizens,
                    authorities and administrators.
                </p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">📍</div>
                <h3>Complaint Tracking</h3>
                <p>
                    Track complaint progress using
                    a unique NyayaShield ID.
                </p>
            </div>

            <div class="feature-card">
                <div class="feature-icon">📊</div>
                <h3>System Intelligence</h3>
                <p>
                    Administrators can monitor complaints,
                    risk levels and performance.
                </p>
            </div>

        </div>


        <div class="card tracking-card">

            <h2>🔍 Track Complaint</h2>

            <p class="muted">
                Enter your NyayaShield Complaint ID.
            </p>

            <div class="track-flex">

                <input
                    id="trackId"
                    placeholder="Example: NYS-2026-ABC123"
                >

                <button
                    class="btn"
                    onclick="trackComplaint()"
                >
                    Track
                </button>

            </div>

            <div id="trackResult"></div>

        </div>
    `;
}

// ========================================
// REGISTER
// ========================================

function register() {
    layoutNav();

    app.innerHTML = `
        <div class="auth-container">

            <div class="card auth-card">

                <div class="auth-title">
                    <div class="big-icon">🛡️</div>

                    <h2>Create Citizen Account</h2>

                    <p>
                        Register securely to access
                        NyayaShieldAI services.
                    </p>
                </div>

                <div id="msg"></div>

                <label>Full Name</label>

                <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                >


                <label>Email Address</label>

                <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                >


                <label>Password</label>

                <input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                >


                <button
                    class="btn full-btn"
                    onclick="doRegister()"
                >
                    Create Account
                </button>


                <p class="center">

                    Already registered?

                    <a
                        href="#"
                        onclick="login(); return false;"
                    >
                        Login
                    </a>

                </p>

            </div>

        </div>
    `;
}

async function doRegister() {
    const messageBox = document.getElementById("msg");

    try {
        const userName =
            document.getElementById("name").value.trim();

        const userEmail =
            document.getElementById("email").value.trim();

        const userPassword =
            document.getElementById("password").value;

        if (!userName || !userEmail || !userPassword) {
            messageBox.innerHTML = `
                <div class="message error">
                    Please fill Name, Email and Password.
                </div>
            `;
            return;
        }

        const response = await api(
            "/api/auth/register",
            {
                method: "POST",
                body: JSON.stringify({
                    name: userName,
                    email: userEmail,
                    password: userPassword
                })
            }
        );

        messageBox.innerHTML = `
            <div class="message success">
                ${escapeHTML(response.message)}
            </div>
        `;

        setTimeout(login, 1200);

    } catch (error) {
        messageBox.innerHTML = `
            <div class="message error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

// ========================================
// LOGIN
// ========================================

function login() {
    layoutNav();

    app.innerHTML = `
        <div class="auth-container">

            <div class="card auth-card">

                <div class="auth-title">
                    <div class="big-icon">🔐</div>

                    <h2>Secure Login</h2>

                    <p>
                        Select your NyayaShield portal.
                    </p>
                </div>

                <div id="msg"></div>


                <label>Select Portal</label>

                <select id="role">

                    <option value="USER">
                        👤 Citizen Portal
                    </option>

                    <option value="AUTHORITY">
                        🏛️ Authority Portal
                    </option>

                    <option value="ADMIN">
                        👨‍💼 Admin Portal
                    </option>

                </select>


                <label>Email</label>

                <input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                >


                <label>Password</label>

                <input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                >


                <button
                    class="btn full-btn"
                    onclick="doLogin()"
                >
                    Login Securely
                </button>


                <div class="demo-box">

                    <b>Demo Credentials</b>

                    <p>
                        Authority:<br>
                        authority@nyayashield.local
                    </p>

                    <p>
                        Admin:<br>
                        admin@nyayashield.local
                    </p>

                </div>

            </div>

        </div>
    `;
}

async function doLogin() {
    const messageBox = document.getElementById("msg");

    try {
        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const role =
            document.getElementById("role").value;

        if (!email || !password) {
            messageBox.innerHTML = `
                <div class="message error">
                    Enter email and password.
                </div>
            `;
            return;
        }

        const response = await api(
            "/api/auth/login",
            {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                    role
                })
            }
        );

        setSession(response);

        dashboard();

    } catch (error) {
        messageBox.innerHTML = `
            <div class="message error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

// ========================================
// LOGOUT
// ========================================

async function logout() {
    try {
        await api(
            "/api/auth/logout",
            {
                method: "POST"
            }
        );
    } catch {}

    state.token = null;
    state.user = null;

    localStorage.removeItem("nys_token");
    localStorage.removeItem("nys_user");

    home();
}

// ========================================
// DASHBOARD ROUTER
// ========================================

function dashboard() {
    if (!state.user) {
        login();
        return;
    }

    layoutNav();

    if (state.user.role === "USER") {
        citizenDashboard();
    } else if (state.user.role === "AUTHORITY") {
        authorityDashboard();
    } else if (state.user.role === "ADMIN") {
        adminDashboard();
    }
}

// ========================================
// CITIZEN DASHBOARD
// ========================================

function citizenDashboard() {
    app.innerHTML = `
        <div class="dashboard-header">

            <div>
                <span class="portal-tag">CITIZEN PORTAL</span>

                <h1>
                    Welcome, ${escapeHTML(state.user.name)}
                </h1>

                <p class="muted">
                    Manage and track your complaints.
                </p>
            </div>

        </div>


        <div class="feature-grid">

            <div class="feature-card">

                <div class="feature-icon">📝</div>

                <h3>File Complaint</h3>

                <p>
                    Submit a new complaint securely.
                </p>

                <button
                    class="btn"
                    onclick="fileComplaint()"
                >
                    File Now
                </button>

            </div>


            <div class="feature-card">

                <div class="feature-icon">📂</div>

                <h3>My Complaints</h3>

                <p>
                    View all submitted complaints.
                </p>

                <button
                    class="btn"
                    onclick="myComplaints()"
                >
                    View Cases
                </button>

            </div>


            <div class="feature-card">

                <div class="feature-icon">🔍</div>

                <h3>Track Complaint</h3>

                <p>
                    Check your complaint progress.
                </p>

                <button
                    class="btn"
                    onclick="showTracking()"
                >
                    Track
                </button>

            </div>

        </div>
    `;
}

// ========================================
// FILE COMPLAINT
// ========================================

function fileComplaint() {
    layoutNav();

    app.innerHTML = `
        <div class="card form-card">

            <h2>📝 File a Complaint</h2>

            <p class="muted">
                Provide accurate information.
                The system will perform AI-assisted risk analysis.
            </p>

            <div id="msg"></div>


            <label>Complaint Category</label>

            <select id="category">
                <option value="">Select Category</option>
                <option value="Cyber Crime">Cyber Crime</option>
                <option value="Financial Fraud">Financial Fraud</option>
                <option value="Online Harassment">Online Harassment</option>
                <option value="Workplace Harassment">Workplace Harassment</option>
                <option value="Women's Safety">Women's Safety</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Other">Other</option>
            </select>


            <label>Location</label>

            <input
                id="location"
                placeholder="Location (optional)"
            >


            <label>Complaint Description</label>

            <textarea
                id="description"
                placeholder="Describe the incident clearly..."
            ></textarea>


            <label class="checkbox-label">

                <input
                    id="anonymous"
                    type="checkbox"
                >

                Submit anonymously

            </label>


            <div class="button-row">

                <button
                    class="btn"
                    onclick="submitComplaint()"
                >
                    Submit Complaint
                </button>

                <button
                    class="btn secondary"
                    onclick="dashboard()"
                >
                    Cancel
                </button>

            </div>

        </div>
    `;
}

async function submitComplaint() {
    const messageBox = document.getElementById("msg");

    try {
        const category =
            document.getElementById("category").value;

        const location =
            document.getElementById("location").value.trim();

        const description =
            document.getElementById("description").value.trim();

        const anonymous =
            document.getElementById("anonymous").checked;

        if (!category || !description) {
            throw new Error(
                "Category and complaint description are required"
            );
        }

        const response = await api(
            "/api/complaints",
            {
                method: "POST",
                body: JSON.stringify({
                    category,
                    location,
                    description,
                    anonymous
                })
            }
        );

        const complaint = response.complaint;

        messageBox.innerHTML = `
            <div class="message success">

                <h3>✅ Complaint Submitted Successfully</h3>

                <p>
                    <b>Complaint ID:</b>
                    ${complaint.id}
                </p>

                <p>
                    <b>AI Risk Level:</b>
                    <span class="risk ${complaint.ai.risk}">
                        ${complaint.ai.risk}
                    </span>
                </p>

                <p>
                    <b>Priority:</b>
                    ${complaint.ai.priority}
                </p>

                <button
                    class="btn"
                    onclick="myComplaints()"
                >
                    View My Complaints
                </button>

            </div>
        `;

    } catch (error) {
        messageBox.innerHTML = `
            <div class="message error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

// ========================================
// MY COMPLAINTS
// ========================================

async function myComplaints() {
    layoutNav();

    app.innerHTML = `
        <h2>📂 My Complaints</h2>
        <div id="complaints">Loading...</div>
    `;

    try {
        const response =
            await api("/api/complaints/my");

        const container =
            document.getElementById("complaints");

        if (!response.complaints.length) {
            container.innerHTML = `
                <div class="card">
                    No complaints submitted yet.
                </div>
            `;
            return;
        }

        container.innerHTML =
            response.complaints
                .map(complaintCard)
                .join("");

    } catch (error) {
        document.getElementById("complaints").innerHTML = `
            <div class="message error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

function complaintCard(complaint) {
    return `
        <div class="card complaint">

            <div class="complaint-top">

                <div>
                    <span class="portal-tag">
                        ${escapeHTML(complaint.category)}
                    </span>

                    <h3>${complaint.id}</h3>
                </div>

                <span class="risk ${complaint.ai.risk}">
                    ${complaint.ai.risk} RISK
                </span>

            </div>

            <p>
                <b>Status:</b>
                <span class="status">
                    ${escapeHTML(complaint.status)}
                </span>
            </p>

            <p>
                AI Score: ${complaint.ai.score}/100
            </p>

            <p class="muted">
                Submitted: ${formatDate(complaint.createdAt)}
            </p>

        </div>
    `;
}

// ========================================
// TRACKING
// ========================================

function showTracking() {
    layoutNav();

    app.innerHTML = `
        <div class="card form-card">

            <h2>🔍 Track Complaint</h2>

            <input
                id="trackId"
                placeholder="Enter Complaint ID"
            >

            <button
                class="btn"
                onclick="trackComplaint()"
            >
                Track Complaint
            </button>

            <div id="trackResult"></div>

        </div>
    `;
}

async function trackComplaint() {
    const input =
        document.getElementById("trackId");

    const result =
        document.getElementById("trackResult");

    const id =
        input.value.trim().toUpperCase();

    if (!id) {
        result.innerHTML = `
            <div class="message error">
                Enter a Complaint ID.
            </div>
        `;
        return;
    }

    try {
        const response =
            await api(
                "/api/track/" +
                encodeURIComponent(id)
            );

        const complaint = response.complaint;

        result.innerHTML = `
            <div class="card tracking-result">

                <h3>Complaint Status</h3>

                <p><b>ID:</b> ${complaint.id}</p>

                <p>
                    <b>Category:</b>
                    ${escapeHTML(complaint.category)}
                </p>

                <p>
                    <b>Status:</b>
                    ${escapeHTML(complaint.status)}
                </p>

                <p>
                    <b>Risk:</b>
                    <span class="risk ${complaint.risk}">
                        ${complaint.risk}
                    </span>
                </p>

                <p>
                    <b>Priority:</b>
                    ${complaint.priority}
                </p>

                <p class="muted">
                    Last Updated:
                    ${formatDate(complaint.updatedAt)}
                </p>

            </div>
        `;

    } catch (error) {
        result.innerHTML = `
            <div class="message error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

// ========================================
// AUTHORITY DASHBOARD
// ========================================

async function authorityDashboard() {
    layoutNav();

    app.innerHTML = `
        <div class="dashboard-header">

            <div>
                <span class="portal-tag">
                    AUTHORITY PORTAL
                </span>

                <h1>🏛️ Case Management Center</h1>

                <p class="muted">
                    Review and manage citizen complaints.
                </p>
            </div>

            <button
                class="btn"
                onclick="authorityDashboard()"
            >
                Refresh
            </button>

        </div>

        <div id="authorityComplaints">
            Loading complaints...
        </div>
    `;

    try {
        const response =
            await api("/api/authority/complaints");

        const complaints =
            response.complaints;

        const container =
            document.getElementById(
                "authorityComplaints"
            );

        if (!complaints.length) {
            container.innerHTML = `
                <div class="card">
                    No complaints available.
                </div>
            `;
            return;
        }

        const riskOrder = {
            HIGH: 1,
            MEDIUM: 2,
            LOW: 3
        };

        complaints.sort(
            (a, b) =>
                riskOrder[a.ai.risk] -
                riskOrder[b.ai.risk]
        );

        container.innerHTML =
            complaints.map(authorityCard).join("");

    } catch (error) {
        document.getElementById(
            "authorityComplaints"
        ).innerHTML = `
            <div class="message error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

function authorityCard(complaint) {
    return `
        <div class="card complaint">

            <div class="complaint-top">

                <div>
                    <span class="portal-tag">
                        ${escapeHTML(complaint.category)}
                    </span>

                    <h3>${complaint.id}</h3>
                </div>

                <span class="risk ${complaint.ai.risk}">
                    ${complaint.ai.risk}
                </span>

            </div>

            <p>
                <b>Reporter:</b>
                ${escapeHTML(complaint.reporterName)}
            </p>

            <p>
                <b>Location:</b>
                ${escapeHTML(complaint.location)}
            </p>

            <p>
                <b>Description:</b><br>
                ${escapeHTML(complaint.description)}
            </p>

            <p>
                <b>AI Score:</b>
                ${complaint.ai.score}/100
            </p>

            <p>
                <b>Priority:</b>
                ${complaint.ai.priority}
            </p>

            <label>Update Case Status</label>

            <select id="status-${complaint.id}">
                ${statusOptions(complaint.status)}
            </select>

            <button
                class="btn"
                onclick="updateComplaintStatus('${complaint.id}')"
            >
                Update Status
            </button>

        </div>
    `;
}

function statusOptions(currentStatus) {
    const statuses = [
        "SUBMITTED",
        "UNDER_REVIEW",
        "ASSIGNED",
        "INVESTIGATION_IN_PROGRESS",
        "RESOLVED",
        "CLOSED"
    ];

    return statuses.map(status => `
        <option
            value="${status}"
            ${status === currentStatus ? "selected" : ""}
        >
            ${status}
        </option>
    `).join("");
}

async function updateComplaintStatus(id) {
    try {
        const status =
            document.getElementById(
                "status-" + id
            ).value;

        await api(
            "/api/authority/complaints/" + id,
            {
                method: "PATCH",
                body: JSON.stringify({ status })
            }
        );

        authorityDashboard();

    } catch (error) {
        alert(error.message);
    }
}

// ========================================
// ADMIN DASHBOARD
// ========================================

async function adminDashboard() {
    layoutNav();

    app.innerHTML = `
        <div class="dashboard-header">

            <div>

                <span class="portal-tag">
                    ADMIN COMMAND CENTER
                </span>

                <h1>🛡️ System Intelligence Dashboard</h1>

                <p class="muted">
                    Monitor users, complaints,
                    risks and authority performance.
                </p>

            </div>

            <button
                class="btn"
                onclick="adminDashboard()"
            >
                🔄 Refresh
            </button>

        </div>

        <div id="adminContent">
            Loading analytics...
        </div>
    `;

    try {
        const data =
            await api("/api/admin/dashboard");

        const o = data.overview;
        const s = data.statusAnalytics;

        document.getElementById("adminContent").innerHTML = `

            <div class="stats-grid">

                ${statCard("👥", o.totalUsers, "Registered Citizens")}

                ${statCard("🏛️", o.totalAuthorities, "Authorities")}

                ${statCard("📋", o.totalComplaints, "Total Complaints")}

                ${statCard("🚨", o.highRiskCases, "High-Risk Cases", "danger")}

                ${statCard("⚠️", o.mediumRiskCases, "Medium-Risk Cases", "warning")}

                ${statCard("✅", o.lowRiskCases, "Low-Risk Cases", "success")}

                ${statCard("📈", o.resolutionRate + "%", "Resolution Rate")}

            </div>


            <div class="card admin-section">

                <h2>📊 Complaint Status Analytics</h2>

                <div class="analytics-grid">

                    ${analyticsBox("Submitted", s.submitted)}

                    ${analyticsBox("Under Review", s.underReview)}

                    ${analyticsBox("Assigned", s.assigned)}

                    ${analyticsBox("Investigation", s.investigation)}

                    ${analyticsBox("Resolved", s.resolved)}

                    ${analyticsBox("Closed", s.closed)}

                </div>

            </div>


            <div class="card admin-section">

                <h2>🚨 AI Risk Distribution</h2>

                ${riskBar(
                    "High Risk",
                    o.highRiskCases,
                    o.totalComplaints,
                    "high"
                )}

                ${riskBar(
                    "Medium Risk",
                    o.mediumRiskCases,
                    o.totalComplaints,
                    "medium"
                )}

                ${riskBar(
                    "Low Risk",
                    o.lowRiskCases,
                    o.totalComplaints,
                    "low"
                )}

            </div>


            <div class="card admin-section">

                <h2>📂 Complaint Categories</h2>

                ${categoryHTML(data.categoryAnalytics)}

            </div>


            <div class="card admin-section">

                <h2>🏛️ Authority Performance</h2>

                ${authorityPerformanceHTML(
                    data.authorityPerformance
                )}

            </div>

        `;

    } catch (error) {
        document.getElementById("adminContent").innerHTML = `
            <div class="message error">
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}

// ========================================
// ADMIN HELPERS
// ========================================

function statCard(icon, value, label, type = "") {
    return `
        <div class="stat-card ${type}">

            <div class="stat-icon">
                ${icon}
            </div>

            <div>

                <div class="stat-number">
                    ${value}
                </div>

                <div class="stat-label">
                    ${label}
                </div>

            </div>

        </div>
    `;
}

function analyticsBox(title, value) {
    return `
        <div class="analytics-box">

            <div class="analytics-number">
                ${value}
            </div>

            <div class="analytics-label">
                ${title}
            </div>

        </div>
    `;
}

function riskBar(title, value, total, type) {
    const percentage =
        total > 0
            ? Math.round((value / total) * 100)
            : 0;

    return `
        <div class="risk-row">

            <div class="risk-title">

                <span>${title}</span>

                <b>${value} (${percentage}%)</b>

            </div>

            <div class="progress-container">

                <div
                    class="progress-bar ${type}"
                    style="width:${percentage}%"
                ></div>

            </div>

        </div>
    `;
}

function categoryHTML(categories) {
    const entries = Object.entries(categories);

    if (!entries.length) {
        return `<p class="muted">No data available.</p>`;
    }

    return `
        <div class="category-list">

            ${entries.map(([name, count]) => `
                <div class="category-row">

                    <span>
                        ${escapeHTML(name)}
                    </span>

                    <b>${count}</b>

                </div>
            `).join("")}

        </div>
    `;
}

function authorityPerformanceHTML(authorities) {
    if (!authorities.length) {
        return `
            <p class="muted">
                No authority accounts available.
            </p>
        `;
    }

    return `
        <div class="table-container">

            <table>

                <thead>

                    <tr>
                        <th>Authority</th>
                        <th>Assigned</th>
                        <th>Active</th>
                        <th>Resolved</th>
                        <th>Performance</th>
                    </tr>

                </thead>

                <tbody>

                    ${authorities.map(authority => `
                        <tr>

                            <td>

                                <b>
                                    ${escapeHTML(authority.name)}
                                </b>

                                <br>

                                <span class="muted">
                                    ${escapeHTML(authority.email)}
                                </span>

                            </td>

                            <td>
                                ${authority.assignedCases}
                            </td>

                            <td>
                                ${authority.activeCases}
                            </td>

                            <td>
                                ${authority.resolvedCases}
                            </td>

                            <td>

                                <span class="performance-badge">

                                    ${authority.performanceRate}%

                                </span>

                            </td>

                        </tr>
                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}

// ========================================
// UTILITIES
// ========================================

function formatDate(date) {
    return new Date(date).toLocaleString();
}

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ========================================
// START
// ========================================

if (state.user) {
    dashboard();
} else {
    home();
}