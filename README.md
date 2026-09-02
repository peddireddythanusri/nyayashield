# NyayaShield

## What this prototype does
- Citizen registration and login
- Separate citizen, authority and admin roles
- Complaint filing
- Unique Complaint ID
- AI-assisted rule-based risk scoring
- Authority dashboard
- Status updates
- Public complaint tracking by Complaint ID
- JSON persistence without SQLite or native Node modules

## Run locally
### Requirement
Install Node.js (18+ recommended).

### Commands
```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd NyayaShield_FullStack
node server.js
```

Open:
http://localhost:4000

No `npm install` is required for this version.

## Demo authority login
Email: authority@nyayashield.local
Password: Authority@123

## Demo admin login
Email: admin@nyayashield.local
Password: Admin@123

## Important
The demo credentials are for prototype demonstration only. Change/remove them before any real deployment.

## GitHub
```bash
git init
git add .
git commit -m "Initial NyayaShield full stack prototype"
git branch -M main
git remote add origin <YOUR-GITHUB-REPOSITORY-URL>
git push -u origin main
```

## Deployment
GitHub Pages can host only the static frontend, not this Node.js server. Deploy the backend to a Node-compatible host and configure the frontend API URL for a public production deployment.
