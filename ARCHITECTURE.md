# 🏗️ Architecture & Data Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Home Page (/)                          │
│                 ↓ Learning Games Link ↓                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Kids Dashboard (/kids)                          │
│    Select Kid → Select Kid → "Play Games" Button            │
│                         ↓                                    │
│              Sets Kid Role in Auth                          │
│              Redirects to /game                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Game Page (/game)                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Domain Selection                                    │ │
│  │    [📚 Language] [🔢 Math] [🧩 Logic]                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↓                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 2. Level Selection                                     │ │
│  │    [1 ⭐⭐⭐] [2 ⭐⭐] [3 🔒]...                        │ │
│  │    (Locked levels show lock icon)                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↓                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 3. Play Level                                          │ │
│  │    Generate 5 Questions per Level                      │ │
│  │    One question at a time                              │ │
│  │    Timer countdown                                     │ │
│  │    Submit answer → Validate → Next question            │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↓                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 4. Results Screen                                      │ │
│  │    Calculate: % correct → Stars (1-5)                  │ │
│  │    Calculate: Stars → Points (5-25)                    │ │
│  │    [Try Again] [Next Level] buttons                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
GAME SESSION FLOW
═════════════════════════════════════════════════════════════

Kid Starts Level 5
    ↓
useGame.ts:startGame()
    ├─→ Validate level unlocked (need 3+ stars on Level 4)
    ├─→ Generate Level (GameLevelGenerator)
    │   └─→ Query gameDomains for 5 questions
    │       ├─→ Language: WritingQG, ReadingQG, ListeningQG
    │       ├─→ Math: MathQG (based on level)
    │       └─→ Logic: PatternQG, SequenceQG, PuzzleQG, MemoryQG
    ├─→ Create GameSession (GameSessionManager)
    └─→ Display Question 1/5
           ↓
QuestionCard.tsx renders question
    ├─→ Timer starts counting down
    ├─→ User answers (various input types)
    └─→ Submit button clicked
           ↓
useGame.ts:submitAnswer()
    ├─→ Check if answer correct
    ├─→ Create GameAnswer object
    ├─→ Update session.answers[]
    ├─→ Update session.score
    └─→ Move to Question 2/5
           ↓
(Repeat for questions 3, 4, 5)
           ↓
Question 5 answered
    ↓
useGame.ts:completeGame()
    ├─→ GameSessionManager.calculateResult()
    │   ├─→ Calculate % correct
    │   ├─→ Map % → Stars (60%→1⭐, 100%→5⭐)
    │   ├─→ Map Stars → Points (1⭐→5pts, 5⭐→25pts)
    │   └─→ Create GameSessionResult
    ├─→ gameAPI.submitLevelCompletion()
    │   ├─→ If Stars ≥ 3:
    │   │   └─→ api.awardPoints() → Google Sheets
    │   ├─→ Update localStorage game-progress
    │   └─→ Store session in game-sessions array
    └─→ Display Results Screen
           ↓
User clicks [Next Level] / [Try Again] / [Back]
```

## Component Hierarchy

```
GamePage (pages/game.tsx)
│
├── Header
│   ├── Back Button
│   ├── Kid Name & Emoji
│   └── Points Balance
│
└── Main Content (based on gamePhase)
    │
    ├── PHASE 1: Domain Selection
    │   ├── QuickStats
    │   │   ├── Kid Name
    │   │   ├── Total Stars
    │   │   ├── Levels Completed
    │   │   └── Points
    │   │
    │   └── DomainSelector
    │       └── DomainCard (x3)
    │           ├── Icon
    │           ├── Name
    │           ├── Description
    │           └── Current Level
    │
    ├── PHASE 2: Level Selection
    │   ├── LevelSelector
    │   │   └── LevelButton (x1-50)
    │   │       ├── Level Number
    │   │       ├── Unlock Status
    │   │       ├── Stars Earned
    │   │       └── Lock Icon (if locked)
    │   │
    │   └── LevelProgress
    │       ├── Progress Bar
    │       └── Recent Stars
    │
    ├── PHASE 3: Playing Game
    │   └── QuestionCard
    │       ├── Timer Display
    │       ├── Question (varies by type)
    │       │   ├── WritingQuestion (canvas/input)
    │       │   ├── ReadingQuestion (options)
    │       │   ├── ListeningQuestion (audio + options)
    │       │   ├── MathQuestion (number input)
    │       │   └── LogicalQuestion (options)
    │       └── Submit Button
    │
    └── PHASE 4: Results
        └── GameResult
            ├── Trophy Icon & Message
            ├── Star Display (x5)
            ├── Metrics
            │   ├── Correct % 
            │   ├── Points Earned 
            │   ├── Time Taken
            │   └── Level Number
            ├── Achievement (if 5 stars)
            └── Buttons
                ├── Try Again
                └── Next Level (if 3+ stars)
