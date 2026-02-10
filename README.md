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
1. Download [Node.js](https://nodejs.org/en/download)
> [!NOTE]
> If you're a testing librarian, you likely DON'T want the Docker version, so scroll down until you see "get a prebuilt Node.js® for..." and use that instead.
2. Clone the repository to your machine
   - With [GitHub Desktop]()
     - Go to **File > Clone repository**
     - Select the **URL** option
     - Use `myr-onl/aspen-playwright-tests` as the URL
     - Set your **Local Path** (this is where the repo will be copied)
     - Click **Clone**
   - Via command line
     - Open your computer terminal
     - Run `cd /local/path/to/repo` (this is where the repo will be copied)
     - Run `git clone https://github.com/myr-onl/aspen-playwright-tests.git`
3. Install node modules in the repository
   - Open the repo in your favorite IDE (e.g., VSCode, IntelliJ, etc.) and open its terminal OR open your computer terminal and navigate inside the repository
   - Run `npm install`
     - If you are asked to install browsers with Playwright, say yes (these are versions of regular browsers designed to run with Playwright)
4. Create your site configuration file(s)
   - Copy the `sites/example` directory to a new directory
   - Name the new directory your intended site name (e.g. `grove.production`, `aspen.localhost`, etc.)
   - Open your new directory's `config.json`
   - Set your site variables
     - See **Configuration Files > Site configuration** below for more details
5. Create your test configuration file
   - Copy the `.env.example` file to a new file called `.env`
   - Open `.env`
   - Set your environment variables
     - See **Configuration Files > Environment variables** below for more details

### Configuration Files
#### Site configuration (`config.json`)
- `catalog`: Basic info about your Aspen site
  - `url`: Aspen home page URL
  - `ils`: ILS driver used by Aspen 
    - Accepted values: `carlx`, `evergreen`, `evolve`, `koha`, `polaris`, `sierra`, or `symphony`
- `patron`: A test patron with hold and checkout privileges in your ILS
  - `username`: username or barcode
  - `password`: password or PIN
  - `invalidPassword`: incorrect password or PIN
- `holdItem`: A grouped work with a bib record in your ILS that can be placed on hold
  - `title`: Title exactly as it appears within grouped work view
  - `groupedWorkId`: Unique ID for the grouped work (can be found in Staff view)
  - `bibRecordId`: Unique ID for the bib record (can be found with Full Record View URL)
- `volumeHoldItem`: A grouped work with a bib record in your ILS that has volume data and can be placed on hold
  - `title`
  - `groupedWorkId`
  - `bibRecordId`

#### Environment variables (`.env`)
- `SITE_NAME`: Active site configuration against which to run tests
- `ALLOW_MANUAL_REFRESH`: Whether holds or checkout data should be manually reloaded when performing tests
  - (i.e., if the hold information does not populate in the user account immediately, all holds tests will fail)
- `ALLOW_VOLUME_HOLDS`: Whether volume holds suite should be run

## 🏃 Running Test Suites
Open this repository inside your IDE and open its terminal OR open your computer terminal and navigate to be inside of this repository.

### Headed Mode
To watch your tests in real time run:
```bash
npx playwright test --headed
```

### Headless Mode
To run your tests across in the background run:
```bash
npx playwright test
```

Information about whether your tests passed or failed will display inside the terminal.

Once tests have finished running, you can also view test results by running `npx playwright show-report`.