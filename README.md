# ⚡ CrewSync — Event Crew Operating System

CrewSync is a high-performance, real-time event operations and crew dispatch management platform designed to cleanly bridge the gap between Event Organizers/Coordinators and on-the-ground volunteer crew members.

Built with a custom React architecture and a pure, sleek monochrome aesthetic powered entirely by Vanilla CSS, CrewSync provides premium usability across mobile, tablet, and desktop viewports.

---

## 🚀 Key Features

- **Multi-Role Workspaces:** Securely separated dashboard viewports tailored for organizers (event grid command centers) and volunteers (task dispatches).
- **Premium Gamification & Progression:** Dynamic XP tracking, leveling systems (with animated Level Up overlays), task completion streaks, and a visual badge cabinet on volunteer profiles.
- **Dynamic Task Dispatch & Capacity Thresholding:** High-granularity task cards supporting operational check-ins, priorities (low, medium, high, critical), categories (Stage Crew, Hospitality, Technical Support), and standby queue support.
- **WhatsApp-Style Chat Workspace:** Responsive sliding-panel mobile chat, tablet split-view, and desktop 3-panel message hub with inline quick replies, unread counters, and profile contextual sidebars.
- **Credential Approvals Portal:** Dynamic organizer control page to approve incoming volunteer profiles, update rankings, and manage the event network.
- **Real-Time Notification Drawer:** System-wide operations alerts and direct message badges.

---

## 🛠️ Tech Stack & Architecture

- **UI Framework:** [React.js](https://react.dev/) (bundled with Vite)
- **Styling Engine:** Vanilla CSS custom-themed design system (supports seamless Dark/Light mode toggle via HSL variables)
- **Icons Library:** [Lucide React](https://lucide.dev/)
- **Popups/Toasts:** [React Hot Toast](https://reacthottoast.com/)
- **State Management:** Bounded React Context state engine featuring reactive local storage sync and auto-updating progression math.

---

## 🏁 Quick Start

### Prerequisites
Ensure you have **Node.js** and **npm** installed.
```sh
npm install npm@latest -g
```

### Installation & Launch
1. **Clone the repository:**
   ```sh
   git clone https://github.com/AbhijithJ1/CrewSync.git
   ```
2. **Navigate to the project directory:**
   ```sh
   cd CrewSync
   ```
3. **Install dependencies:**
   ```sh
   npm install
   ```
4. **Boot up Vite development server:**
   ```sh
   npm run dev
   ```

### Default Credentials
To access the organizer's command center:
* **Email:** `admin@crewsync.com`
* **Password:** `admin123`

---

## 🏗️ Architecture & Simulation Notice
CrewSync operates entirely inside the browser sandboxed environment using React state and `localStorage` persistence. The application is completely functional for portfolios, live simulations, and local testing. To deploy it in a remote production environment, replace the dispatches in `AppContext.jsx` with your database hooks or WebSockets (e.g., Firebase, Supabase, or PostgreSQL).

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
