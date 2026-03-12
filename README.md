# Mentora — Mentorship Platform Backend

A RESTful API backend for a mentorship platform where **parents**, **students**, and **mentors** interact. Built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Features

-  **JWT Authentication** — Secure signup/login with password hashing (bcrypt)
-  **Student Management** — Parents create and manage student profiles
- **Lesson System** — Mentors create and manage lessons
- **Booking System** — Parents assign students to lessons
-  **Session System** — Mentors create sessions, students can join
-  **LLM Summarization** — AI-powered text summarization via Google Gemini
- **Role-based Access Control** — Fine-grained permissions per role
- **Rate Limiting** — Protection against API abuse

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | HTTP server & routing |
| **TypeScript** | Type safety |
| **Prisma** | ORM & database migrations |
| **PostgreSQL** | Relational database |
| **JWT** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Google Gemini** | LLM text summarization |
| **express-rate-limit** | Rate limiting |

---

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** running locally or remotely
- **Gemini API Key** (for LLM feature)

---

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Backend-Task
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/mentora` |
| `JWT_SECRET` | Secret key for JWT signing | `my-super-secret-key` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `PORT` | Server port (optional, default 3000) | `3000` |

### 3. Database Setup

```bash
# Run Prisma migrations to create tables
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Start the Server

```bash
# Development (hot-reload)
npm run dev

# Production
npm run build
npm start
```

The server will start at `http://localhost:3000`.

---

## API Documentation

### Authentication

#### POST `/auth/signup`
Register a new parent or mentor.

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Parent",
    "email": "john@example.com",
    "password": "securepass123",
    "role": "PARENT"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "John Parent", "email": "john@example.com", "role": "PARENT" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST `/auth/login`
Login with email and password.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "securepass123"}'
```

#### GET `/me`
Get current authenticated user profile.

```bash
curl http://localhost:3000/me \
  -H "Authorization: Bearer <TOKEN>"
```

---

### Students (Parent only)

#### POST `/students`
Create a student under the authenticated parent.

```bash
curl -X POST http://localhost:3000/students \
  -H "Authorization: Bearer <PARENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Student", "age": 14}'
```

#### GET `/students`
List students. Parents see only their students.

```bash
curl http://localhost:3000/students \
  -H "Authorization: Bearer <TOKEN>"
```

---

### Lessons (Mentor creates)

#### POST `/lessons`
Create a lesson (mentor only).

```bash
curl -X POST http://localhost:3000/lessons \
  -H "Authorization: Bearer <MENTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Intro to Algebra", "description": "Basic algebra concepts for beginners"}'
```

#### GET `/lessons`
List all lessons.

```bash
curl http://localhost:3000/lessons \
  -H "Authorization: Bearer <TOKEN>"
```

#### GET `/lessons/:id`
Get a specific lesson.

---

### Bookings (Parent only)

#### POST `/bookings`
Book a student into a lesson.

```bash
curl -X POST http://localhost:3000/bookings \
  -H "Authorization: Bearer <PARENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"studentId": "<STUDENT_ID>", "lessonId": "<LESSON_ID>"}'
```

#### GET `/bookings`
List bookings. Parents see only their students' bookings.

---

### Sessions

#### POST `/sessions`
Create a session for a lesson (mentor only).

```bash
curl -X POST http://localhost:3000/sessions \
  -H "Authorization: Bearer <MENTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "<LESSON_ID>",
    "date": "2026-03-15T10:00:00Z",
    "topic": "Solving Linear Equations",
    "summary": "Covered ax + b = 0 form"
  }'
```

#### GET `/lessons/:id/sessions`
List all sessions for a lesson.

```bash
curl http://localhost:3000/lessons/<LESSON_ID>/sessions \
  -H "Authorization: Bearer <TOKEN>"
```

#### POST `/sessions/:id/join` *(Bonus)*
Parent assigns their student to join a session. Student must be booked for the lesson.

```bash
curl -X POST http://localhost:3000/sessions/<SESSION_ID>/join \
  -H "Authorization: Bearer <PARENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"studentId": "<STUDENT_ID>"}'
```

---

### LLM Summarization

#### POST `/llm/summarize`
Summarize text using Google Gemini. Rate limited to 10 requests/minute.

```bash
curl -X POST http://localhost:3000/llm/summarize \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "• AI is intelligence demonstrated by machines...\n• AI research studies intelligent agents...",
    "model": "gemini-2.0-flash"
  }
}
```

**Validation rules:**
| Condition | Status Code |
|-----------|------------|
| Text missing or empty | 400 |
| Text < 50 characters | 400 |
| Text > 10,000 characters | 413 |
| LLM API failure | 502 |
| Rate limit exceeded | 429 |

---

## Project Structure

```
src/
├── config/env.ts           # Environment configuration
├── middleware/
│   ├── auth.middleware.ts   # JWT verification
│   ├── role.middleware.ts   # Role-based access control
│   ├── validate.middleware.ts # Request body validation
│   └── error.middleware.ts  # Global error handler
├── controllers/             # Route handlers (thin layer)
├── services/                # Business logic
├── routes/                  # Express route definitions
├── utils/
│   ├── jwt.ts              # JWT sign/verify helpers
│   └── errors.ts           # Custom error classes
├── app.ts                   # Express app setup
└── server.ts                # Entry point
```

---

## Design Decisions

- **Layered architecture**: Routes → Controllers → Services → Prisma. Clean separation of concerns.
- **Custom error classes**: `AppError` hierarchy with HTTP status codes, caught by global error handler.
- **Role validation at route level**: Middleware chain validates auth, then role, then body.
- **Parent ownership enforcement**: Parents can only manage their own students and bookings.
- **Booking uniqueness**: A student can't be double-booked into the same lesson (DB constraint).
- **Session join requires booking**: Students must be booked for a lesson before joining its sessions.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start dev server with hot-reload |
| `build` | `npm run build` | Compile TypeScript to JavaScript |
| `start` | `npm start` | Run compiled production build |
| `prisma:migrate` | `npm run prisma:migrate` | Run database migrations |
| `prisma:generate` | `npm run prisma:generate` | Generate Prisma client |
| `prisma:studio` | `npm run prisma:studio` | Open Prisma Studio GUI |

---

## License

ISC
