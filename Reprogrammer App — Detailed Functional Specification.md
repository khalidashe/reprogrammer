# Reprogrammer App — Detailed Functional Specification

## Overview

**Reprogrammer** is a behavioral habit-tracking mobile app (iOS/Android) that helps users reprogram their automatic behaviors through **deliberate awareness**. The app's core loop is:

1. User creates a behavior to practice (e.g., "sit up straight")
2. App sends randomized notifications within a daily time window (e.g., 9am-9pm)
3. User responds Yes/No to each ping
4. App tracks streaks and provides feedback (level-ups, pauses)

**Tagline:** NOTICE · REPEAT · REPROGRAM

---

## User Flows

### 1. First Launch (Onboarding)
- **Splash screen** (1.4s animated intro) appears on app start
- User is shown **4 template behaviors** as quick-start options:
  - Confident Posture
  - Unreactive Listening
  - Poker Face
  - Eye Contact
- User can tap templates to add them instantly, or skip and create custom behaviors
- Tapping "Continue" or creating a behavior sets `hasOnboarded = true`
- User is routed to the Home screen

### 2. Home Screen (Main Dashboard)
- **Behavior grid view** showing all active behaviors as cards
- Each card displays:
  - Behavior title (e.g., "Sit Up Straight")
  - Time window (e.g., "09:00 - 21:00")
  - **Current streak** (displayed prominently in large, bright text)
  - Quick stats: "X check-ins today", "Y active behaviors"
- **Action buttons:**
  - "+" button to create new behavior
  - Refresh button to manually reschedule all notifications
  - Settings icon to manage/archive behaviors
  - Profile icon to view stats

### 3. Create/Edit Behavior
- **Modal that slides up from bottom** with a comprehensive form:

  **Section 1: Core**
  - Behavior title (e.g., "Confident Posture")
  - Custom ping message (what the notification says; defaults to the title)
  - Example: "Sit up straight" or "Enter room with eye contact"

  **Section 2: Scheduling**
  - Active days (toggles for Sun, Mon, Tue, etc.)
  - Time window: Start time and End time (HH:mm; e.g., 09:00 to 21:00)
  - Frequency: Pings per hour — 1-120 (one ping per hour up to two pings per minute)
  - **Note:** Pings are spread evenly across the window with ~20% jitter around each slot center. Total pings/day = `pingsPerHour × windowHours`.

- **Save** persists the behavior and schedules all notifications for the next 7 days
- **Edit** updates an existing behavior and re-schedules notifications
- **Delete** removes the behavior and all its check-ins and notifications

### 4. Behavior Detail Screen
- Shows rich **streak counter** (current consecutive "yes" days)
  - Allows today to be missing (so "yes on Mon, yes on Tue, missed Wed" = 2-day streak)
- **Calendar visualization:**
  - 30-90 day grid of dots representing each day
  - Green dots = "yes" check-ins
  - Gray dots = "no" check-ins
  - Hollow/blank dots = no check-in for that day
  - Inactive dots = days outside the active days range
- **Recent check-ins list:**
  - Timestamp, result (yes/no), optional user note
  - Chronologically sorted (newest first)
- **Journal section:**
  - All accumulated notes from check-ins and manual edits
- **Actions:**
  - Edit behavior
  - Archive/hide behavior
  - Bookmark/favorite behavior
  - Delete behavior

### 5. Check-In Sheet (Triggered by Notification)
- **When user taps a notification,** app deep-links to this screen with:
  - Behavior ID
  - Attempt ID (to track which notification this is)
  - Phase (initial ping, 15-min snooze, or 30-min snooze)

- **Large Yes/No buttons** for quick response
- **Optional note field** (user can add context: "felt awkward", "worked well", etc.)
- **On Yes:**
  - Check-in is marked as resolved
  - Streak may increase
  - If streak hits 7+ days, behavior levels up (see Level-Up Logic below)
