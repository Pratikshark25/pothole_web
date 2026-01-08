# Design - Web & Cloud for potholemapper

## Summary

This project consists of a full-stack web application for mapping potholes. The backend is built with Express.js and provides a REST API, while the frontend uses React with Vite for fast development and hot module replacement. The server is configured to handle CORS and JSON requests, and includes dependencies for future database integration (Mongoose). The client is styled with CSS and includes ESLint configuration for code quality. The application is structured for easy

## Tech stack Dev setup

TODO(sairiteshdomakuntla): Fill this section based on your analysis.
Frontend

React.js + Tailwind CSS (UI)

React Router (navigation)

Axios (API calls)

Context API (state management)

Backend

Node.js + Express.js (API server)

MongoDB + Mongoose (database)

JWT + bcrypt (authentication)

Cloud Storage (AWS/GCP) (file uploads)

REST APIs (for web + mobile)

## DB Dev setup

TODO(Rasagna2810): Fill this section based on your analysis.

**Database** :MongoDb

**Files(image/video)**:AWS S3

## Data flow diagram

TODO(MohitKarthiekeya): Fill this section based on your analysis.

Here’s the concise summary:

**Frontend (User-facing in React):**

* Web app with municipal dashboard
* Map showing potholes
* Filters for severity & repair status
* Interface to fetch pothole data

**Backend (Node.js/Express APIs):**

1. **Receive Report:** Accepts image + metadata, validates, stores image, forwards metadata
2. **Verify & Analyze:** Runs YOLO AI model to confirm pothole & score severity
3. **Store Data:** Saves verified info in MongoDB
4. **Serve Data:** APIs for frontend to query with filters

**Data Storage:**

* **Cloud Storage (S3/Azure Blob):** Stores raw images for AI analysis
* **MongoDB:** Stores pothole records, user info, repair status

<img width="1360" height="977" alt="image" src="https://github.com/user-attachments/assets/d1a57c73-3ca8-467a-975f-53bea765ab74" />



## Database schema

TODO(gaddalecharmi): Fill this section based on your analysis.

**The basic database schema for the Pothole Mapper project using Mongoose (MongoDB) includes the three key models:**

**User Schema** – stores commuter, municipal staff, and admin details with role-based access.

**Pothole Schema** – stores reported pothole data including location, images, AI verification status, and repair progress.

**Feedback Schema** – stores user feedback, ratings, and optional links to specific potholes.

## List of APIs

TODO(gaddalecharmi): Fill this section based on your analysis.

We require the following API's: 

-Google Maps JavaScript API

-Google Maps Directions API

-Google Maps Geocoding API

-HTML5 Geolocation API

-Cloudinary Upload API

-Municipality Office API

-Roboflow API / Hugging Face API

-Firebase Cloud Messaging (FCM)

-JWT Authentication (Custom MERN)

-Your REST API Endpoints (Custom MERN)

## Security

TODO(pthanmayee) : Fill this section based on your analysis.

1. Authentication
   
JWT-based Auth (Access + Refresh tokens)

   Access token: Short-lived (e.g., 15–30 min)

   Refresh token: Long-lived, stored securely in HTTP-only cookies.

Role-based Access Control (RBAC)

   Roles: commuter, municipal_staff, admin.

   Middleware checks role before allowing access to sensitive routes.

OAuth 2.0 (optional)

   Allow login with Google/Facebook for commuters to simplify sign-up.

2. API Security
   
HTTPS everywhere (TLS 1.2+) to encrypt traffic.

CORS policy restricted to trusted domains (React frontend + admin panel).

Rate Limiting to prevent abuse of reporting APIs (e.g., express-rate-limit).

Input Validation & Sanitization (e.g., express-validator) to prevent SQL/NoSQL injection and XSS.

CSRF Protection for state-changing requests if cookies are used.

3. File & Cloud Security
   
AWS S3 Bucket Security

   Private by default; signed URLs for temporary access.

   Scan uploads with an antivirus service (e.g., ClamAV Lambda) before storage.

Cloudinary / Roboflow / HuggingFace API Keys stored in server-side .env only.

4. Database Security (MongoDB)
   
Use IP whitelisting and VPC peering (no public DB access).

Enable authentication & TLS for DB connections.

Enforce schema validation in Mongoose to reject malformed data.

5. Session & Token Management
   
Expire tokens immediately after password reset or logout.

Store refresh tokens in DB to allow forced logouts (token revocation).

Use strong hashing (bcrypt) for passwords.

6. Monitoring & Alerts
   
Audit logs for all admin actions.

Track login attempts & lock account on repeated failures (brute-force prevention).

Enable AWS CloudWatch & MongoDB Atlas Alerts for suspicious activity.

