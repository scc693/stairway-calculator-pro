# Dundas Specialties Stair Calculator

A professional-grade Progressive Web App (PWA) designed for carpenters and DIY enthusiasts to calculate stair stringer measurements, generate cut lists, and view dynamic blueprints.

## Features

*   **Stair Stringer Calculator**: Calculate rise, run, stringer length, and more based on total rise and run constraints.
*   **Dynamic Vector Blueprint**: Visual representation of the stringer layout with accurate dimensions.
*   **Cut List Generation**: Detailed measurements for every step.
*   **Carpenter's Speed Square Guide**: Interactive guide for marking cuts using a speed square (supports Pivot/Angle and Rise/Run methods).
*   **PDF Export**: Download blueprints and cut lists as PDF files.
*   **Theme Support**: Dynamic Light and Dark modes (Dark mode features a specialized dark grayish-blue palette).
*   **PWA Capabilities**: Installable on mobile and desktop devices for offline access.

## Tech Stack

*   **Framework**: React
*   **Build Tool**: Vite
*   **PWA Support**: `vite-plugin-pwa`
*   **PDF Generation**: `jspdf` and `html2canvas`
*   **Testing**: Vitest and React Testing Library

## Getting Started

### Prerequisites

*   Node.js (v16 or higher)
*   npm (v7 or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/scc693/stairway-calculator-pro.git
    cd stairway-calculator-pro
    ```

2.  Install dependencies:
    ```bash
    npm install
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

## Hosting on GitHub Pages

This project is configured to be easily hosted on GitHub Pages. Since the `base` path in `vite.config.js` is set to relative (`./`), the app can be deployed to a subpath without issues.

### Method 1: Using the `gh-pages` package (Recommended for manual deploys)

1.  Install the `gh-pages` package as a developer dependency:
    ```bash
    npm install gh-pages --save-dev
    ```

2.  Add a `deploy` script to your `package.json`:
    ```json
    "scripts": {
      "predeploy": "npm run build",
      "deploy": "gh-pages -d dist",
      ...
    }
    ```

3.  Deploy the app:
    ```bash
    npm run deploy
    ```

    This command will build your project and push the contents of the `dist` folder to a `gh-pages` branch on your repository. GitHub Pages should automatically enable for that branch.

### Method 2: Using GitHub Actions (Automated)

1.  Go to your repository on GitHub.
2.  Navigate to **Settings** > **Pages**.
3.  Under **Build and deployment**, select **GitHub Actions** as the source.
4.  GitHub will suggest a workflow for Vite or Static HTML. You can create a file named `.github/workflows/deploy.yml` with the following content:

    ```yaml
    name: Deploy to GitHub Pages

    on:
      push:
        branches: [ main ] # or master

    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v4

          - name: Set up Node
            uses: actions/setup-node@v4
            with:
              node-version: 20
              cache: 'npm'

          - name: Install dependencies
            run: npm install

          - name: Build
            run: npm run build

          - name: Upload artifact
            uses: actions/upload-pages-artifact@v3
            with:
              path: ./dist

      deploy:
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        runs-on: ubuntu-latest
        needs: build
        permissions:
          pages: write
          id-token: write
        steps:
          - name: Deploy to GitHub Pages
            id: deployment
            uses: actions/deploy-pages@v4
    ```

5.  Commit and push this file. Every time you push to the `main` branch, the action will automatically build and deploy your site.

## License

ISC