- **On No:**
  - Check-in is marked as failed
  - Notification is rescheduled for a snooze (15 min, then 30 min)
  - After 3 consecutive "no"s, behavior is paused until end-of-day

### 6. Profile Screen
- User profile: name, bio, optional avatar
- **Stats dashboard:**
  - Total behaviors (all + active)
  - Total check-ins
  - Success rate (% of "yes" responses)
  - Longest streak (across all behaviors)
  - Total days active

### 7. Settings/Management Screen
- List of all behaviors (including hidden/archived ones)
- **Bulk actions:**
  - Archive/hide multiple behaviors
  - Export behavior data (JSON)
  - Clear all check-ins (for a specific behavior)
- **Behavior cards** show:
  - Title, current streak, last check-in date
  - Delete button
  - Archive button

---

## Notification System

### Scheduling
- **When behavior is created or updated,** the app calculates the next 7 days of notifications
- For each active day within the time window:
  - Computes `effectiveInterval = intervalMinutes × LEVEL_MULTIPLIERS[level - 1]` (capped at 120 minutes)
  - Walks the window in steps of `effectiveInterval`, placing one anchor at each step (first anchor at window start)
  - Applies ±20% jitter to each anchor (variable-interval reinforcement is more durable than fixed; Skinner)
  - Enforces a minimum gap of 60% of `effectiveInterval` between consecutive pings to prevent jitter-induced collisions
  - Skips slots whose time has already passed today
  - Soft-caps at 30 pings/day per behavior to stay under the iOS 60-pending global limit
  - Schedules each as a local device notification (soonest-first global ordering)

### Level-Based Expansion (Spaced Repetition)
- The base `intervalMinutes` is the user's chosen practice density (e.g., every 5 min during focused practice)
- As the user builds streaks, the app expands the effective interval, mirroring SM-2 ease-factor expansion: dense pinging during habit formation, gradual spacing-out during consolidation
- Multiplier curve indexed by `level`: `[1.0, 1.5, 2.5, 4.0, 6.0]` — final value reused for levels beyond 5
- On lapse (3 consecutive "no" responses → end-of-day pause), `level` decrements by 1 (floor 1) so the next day contracts back to denser practice
- Effective interval is hard-capped at 120 minutes

### Notification Content
- **Title:** Behavior title (e.g., "Sit Up Straight")
- **Body:** Custom ping message (e.g., "Check your posture now")
- **Metadata:**
  - Behavior ID (to route the response)
  - Attempt ID (to track which specific notification this is)
  - Phase (initial, snooze15, snooze30)

### Retry/Snooze Logic
- **On "No" response:**
  1. First "no" → reschedule 15 minutes later
  2. Second "no" → reschedule 30 minutes later
  3. Third "no" → pause behavior until end-of-day; cancel remaining pings

### Permissions
- **iOS:** App requests notification permission during onboarding
- **Android:** Notifications granted by default

---

## Data Model

### Behavior
```
- id (unique string)
- title (e.g., "Confident Posture")
- pingMessage (custom notification text)
- journal (accumulated notes)
- activeDays (array of 0-6: Sun-Sat)
- window:
  - from (HH:mm, e.g., "09:00")
  - to (HH:mm, e.g., "21:00")
- intervalMinutes (number; one of the presets [1, 2, 5, 10, 15, 20, 30, 45, 60]; minutes between consecutive pings within the window before level expansion is applied)
- level (1, 2, 3, ... — increases on level-ups; multiplies `intervalMinutes` to produce the effective scheduling interval)
- pausedUntil (timestamp; if set, no notifications until this time)
- lastLevelUpStreak (streak count when last leveled up)
- createdAt (timestamp)
- hidden (archived flag)
- bookmarked (favorite flag)
```

### Check-In
```
- id (unique)
- behaviorId (which behavior)
- at (timestamp)
- result ('yes' | 'no')
- note (optional user comment)
```

