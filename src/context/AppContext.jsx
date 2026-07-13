import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { INITIAL_ACTIVE_TASKS, INITIAL_TASK_HISTORY, INITIAL_VOLUNTEERS, ORGANIZER_ACCOUNT, TASK_TYPES, LOCATIONS } from '../data/mockData';
import { calculateLevelInfo, XP_REWARDS, ACHIEVEMENTS } from '../data/xpConfig';

// ─────────────────────────────────────────────────────────────
// VERSION MIGRATION
// ─────────────────────────────────────────────────────────────
const CURRENT_VERSION = 'v3.0';
const checkAndMigrateVersion = () => {
  const savedVersion = localStorage.getItem('crewsync-version');
  if (savedVersion !== CURRENT_VERSION) {
    const keysToRemove = [
      'crewsync-user',
      'crewsync-volunteers',
      'crewsync-users',
      'crewsync-activeTasks',
      'crewsync-taskHistory',
      'crewsync-notifications',
      'crewsync-directMessages',
      'crewsync-version',
      'crewsync-locations',
      'crewsync-taskTypes',
      'crewsync-events'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    localStorage.setItem('crewsync-version', CURRENT_VERSION);
  }
};
checkAndMigrateVersion();

const AppContext = createContext(null);

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// XP / Achievement utilities are in src/data/xpConfig.js

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PERSISTENCE HELPERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const loadPersistedData = (key, defaultData) => {
  const saved = localStorage.getItem(`crewsync-${key}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading localStorage key', key, e);
    }
  }
  return defaultData;
};

// Sanitized loader for direct messages:
// - Migrates legacy field names (content/body/message â†’ text)
// - Strips messages with empty or missing text to prevent ghost bubbles
const loadDirectMessages = () => {
  const saved = localStorage.getItem('crewsync-directMessages');
  if (saved) {
    try {
      const raw = JSON.parse(saved);
      if (!Array.isArray(raw)) return [];
      return raw
        .map(msg => ({
          ...msg,
          text: msg.text || msg.content || msg.body || msg.message || '',
        }))
        .filter(msg => typeof msg.text === 'string' && msg.text.trim().length > 0);
    } catch (e) {
      console.error('Error loading directMessages from localStorage', e);
    }
  }
  return [];
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// INITIAL STATE
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Protect seeded accounts from stale localStorage approvalStatus.
// vol-1..vol-4 must always be approvalStatus:'approved' so they can't get
// stuck on the pending-approval page after a data reset.
const SEED_VOL_IDS = new Set(INITIAL_VOLUNTEERS.map(v => v.id));
const initialVolunteers = loadPersistedData('volunteers', INITIAL_VOLUNTEERS).map(v =>
  SEED_VOL_IDS.has(v.id)
    ? { ...v, approvalStatus: 'approved', role: v.role || 'volunteer' }
    : v
);
const loadedUser = loadPersistedData('user', null);
let initialUser = loadedUser;
if (loadedUser) {
  const match = initialVolunteers.find(v => v.id === loadedUser.id);
  if (match) {
    initialUser = match;
  }
  // Organizer account doesn't live in volunteers array; restore directly
  if (!match && loadedUser.role === 'organizer') {
    initialUser = loadedUser;
  }
}

const initialState = {
  user: initialUser,
  events: loadPersistedData('events', []),
  activeTasks: loadPersistedData('activeTasks', INITIAL_ACTIVE_TASKS),
  taskHistory: loadPersistedData('taskHistory', INITIAL_TASK_HISTORY),
  volunteers: initialVolunteers,
  users: initialVolunteers,
  organizer: ORGANIZER_ACCOUNT,
  notifications: loadPersistedData('notifications', []),
  taskTypes: Array.from(new Set(loadPersistedData('taskTypes', TASK_TYPES))),
  locations: Array.from(new Set(loadPersistedData('locations', LOCATIONS))),
  theme: localStorage.getItem('crewsync-theme') || 'dark',
  celebration: null,
  directMessages: loadDirectMessages(),
  activeDirectChatVolunteerId: null,
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// REDUCER
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function appReducer(state, action) {
  switch (action.type) {

    // â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'LOGIN':
      return { ...state, user: action.payload };

    case 'LOGOUT':
      return { ...state, user: null };

    case 'SYNC_USER':
      return { ...state, user: action.payload };

    // â”€â”€ Celebration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'TRIGGER_CELEBRATION':
      return { ...state, celebration: action.payload };

    case 'CLEAR_CELEBRATION':
      return { ...state, celebration: null };

    // â”€â”€ Access Approvals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'APPROVE_USER': {
      const { userId } = action.payload;
      const targetUser = state.volunteers.find(u => u.id === userId);
      if (!targetUser) return state;

      const updatedVolunteers = state.volunteers.map(u =>
        u.id === userId
          ? { ...u, approvalStatus: 'approved', role: u.roleRequest, available: true }
          : u
      );

      const updatedUser =
        state.user && state.user.id === userId
          ? { ...state.user, approvalStatus: 'approved', role: targetUser.roleRequest, available: true }
          : state.user;

      return {
        ...state,
        volunteers: updatedVolunteers,
        users: updatedVolunteers,
        user: updatedUser,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            message: `${targetUser.name} was approved as ${targetUser.roleRequest.toUpperCase()}`,
            type: 'success',
            timestamp: Date.now(),
            read: false,
            isApproval: true,
          },
          ...state.notifications,
        ],
      };
    }

    case 'REJECT_USER': {
      const { userId } = action.payload;
      const targetUser = state.volunteers.find(u => u.id === userId);
      if (!targetUser) return state;

      const updatedVolunteers = state.volunteers.map(u =>
        u.id === userId
          ? { ...u, approvalStatus: 'rejected', role: null, available: false }
          : u
      );

      const updatedUser =
        state.user && state.user.id === userId
          ? { ...state.user, approvalStatus: 'rejected', role: null, available: false }
          : state.user;

      return {
        ...state,
        volunteers: updatedVolunteers,
        users: updatedVolunteers,
        user: updatedUser,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            message: `${targetUser.name}'s request was rejected`,
            type: 'warning',
            timestamp: Date.now(),
            read: false,
            isApproval: true,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Signup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'SIGNUP': {
      const roleRequest = action.payload.role;
      const newUser = {
        id: roleRequest === 'organizer' ? `org-${Date.now()}` : `vol-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        password: action.payload.password,
        roleRequest,
        role: null,
        approvalStatus: 'pending',
        available: false,
        skills: action.payload.skills || [],
        location: roleRequest === 'volunteer' ? 'Lobby Area' : '',
        tasksCompleted: 0,
        criticalTasksCompleted: 0,
        xp: 0,
        level: 1,
        rankTitle: 'Rookie',
        streakCount: 0,
        responseRate: 0,
        achievements: [],
      };

      const nextVolunteers = [...state.volunteers, newUser];

      return {
        ...state,
        user: newUser,
        volunteers: nextVolunteers,
        users: nextVolunteers,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            message: `Account created for ${newUser.name}. Pending approval.`,
            type: 'info',
            timestamp: Date.now(),
            read: false,
            isApproval: true,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Task Creation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'ADD_TASK': {
      const newId = `task-${Date.now()}`;
      const durationSecs = action.payload.durationLimit || 300;
      const newTask = {
        title: 'Untitled Task',
        description: '',
        volunteersNeeded: 1,
        location: 'Main Auditorium',
        requiredSkill: 'Technical Support',
        durationLimit: 300,
        deadline: 'ASAP',
        priority: 'medium',
        ...action.payload,
        id: newId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        // Compute a real expiry wall-clock timestamp from durationLimit
        expiresAt: Date.now() + durationSecs * 1000,
        acceptedBy: [],
        interestedVolunteers: [],
        messages: [],
      };
      return {
        ...state,
        activeTasks: [newTask, ...state.activeTasks],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId: newId,
            message: `New task dispatched: "${newTask.title}"`,
            type: 'info',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Accept Task (triggers Busy Lock) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'ACCEPT_TASK': {
      const { taskId, volunteerId } = action.payload;
      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      // Slot full guard
      if ((task.acceptedBy || []).length >= (task.volunteersNeeded || 1)) {
        return state;
      }

      const nextAcceptedBy = [...(task.acceptedBy || []), volunteerId];
      const volunteerName = state.volunteers.find(v => v.id === volunteerId)?.name || 'Crew member';

      // Busy Lock: set available=false for accepted volunteer
      const nextVolunteers = state.volunteers.map(v =>
        v.id === volunteerId ? { ...v, available: false } : v
      );

      const isCurrentUser = state.user?.id === volunteerId;
      const nextUser = isCurrentUser ? { ...state.user, available: false } : state.user;

      const slotsNowFull = nextAcceptedBy.length >= (task.volunteersNeeded || 1);

      return {
        ...state,
        user: nextUser,
        volunteers: nextVolunteers,
        users: nextVolunteers,
        activeTasks: state.activeTasks.map(t =>
          t.id === taskId
            ? { ...t, acceptedBy: nextAcceptedBy, status: slotsNowFull ? 'accepted' : 'pending' }
            : t
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId,
            message: `${volunteerName} accepted "${task.title}"`,
            type: 'success',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Express Interest (Slots Full) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'EXPRESS_INTEREST': {
      const { taskId, volunteerId } = action.payload;
      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      // Prevent duplicate
      if ((task.interestedVolunteers || []).includes(volunteerId)) return state;

      const volunteerName = state.volunteers.find(v => v.id === volunteerId)?.name || 'Crew member';

      return {
        ...state,
        activeTasks: state.activeTasks.map(t =>
          t.id === taskId
            ? { ...t, interestedVolunteers: [...(t.interestedVolunteers || []), volunteerId] }
            : t
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId,
            message: `${volunteerName} is interested in "${task.title}"`,
            type: 'info',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Approve Interest (Organizer promotes interested â†’ accepted) â”€
    case 'APPROVE_INTEREST': {
      const { taskId, volunteerId } = action.payload;
      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      const volunteerName = state.volunteers.find(v => v.id === volunteerId)?.name || 'Crew member';
      const nextAcceptedBy = [...(task.acceptedBy || []), volunteerId];
      const nextInterested = (task.interestedVolunteers || []).filter(id => id !== volunteerId);

      const nextVolunteers = state.volunteers.map(v =>
        v.id === volunteerId ? { ...v, available: false } : v
      );

      const isCurrentUser = state.user?.id === volunteerId;
      const nextUser = isCurrentUser ? { ...state.user, available: false } : state.user;

      return {
        ...state,
        user: nextUser,
        volunteers: nextVolunteers,
        users: nextVolunteers,
        activeTasks: state.activeTasks.map(t =>
          t.id === taskId
            ? { ...t, acceptedBy: nextAcceptedBy, interestedVolunteers: nextInterested, status: 'accepted' }
            : t
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId,
            message: `${volunteerName} approved from interest list for "${task.title}"`,
            type: 'success',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Leave Task (releases Busy Lock) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'LEAVE_TASK': {
      const { taskId, volunteerId } = action.payload;
      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      const nextAcceptedBy = (task.acceptedBy || []).filter(id => id !== volunteerId);
      const nextStatus = nextAcceptedBy.length === 0 ? 'pending' : 'accepted';

      const volunteerName = state.volunteers.find(v => v.id === volunteerId)?.name || 'Crew member';

      // Release Busy Lock: set available=true, break streak on leave
      const nextVolunteers = state.volunteers.map(v =>
        v.id === volunteerId ? { ...v, available: true, streakCount: 0 } : v
      );

      const isCurrentUser = state.user?.id === volunteerId;
      const nextUser = isCurrentUser ? { ...state.user, available: true, streakCount: 0 } : state.user;

      return {
        ...state,
        user: nextUser,
        volunteers: nextVolunteers,
        users: nextVolunteers,
        activeTasks: state.activeTasks.map(t =>
          t.id === taskId
            ? { ...t, acceptedBy: nextAcceptedBy, status: nextStatus }
            : t
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            message: `${volunteerName} left "${task.title}"`,
            type: 'warning',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Complete Task (XP rewards, achievements, anti-abuse) â”€â”€
    case 'COMPLETE_TASK': {
      const { taskId, completionNote } = action.payload;

      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      const resolvedTask = {
        ...task,
        status: 'completed',
        completionNote,
        completedAt: new Date().toISOString(),
      };

      const assignedIds = task.acceptedBy || [];
      let celebrationToTrigger = null;

      const nextVolunteers = state.volunteers.map(v => {
        if (assignedIds.includes(v.id)) {
          // Anti-Abuse: category repeat penalty
          const userCompletedTasks = state.taskHistory.filter(
            t => t.status === 'completed' && (t.acceptedBy || []).includes(v.id)
          );
          const sortedHistory = [...userCompletedTasks].sort(
            (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
          );
          const lastTask = sortedHistory.length > 0 ? sortedHistory[0] : null;
          const isRepeatedCategory = lastTask && lastTask.requiredSkill === task.requiredSkill;

          // Base XP by priority (low: 10, medium: 20, high: 35, critical: 50)
          let baseXP = XP_REWARDS.low;
          if (task.priority === 'critical') baseXP = XP_REWARDS.critical;
          else if (task.priority === 'high') baseXP = XP_REWARDS.high;
          else if (task.priority === 'medium') baseXP = XP_REWARDS.medium;

          // First Responder Bonus (+10 XP)
          const isFirstAccepted = (task.acceptedBy || [])[0] === v.id;
          const responderBonus = isFirstAccepted ? XP_REWARDS.firstResponder : 0;

          // Streak Bonus (+15 XP for 3+ consecutive completions)
          const nextStreak = (v.streakCount || 0) + 1;
          const streakBonus = nextStreak >= 3 ? XP_REWARDS.streak : 0;

          // Apply anti-abuse penalty
          let xpEarned = baseXP + responderBonus + streakBonus;
          if (isRepeatedCategory) {
            xpEarned = Math.round(xpEarned * XP_REWARDS.categoryRepeatPenalty);
          }

          const currentXp = v.xp || 0;
          const nextXp = currentXp + xpEarned;
          const currentLevelInfo = calculateLevelInfo(currentXp);
          const nextLevelInfo = calculateLevelInfo(nextXp);

          // Achievement unlocks
          const currentAchievements = v.achievements || [];
          const newAchievements = [...currentAchievements];
          const unlockedNow = [];

          const nextTasksCompleted = (v.tasksCompleted || 0) + 1;
          const nextCriticalTasksCompleted =
            (v.criticalTasksCompleted || 0) + (task.priority === 'critical' ? 1 : 0);
          const nextResponseRate = Math.min(100, (v.responseRate || 80) + 4);

          const unlock = id => {
            if (!newAchievements.includes(id)) {
              newAchievements.push(id);
              unlockedNow.push(id);
            }
          };

          if (nextTasksCompleted === 1) unlock('First Task Completed');
          if (nextTasksCompleted === 5) unlock('5 Tasks Completed');
          if (nextTasksCompleted === 10) unlock('10 Tasks Completed');
          if (task.priority === 'critical') unlock('First Critical Task');
          if (isFirstAccepted) unlock('Fastest Responder');
          if (nextStreak === 7) unlock('7-Day Active Streak');
          if (nextResponseRate === 100 && nextTasksCompleted >= 3) unlock('100% Response Rate');

          // Trigger celebration if this is the logged-in user
          if (state.user && state.user.id === v.id) {
            if (nextLevelInfo.level > currentLevelInfo.level) {
              celebrationToTrigger = { type: 'level_up', value: nextLevelInfo.level };
            } else if (unlockedNow.length > 0) {
              celebrationToTrigger = { type: 'achievement', value: unlockedNow[0] };
            }
          }

          return {
            ...v,
            available: true,
            tasksCompleted: nextTasksCompleted,
            criticalTasksCompleted: nextCriticalTasksCompleted,
            xp: nextXp,
            level: nextLevelInfo.level,
            rankTitle: nextLevelInfo.rankTitle,
            streakCount: nextStreak,
            responseRate: nextResponseRate,
            achievements: newAchievements,
          };
        }
        return v;
      });

      const isCurrentUserAssigned = state.user && assignedIds.includes(state.user.id);
      const nextUser = isCurrentUserAssigned
        ? nextVolunteers.find(v => v.id === state.user.id)
        : state.user;

      const crewNames = assignedIds
        .map(id => state.volunteers.find(v => v.id === id)?.name || 'Crew')
        .join(', ');
      const notifMessage = crewNames
        ? `Task completed: "${task.title}" by ${crewNames}.`
        : `Task completed: "${task.title}".`;

      return {
        ...state,
        user: nextUser,
        volunteers: nextVolunteers,
        users: nextVolunteers,
        activeTasks: state.activeTasks.filter(t => t.id !== taskId),
        taskHistory: [resolvedTask, ...state.taskHistory],
        celebration: celebrationToTrigger || state.celebration,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId,
            message: notifMessage,
            type: 'success',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Delete Task (permanent, no history trace) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'DELETE_TASK': {
      const taskId = action.payload;
      const task = state.activeTasks.find(t => t.id === taskId) ||
                   state.taskHistory.find(t => t.id === taskId);
      if (!task) return state;

      const assignedIds = task.acceptedBy || [];
      const nextVolunteers = state.volunteers.map(v =>
        assignedIds.includes(v.id) ? { ...v, available: true } : v
      );
      const isCurrentUserAssigned = state.user && assignedIds.includes(state.user.id);
      const nextUser = isCurrentUserAssigned ? { ...state.user, available: true } : state.user;

      return {
        ...state,
        user: nextUser,
        volunteers: nextVolunteers,
        users: nextVolunteers,
        activeTasks: state.activeTasks.filter(t => t.id !== taskId),
        taskHistory: state.taskHistory.filter(t => t.id !== taskId),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            message: `Task "${task.title}" permanently deleted.`,
            type: 'warning',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Cancel Task â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'CANCEL_TASK': {
      const taskId = action.payload;
      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      const resolvedTask = {
        ...task,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      };

      const assignedIds = task.acceptedBy || [];
      const nextVolunteers = state.volunteers.map(v =>
        assignedIds.includes(v.id) ? { ...v, available: true } : v
      );

      const isCurrentUserAssigned = state.user && assignedIds.includes(state.user.id);
      const nextUser = isCurrentUserAssigned
        ? { ...state.user, available: true }
        : state.user;

      return {
        ...state,
        user: nextUser,
        volunteers: nextVolunteers,
        users: nextVolunteers,
        activeTasks: state.activeTasks.filter(t => t.id !== taskId),
        taskHistory: [resolvedTask, ...state.taskHistory],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId,
            message: `Task "${task.title}" cancelled.`,
            type: 'warning',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Expire Task â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'EXPIRE_TASK': {
      const taskId = action.payload;
      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      const assignedIds = task.acceptedBy || [];

      // AUTO-COMPLETE: crew was on task, give XP same as COMPLETE_TASK
      if (assignedIds.length > 0) {
        let celebrationToTrigger = null;

        const nextVolunteers = state.volunteers.map(v => {
          if (!assignedIds.includes(v.id)) return v;

          const userCompletedTasks = state.taskHistory.filter(
            t => t.status === 'completed' && (t.acceptedBy || []).includes(v.id)
          );
          const sortedHistory = [...userCompletedTasks].sort(
            (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
          );
          const lastTask = sortedHistory[0] || null;
          const isRepeatedCategory = lastTask && lastTask.requiredSkill === task.requiredSkill;

          let baseXP = XP_REWARDS.low;
          if (task.priority === 'critical') baseXP = XP_REWARDS.critical;
          else if (task.priority === 'high') baseXP = XP_REWARDS.high;
          else if (task.priority === 'medium') baseXP = XP_REWARDS.medium;

          const isFirstAccepted = assignedIds[0] === v.id;
          const responderBonus = isFirstAccepted ? XP_REWARDS.firstResponder : 0;
          const nextStreak = (v.streakCount || 0) + 1;
          const streakBonus = nextStreak >= 3 ? XP_REWARDS.streak : 0;

          let xpEarned = baseXP + responderBonus + streakBonus;
          if (isRepeatedCategory) xpEarned = Math.round(xpEarned * XP_REWARDS.categoryRepeatPenalty);

          const currentXp = v.xp || 0;
          const nextXp = currentXp + xpEarned;
          const currentLevelInfo = calculateLevelInfo(currentXp);
          const nextLevelInfo = calculateLevelInfo(nextXp);

          if (state.user && state.user.id === v.id && nextLevelInfo.level > currentLevelInfo.level) {
            celebrationToTrigger = { type: 'level_up', value: nextLevelInfo.level };
          }

          return {
            ...v,
            available: true,
            tasksCompleted: (v.tasksCompleted || 0) + 1,
            criticalTasksCompleted: (v.criticalTasksCompleted || 0) + (task.priority === 'critical' ? 1 : 0),
            xp: nextXp,
            level: nextLevelInfo.level,
            rankTitle: nextLevelInfo.rankTitle,
            streakCount: nextStreak,
            responseRate: Math.min(100, (v.responseRate || 80) + 4),
          };
        });

        const resolvedTask = {
          ...task,
          status: 'completed',
          completionNote: 'Auto-completed: timer elapsed with active crew.',
          completedAt: new Date().toISOString(),
        };

        const isCurrentUserAssigned = state.user && assignedIds.includes(state.user.id);
        const nextUser = isCurrentUserAssigned
          ? nextVolunteers.find(v => v.id === state.user.id)
          : state.user;

        return {
          ...state,
          user: nextUser,
          volunteers: nextVolunteers,
          users: nextVolunteers,
          activeTasks: state.activeTasks.filter(t => t.id !== taskId),
          taskHistory: [resolvedTask, ...state.taskHistory],
          celebration: celebrationToTrigger || state.celebration,
          notifications: [
            {
              id: `notif-${Date.now()}`,
              taskId,
              message: `Timer elapsed \u2014 "${task.title}" auto-completed. Crew rewarded.`,
              type: 'success',
              timestamp: Date.now(),
              read: false,
            },
            ...state.notifications,
          ],
        };
      }

      // PLAIN EXPIRE: no crew assigned
      const resolvedTask = {
        ...task,
        status: 'expired',
        expiredAt: new Date().toISOString(),
      };

      return {
        ...state,
        activeTasks: state.activeTasks.filter(t => t.id !== taskId),
        taskHistory: [resolvedTask, ...state.taskHistory],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId,
            message: `Dispatch expired (no crew): "${task.title}"`,
            type: 'warning',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // â”€â”€ Task Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'SEND_CHAT_MESSAGE': {
      const { taskId, senderId, senderName, text } = action.payload;
      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        senderId,
        senderName,
        text,
        timestamp: Date.now(),
      };

      const updateTaskMessages = t => {
        if (t.id === taskId) {
          return { ...t, messages: [...(t.messages || []), message] };
        }
        return t;
      };

      return {
        ...state,
        activeTasks: state.activeTasks.map(updateTaskMessages),
        taskHistory: state.taskHistory.map(updateTaskMessages),
      };
    }

    // â”€â”€ Availability Toggle (manual Busy/Available) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'TOGGLE_AVAILABILITY': {
      const volunteerId = action.payload;
      const isCurrentUser = state.user?.id === volunteerId;

      const nextVolunteers = state.volunteers.map(v =>
        v.id === volunteerId ? { ...v, available: !v.available } : v
      );

      const nextUser = isCurrentUser
        ? { ...state.user, available: !state.user.available }
        : state.user;

      return {
        ...state,
        user: nextUser,
        volunteers: nextVolunteers,
        users: nextVolunteers,
      };
    }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return { ...state, notifications: [] };

    // â”€â”€ Direct Messaging â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    case 'SEND_DIRECT_MESSAGE': {
      const { senderId, senderName, receiverId, receiverName, text } = action.payload;
      const newMessage = {
        id: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        senderId,
        senderName,
        receiverId,
        receiverName,
        text,
        timestamp: Date.now(),
        read: false
      };

      const isToOrganizer = receiverId === state.organizer.id || receiverName === 'Coordinator';

      const notif = {
        id: `notif-dm-${Date.now()}`,
        message: `Message from ${senderName}: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`,
        type: 'message',
        timestamp: Date.now(),
        read: false,
        senderId,
        volunteerId: senderId,
        ...(isToOrganizer ? { targetRole: 'organizer' } : { targetVolunteerId: receiverId })
      };

      return {
        ...state,
        directMessages: [...(state.directMessages || []), newMessage],
        notifications: [notif, ...state.notifications]
      };
    }

    case 'MARK_DIRECT_MESSAGES_READ': {
      const { volunteerId, userId } = action.payload;
      const updated = (state.directMessages || []).map(msg => {
        if (
          (msg.receiverId === userId && msg.senderId === volunteerId) ||
          (msg.receiverId === volunteerId && msg.senderId === userId)
        ) {
          return { ...msg, read: true };
        }
        return msg;
      });
      const updatedNotifs = (state.notifications || []).map(n => {
        if (n.type === 'message' && n.volunteerId === volunteerId) {
          return { ...n, read: true };
        }
        return n;
      });
      return {
        ...state,
        directMessages: updated,
        notifications: updatedNotifs
      };
    }

    case 'SET_ACTIVE_DIRECT_CHAT': {
      return { ...state, activeDirectChatVolunteerId: action.payload };
    }

    // ── Events ───────────────────────────────────────────────────────────
    case 'CREATE_EVENT': {
      const newEvent = {
        id: `event-${Date.now()}`,
        title: action.payload.title || 'Untitled Event',
        description: action.payload.description || '',
        date: action.payload.date || new Date().toISOString().slice(0, 10),
        venue: action.payload.venue || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: action.payload.createdBy || 'org-1',
      };
      return {
        ...state,
        events: [newEvent, ...state.events],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            message: `New event created: "${newEvent.title}"`,
            type: 'success',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'UPDATE_EVENT': {
      const { eventId, updates } = action.payload;
      return {
        ...state,
        events: state.events.map(ev =>
          ev.id === eventId ? { ...ev, ...updates } : ev
        ),
      };
    }

    case 'COMPLETE_EVENT': {
      const { eventId } = action.payload;
      return {
        ...state,
        events: state.events.map(ev =>
          ev.id === eventId
            ? { ...ev, status: 'completed', completedAt: new Date().toISOString() }
            : ev
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            message: `Event marked as completed.`,
            type: 'success',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'DELETE_EVENT': {
      const { eventId } = action.payload;
      return {
        ...state,
        events: state.events.filter(ev => ev.id !== eventId),
      };
    }

    // ── Task Completion Requests ──────────────────────────────────────────
    case 'REQUEST_TASK_COMPLETION': {
      const { taskId, volunteerId, completionNote } = action.payload;
      const volunteerName = state.volunteers.find(v => v.id === volunteerId)?.name || 'Crew member';
      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      return {
        ...state,
        activeTasks: state.activeTasks.map(t =>
          t.id === taskId
            ? { ...t, status: 'waiting_review', completionNote, requestedBy: volunteerId, requestedAt: new Date().toISOString() }
            : t
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId,
            message: `${volunteerName} requested completion approval for "${task.title}"`,
            type: 'info',
            timestamp: Date.now(),
            read: false,
            targetRole: 'organizer',
          },
          ...state.notifications,
        ],
      };
    }

    case 'APPROVE_TASK_COMPLETION': {
      const { taskId } = action.payload;
      // Reuse the existing COMPLETE_TASK logic by delegating
      // We inline it here to avoid code duplication issues
      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      const resolvedTask = {
        ...task,
        status: 'completed',
        completedAt: new Date().toISOString(),
        approvedByOrganizer: true,
      };

      const assignedIds = task.acceptedBy || [];
      let celebrationToTrigger = null;

      const nextVolunteers = state.volunteers.map(v => {
        if (!assignedIds.includes(v.id)) return v;

        let baseXP = XP_REWARDS.low;
        if (task.priority === 'critical') baseXP = XP_REWARDS.critical;
        else if (task.priority === 'high') baseXP = XP_REWARDS.high;
        else if (task.priority === 'medium') baseXP = XP_REWARDS.medium;

        const isFirstAccepted = assignedIds[0] === v.id;
        const responderBonus = isFirstAccepted ? XP_REWARDS.firstResponder : 0;
        const nextStreak = (v.streakCount || 0) + 1;
        const streakBonus = nextStreak >= 3 ? XP_REWARDS.streak : 0;
        const xpEarned = baseXP + responderBonus + streakBonus;

        const currentXp = v.xp || 0;
        const nextXp = currentXp + xpEarned;
        const currentLevelInfo = calculateLevelInfo(currentXp);
        const nextLevelInfo = calculateLevelInfo(nextXp);

        const currentAchievements = v.achievements || [];
        const newAchievements = [...currentAchievements];
        const unlockedNow = [];
        const nextTasksCompleted = (v.tasksCompleted || 0) + 1;
        const nextCriticalTasksCompleted = (v.criticalTasksCompleted || 0) + (task.priority === 'critical' ? 1 : 0);
        const nextResponseRate = Math.min(100, (v.responseRate || 80) + 4);

        const unlock = id => { if (!newAchievements.includes(id)) { newAchievements.push(id); unlockedNow.push(id); } };
        if (nextTasksCompleted === 1) unlock('First Task Completed');
        if (nextTasksCompleted === 5) unlock('5 Tasks Completed');
        if (nextTasksCompleted === 10) unlock('10 Tasks Completed');
        if (task.priority === 'critical') unlock('First Critical Task');
        if (isFirstAccepted) unlock('Fastest Responder');
        if (nextStreak === 7) unlock('7-Day Active Streak');
        if (nextResponseRate === 100 && nextTasksCompleted >= 3) unlock('100% Response Rate');

        if (state.user && state.user.id === v.id) {
          if (nextLevelInfo.level > currentLevelInfo.level) {
            celebrationToTrigger = { type: 'level_up', value: nextLevelInfo.level };
          } else if (unlockedNow.length > 0) {
            celebrationToTrigger = { type: 'achievement', value: unlockedNow[0] };
          }
        }

        return {
          ...v,
          available: true,
          tasksCompleted: nextTasksCompleted,
          criticalTasksCompleted: nextCriticalTasksCompleted,
          xp: nextXp,
          level: nextLevelInfo.level,
          rankTitle: nextLevelInfo.rankTitle,
          streakCount: nextStreak,
          responseRate: nextResponseRate,
          achievements: newAchievements,
        };
      });

      const isCurrentUserAssigned = state.user && assignedIds.includes(state.user.id);
      const nextUser = isCurrentUserAssigned
        ? nextVolunteers.find(v => v.id === state.user.id)
        : state.user;

      return {
        ...state,
        user: nextUser,
        volunteers: nextVolunteers,
        users: nextVolunteers,
        activeTasks: state.activeTasks.filter(t => t.id !== taskId),
        taskHistory: [resolvedTask, ...state.taskHistory],
        celebration: celebrationToTrigger || state.celebration,
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId,
            message: `Task "${task.title}" approved and completed. Crew rewarded!`,
            type: 'success',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'REJECT_TASK_COMPLETION': {
      const { taskId, reason } = action.payload;
      const task = state.activeTasks.find(t => t.id === taskId);
      if (!task) return state;

      return {
        ...state,
        activeTasks: state.activeTasks.map(t =>
          t.id === taskId
            ? { ...t, status: 'accepted', completionNote: '', requestedBy: null, rejectionReason: reason || '' }
            : t
        ),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            taskId,
            message: `Completion request rejected for "${task.title}". Task remains active.`,
            type: 'warning',
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    // ── Theme ─────────────────────────────────────────────────────────────
    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('crewsync-theme', newTheme);
      return { ...state, theme: newTheme };
    }

    // ── Dynamic Locations & Skills ────────────────────────────────────────
    case 'ADD_LOCATION': {
      const newLoc = (action.payload || '').trim();
      if (!newLoc) return state;
      const normalized = state.locations.map(l => l.toLowerCase());
      if (normalized.includes(newLoc.toLowerCase())) return state;
      return { ...state, locations: [...state.locations, newLoc] };
    }

    case 'DELETE_LOCATION': {
      const targetLoc = action.payload;
      return { ...state, locations: state.locations.filter(loc => loc !== targetLoc) };
    }

    case 'ADD_SKILL': {
      const newSkill = (action.payload || '').trim();
      if (!newSkill) return state;
      const normalized = state.taskTypes.map(s => s.toLowerCase());
      if (normalized.includes(newSkill.toLowerCase())) return state;
      return { ...state, taskTypes: [...state.taskTypes, newSkill] };
    }

    case 'DELETE_SKILL': {
      const targetSkill = action.payload;
      return { ...state, taskTypes: state.taskTypes.filter(sk => sk !== targetSkill) };
    }

    // ── Remove Volunteer (Organizer-only permanent deletion) ──────
    case 'REMOVE_VOLUNTEER': {
      const { volunteerId } = action.payload;

      // Guards: only organizer can call; cannot self-remove; target must not be organizer
      if (!state.user || state.user.role !== 'organizer') return state;
      if (volunteerId === state.user.id) return state;
      const target = state.volunteers.find(v => v.id === volunteerId);
      if (!target) return state;
      if (target.role === 'organizer') return state;

      // Remove from volunteers + users lists
      const nextVolunteers = state.volunteers.filter(v => v.id !== volunteerId);

      // Remove from every active task's acceptedBy, checkedInUsers, interestedVolunteers
      const nextActiveTasks = state.activeTasks.map(t => {
        const nextAcceptedBy      = (t.acceptedBy         || []).filter(id => id !== volunteerId);
        const nextCheckedIn       = (t.checkedInUsers      || []).filter(id => id !== volunteerId);
        const nextInterested      = (t.interestedVolunteers || []).filter(id => id !== volunteerId);

        // Recompute status so the slot opens back up
        const wasRemoved = (t.acceptedBy || []).includes(volunteerId);
        const newStatus  = wasRemoved
          ? (nextAcceptedBy.length >= (t.volunteersNeeded || 1) ? 'accepted' : 'pending')
          : t.status;

        return {
          ...t,
          acceptedBy: nextAcceptedBy,
          checkedInUsers: nextCheckedIn,
          interestedVolunteers: nextInterested,
          status: newStatus,
        };
      });

      // Remove from standbyQueue if it exists
      const nextStandby = (state.standbyQueue || []).filter(id => id !== volunteerId);

      // Purge direct messages involving this volunteer
      const nextDMs = (state.directMessages || []).filter(
        m => m.senderId !== volunteerId && m.receiverId !== volunteerId
      );

      // Purge notifications related to this volunteer
      const nextNotifs = (state.notifications || []).filter(
        n => n.volunteerId !== volunteerId && n.senderId !== volunteerId
      );

      // Organizer log notification
      const removalLog = {
        id: `notif-removal-${Date.now()}`,
        message: `Volunteer removed from crew registry: ${target.name}`,
        type: 'warning',
        timestamp: Date.now(),
        read: false,
        targetRole: 'organizer',
      };

      return {
        ...state,
        volunteers:   nextVolunteers,
        users:        nextVolunteers,
        activeTasks:  nextActiveTasks,
        standbyQueue: nextStandby,
        directMessages: nextDMs,
        notifications:  [removalLog, ...nextNotifs],
      };
    }

    default:
      return state;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// PROVIDER
// ──────────────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Apply theme class to body
  useEffect(() => {
    if (state.theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [state.theme]);

  // Persist all critical state to localStorage
  useEffect(() => {
    localStorage.setItem('crewsync-user', JSON.stringify(state.user));
    localStorage.setItem('crewsync-events', JSON.stringify(state.events || []));
    localStorage.setItem('crewsync-activeTasks', JSON.stringify(state.activeTasks));
    localStorage.setItem('crewsync-taskHistory', JSON.stringify(state.taskHistory));
    localStorage.setItem('crewsync-volunteers', JSON.stringify(state.volunteers));
    localStorage.setItem('crewsync-notifications', JSON.stringify(state.notifications));
    localStorage.setItem('crewsync-locations', JSON.stringify(state.locations));
    localStorage.setItem('crewsync-taskTypes', JSON.stringify(state.taskTypes));
    localStorage.setItem('crewsync-directMessages', JSON.stringify(state.directMessages || []));
    localStorage.setItem('crewsync-version', CURRENT_VERSION);
  }, [state.user, state.events, state.activeTasks, state.taskHistory, state.volunteers, state.notifications, state.locations, state.taskTypes, state.directMessages]);

  // ── Auto-expire tasks when their expiresAt wall-clock time is passed ──
  useEffect(() => {
    const tickExpiry = () => {
      const now = Date.now();
      state.activeTasks.forEach(task => {
        if (task.expiresAt && task.expiresAt <= now) {
          dispatch({ type: 'EXPIRE_TASK', payload: task.id });
        }
      });
    };
    tickExpiry(); // run once immediately
    const interval = setInterval(tickExpiry, 15000); // then every 15s
    return () => clearInterval(interval);
  }, [state.activeTasks]);

  // Keep logged-in user synced with volunteers list (approval, xp, etc.)

  useEffect(() => {
    if (state.user && state.user.role !== 'organizer') {
      const match = state.volunteers.find(v => v.id === state.user.id);
      if (
        match &&
        (match.approvalStatus !== state.user.approvalStatus ||
          match.role !== state.user.role ||
          match.xp !== state.user.xp ||
          match.achievements?.length !== state.user.achievements?.length)
      ) {
        dispatch({ type: 'SYNC_USER', payload: match });
      }
    }
  }, [state.volunteers, state.user]);

  // ── Auth actions ──────────────────────────────────────────────────────
  const login = useCallback(user => dispatch({ type: 'LOGIN', payload: user }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const signup = useCallback(userInfo => dispatch({ type: 'SIGNUP', payload: userInfo }), []);

  /**
   * loginWithGoogle — Abstract interface for Google Authentication.
   * During local development, this interface uses temporary frontend state
   * only to support UI rendering and interaction.
   * The backend developer will replace the underlying implementation
   * with Firebase services without requiring UI changes.
   */
  const loginWithGoogle = useCallback(async () => {
    // FRONTEND INTERFACE ONLY — backend developer replaces body with Firebase Auth.
    // Resolves with: { success: boolean, user: object|null, error: string|null }
    console.warn('[loginWithGoogle] Abstract interface — Firebase integration pending.');
    return { success: false, user: null, error: 'Google Auth not yet integrated. Use email/password login.' };
  }, []);

  // ── Event actions ─────────────────────────────────────────────────────
  const createEvent = useCallback(
    (eventData) => dispatch({ type: 'CREATE_EVENT', payload: eventData }),
    []
  );
  const updateEvent = useCallback(
    (eventId, updates) => dispatch({ type: 'UPDATE_EVENT', payload: { eventId, updates } }),
    []
  );
  const completeEvent = useCallback(
    (eventId) => dispatch({ type: 'COMPLETE_EVENT', payload: { eventId } }),
    []
  );
  const deleteEvent = useCallback(
    (eventId) => dispatch({ type: 'DELETE_EVENT', payload: { eventId } }),
    []
  );

  // ── Completion Request actions ────────────────────────────────────────
  /**
   * requestTaskCompletion — Called by a volunteer to submit a completion request.
   * Updates frontend state required to render: Task Status, Event Progress,
   * Profile Statistics, XP, Level, Rank, Leaderboard.
   * The backend will become the authoritative source after Firebase integration.
   */
  const requestTaskCompletion = useCallback(
    (taskId, volunteerId, completionNote) =>
      dispatch({ type: 'REQUEST_TASK_COMPLETION', payload: { taskId, volunteerId, completionNote } }),
    []
  );

  /**
   * approveTaskCompletion — Called by the organizer to approve a completion request.
   * Updates the frontend state required to render:
   * Task Status, Event Progress, Profile Statistics, XP, Level, Rank, Leaderboard.
   * These updates exist only to support frontend rendering and local testing.
   * The backend will become the authoritative source after Firebase integration.
   */
  const approveTaskCompletion = useCallback(
    (taskId) => dispatch({ type: 'APPROVE_TASK_COMPLETION', payload: { taskId } }),
    []
  );

  const rejectTaskCompletion = useCallback(
    (taskId, reason) => dispatch({ type: 'REJECT_TASK_COMPLETION', payload: { taskId, reason } }),
    []
  );

  // â”€â”€ Task actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addTask = useCallback(task => dispatch({ type: 'ADD_TASK', payload: task }), []);
  const cancelTask = useCallback(taskId => dispatch({ type: 'CANCEL_TASK', payload: taskId }), []);
  const deleteTask = useCallback(taskId => dispatch({ type: 'DELETE_TASK', payload: taskId }), []);
  const acceptTask = useCallback((taskId, volunteerId) =>
    dispatch({ type: 'ACCEPT_TASK', payload: { taskId, volunteerId } }), []);
  const leaveTask = useCallback((taskId, volunteerId) =>
    dispatch({ type: 'LEAVE_TASK', payload: { taskId, volunteerId } }), []);
  const expressInterest = useCallback((taskId, volunteerId) =>
    dispatch({ type: 'EXPRESS_INTEREST', payload: { taskId, volunteerId } }), []);
  const approveInterest = useCallback((taskId, volunteerId) =>
    dispatch({ type: 'APPROVE_INTEREST', payload: { taskId, volunteerId } }), []);

  // â”€â”€ Task Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sendChatMessage = useCallback((taskId, senderId, senderName, text) => {
    dispatch({ type: 'SEND_CHAT_MESSAGE', payload: { taskId, senderId, senderName, text } });
  }, []);

  // ── Complete Task (simplified to delegate entirely to the reducer) ──
  const completeTask = useCallback((taskId, volunteerId, completionNote) => {
    let note = completionNote;
    if (typeof volunteerId === 'string' && !completionNote) {
      note = volunteerId;
    }
    dispatch({
      type: 'COMPLETE_TASK',
      payload: {
        taskId,
        completionNote: note,
      },
    });
  }, []);

  const expireTask = useCallback(taskId => dispatch({ type: 'EXPIRE_TASK', payload: taskId }), []);
  const toggleAvailability = useCallback(
    volunteerId => dispatch({ type: 'TOGGLE_AVAILABILITY', payload: volunteerId }), []
  );
  const dismissNotification = useCallback(
    id => dispatch({ type: 'DISMISS_NOTIFICATION', payload: id }), []
  );
  const markNotificationRead = useCallback(
    id => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }), []
  );
  const clearAllNotifications = useCallback(
    () => dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' }), []
  );
  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);

  const userNotifications = useMemo(() => {
    if (!state.user) return [];
    return state.notifications.filter(n => {
      // Prevent self-notifications
      if (n.senderId === state.user.id) {
        return false;
      }
      if (n.type === 'message') {
        if (state.user.role === 'organizer') {
          return n.targetRole === 'organizer';
        } else {
          return n.targetVolunteerId === state.user.id;
        }
      }
      if (n.targetVolunteerId) {
        return n.targetVolunteerId === state.user.id;
      }
      if (n.targetRole) {
        return n.targetRole === state.user.role;
      }
      return true;
    });
  }, [state.notifications, state.user]);

  const sendDirectMessage = useCallback(
    (senderId, senderName, receiverId, receiverName, text) =>
      dispatch({ type: 'SEND_DIRECT_MESSAGE', payload: { senderId, senderName, receiverId, receiverName, text } }),
    []
  );

  const markDirectMessagesRead = useCallback(
    (volunteerId, userId) =>
      dispatch({ type: 'MARK_DIRECT_MESSAGES_READ', payload: { volunteerId, userId } }),
    []
  );

  const setActiveDirectChat = useCallback(
    (volunteerId) =>
      dispatch({ type: 'SET_ACTIVE_DIRECT_CHAT', payload: volunteerId }),
    []
  );

  const approveUser = useCallback(
    userId => dispatch({ type: 'APPROVE_USER', payload: { userId } }), []
  );
  const rejectUser = useCallback(
    userId => dispatch({ type: 'REJECT_USER', payload: { userId } }), []
  );
  const clearCelebration = useCallback(() => dispatch({ type: 'CLEAR_CELEBRATION' }), []);

  const removeVolunteer = useCallback(
    (volunteerId) => dispatch({ type: 'REMOVE_VOLUNTEER', payload: { volunteerId } }),
    []
  );

  // â”€â”€ Dynamic field callbacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addLocation = useCallback(loc => dispatch({ type: 'ADD_LOCATION', payload: loc }), []);
  const deleteLocation = useCallback(loc => dispatch({ type: 'DELETE_LOCATION', payload: loc }), []);
  const addSkill = useCallback(sk => dispatch({ type: 'ADD_SKILL', payload: sk }), []);
  const deleteSkill = useCallback(sk => dispatch({ type: 'DELETE_SKILL', payload: sk }), []);

  // â”€â”€ Authenticate (login lookup) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const authenticate = useCallback(
    (email, password) => {
      // Check organizer/admin account
      if (email === state.organizer.email && password === state.organizer.password) {
        return { success: true, user: state.organizer };
      }
      // Check volunteer/organizer-request accounts in volunteers array
      const vol = state.volunteers.find(v => v.email === email && v.password === password);
      if (vol) {
        return { success: true, user: vol };
      }
      return { success: false, user: null };
    },
    [state.organizer, state.volunteers]
  );

  // â”€â”€ Leaderboard score helper (exported for convenience) â”€â”€
  const computeLeaderboardScore = useCallback(vol => {
    return (
      (vol.xp || 0) +
      (vol.tasksCompleted || 0) * 10 +
      (vol.criticalTasksCompleted || 0) * 20 +
      (vol.responseRate || 0) * 5
    );
  }, []);

  // Forcing leaderboard live recompute
  const leaderboard = useMemo(() => {
    return state.volunteers
      .filter(v => v.role === 'volunteer' && v.approvalStatus === 'approved')
      .map(v => ({
        ...v,
        score: (v.xp || 0) + (v.tasksCompleted || 0) * 10 + (v.criticalTasksCompleted || 0) * 20 + (v.responseRate || 0) * 5
      }))
      .sort((a, b) => b.score - a.score);
  }, [state.volunteers]);

  const value = {
    ...state,
    notifications: userNotifications,
    leaderboard,
    // Auth
    login,
    logout,
    signup,
    authenticate,
    loginWithGoogle,
    // Events
    createEvent,
    updateEvent,
    completeEvent,
    deleteEvent,
    // Tasks
    addTask,
    cancelTask,
    deleteTask,
    acceptTask,
    leaveTask,
    completeTask,
    expireTask,
    // Completion Requests
    requestTaskCompletion,
    approveTaskCompletion,
    rejectTaskCompletion,
    // Interest
    expressInterest,
    approveInterest,
    // Chat
    sendChatMessage,
    // Availability / Busy Lock
    toggleAvailability,
    // Approvals
    approveUser,
    rejectUser,
    // Dynamic fields
    addLocation,
    deleteLocation,
    addSkill,
    deleteSkill,
    // Notifications
    dismissNotification,
    markNotificationRead,
    clearAllNotifications,
    // Theme
    toggleTheme,
    // Direct Messaging
    sendDirectMessage,
    markDirectMessagesRead,
    setActiveDirectChat,
    // Celebration
    clearCelebration,
    // Crew Moderation
    removeVolunteer,
    // Utilities
    computeLeaderboardScore,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

