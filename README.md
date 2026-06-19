# ⚡ OptiAllocate — Smart Resource Allocation System

OptiAllocate is an intelligent, visual, real-time resource allocation and capacity forecasting platform. Built for engineering managers, operations leads, and project leads, it helps optimize how human capital, hardware/equipment, and budgets are assigned across active projects and upcoming tasks. 

Instead of acting as a static grid or spreadsheet, OptiAllocate includes a **smart recommendation engine** and **real-time conflict detection** that highlights over-allocations, budget overruns, and skill mismatches before they impact timelines.

---

## 🚀 Key Features

### 1. Dashboard (Command Center)
- **Key Performance Indicators (KPIs):** Real-time metrics tracking total resources, active projects, average utilization rate, over-allocated staff, and overall budget burn.
- **Utilization Heatmap:** Interactive week-by-week visual grid displaying load levels for all team members (highlighting under-utilization in amber, over-utilization in red, and optimal load in green).
- **Smart Insights:** Proactive, context-aware suggestions (e.g., highlighting bottlenecks, recommending cross-training, and identifying cost saving opportunities).

### 2. Allocation Board (Dynamic Gantt & Scheduler)
- **Drag-and-Drop Scheduling:** Timeline-based planner showing allocations across weeks.
- **Capacity Indicators:** Real-time visual meters showing remaining hours for each employee.
- **Interactive Assignments:** Inline assignment creators, duration resizing, and instant conflict alerts when limits are breached.

### 3. Smart Auto-Allocation Engine
- **Constraint-Based Scoring:** Generates candidate recommendations based on an adjustable scoring formula weighting four factors:
  - *Skill matching* (experience/competency alignment)
  - *Availability* (current and upcoming utilization headroom)
  - *Cost efficiency* (salary/rate optimization)
  - *Workload balance* (even distribution of workload to prevent burnout)
- **Interactive Configuration:** Custom weighting slider dashboard to customize the recommendation algorithm in real time.

### 4. Interactive Directories
- **Resource Directory:** Manage employee profiles, cost rates, weekly availability caps, and primary skill sets.
- **Project Directory:** Track active projects, stages, timelines, budgets, and current progress.

### 5. Forecasting & Budget Analysis
- **Capacity Forecasting:** Line chart projecting resource demand vs. capacity over the next 12 weeks to predict hiring requirements.
- **Financial Analytics:** Multi-axis budget tracking showing allocated spend, actual burn rates, and projected budget exhaustion dates.

---

## 🛠️ Technology Stack

- **Core Framework:** React 19 (JavaScript) + Vite
- **Styling:** Tailwind CSS v4 (incorporating glassmorphism, dynamic transitions, and modern variables)
- **State Management:** Zustand (fully persisted store cache in local storage)
- **Animations:** Framer Motion (smooth page transitions, modal overlays, and micro-interactions)
- **Icons:** Lucide React
- **Date Utilities:** Date-fns

---

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed (v18+ recommended).

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd Allocation-System
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm run dev
   ```
   *The application will be running locally at `http://localhost:5173/`.*

4. Build for production:
   ```bash
   npm run build
   ```
   *Compiles the optimized build into the `/dist` directory.*

---

## 🗺️ Project Architecture

```
src/
├── components/          # Reusable UI elements
│   ├── layout/          # Sidebar, Topbar, and AppLayout skeleton
│   ├── dashboard/       # KpiCards, Heatmaps, and AI Insights Panel
│   ├── resources/       # Resource lists and skill matrices
│   ├── projects/        # Project card visualizers
│   ├── allocation-board/# Gantt rows and scheduling components
│   ├── allocation-engine/# Recommendation dialogs and matching alerts
│   ├── notifications/   # System-wide alert center
│   └── shared/          # Command palettes, tooltips, and empty states
├── data/                # Mock seed data (resources, projects, schedules)
├── lib/                 # Core business logic (conflict checks, forecasting, engine)
├── store/               # Zustand state stores (persisted to localStorage)
├── pages/               # Top-level route pages (Dashboard, Settings, Forecast, etc.)
└── main.jsx             # React entry point
```

---

