# VedaAI - Hiring Assignment

A pixel-perfect, highly responsive React application built for the VedaAI hiring assignment. The project implements a dynamic layout system with support for desktop and mobile orientations, managing application state through Zustand.

## 🚀 Setup Instructions

Follow these steps to get the project running locally:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes with Node.js)

### Installation & Execution

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd "VedaAI - Hiring Assignment"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *The server will typically start on `http://localhost:5173/`. Open this URL in your browser.*

4. **Build for production** (optional):
   ```bash
   npm run build
   ```

---

## 🏗 Architecture Overview

The application is built using a modern, lightweight, and scalable stack to ensure high performance and a seamless developer experience:

- **Framework**: React 19 + Vite for rapid development, fast hot-module replacement (HMR), and optimized production builds.
- **State Management**: **Zustand** is utilized for centralized, lightweight global state management (`useAssessmentStore.js`). It manages the active screen stages (`assignments_list` -> `create_assignment` -> `assignment_output`), mock notifications, and mobile sidebar toggles.
- **Styling**: Pure Vanilla CSS leveraging CSS Variables (Custom Properties) and modern Flexbox/Grid layouts. This eliminates the overhead of bulky UI libraries and allows for exact 1:1 pixel-perfect replication of the Figma designs.
- **Icons**: `lucide-react` for clean, scalable, and customizable SVG icons.

### Application Flow
- `App.jsx` acts as the primary layout shell. It provides the Sidebar, Header, and a central content area.
- The main content area dynamically renders the correct view (`AssignmentsList`, `AssessmentForm`, or `A4PreviewCanvas`) based on the `screenStage` variable in the Zustand store.

---

## 🎨 Approach & Clean Code

### 1. Pixel-Perfect UI Fidelity
The primary focus was achieving an exact visual match with the provided Figma designs. Instead of wrestling with opinionated UI frameworks, pure CSS was used to implement exact paddings, border radii (e.g., the pill-shaped top navbar matching the 810px center layout), typography scales, and subtle backdrop-filter blurs. CSS custom properties (`:root`) govern the entire design system, ensuring absolute consistency across the app.

### 2. Clean Code Principles
- **Separation of Concerns**: UI components are kept small, focused, and semantic. Complex logic (like routing stages, storing form data, and managing websocket mock progress) is abstracted into the Zustand store rather than cluttering the UI components.
- **Readability & Modularity**: Components are broken down logically into their own dedicated files. 
- **Reusable Tokens**: Hardcoded values are minimized. Standardized CSS variables (e.g., `--brand-accent`, `--surf-primary`, `--transition-standard`) are used to maintain DRY (Don't Repeat Yourself) principles across all stylesheets.

### 3. Responsive & Adaptive Design
- **Fluid Layouts**: The application adapts gracefully from an ultra-wide desktop view down to smaller viewports using fluid flexbox constraints, CSS grid, and `clamp()` typography.
- **Mobile-Specific Architecture**: Implemented custom JS hooks (e.g., `useIsPortrait`) alongside strict CSS media queries to shift the layout architecture entirely on mobile devices. This includes hiding the fixed desktop sidebar in favor of a slide-out hamburger menu drawer and a fixed bottom navigation bar, offering a native app-like experience.
