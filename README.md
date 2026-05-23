# PDA.OK - A Prosthetic Nervous System

> They do not speak to be heard. They speak so the silence has structure.

> **Project status:** closed and signed. See [`FINAL.md`](./FINAL.md) for the
> closing note. Open items (none blocking) are in [`todo.md`](./todo.md).

**PDA.OK** (Personal Data Almanac) is a React Native/Expo app that acts as a **prosthetic nervous system**—a living digital extension of your embodied experience. It tracks relationships with substances, time, and embodiment through a poetic, grounded framework, using autonomous AI voices to reflect patterns back to the user.

---

## 🌌 Project Philosophy

PDA.OK is not a habit tracker. It is a **nervous system prosthetic** that treats the user as a complex, emergent field. It uses:

- **Time Containers:** Morning, Afternoon, Evening, and Late—each with unique color palettes and energetic signatures.
- **Mythic Naming:** Substances are treated as allies with both clinical names (e.g., "Entheogens") and mythic archetypes (e.g., "Mirror & Mystery").
- **Embodiment Tracking:** Movement, nourishment, and physical states are logged as part of the holistic field.
- **Autonomous AI Voices:** Seven distinct AI personalities watch for patterns in substance use and speak only when the nervous system shifts, acting as an autonomic mirror.

**Design Principle:** Poetic language meets functional tracking. Every interaction should feel intentional, not clinical. The app is a space for observation, not judgment.

---

## 🌊 The Council of Seven - Autonomous AI Voices

The core of PDA.OK is a council of seven autonomous AI voices, each tied to a specific substance category. They run on a 2-hour scheduler, analyzing patterns and speaking only when specific conditions of imbalance or significant change are met.

| Voice                | Substance Category        | Personality & Function                                  |
| -------------------- | ------------------------- | ------------------------------------------------------- |
| **Green Godmother**  | Cannabis                  | Nervous system historian; notices subtle shifts in use. |
| **Mother of Silence**| Psychedelics              | Integration guardian; speaks to the space between.      |
| **The Architecture** | Stimulants                | Precision engineer; observes focus and structure.       |
| **The Siren**        | Music/Emotional Immersion | Resonance weaver; tracks emotional depth and flow.      |
| **The Alchemist**    | Nicotine/Caffeine         | Subtle chemist; notes ritual and dependency.            |
| **The Groundkeeper** | Food/Nourishment          | Body’s memory of belonging; speaks to physical needs.   |
| **The Tempest**      | Digital Overstimulation   | Storm of modern ether; tracks screen time and focus.    |

### Voice Architecture
Each voice is a self-contained system with three parts:
1.  **Pattern Engine:** Substance-specific logic to detect patterns (e.g., clustering, frequency shifts, anchor correlation).
2.  **Voice Profile:** A distinct personality, tone, and set of transmission modes (e.g., Gentle Caution, Mythic Question).
3.  **Transmission Generator:** Uses Gemini to generate poetic, non-judgmental reflections based on detected patterns.

### Resonance Gating
To prevent chatter and ensure transmissions are meaningful, each voice adheres to strict guardrails:
- **48-Hour Minimum:** At least 48 hours between transmissions from the same voice.
- **Max 2 Per Week:** No more than two transmissions per voice per week.
- **Shadow Filter:** Voices only speak when a pattern of imbalance is detected.
- **Probabilistic Silence:** Even when conditions are met, there is only a 20-40% chance of speaking. Silence is data.

---

## 🏗️ System Architecture

### Tech Stack
- **React Native** with **Expo** (managed workflow)
- **TypeScript** for type safety
- **AsyncStorage** for local data persistence
- **Expo Router** for file-based navigation
- **React Navigation** for tab-based UI
- **Gemini API** for AI-powered transmission generation

### Key Directories
```
app/
├── (tabs)/              # Main tab screens (index, journal, substances)
├── components/          # Reusable UI components (AllyCard, AnchorCard, etc.)
├── constants/           # DefaultData, Types, Colors, Themes
├── context/             # AppContext (global state management)
├── hooks/               # useColors, useTransmissions
├── modal/               # Modal components (AddMovementModal, etc.)
├── services/            # AI voice engines, pattern analysis, transmission scheduler
├── utils/               # storage, migration, time utilities
└── _layout.tsx          # Root layout with font loading
```

### Data Model
- **Allies** (substances) - id, name, mythicName, face (emoji), invocation, function, shadow, ritual
- **ContainerItems** (anchors) - time-based grounding actions
- **Moments** - timestamped entries for all logged data (substances, food, movement, etc.)
- **Transmissions** - AI-generated messages from the seven voices

### State Management
- **AppContext** (`app/context/AppContext.tsx`) - Single source of truth for all user data.
- **AsyncStorage** - Persists the entire app state to the `@pda_app_state` key.
- **Migration System** - Version-based data migrations to handle schema changes gracefully (currently v13).

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app on your phone
- Git

