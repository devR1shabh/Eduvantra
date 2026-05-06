# EduVantra

![MERN](https://img.shields.io/badge/Stack-MERN-2ea44f?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb?style=for-the-badge&logo=react&logoColor=111)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47a248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

EduVantra is a full-stack EdTech platform for discovering courses, managing learning content, enrolling students, tracking progress, and supporting learners with an AI chatbot.

## Live Demo

https://eduvantra.vercel.app/

## Professional Project Overview

EduVantra is built as a modern MERN learning management platform with separate student and instructor experiences. It includes secure authentication, course management, media uploads, payment integration, email-based verification flows, dashboards, reviews, and course progress tracking.

The project demonstrates practical full-stack engineering across frontend routing, state management, REST APIs, MongoDB data modeling, authentication, third-party integrations, and responsive UI development.

## Features

- User signup, login, OTP verification, and password reset
- Role-based access for students, instructors, and admins
- Course catalog, course details, and category-based browsing
- Instructor course creation, editing, sections, and lectures
- Student cart, enrollment, course viewing, and progress tracking
- Razorpay payment flow with payment confirmation email
- Ratings and reviews for courses
- Profile management and account settings
- Cloudinary-based media upload
- Contact form with email response
- AI chatbot integration using Gemini or OpenAI provider settings

## Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Redux Toolkit, React Router |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Authentication | JWT, bcryptjs, OTP verification |
| Payments | Razorpay |
| Media | Cloudinary, express-fileupload |
| Email | Nodemailer |
| AI | Gemini API / OpenAI API |

## Folder Structure

```text
Eduvantra/
+-- client/              # React + Vite frontend
|   +-- src/
|       +-- components/  # Reusable and feature UI components
|       +-- pages/       # Route-level pages
|       +-- services/    # API connectors and operations
|       +-- slices/      # Redux state slices
+-- server/              # Express backend
|   +-- config/          # Database, Cloudinary, Razorpay config
|   +-- controllers/     # Request handlers
|   +-- models/          # Mongoose schemas
|   +-- routes/          # API routes
|   +-- utils/           # Shared backend utilities
+-- package.json         # Root scripts
```

## Environment Variables

Create `.env` files where required.

### Client

```env
VITE_BASE_URL=http://localhost:4000/api/v1
VITE_RAZORPAY_KEY=your_razorpay_key
```

### Server

```env
PORT=4000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

MAIL_HOST=your_mail_host
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password

CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=your_cloudinary_folder

RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

## Installation & Setup

```bash
git clone https://github.com/devR1shabh/Eduvantra.git
cd Eduvantra

npm install
npm install --prefix client
npm install --prefix server
```

## Running Locally

Run frontend and backend together from the project root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:4000`

## Deployment

- Frontend can be deployed on Vercel, Netlify, or any static hosting platform.
- Backend can be deployed on Render, Railway, or a Node.js hosting provider.
- MongoDB Atlas, Cloudinary, Razorpay, mail credentials, and AI provider keys must be configured in the production environment.

## Screenshots


| Home | Course Details | Dashboard |
| --- | --- | --- |
| Screenshot placeholder | Screenshot placeholder | Screenshot placeholder |

## Future Improvements

- Add automated test coverage for core API and UI flows
- Improve admin dashboard functionality
- Add advanced course search and filtering
- Add stronger analytics for instructors
- Add production-ready deployment documentation

## Author

**Rishabh**  
GitHub: [devR1shabh](https://github.com/devR1shabh)
