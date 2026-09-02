# NyayaShieldAI

## AI-Powered Complaint Intelligence and Justice Support Platform

### From Complaint to Resolution - Smarter, Faster, Transparent

---

# Live Demo

## Public Application

[Open NyayaShieldAI Live Demo](https://nyayashield1.onrender.com)

Public URL:

https://nyayashield1.onrender.com

---

# Project Overview

NyayaShieldAI is an AI-powered digital complaint intelligence and justice support platform designed to improve the way citizens submit, track, and manage complaints.

The system connects three major stakeholders:

- Citizen
- Authority
- Administrator

NyayaShieldAI creates a transparent digital workflow from complaint submission to case monitoring and resolution.

---

# Problem Statement

Traditional complaint management processes can face several challenges:

- Lack of transparency
- Difficulty in tracking complaint progress
- Delayed identification of urgent complaints
- Manual prioritization of cases
- Lack of centralized monitoring
- Difficulty in measuring authority performance

Citizens may not always know what happens after submitting a complaint. Authorities may need to manually review and prioritize multiple cases. Administrators may lack a centralized system for monitoring complaints and performance.

---

# Proposed Solution

NyayaShieldAI provides a centralized digital platform that allows citizens to register and submit complaints, analyzes complaint risk, enables authorities to manage cases, and provides administrators with system analytics and performance monitoring.

The system creates an organized workflow:

```text
Citizen Registration
        |
        v
Citizen Login
        |
        v
File Complaint
        |
        v
Complaint ID Generation
        |
        v
Risk Analysis
        |
        v
Risk Classification
        |
        v
Authority Review
        |
        v
Case Status Update
        |
        v
Citizen Complaint Tracking
        |
        v
Admin Monitoring and Analytics
```

Complete System Workflow
Step 1: Citizen Registration
A new user creates an account by providing:
Name
Email Address
Password
The system validates the information and creates the citizen account.
Step 2: Citizen Login
The registered citizen logs into the NyayaShieldAI platform using their email address and password.
After successful authentication, the citizen can access the complaint dashboard.
Step 3: File a Complaint
The citizen enters the complaint information, including:
Complaint Category
Complaint Description
Location Information
Additional Details
The complaint is submitted to the system.
Step 4: Complaint ID Generation
After successful submission, the system generates a unique Complaint ID.
This ID helps identify and track the complaint throughout its lifecycle.
Step 5: Complaint Risk Analysis
The system analyzes the complaint description and identifies important indicators.
The complaint is assigned:
Risk Score
Risk Level
Priority Level
Important Indicators
Step 6: Risk Classification
The complaint is classified into one of the following categories:
High Risk
Medium Risk
Low Risk
High-risk complaints can receive priority attention from the authority.
Step 7: Authority Review
Authorized personnel log into the Authority Portal.
They can:
View submitted complaints
Review complaint information
Identify complaint risk levels
Manage assigned cases
Step 8: Case Status Update
Authorities update the complaint status according to the progress of the case.
The workflow can follow:
```text
Submitted
    |
    v
Under Review
    |
    v
Assigned
    |
    v
Investigation in Progress
    |
    v
Resolved
    |
    v
Closed

```
Step 9: Citizen Tracking
The citizen can track the complaint using the Complaint ID.
The system displays information such as:
Complaint Status
Risk Level
Priority
Submission Details
Case Progress
Step 10: Administrator Monitoring
The administrator logs into the Admin Dashboard.
The administrator can monitor:
Total Registered Users
Total Complaints
High-Risk Cases
Complaint Analytics
Authority Performance
Resolution Performance
NyayaShieldAI provides a centralized digital platform where:
```text
Citizen
   ↓
Register & Login
   ↓
File Complaint
   ↓
AI Risk Analysis
   ↓
Risk Classification
   ↓
Authority Reviews Case
   ↓
Case Status Updated
   ↓
Citizen Tracks Progress
   ↓
Admin Monitors Analytics
```
## Demo admin login
Email: admin@nyayashield.local
Password: Admin@123

## Important
The demo credentials are for prototype demonstration only. Change/remove them before any real deployment.

## GitHub
in bash
git init
git add .
git commit -m "Initial NyayaShield full stack prototype"
git branch -M main
git remote add origin <YOUR-GITHUB-REPOSITORY-URL>
git push -u origin main


## Deployment
GitHub Pages can host only the static frontend, not this Node.js server. Deploy the backend to a Node-compatible host and configure the frontend API URL for a public production deployment.
