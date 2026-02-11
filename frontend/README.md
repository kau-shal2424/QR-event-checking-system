# Frontend Client

React application built with Vite.

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run development server:
    ```bash
    npm run dev
    ```

## Project Structure

- `src/pages`:
  - `Login.jsx`: Admin authentication.
  - `Dashboard.jsx`: Statistics and recent activity.
  - `Events.jsx`: Event management (CRUD).
  - `EventDetails.jsx`: Participant list, CSV upload, search/filter.
  - `QRScanner.jsx`: Mobile-first QR code scanner.

- `src/components`: Reusable UI components.
- `src/services`: API configuration (Axios).
- `src/context`: Auth state management.

## Key Libraries
- `react-router-dom`: Routing
- `axios`: HTTP client
- `@zxing/browser`: QR Code scanning