### Reminder Attempt
```
- id (unique)
- behaviorId (which behavior)
- scheduledFor (timestamp when notification fires)
- phase ('initial' | 'snooze15' | 'snooze30')
- status ('scheduled' | 'resolved' | 'skipped' | 'disabled')
- noCount (count of consecutive "no" responses)
- createdAt, updatedAt
```

---

## Streak & Level-Up Logic

### Streak Calculation
- **Counts consecutive "yes" check-ins** working backwards from today
- **Allows today to be missing:** If you have "yes" on Mon, "yes" on Tue, and no check-in on Wed, your streak from Wed's perspective is 2 (Tue-Mon)
- **Streak resets to 0** if you get a "no" check-in

### Level-Up System
- **Trigger:** When streak reaches 7 days AND `(streak - lastLevelUpStreak) >= 7`
- **Effect:**
  - Behavior's `level` increments
  - `lastLevelUpStreak` is updated to the current streak
- **Rationale:** Marks progress and achievement milestones

---

## Storage & Persistence

### Local Storage
- All data stored in device's **AsyncStorage** (async key-value store)
- Keys:
  - `rpg.behaviors.v1` (array of behaviors)
  - `rpg.checkins.v1` (array of check-ins)
  - `rpg.reminderAttempts.v1` (array of notification attempts)
  - `rpg.app.v1` (user profile, onboarding flag)

### On App Launch
- App loads all data from AsyncStorage
- Zustand store is hydrated with behaviors, check-ins, profile
- Notification listener is attached
- If it's a new day or app was closed, notifications are rescheduled

### On App Resume
- All notifications are recalculated and rescheduled (in case system clock changed)

### Error Handling
- If a behavior is malformed, it's silently ignored on load
- Errors are logged locally (max 100 entries) for debugging
- Invalid data doesn't crash the app; defaults to empty state

---

## Optional Advanced Features (Deferred to v2)

These are designed but not yet implemented:

1. **Cloud Sync:** Clerk authentication + backend API
   - User account, login, cross-device sync
   - Behavior backup and restore
   
2. **Geofencing:** Location-based behavior triggers
   - "When entering the office, practice eye contact"
   - Separate from time-based notifications
   
3. **Calendar Integration:** Sync with iOS Calendar/Google Calendar
   - Block time for "focused behavior practice"
   
4. **Analytics Dashboard:**
   - Weekly review screen
   - Success trends, habit evolution graphs
   - Insights (e.g., "You're most consistent on Tuesdays")
   
5. **Behavior Archival UX:**
   - Archive/hibernate behaviors without deleting
   - "Resume later" flow
   
6. **Customization:**
   - Snooze notifications (delay by hours or days)
   - Behavior sharing with friends (accountability partners)
   
7. **AI Suggestions:**
   - Recommend behaviors based on user profile
   - Suggest better phrasing for behavior intentions
   - Infer optimal notification windows from user's check-in patterns

---

## Technical Constraints

- **Mobile-first:** iOS and Android via React Native/Expo
- **No internet required:** All functionality works offline
- **Local notifications only:** No push server (v1)
- **AsyncStorage only:** No database (v1)
- **No external analytics:** User data stays on device
- **Dark theme by default:** Minimal light theme support for now

---

## Key User Behaviors to Support

1. **Casual users:** Create 1-2 behaviors, check in occasionally, don't engage with streaks
   - Benefit: Reminders alone are valuable for awareness
   
2. **Engaged users:** Create 5+ behaviors, respond to most pings, aim for streaks
   - Benefit: Gamified progression, level-ups, streak competition
   
3. **Power users:** Customize everything, track journal notes, export data, manage multiple projects
   - Benefit: Deep analytics, behavior relationships, personal insights

---

## Summary

Reprogrammer is a **focused MVP** that excels at one thing: **surfacing automatic behaviors into conscious awareness through randomized notifications and tracking progress via streaks**. The app is designed to scale to cloud sync, geofencing, and advanced analytics, but v1 is deliberately minimal—just the core notification → check-in → streak loop.