```

## State Management Flow

```
useGame Hook (lib/useGame.ts)
│
├── LOCAL STATE
│   ├── currentLevel (GameDomain | null)
│   ├── currentLevelNumber (number)
│   ├── questions (Question[])
│   ├── currentQuestionIndex (number)
│   ├── session (GameSession | null)
│   ├── result (GameSessionResult | null)
│   ├── maxLevelCompleted (Record<GameDomain, number>)
│   ├── totalStars (Record<GameDomain, number>)
│   ├── starsPerLevel (Record<number, number>)
│   ├── isLoading (boolean)
│   └── error (string | null)
│
├── INITIALIZE
│   → loadGameProgress()
│      └─→ gameAPI.getKidGameProgress()
│          └─→ Read from localStorage
│
├── START GAME
│   → startGame(domain, levelNumber)
│      ├─→ Check level unlocked
│      ├─→ GameLevelGenerator.generateLevel()
│      ├─→ GameSessionManager.createSession()
│      └─→ Set state (questions, session, etc)
│
├── PLAY GAME
│   → submitAnswer(answer)
│      ├─→ Validate answer (checkAnswer)
│      ├─→ GameSessionManager.recordAnswer()
│      ├─→ Update session.answers
│      └─→ Auto-advance to next question
│
├── COMPLETE GAME
│   → completeGame()
│      ├─→ GameSessionManager.calculateResult()
│      ├─→ gameAPI.submitLevelCompletion()
│      │   └─→ api.awardPoints() if 3+ stars
│      ├─→ Update localStorage
│      └─→ Set result state
│
└── UTILITY
    ├─→ nextQuestion()
    ├─→ retryLevel()
    ├─→ resetGame()
    └─→ loadGameProgress()
```

## Database Schema (localStorage)

```
GAME PROGRESS
──────────────────────────────────────────────
Key: game-progress-{kidId}

{
  "language": 5,                    // Max level reached
  "mathematics": 3,
  "logical": 2,
  "total_stars": 34,                // Sum across all domains
  "last_session": "2025-02-07T10:30:00Z",
  "completed_levels": {
    "language-level-1": 5,          // Stars earned
    "language-level-2": 4,
    "language-level-3": 5,
    "mathematics-level-1": 5,
    "mathematics-level-2": 3,
    ...
  }
}


GAME SESSIONS (Last 100)
──────────────────────────────────────────────
Key: game-sessions-{kidId}

[
  {
    "award_id": "award-alice-language-level-5-1707298200000",
    "kid_id": "alice",
    "level_id": "language-level-5",
    "domain": "language",
    "level_number": 5,
    "stars_earned": 5,
    "points_awarded": 25,
    "completed_at": "2025-02-07T10:30:00Z",
    "reason": "Language Level 5 - Writing - 5 Stars"
  },
  ...
]


SESSIONS STRUCTURE
──────────────────────────────────────────────
Rotates to keep only last 100 entries
Newest entries pushed to end
Oldest entries shift() removed
```

## Question Generation Pipeline

```
SELECT DOMAIN & LEVEL
        ↓
╔═══════════════════════════════════════╗
║ gameDomains/language.ts               ║
║ ┌─────────────────────────────────┐  ║
║ │ WritingQuestionGenerator         │  ║
║ │ - Levels 1-5: Letters            │  ║
║ │ - Levels 6-10: Words             │  ║
║ │ - Levels 11+: Sentences          │  ║
║ └─────────────────────────────────┘  ║
║ ┌─────────────────────────────────┐  ║
║ │ ReadingQuestionGenerator         │  ║
║ │ - Levels 1-5: Letters            │  ║
║ │ - Levels 6-10: Words             │  ║
║ │ - Levels 11+: Passages           │  ║
║ └─────────────────────────────────┘  ║
║ ┌─────────────────────────────────┐  ║
║ │ ListeningQuestionGenerator       │  ║
║ │ - TTS-based audio                │  ║
║ │ - Auto-pronounced options        │  ║
║ └─────────────────────────────────┘  ║
╚═══════════════════════════════════════╝
        ↓
