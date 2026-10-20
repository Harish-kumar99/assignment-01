# Session Booking API

A REST API for booking sessions with teachers using Node.js, TypeScript, Express.js, MongoDB, and Mongoose.

## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB
- Mongoose

## Prerequisites

- Node.js installed
- MongoDB running locally or accessible via connection string

## Setup Instructions

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/session-booking
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### 1. Create User
**POST** `/api/users`

Create a new user. Email must be unique.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

### 2. Create Teacher
**POST** `/api/teachers`

Create a new teacher.

**Request Body:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "specialization": "Mathematics",
  "experience": 5
}
```

### 3. Create Session
**POST** `/api/sessions`

Create a new session for a teacher. Default status is AVAILABLE.

**Request Body:**
```json
{
  "teacherId": "teacher_id_here",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z"
}
```

### 4. Get Available Sessions
**GET** `/api/sessions/available?dateTimestamp={timestamp}`

Return all AVAILABLE sessions for the supplied date. Uses MongoDB Aggregation Pipeline.

**Query Parameters:**
- `dateTimestamp`: Unix timestamp for the date

### 5. Book Session
**POST** `/api/sessions/:id/book`

Book an available session.

**Request Body:**
```json
{
  "userId": "user_id_here"
}
```

**Rules:**
- User must exist
- Session must exist
- Only AVAILABLE sessions can be booked
- A booked session cannot be booked again

### 6. Mark Session Complete
**PATCH** `/api/sessions/:id/complete`

Mark a booked session as completed.

**Rules:**
- Session must exist
- Only BOOKED sessions can be marked as completed
- Updates status to COMPLETED and sets completedAt

### 7. Get User Sessions
**GET** `/api/users/:id/sessions`

Return all sessions for the user separated into Upcoming Sessions and Completed Sessions. Uses MongoDB Aggregation Pipeline.

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── config/
│   └── database.ts       # MongoDB connection
├── controllers/
│   ├── userController.ts # User-related operations
│   └── sessionController.ts # Session-related operations
├── middleware/
│   └── errorHandler.ts   # Centralized error handling
├── models/
│   ├── User.ts           # User schema
│   ├── Teacher.ts        # Teacher schema
│   └── Session.ts        # Session schema
├── routes/
│   └── index.ts          # API routes
└── server.ts             # Express app setup
```
