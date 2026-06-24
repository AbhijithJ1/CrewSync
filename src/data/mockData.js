// ================= TASK PRIORITIES =================
export const PRIORITY_LEVELS = ["low", "medium", "high", "critical"];

// ================= SKILLS / CATEGORIES =================
export const TASK_TYPES = [
  "Technical Support",
  "Hospitality",
  "Stage Crew",
  "Logistics",
  "Media & Design"
];

// ================= LOCATIONS =================
export const LOCATIONS = [
  "Main Auditorium",
  "Lobby Area",
  "Hackathon Hall",
  "Dining Pavilion",
  "Sponsor Exhibition",
  "Speaker Lounge"
];

// ================= INITIAL VOLUNTEERS =================
// Stats start at zero — XP/achievements/tasks are earned purely from real events.
export const INITIAL_VOLUNTEERS = [];

// ================= ORGANIZER ACCOUNT =================
export const ORGANIZER_ACCOUNT = {
  id: "org-1",
  name: "Alex Morgan",
  email: "admin@crewsync.com",
  password: "admin123",
  role: "organizer",
  roleRequest: "organizer",
  approvalStatus: "approved"
};

// ================= ACTIVE TASKS =================
// Empty by default. Tasks are created exclusively by the organizer at runtime.
// No pre-seeded dispatches — everything is event-driven.
export const INITIAL_ACTIVE_TASKS = [];

// ================= TASK HISTORY =================
// Empty by default. History entries are generated only from real completed/
// cancelled/expired events at runtime.
export const INITIAL_TASK_HISTORY = [];
