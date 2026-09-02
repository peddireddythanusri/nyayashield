const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 4000;
const ROOT = __dirname;

const DATA_DIR = path.join(ROOT, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// ========================================
// DATABASE
// ========================================

function ensureDatabase() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(
                {
                    users: [],
                    complaints: [],
                    sessions: []
                },
                null,
                2
            )
        );
    }
}

function readDB() {
    ensureDatabase();

    try {
        return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (error) {
        return {
            users: [],
            complaints: [],
            sessions: []
        };
    }
}

function writeDB(db) {
    ensureDatabase();

    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(db, null, 2)
    );
}

// ========================================
// RESPONSE
// ========================================

function json(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify(data));
}

// ========================================
// PASSWORD SECURITY
// ========================================

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    const hash = crypto
        .scryptSync(password, salt, 64)
        .toString("hex");

    return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
    try {
        const [salt, originalHash] = storedPassword.split(":");

        const newHash = crypto
            .scryptSync(password, salt, 64)
            .toString("hex");

        return crypto.timingSafeEqual(
            Buffer.from(originalHash, "hex"),
            Buffer.from(newHash, "hex")
        );
    } catch {
        return false;
    }
}

// ========================================
// REQUEST BODY
// ========================================

function getBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";

        req.on("data", chunk => {
            data += chunk;

            if (data.length > 2 * 1024 * 1024) {
                reject(new Error("Request too large"));
                req.destroy();
            }
        });

        req.on("end", () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch {
                reject(new Error("Invalid request data"));
            }
        });
    });
}

// ========================================
// AUTHENTICATION
// ========================================

function getToken(req) {
    const header = req.headers.authorization || "";

    if (header.startsWith("Bearer ")) {
        return header.substring(7);
    }

    return null;
}

function getCurrentUser(req, db) {
    const token = getToken(req);

    if (!token) return null;

    const session = db.sessions.find(
        session => session.token === token
    );

    if (!session) return null;

    return db.users.find(
        user => user.id === session.userId
    ) || null;
}

function requireRole(req, res, db, allowedRoles) {
    const user = getCurrentUser(req, db);

    if (!user || !allowedRoles.includes(user.role)) {
        json(res, 401, {
            error: "Unauthorized access"
        });

        return null;
    }

    return user;
}

// ========================================
// ID GENERATION
// ========================================

function createId(prefix) {
    const year = new Date().getFullYear();

    const random = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

    return `${prefix}-${year}-${random}`;
}

// ========================================
// AI RISK ANALYSIS
// ========================================

function analyzeComplaint(description, category) {
    const text = `${description} ${category}`.toLowerCase();

    const highRiskWords = [
        "kill",
        "murder",
        "rape",
        "assault",
        "weapon",
        "gun",
        "bomb",
        "attack",
        "life threat",
        "immediate danger",
        "kidnap",
        "abduction",
        "violence"
    ];

    const mediumRiskWords = [
        "harassment",
        "stalking",
        "fraud",
        "scam",
        "blackmail",
        "threat",
        "bullying",
        "abuse",
        "cybercrime",
        "cyber crime"
    ];

    let score = 15;
    const indicators = [];

    highRiskWords.forEach(word => {
        if (text.includes(word)) {
            score += 18;
            indicators.push(word);
        }
    });

    mediumRiskWords.forEach(word => {
        if (text.includes(word)) {
            score += 9;
            indicators.push(word);
        }
    });

    if (description.length > 500) {
        score += 5;
    }

    score = Math.min(score, 100);

    let risk = "LOW";
    let priority = "NORMAL";

    if (score >= 60) {
        risk = "HIGH";
        priority = "URGENT";
    } else if (score >= 35) {
        risk = "MEDIUM";
        priority = "PRIORITY";
    }

    return {
        score,
        risk,
        priority,
        indicators: [...new Set(indicators)]
    };
}

// ========================================
// DEFAULT ADMIN & AUTHORITY
// ========================================

