# Reprogrammer: Spaced Repetition for Behavior Change

## Purpose

Reprogrammer is a mental health and behavior change app that uses **spaced repetition** to help users become aware of and practice changing automatic behaviors. The app is not a wellness provider—it's a practice amplifier. It helps users build awareness of unconscious patterns and provides structured reminders to practice adopting healthy behaviors or eliminating unhealthy ones. **The user does the actual work of change through practice.**

## How It Works

Users select or create "**states**"—specific behaviors or habits they want to practice (e.g., "take a 5-minute breathing break," "go to the gym," "avoid scrolling social media"). The app then:

1. **Delivers spaced-repetition prompts** at intelligently timed intervals to reinforce the behavior
2. **Brings automatic behaviors into awareness** so users recognize when they're responding habitually
3. **Tracks practice** to show progress over time
4. **Adapts** based on user engagement and mental health assessments

The app doesn't do the practice for you—users must actively engage with the behavior when prompted. This is the key to lasting behavior change: conscious, repeated practice until new patterns become automatic.

## Current State

Reprogrammer is built as a **cross-platform Expo (React Native) app** that runs on Android, iOS, and web. The foundation is solid and production-ready:

- **Tab-based navigation** with a clean Home and Explore interface
- **Light/dark mode theming** system with centralized color management
- **Full TypeScript** for type safety throughout
- **File-based routing** using Expo Router (similar to Next.js)
- **Responsive design** that adapts to all platform sizes
- **Reusable component patterns** for themed UI (ThemedText, ThemedView, etc.)

This foundation is ready for feature development. The starter template gives developers a solid platform to build the planned features without wrestling with boilerplate.

## Vision: Where We're Heading

The Linear backlog outlines the vision for Reprogrammer's evolution:

**Assessment-Driven Personalization** (REP-30, REP-32)
- Users take mental health assessments during signup and progress check-ins
- "States" (behaviors to practice) are personalized based on assessment results
- The app recommends which behaviors are most relevant to the user's mental health baseline and goals

**Therapist Collaboration** (REP-33)
- Therapists can create custom state packages tailored to individual patients
- Shareable packages let therapists recommend specific behaviors for their clients to practice
- Tracking links patient progress to therapist recommendations

**Holistic Wellness** (REP-31)
- Gym/fitness integration connects physical activity to mental health improvement
- Multiple package types (mindfulness, exercise, behavioral habits, etc.)
- Progress tracking shows correlation between practice and mental health improvements

## Tech Stack

- **Framework**: Expo ~54.0 (React Native)
- **UI**: React 19.1, React Native 0.81
- **Navigation**: Expo Router 6.0 (file-based routing)
- **Language**: TypeScript 5.9
- **Styling**: Centralized theme system with platform-specific fonts
- **Animations**: React Native Reanimated 4.1 (future: add spaced repetition UI animations)
- **Icons**: Expo Vector Icons, Expo Symbols
- **Build Tool**: Expo CLI

## Project Structure

```
app/                          # File-based routing (Expo Router)
├── _layout.tsx               # Root layout with theme provider
├── (tabs)/                   # Tab-based main navigation
│   ├── index.tsx            # Home screen
│   └── explore.tsx          # Information/education screen
└── modal.tsx                # Modal screen template

components/                   # Reusable UI components
├── themed-text.tsx          # Text with theme support
├── themed-view.tsx          # View with theme support
├── hello-wave.tsx           # Example animated component
└── ui/                      # UI primitives (collapsible, etc.)

constants/                   # App-wide constants
└── theme.ts                # Color and font definitions

hooks/                       # Custom React hooks
├── use-color-scheme.ts     # Detect light/dark preference
└── use-theme-color.ts      # Theme color utilities

assets/                      # Icons, images, splash screens
```

## Getting Started

Install dependencies:
```bash
npm install
```

Run the app:
```bash
npm start              # Start dev server
npx expo start         # Alternative command
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run on web
```

Run linting:
```bash
npm run lint
```

Reset to blank starter (if needed):
```bash
npm run reset-project
```

## Key Development Patterns

**Theming**: The app uses a centralized theme system in `constants/theme.ts` with light/dark colors. Wrap components with ThemedText and ThemedView to automatically adapt to the current theme.

**File-Based Routing**: New screens are automatically routed based on file location in `app/`. Create a new file to create a new route—no manual routing setup needed.

**Type Safety**: Full TypeScript throughout. Leverage types to prevent bugs and improve developer experience.

## Next Steps for Development

1. **States Management**: Build the core "states" data model—how users create, edit, and organize behaviors to practice
2. **Spaced Repetition Engine**: Implement the scheduling logic that determines when reminders are sent based on the forgetting curve
3. **Assessment System**: Build mental health assessment questions and scoring (REP-30)
4. **Personalization**: Link user assessment results to state recommendations (REP-32)
5. **Therapist Tools**: Build therapist-curated package creation and sharing (REP-33)

---

**Vision**: Empower users to understand and change their automatic behaviors through structured practice, with therapist support and personalized guidance from mental health data. The app is a mirror and a coach—it shows you what you're doing automatically and helps you practice change.
