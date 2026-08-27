# Untangle — Gamified Learning & Screening-Support Village

**Untangle** is a child-friendly, mobile-first gamified learning and early screening-support web application built with **React**, **TypeScript**, and **Tailwind CSS**. It realizes the complete vision of Software Requirements Specification (SRS v1.0) and integrates dynamic AI-generated educational content via Groq API with personalized progression and complete multi-player isolation.

---

## 🤖 Dynamic AI Educational Content (Groq API)

Untangle integrates a clean, decoupled AI content generation pipeline for personalized levels:

```
PLAYER PLAYS LEVEL
        ↓
LEVEL COMPLETED
        ↓
SAVE LEARNING DATA LOCALLY
        ↓
UPDATE PLAYER LEARNING PROFILE
        ↓
CREATE COMPACT LEARNING SUMMARY
        ↓
CALL GROQ API (via ContentGenerationService)
        ↓
VALIDATE GENERATED WORDS (Strict Language & Script Rules)
        ↓
STORE VALID WORDS IN LOCAL CACHE
        ↓
NEXT LEVEL USES NEW PERSONALIZED WORDS
```

### Architecture Highlights:
- **Application Controls Learning Logic:** Difficulty, score, level completion, words needing practice, words mastered, language constraints, and rewards are 100% deterministic and controlled by the app.
- **Groq Generates Content Batches:** Generates structured JSON batches of age-appropriate words within explicit constraints (e.g. word length, target patterns, words to avoid, reinforcement words).
- **Strict Content Validation:** Validates JSON schema, script integrity (Tamil glyphs for Tamil, English letters for English, no cross-language mixing), unique IDs, and non-empty strings before caching.
- **Resilient Fallback:** If offline, API key is missing, or network fails, the game seamlessly serves rich local curated fallback batches. The game **never crashes**.
- **Groq is NOT Diagnostic:** AI is strictly used for educational content and companion dialogue. It never evaluates medical risk, diagnosis, or clinical scoring.

---

## 👥 Multi-Player Learning Profiles & Isolation

Different players receive different personalized content batches based on their unique learning histories:

- **Player A — Aarav (High Performer):** High success rate (~90%), fast mastery. System deterministically increases difficulty and introduces new vocabulary.
- **Player B — Kavi (Needs Pattern Reinforcement):** Has repeated difficulty with specific sound patterns (e.g. `'ம'` in Tamil). System targets weak patterns and reinforces difficult words in the next level.
- **Player C — Leo (English Beginner):** English language learner, Level 1, beginner 3-letter phonetic words (`CAT`, `SUN`, `TREE`).

*Switch between learners anytime via the Learner Switcher in the top status bar or inside Parent Settings.*

---

## 📱 Mobile-First Responsive Web Design

- **Native Mobile Experience:** Fills 100% of mobile screens with natural touch scrolling, sticky top status bar, and sticky bottom navigation.
- **Desktop & Tablet Optimized:** Displays as a clean, modern, centered mobile-first container (`max-w-md`) with soft shadow and responsive layouts—no artificial phone bezels or fake status bars.

---

## 🌐 100% Pure Language Isolation (Zero Overlap)

- **Tamil Mode (`தமிழ்`):** Every single label, card, button, speech bubble, keypad tile, creature name, and audio synthesis is in pure, natural Tamil without English words or bracketed transliterations.
  - Typeface: **Noto Sans Tamil**
- **English Mode (`ENG`):** Every single label, card, button, speech bubble, keypad tile, creature name, and audio synthesis is in pure English.
  - Typeface: Genuine **OpenDyslexic** (weighted bases for reading ease) / **Lexend**.

---

## 🎮 Real Features Implemented

1. **Living Storybook Village & Card Hub:**
   - Dual-view toggle: Interactive Storybook Map (`village_storybook.png`) with animated location pins + 4-card Quick Hub (`Home.png`).
   - Daily Quest progression bar with gift claiming animation & confetti.

2. **Word Kite Dynamic Multi-Level Field (`Kite game.png` & `kite_storybook.png`):**
   - Tile-based word construction. Real words launch the kite soaring into the clouds with breeze sounds and ribbon fluttering; nonwords trigger an authentic wobble and gentle float-down without punitive scores.
   - On level completion, the next level's word batch is generated and cached in the background!