function createDefaultAccounts() {
    const db = readDB();

    const defaults = [
        {
            id: "AUT-001",
            name: "NyayaShield Authority",
            email: "authority@nyayashield.local",
            password: "Authority@123",
            role: "AUTHORITY"
        },
        {
            id: "ADM-001",
            name: "NyayaShield Administrator",
            email: "admin@nyayashield.local",
            password: "Admin@123",
            role: "ADMIN"
        }
    ];

    let changed = false;

    defaults.forEach(account => {
        const exists = db.users.some(
            user => user.email === account.email
        );

        if (!exists) {
            db.users.push({
                id: account.id,
                name: account.name,
                email: account.email,
                password: hashPassword(account.password),
                role: account.role,
                createdAt: new Date().toISOString()
            });

            changed = true;
        }
    });

    if (changed) {
        writeDB(db);
    }
}

// ========================================
// STATIC FILES
// ========================================

function serveStatic(res, pathname) {
    let filename = pathname === "/"
        ? "index.html"
        : pathname.replace(/^\//, "");

    const filePath = path.join(ROOT, "public", filename);

    if (!filePath.startsWith(path.join(ROOT, "public"))) {
        return false;
    }

    if (!fs.existsSync(filePath)) {
        return false;
    }

    const extension = path.extname(filePath);

    const contentTypes = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json"
    };

    res.writeHead(200, {
        "Content-Type": contentTypes[extension] || "text/plain"
    });

    fs.createReadStream(filePath).pipe(res);

    return true;
}

// ========================================
// STARTUP
// ========================================

ensureDatabase();
createDefaultAccounts();

// ========================================
// SERVER
// ========================================

