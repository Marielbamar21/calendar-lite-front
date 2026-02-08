# Calendar Lite — Frontend

React + TypeScript + Vite frontend for the Calendar Lite (Room Planner) application: authentication, dashboard, rooms, and bookings.

---

## Repository link

**Submit the GitHub repository link** for this project when required (e.g. for assignment or review).

Example: `https://github.com/your-username/calendar-lite-front`

---

## Running the project

### Prerequisites

- **Node.js** 18+ (recommended: LTS)
- **npm** (comes with Node.js)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment (optional)

The app calls a backend API. To point to your API URL, create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

Replace the URL with your backend base URL. If you omit this, the app uses relative paths (e.g. `/api`), which only work if the frontend is served with the same host or behind a proxy.

### 3. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** (or the port shown in the terminal). Open that URL in your browser.

### 4. Other commands

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start dev server (hot reload)  |
| `npm run build`   | Build for production (`dist/`) |
| `npm run preview` | Preview the production build   |
| `npm run lint`    | Run ESLint                     |

### 5. Production build

```bash
npm run build
```

Output is in the `dist/` folder. Serve it with any static file server or host it on Vercel, Netlify, etc.

---

## Tech stack

- React 19, TypeScript, Vite 7
- React Router, React Hook Form, Zod
- Tailwind CSS 4, Radix UI (Dialog)
- react-hot-toast, Lucide React
