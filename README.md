# Dundas Specialties Stair Calculator

A Progressive Web App (PWA) designed for carpenters and DIY enthusiasts to calculate stair stringer measurements, generate cut lists, and view dynamic blueprints.

## Features

*   **Stair Stringer Calculator**: Calculate rise, run, stringer length, and more based on total rise and run constraints.
*   **Dynamic Vector Blueprint**: Visual representation of the stringer layout with accurate dimensions.
*   **Cut List Generation**: Detailed measurements for every step.
*   **Carpenter's Speed Square Guide**: Interactive guide for marking cuts using a speed square (supports Pivot/Angle and Rise/Run methods).
*   **PDF Export**: Download blueprints and cut lists as PDF files.
*   **Theme Support**: Dynamic Light and Dark modes (Dark mode features a specialized dark grayish-blue palette).
*   **PWA Capabilities**: Installable on mobile and desktop devices for offline access.

## Saved calculations

Visit [stairs.clearteck.org](https://stairs.clearteck.org/) and sign in with an email verification code to save and reopen calculations. Each account sees its own saved calculations. The calculator also runs without signing in.

The cut list models bare stringer geometry with the upper floor as the final riser. Finished tread and riser allowances need to be worked out separately. The app checks its dimensional limits and whether a notch crosses the edge of the board. Verify stock strength, connections, and local requirements separately before cutting.

## Tech Stack

*   **Framework**: React
*   **Build Tool**: Vite
*   **PWA Support**: `vite-plugin-pwa`
*   **PDF Generation**: `jspdf` and `html2canvas`
*   **Testing**: Vitest and React Testing Library

## Getting Started

### Prerequisites

*   Node.js 22.12+ or Node.js 24 (CI uses Node.js 24)
*   npm (bundled with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/scc693/stairway-calculator-pro.git
    cd stairway-calculator-pro
    ```

2.  Install dependencies:
    ```bash
    npm ci
    ```

### Running Locally

To start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Running Tests

To execute the test suite:

```bash
npm test
```

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Cloudflare Pages deployment

Run `npm run build:pages` and upload `dist/` as an advanced-mode Pages deployment to the `stairway-calculator-pro` project. The production domain is `stairs.clearteck.org`. The build includes `_worker.js` and `_routes.json` for the API.

Bind the production D1 database as `DB` and apply the SQL files in `cloudflare/migrations/` in order. Set `ACCESS_AUD` to the audience of the Cloudflare Access application covering `stairs.clearteck.org/api/*`. The API verifies the Access JWT against the Clearteck team’s signing keys and applies ownership checks in D1. The static calculator runs locally with `npm run dev`.

## License

MIT