const server = http.createServer(async (req, res) => {
    const url = new URL(
        req.url,
        `http://${req.headers.host}`
    );

    const pathname = url.pathname;

    try {

        // ========================================
        // REGISTER CITIZEN
        // ========================================

        if (
            req.method === "POST" &&
            pathname === "/api/auth/register"
        ) {
            const body = await getBody(req);

            const name = String(body.name || "").trim();
            const email = String(body.email || "")
                .trim()
                .toLowerCase();
            const password = String(body.password || "");

            if (!name || !email || !password) {
                return json(res, 400, {
                    error: "Name, email and password are required"
                });
            }

            if (!email.includes("@")) {
                return json(res, 400, {
                    error: "Please enter a valid email address"
                });
            }

            if (password.length < 6) {
                return json(res, 400, {
                    error: "Password must contain at least 6 characters"
                });
            }

            const db = readDB();

            const exists = db.users.some(
                user => user.email === email
            );

            if (exists) {
                return json(res, 409, {
                    error: "This email is already registered"
                });
            }

            db.users.push({
                id: createId("USR"),
                name,
                email,
                password: hashPassword(password),
                role: "USER",
                createdAt: new Date().toISOString()
            });

            writeDB(db);

            return json(res, 201, {
                message: "Registration successful. Please login."
            });
        }

        // ========================================
        // LOGIN
        // ========================================

        if (
            req.method === "POST" &&
            pathname === "/api/auth/login"
        ) {
            const body = await getBody(req);

            const email = String(body.email || "")
                .trim()
                .toLowerCase();

            const password = String(body.password || "");
            const role = String(body.role || "");

            const db = readDB();

            const user = db.users.find(
                item => item.email === email
            );

            if (!user || !verifyPassword(password, user.password)) {
                return json(res, 401, {
                    error: "Invalid email or password"
                });
            }

            if (role && user.role !== role) {
                return json(res, 403, {
                    error: "Please select the correct portal"
                });
            }

            const token = crypto
                .randomBytes(32)
                .toString("hex");

            db.sessions = db.sessions.filter(
                session => session.userId !== user.id
            );

            db.sessions.push({
                token,
                userId: user.id,
                createdAt: new Date().toISOString()
            });

            writeDB(db);

            return json(res, 200, {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }

        // ========================================
        // LOGOUT
        // ========================================

        if (
            req.method === "POST" &&
            pathname === "/api/auth/logout"
        ) {
            const db = readDB();
            const token = getToken(req);

            db.sessions = db.sessions.filter(
                session => session.token !== token
            );

            writeDB(db);

            return json(res, 200, {
                message: "Logged out successfully"
            });
        }

        // ========================================
        // CREATE COMPLAINT
        // ========================================

        if (
            req.method === "POST" &&
            pathname === "/api/complaints"
        ) {
            const db = readDB();

            const user = requireRole(
                req,
                res,
                db,
                ["USER"]
            );

            if (!user) return;

            const body = await getBody(req);

            const category = String(body.category || "").trim();
            const description = String(body.description || "").trim();
            const location = String(body.location || "").trim();
            const anonymous = Boolean(body.anonymous);

            if (!category || !description) {
                return json(res, 400, {
                    error: "Category and description are required"
                });
            }

            const ai = analyzeComplaint(
                description,
                category
            );

            const complaint = {
                id: createId("NYS"),
                userId: user.id,
                reporterName: anonymous
                    ? "Anonymous Citizen"
                    : user.name,
                category,
                description,
                location: location || "Not provided",
                anonymous,
                status: "SUBMITTED",
                assignedTo: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ai
            };

            db.complaints.unshift(complaint);

            writeDB(db);

            return json(res, 201, {
                message: "Complaint submitted successfully",
                complaint
            });
        }

        // ========================================
        // CITIZEN COMPLAINTS
        // ========================================

        if (
            req.method === "GET" &&
            pathname === "/api/complaints/my"
        ) {
            const db = readDB();

            const user = requireRole(
                req,
                res,
                db,
                ["USER"]
            );

            if (!user) return;

            const complaints = db.complaints.filter(
                complaint => complaint.userId === user.id
            );

            return json(res, 200, {
                complaints
            });
        }

        // ========================================
        // TRACK COMPLAINT
        // ========================================

        if (
            req.method === "GET" &&
            pathname.startsWith("/api/track/")
        ) {
            const complaintId = decodeURIComponent(
                pathname.split("/").pop()
            ).toUpperCase();

            const db = readDB();

            const complaint = db.complaints.find(
                item => item.id === complaintId
            );

            if (!complaint) {
                return json(res, 404, {
                    error: "Complaint ID not found"
                });
            }

            return json(res, 200, {
                complaint: {
                    id: complaint.id,
                    category: complaint.category,
                    status: complaint.status,
                    risk: complaint.ai.risk,
                    priority: complaint.ai.priority,
                    createdAt: complaint.createdAt,
                    updatedAt: complaint.updatedAt
                }
            });
        }

        // ========================================
        // AUTHORITY COMPLAINTS
        // ========================================

        if (
            req.method === "GET" &&
            pathname === "/api/authority/complaints"
        ) {
            const db = readDB();

            const user = requireRole(
                req,
                res,
                db,
                ["AUTHORITY"]
            );

            if (!user) return;

            return json(res, 200, {
                complaints: db.complaints
            });
        }

        // ========================================
        // UPDATE COMPLAINT
        // ========================================

        if (
            req.method === "PATCH" &&
            pathname.startsWith("/api/authority/complaints/")
        ) {
            const db = readDB();

            const authority = requireRole(
                req,
                res,
                db,
                ["AUTHORITY"]
            );

            if (!authority) return;

            const complaintId = pathname.split("/").pop();
            const body = await getBody(req);

            const allowedStatuses = [
                "SUBMITTED",
                "UNDER_REVIEW",
                "ASSIGNED",
                "INVESTIGATION_IN_PROGRESS",
                "RESOLVED",
                "CLOSED"
            ];

            if (!allowedStatuses.includes(body.status)) {
                return json(res, 400, {
                    error: "Invalid complaint status"
                });
            }

            const complaint = db.complaints.find(
                item => item.id === complaintId
            );

            if (!complaint) {
                return json(res, 404, {
                    error: "Complaint not found"
                });
            }

            complaint.status = body.status;
            complaint.assignedTo = authority.name;
            complaint.updatedAt = new Date().toISOString();

            writeDB(db);

            return json(res, 200, {
                message: "Complaint status updated successfully",
                complaint
            });
        }

        // ========================================
        // ADMIN ANALYTICS
        // ========================================

        if (
            req.method === "GET" &&
            pathname === "/api/admin/dashboard"
        ) {
            const db = readDB();

            const admin = requireRole(
                req,
                res,
                db,
                ["ADMIN"]
            );

            if (!admin) return;

            const citizens = db.users.filter(
                user => user.role === "USER"
            );

            const authorities = db.users.filter(
                user => user.role === "AUTHORITY"
            );

            const totalComplaints = db.complaints.length;

            const highRiskCases = db.complaints.filter(
                complaint => complaint.ai?.risk === "HIGH"
            ).length;

            const mediumRiskCases = db.complaints.filter(
                complaint => complaint.ai?.risk === "MEDIUM"
            ).length;

            const lowRiskCases = db.complaints.filter(
                complaint => complaint.ai?.risk === "LOW"
            ).length;

            const statusAnalytics = {
                submitted: db.complaints.filter(
                    c => c.status === "SUBMITTED"
                ).length,

                underReview: db.complaints.filter(
                    c => c.status === "UNDER_REVIEW"
                ).length,

                assigned: db.complaints.filter(
                    c => c.status === "ASSIGNED"
                ).length,

                investigation: db.complaints.filter(
                    c => c.status === "INVESTIGATION_IN_PROGRESS"
                ).length,

                resolved: db.complaints.filter(
                    c => c.status === "RESOLVED"
                ).length,

                closed: db.complaints.filter(
                    c => c.status === "CLOSED"
                ).length
            };

            const completedCases =
                statusAnalytics.resolved +
                statusAnalytics.closed;

            const resolutionRate =
                totalComplaints > 0
                    ? Math.round(
                        (completedCases / totalComplaints) * 100
                    )
                    : 0;

            const authorityPerformance = authorities.map(authority => {
                const assignedCases = db.complaints.filter(
                    complaint =>
                        complaint.assignedTo === authority.name
                );

                const resolvedCases = assignedCases.filter(
                    complaint =>
                        complaint.status === "RESOLVED" ||
                        complaint.status === "CLOSED"
                );

                const activeCases = assignedCases.filter(
                    complaint =>
                        complaint.status !== "RESOLVED" &&
                        complaint.status !== "CLOSED"
                );

                const performanceRate =
                    assignedCases.length > 0
                        ? Math.round(
                            (resolvedCases.length /
                                assignedCases.length) * 100
                        )
                        : 0;

                return {
                    id: authority.id,
                    name: authority.name,
                    email: authority.email,
                    assignedCases: assignedCases.length,
                    activeCases: activeCases.length,
                    resolvedCases: resolvedCases.length,
                    performanceRate
                };
            });

            const categoryAnalytics = {};

            db.complaints.forEach(complaint => {
                const category =
                    complaint.category || "Other";

                categoryAnalytics[category] =
                    (categoryAnalytics[category] || 0) + 1;
            });

            return json(res, 200, {
                overview: {
                    totalUsers: citizens.length,
                    totalAuthorities: authorities.length,
                    totalComplaints,
                    highRiskCases,
                    mediumRiskCases,
                    lowRiskCases,
                    resolutionRate
                },

                statusAnalytics,

                authorityPerformance,

                categoryAnalytics
            });
        }

        // ========================================
        // STATIC FILES
        // ========================================

        if (req.method === "GET" && serveStatic(res, pathname)) {
            return;
        }

        json(res, 404, {
            error: "Page not found"
        });

    } catch (error) {
        console.error(error);

        json(res, 500, {
            error: error.message || "Internal server error"
        });
    }
});

server.listen(PORT, () => {
    console.log("======================================");
    console.log("🛡️ NyayaShieldAI Version 2");
    console.log(`🚀 Running: http://localhost:${PORT}`);
    console.log("======================================");
});