╔═══════════════════════════════════════╗
║ gameDomains/mathematics.ts            ║
║ ┌─────────────────────────────────┐  ║
║ │ MathQuestionGenerator            │  ║
║ │ - Levels 1-5: Addition (0-10)    │  ║
║ │ - Levels 6-10: Subtraction       │  ║
║ │ - Levels 11-15: Multiplication   │  ║
║ │ - Levels 16+: Division           │  ║
║ └─────────────────────────────────┘  ║
╚═══════════════════════════════════════╝
        ↓
╔═══════════════════════════════════════╗
║ gameDomains/logical.ts                ║
║ ┌─────────────────────────────────┐  ║
║ │ PatternQuestionGenerator         │  ║
║ ├─────────────────────────────────┤  ║
║ │ SequenceQuestionGenerator        │  ║
║ ├─────────────────────────────────┤  ║
║ │ PuzzleQuestionGenerator          │  ║
║ ├─────────────────────────────────┤  ║
║ │ MemoryQuestionGenerator          │  ║
║ └─────────────────────────────────┘  ║
╚═══════════════════════════════════════╝
        ↓
COMBINE 5 QUESTIONS PER LEVEL
        ↓
RETURN Question[] to useGame hook
```

## Scoring Formula

```
╔════════════════════════════════════════════════════════════╗
║ PERCENTAGE CORRECT → STARS LOOKUP                         ║
╠════════════════════════════════════════════════════════════╣
║ >= 100% → 5 STARS ⭐⭐⭐⭐⭐                              ║
║ >= 90%  → 4 STARS ⭐⭐⭐⭐                                ║
║ >= 80%  → 3 STARS ⭐⭐⭐                                  ║
║ >= 70%  → 2 STARS ⭐⭐                                    ║
║ >= 60%  → 1 STAR  ⭐                                      ║
║ < 60%   → 0 STARS (Can retry)                            ║
╚════════════════════════════════════════════════════════════╝
        ↓
╔════════════════════════════════════════════════════════════╗
║ STARS → POINTS CONVERSION                                 ║
╠════════════════════════════════════════════════════════════╣
║ 5 STARS → 25 POINTS + TIME BONUS                          ║
║ 4 STARS → 20 POINTS + TIME BONUS                          ║
║ 3 STARS → 15 POINTS + TIME BONUS                          ║
║ 2 STARS → 10 POINTS + TIME BONUS                          ║
║ 1 STAR  →  5 POINTS + TIME BONUS                          ║
╚════════════════════════════════════════════════════════════╝
        ↓
╔════════════════════════════════════════════════════════════╗
║ TIME BONUS CALCULATION                                    ║
╠════════════════════════════════════════════════════════════╣
║ Time Saved = Total Time Limit - Time Taken               ║
║ Time Bonus = Time Saved × 0.1 points/sec                 ║
║ Total Points = Base Points + Time Bonus                  ║
╚════════════════════════════════════════════════════════════╝
        ↓
AWARD TO KID (if 3+ stars)
        ↓
SAVE TO GOOGLE SHEETS
```

## Integration Points

```
EXISTING SYSTEM          NEW GAMIFICATION
─────────────────────────────────────────────
    kids.tsx             ← Play Games Button
        │
        ↓
    game.tsx             ← NEW GAME PAGE
        │
        ├─→ auth.ts      ✓ Check kid logged in
        │
        ├─→ api.ts       ✓ Award points when 3+ stars
        │               ✓ Sync to Google Sheets
        │
        ├─→ gameAPI.ts   ✓ Track local progress
        │               ✓ Manage level unlocks
        │
        └─→ components/  ✓ Question display
            gameEngine.ts ✓ Scoring & validation
            gameDomains/  ✓ Question generation
```

---

**This architecture is optimized for performance, scalability, and extensibility.**
