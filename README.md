# FlashCollab Backend

FlashCollab is a real-time peer help app for students. This repository contains the backend implementation.

## Features

- **Real-time SOS Matching:** Students post requests and get matched instantly.
- **15-minute Timer:** Requests are live for 15 minutes.
- **Live Chat & Whiteboard:** Real-time collaboration using Socket.io.
- **Community Forum:** A place to ask questions and interact with peers.
- **Leaderboard:** Track top helpers on campus.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory (optional, but recommended for Firebase):
   ```
   PORT=5000
   FIREBASE_SERVICE_ACCOUNT='{...}'
   FIREBASE_DATABASE_URL='https://your-project.firebaseio.com'
   ```

### Running the Server

```bash
npm start
```
The server will start on `http://localhost:5000`.

## Testing

### Automated Tests

We use Jest and Supertest for API testing. To run the tests:

```bash
npm test
```

### Manual Testing with Postman/cURL

The API is protected by Firebase authentication. For development purposes, if no valid Firebase config is found, the middleware defaults to a `dev-user-id`.

#### 1. Get User Profile
```bash
curl -H "Authorization: Bearer dev-token" http://localhost:5000/api/users/profile
```

#### 2. Get Live Requests
```bash
curl -H "Authorization: Bearer dev-token" http://localhost:5000/api/requests
```

#### 3. Post a Help Request
```bash
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer dev-token" \
-d '{"subject": "Math 101", "description": "Stuck on derivatives"}' \
http://localhost:5000/api/requests
```

#### 4. Join the Forum
```bash
curl -H "Authorization: Bearer dev-token" http://localhost:5000/api/forum
```

## Socket.io Events

- `join-user-room`: Joins a private room for the user (`userId`).
- `join-session`: Joins a specific session room (`sessionId`).
- `send-message`: Sends a chat message.
- `draw`: Synchronizes whiteboard drawing.
- `new-sos-request`: Broadcasted when a new request is created.