3. **Mindy AI Learning Companion & Realistic "Teach Mindy" (`Mindy.png`):**
   - **Dynamic Groq AI & Realistic Misconceptions:** Mindy makes witty, believable, context-specific mix-ups about vocabulary words the child is actively practicing (from current level words, recently struggled words, or fresh AI generation).
   - **Randomized Option Shuffling (0, 1, 2):** Answer positions are dynamically scrambled using Fisher-Yates shuffle—the correct answer is NEVER locked to the first option.
   - **Zero Word Repetition:** Tracks session history so words are never repeated.
   - **On-Demand "✨ New AI Mystery":** Generates fresh, humorous puzzles on the fly with live thinking animations and speech feedback.
   - Collectible **Lesson Cards** with words, meanings, and dates awarded upon successful guidance.

4. **Varnamala Creature World & Unlimited Letter Garden Discovery:**
   - **Unlimited Generation (No 16-Item Limit):** Letter Garden dynamically unlocks beyond the initial 16 items (Stage 5 = 20 items, Stage 6 = 24, Stage 7 = 28, Stage 8 = 32, ..., Stage 10 = 40+ items).
   - **AI-Powered Discovery via Groq:** Dynamically generates fresh letter-object pairs featuring animals, everyday objects, fruits, toys, vehicles, nature, and celestial bodies.
   - **Extensive Progressive Fallback Bank:** 24+ additional curated items per language with 100% phonetic accuracy, ensuring discovery NEVER stops even offline.
   - **Dual Modes:** Creature Cards exploration with "Teach Me!" audio pronunciation + interactive Sound Matcher with guaranteed target inclusion and randomized options.

5. **Pulse Path — Village Drum Rhythm (SRS 7.6):**
   - Interactive Village Drum (Mridangam / Dhol) with 3 hit zones: Bass (*Tha* / *த*), Slap (*Dhin* / *திமி*), and Rim (*Thom* / *தோம்*).
   - Real syllable rhythm challenges with visual ripple animations and device haptic vibrations.

6. **Personal Reading Lens Prototype (SRS 7.7):**
   - 4 contrast ruler tints: **Warm Yellow**, **Cool Sky**, **Pale Mint**, and **Clear**.
   - **Line Focus Window** slider to prevent visual crowding.
   - **Bionic Reading Mode** (bolding word onsets for rapid fixation).
   - Sentence-by-sentence text-to-speech narration.
   - Simulated AR Camera Card Scanner with viewfinder brackets.

7. **Living Learning Garden (SRS 7.10):**
   - Environmental growth: Living Word Tree with ripe golden fruits that children can tap to harvest and hear spoken aloud.

8. **Village Mela Festival (5-Day Celebration) (`mela_storybook.png` & `Festive.png`):**
   - Nighttime banyan tree festival with 6 interactive Diya lamps to light by sounding out phonemes, and sweet Pongal pot word harvest.

9. **Family Voice Cottage with Real Microphone Recording (SRS 7.8):**
   - Parents can record genuine voice notes directly through the browser microphone using `navigator.mediaDevices.getUserMedia` and `MediaRecorder`.
   - Stored safely on-device with preview, playback, and deletion controls.

10. **Calm Parent Garden & Responsible Screening Support (`Parent.png`):**
    - Protected by a simple verification math gate (`4 + 3 = ?`).
    - Reading Weather widget (`⛅ Storm Clearing - Improvement visible`).
    - 4 Core Domains: Letter recognition (*Growing green*), Sound patterns (*Needs practice yellow*), Word recognition (*Improving light green*), Reading fluency (*Practice more amber*).
    - Mela Report Card with actionable home activity suggestions.
    - Prominent responsible screening notice: *"Untangle is a screening and learning support tool, not a diagnostic tool."*
    - Data privacy: Export learning history to JSON and reset village state.

---

## 🚀 Running Locally

```bash
unzip untangle-app.zip
cd untangle-app
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

To enable live Groq API generation in your local environment, set your key in `.env`:
```
VITE_GROQ_API_KEY=gsk_...
```
*(If left empty, Untangle automatically operates with high-quality local curated fallback content without any disruption).*