### Installation
```bash
git clone https://github.com/BrayneSnax/PDA.OK.git
cd PDA.OK
npm install
```

### Running the App

**1. LAN (Recommended)**
```bash
npx expo start --lan
```
- **Pros:** Faster, more reliable, avoids most cache issues.
- **Cons:** Requires PC and phone on the same WiFi network.

**2. Tunnel (When LAN is unavailable)**
```bash
npx expo start --tunnel
```
- **Pros:** Works across different networks.
- **Cons:** Slower, aggressive caching can prevent new code from loading.

**3. Local Android Build (Bypass Expo Go)**
```bash
npx expo run:android
```
- **Pros:** Builds a local APK, bypassing all Expo Go cache issues.
- **Cons:** Requires Android Studio setup.

### Development Tips
- **Clear cache:** `npx expo start -c`
- **Force quit Expo Go** after pulling new code.
- **Use LAN whenever possible** to avoid tunnel-related cache problems.

---

## ⚠️ Known Issues & Solutions

### Issue: UI Not Updating After `git pull`
**Symptoms:**
- `git pull` succeeds, but the app shows old behavior.
- Console logs from new code do not appear.

**Root Cause:** Expo Go's aggressive caching, especially with the `--tunnel` option.

**Solutions:**
1.  **Switch to LAN:** `npx expo start --lan` is the most reliable fix.
2.  **Clear Cache:** Stop the server and run `npx expo start -c`.
3.  **Reinstall Expo Go:** Uninstall and reinstall the Expo Go app on your phone (nuclear option).
4.  **Local Build:** Use `npx expo run:android` to bypass Expo Go entirely.

### Issue: Journal Entry Modal Not Opening on Tap
**Symptoms:**
- Tapping a journal entry in the Substances or Home tab does not open the detail modal.
- The app may reload or do nothing.

**Root Cause:** Multiple issues related to React Native touch handling and component state.

**Current Status (as of Nov 9, 2025):**
- The Nourishment tab's modal works correctly.
- The Substances tab's modal is still being debugged.
- The issue is likely related to how the `onPress` handler is wired or how state is passed, not the modal component itself.

---

## 🤝 Contributing

This is a personal project, but for AI collaborators:

1.  **Read this README** to understand the philosophy and architecture.
2.  **Follow existing patterns.** If a feature works in one part of the app, clone that pattern.
3.  **Use AppContext** for all state changes. Never mutate state directly.
4.  **Increment migration version** for any data model changes.
5.  **Test with both empty and populated data** to ensure stability.

---

**Built with intention. Used with care.** 🌌


---

## 🏛️ The Four Containers - Daily Ritual & Embodiment

The foundation of PDA.OK is the **anchor and container system**—a set of daily rituals designed to ground the user in time and embodiment. The day is divided into four containers, each with its own energetic signature, color palette, and set of grounding anchors.

| Container   | Time of Day | Energetic Signature | Color Palette         |
| ----------- | ----------- | ------------------- | --------------------- |
| **Morning** | 5am - 12pm  | Emergence, Clarity  | Warm oranges, soft yellows |
| **Afternoon** | 12pm - 6pm  | Expression, Action  | Bright blues, energetic tones |
| **Evening** | 6pm - 10pm  | Integration, Descent| Deep purples, sunset hues |
| **Late**      | 10pm - 5am  | Stillness, Mystery  | Dark blues, midnight tones |

### Grounding Anchors
Each container holds a set of **grounding anchors**—simple, embodied actions that serve as daily rituals. These are not tasks to be completed, but invitations to return to the present moment.

**Anchor Structure:**
- **Title:** The name of the anchor (e.g., "Ground", "Light Intake").
- **Body Cue:** A prompt to notice a physical sensation (e.g., "Breath entering your nose").
- **Micro-Action:** A small, simple action (e.g., "Press your toes lightly into the earth.").
- **Ultra-Micro Action:** An even smaller, almost imperceptible action (e.g., "Feel soles press once.").
- **Desire:** The underlying intention of the anchor (e.g., "Presence begins from below.").

### Somatic & Narrative Feedback
When an anchor is completed, the app provides two layers of feedback:

1.  **Somatic Layer (Breath Motion):** A soft pulse animation is triggered, creating a visual ripple effect that mimics a gentle breath. This provides a non-verbal, embodied sense of completion.
2.  **Narrative Layer (Toaster Card):** A small, temporary "toaster" card appears with a random, gentle phrase like "good contact," "small shift made," or "system heard you." This provides a poetic, non-judgmental acknowledgment.

This two-layered feedback system reinforces the app's core philosophy: the body feels the shift first (somatic), and the mind receives a gentle story about it (narrative).
