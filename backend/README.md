# Backend API

Node.js/Express REST API for the QR Event Check-In System.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Create `.env`:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/qr-checkin
    JWT_SECRET=your_jwt_secret
    HMAC_SECRET=your_qr_secret
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```

## API Endpoints

### Auth
- `POST /auth/register` - Create admin
- `POST /auth/login` - Login admin

### Events
- `GET /events` - List all events
- `POST /events` - Create event (Admin)
- `PUT /events/:id` - Update event (Admin)
- `DELETE /events/:id` - Delete event (Admin)

### Participants
- `GET /participants/event/:eventId` - List participants (Search/Filter)
- `POST /participants/upload/:eventId` - Bulk upload CSV (Admin)
- `POST /participants/checkin` - QR Check-in (Public)

### Stats
- `GET /stats/dashboard` - Admin Dashboard Stats
