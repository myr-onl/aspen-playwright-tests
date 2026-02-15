# Playwright Tests for Aspen Discovery
This repository contains Playwright tests for use with [Aspen Discovery](https://github.com/Aspen-Discovery/aspen-discovery).

## 🧬 Directory Structure
- 📁 `/lib`: Contains helper files for TypeScript architecture
- 📁 `/page-objects`: Contains repeat actions that can be used across tests, organized by the page on which they occur (e.g., Home, Grouped Works, etc.)
- 📁 `/sites`: Contains site-specific directories
    - 📁 `/example`: Example site directory
        - 📄 `config.json`: Example site configuration file
- 📁 `/tests`: Contains test suites, organized by related user behavior or workflows (e.g., Holds, Lists, etc.)
- 📄 `.env.example`: Example environment variables file
- 📄 `playwright.config.ts`: Playwright configuration file

## 🚀 Getting Started
### 1. Install Prerequisites
- Download [Git](https://git-scm.com/install/)
- Download [Node.js](https://nodejs.org/en/download)
> [!NOTE]
> If you're a testing librarian, you likely DON'T want the Docker version, so scroll down until you see "get a prebuilt Node.js® for..." and use that instead.

### 2. Clone the repository to your machine
Choose the method that sounds the easiest to you.

<details>
  <summary>With GitHub Desktop</summary>
  <ol>
    <li>Install <a href="https://desktop.github.com/download/">GitHub Desktop</a></li>
    <li>Go to <strong>File > Clone repository</strong></li>
    <li>Use <code>myr-onl/aspen-playwright-tests</code> as the URL</li>
    <li>Set your <strong>Local Path</strong> (this is where the repo will be copied)</li>
    <li>Click <strong>Clone</strong></li>
  </ol>
</details>

<details>
  <summary>Via command line</summary>
  <ol>
    <li>Open a terminal on your computer</li>
    <li>Navigate to the folder where you want to copy this repo</li>
    <li>Run <code>git clone https://github.com/myr-onl/aspen-playwright-tests.git</code></li>
  </ol>
</details>

### 3. Install node modules in the repository
1. Open the repo in your favorite IDE (e.g., VSCode, IntelliJ, etc.) and open its terminal OR open your computer terminal and navigate inside the repository
2. Run `npm install`
> [!IMPORTANT]
> If you are asked to install browsers with Playwright, say yes. These browsers are designed to run with Playwright and **not** regular browsers that will appear in your computer applications list.

### 4. Create your site configuration file(s)
1. Copy the `sites/example` directory to a new directory
2. Name the new directory your intended site name (e.g. `grove.production`, `aspen.localhost`, etc.)
3. Open your new directory's `config.json`
4. Add your unique variables to the config file

<details>
  <summary>Site configuration variables</summary>
  <ul>
    <li><code>catalog</code>: Basic info about your Aspen site</li>
      <ul>
        <li><code>url</code>: Aspen home page URL</li>
        <li><code>ils</code>: ILS that is connected to your Aspen (accepted values: `carlx`, `evergreen`, `evolve`, `koha`, `polaris`, `sierra`, or `symphony`)</li>
      </ul>
    <li><code>patron</code>: A test patron with hold and checkout privileges in your ILS</li>
      <ul>
        <li><code>username</code>: username or barcode</li>
        <li><code>password</code>: password or PIN</li>
        <li><code>invalidPassword</code>: incorrect password or PIN</li>
      </ul>
    <li><code>holdItem</code>: A grouped work with a bib record in your ILS that can be placed on hold</li>
      <ul>
        <li><code>title</code>: Title exactly as it appears within grouped work view</li>
        <li><code>groupedWorkId</code>: Unique ID for the grouped work (can be found in Staff view or grouped work URL)
        <li><code>bibRecordId</code>: Unique ID for the bib record (can be found with full record view URL)
      </ul>
    <li><code>volumeHoldItem</code>: A grouped work with a bib record in your ILS that has volume data and can be placed on hold</li>
      <ul>
        <li>Same variables as <code>holdItem</code></li>
      </ul>
    </ul>
</details>

### 5. Create your test configuration file
1. Copy the `.env.example` file to a new file called `.env`
2. Open `.env`
3. Set your environment variables

<details>
  <summary>Environment variables</summary>
    <ul>
      <li><code>SITE_NAME</code>: Active site configuration against which to run tests</li>
      <li><code>ALLOW_MANUAL_REFRESH</code>: Whether account data (like holds and checkouts) should be manually reloaded when performing tests
      <li><code>ALLOW_VOLUME_HOLDS</code>: Whether volume holds suite should be run</li>
    </ul>
 </details>

## 🏃 Running Test Suites
Open this repository inside your IDE and open its terminal OR open your computer terminal and navigate to be inside of this repository.
### UI Mode (Recommended)
Running tests in [UI mode](https://playwright.dev/docs/test-ui-mode) most closely resembles how we ran tests in the Selenium IDE browser extension.
To open UI mode in a separate window, use the following command:
```bash
npx playwright test --ui
```

### Headed Mode
To watch your tests in real time using the base `playwright.config.ts` configuration, run:
```bash
npx playwright test --headed
```

### Headless Mode
To run your tests in the background, run:
```bash
npx playwright test
```

Information about whether your tests passed or failed will display inside the terminal.

Once tests have finished, you can also view test results by running `npx playwright show-report`.