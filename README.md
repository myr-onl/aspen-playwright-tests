# Playwright Tests for Aspen Discovery
This repository contains Playwright tests for use with [Aspen Discovery](https://github.com/Aspen-Discovery/aspen-discovery).

## Getting Started 🚀
### 1. Install Prerequisites
- Download [Git](https://git-scm.com/install/)
- Download [Node.js](https://nodejs.org/en/download)
> [!NOTE]
> If you're a testing librarian, you likely DON'T want the Docker version, so scroll down until you see "get a prebuilt Node.js® for..." and use that instead.

### 2. Clone the repository to your machine
Choose the method that sounds the easiest to you.

<details>
  <summary><h4 style="display:inline-block;margin:0">With GitHub Desktop</h4></summary>
  <ol>
    <li>Install <a href="https://desktop.github.com/download/">GitHub Desktop</a></li>
    <li>Go to <strong>File > Clone repository</strong></li>
    <li>Use <code>myr-onl/aspen-playwright-tests</code> as the URL</li>
    <li>Set your <strong>Local Path</strong> (this is where the repo will be copied)</li>
    <li>Click <strong>Clone</strong></li>
  </ol>
</details>

<details>
  <summary><h4 style="display:inline-block;margin:0">Via command line</h4></summary>
  <ol>
    <li>Open a terminal on your computer</li>
    <li>Navigate to the folder where you want to copy this repo</li>
    <li>Run <code>git clone https://github.com/myr-onl/aspen-playwright-tests.git</code></li>
  </ol>
</details>

### 3. Install Playwright and node modules
a. Open the repo in your favorite IDE (e.g., VSCode, IntelliJ, etc.) and open its terminal OR open your computer terminal and navigate inside the repository

b. Install Playwright
```bash
npx playwright install --with-deps
```
> [!IMPORTANT]
> This command should install Playwright and all the necessary testing browsers (which are **not** regular browsers that should appear in your computer applications list). If this command fails, try separating out the Playwright and browser install commands, as below.

```bash
npx playwright install
npx playwright install-deps
```

c. Install node_modules
```bash
npm install
```

### 4. Create your site configuration files
1. Copy the `sites/example` directory and its contents to a new directory
2. Name the new directory your intended site name (e.g. `grove.production`, `dev.localhost`, etc.)
3. Copy `sites/active.json.example` to a new `sites/active.json` file and add your site directory name as the `name` variable
4. Open your site directory's `config.json`, `bibs.json`, and `lists.json` files
5. Add your unique variables to each of the config file

> [!NOTE]
> You can create multiple directories in `sites/` to run tests in different Aspen interfaces, e.g., consortial vs. member library catalogs. To swap between active sites, edit the `name` variable in `sites/active.json`.

<details>
  <summary><h4 style="display:inline-block;margin:0">config.json</h4></summary>
  <p>You also have the option to use a single test user by skipping <code>chromium</code>, <code>firefox</code>, or <code>webkit</code> and jumping straight to setting <code>username</code>, <code>password</code>, and <code>invalidPassword</code> variables.
  <ul>
    <li><code>catalog</code>: Basic info about your Aspen site</li>
      <ul>
        <li><code>url</code>: Aspen home page URL</li>
        <li><code>ils</code>: ILS that is connected to your Aspen (accepted values: <code>carlx</code>, <code>evergreen</code>, <code>evolve</code>, <code>koha</code>, <code>polaris</code>, <code>sierra</code>, or <code>symphony</code>)</li>
      </ul>
    <li><code>run</code>: disable or enable specific test behavior</li>
    	<ul>
        	<li><code>manualRefresh</code>: whether to manually refresh the holds page after placing a hold</li>
			<li><code>freezeHolds</code>: whether to freeze or thaw holds in holds tests</li>
        	<li><code>changePickup</code>: whether to change pickup location in holds tests</li>
        	<li><code>volumeHolds</code>: whether to run the volume holds suite</li>
      </ul>
    <li><code>patron</code>: A test patron with hold and checkout privileges in your ILS</li>
      <ul>
        <li><code>chromium</code>: username or barcode</li>
        	<ul>
        		<li><code>username</code>: username or barcode</li>
        		<li><code>password</code>: password or PIN</li>
        		<li><code>invalidPassword</code>: incorrect password or PIN</li>
      		</ul>
        <li><code>firefox</code></li>
        	<ul>
        		<li><code>username</code></li>
        		<li><code>password</code></li>
        		<li><code>invalidPassword</code></li>
      		</ul>
        <li><code>webkit</code></li>
        	<ul>
        		<li><code>username</code></li>
        		<li><code>password</code></li>
        		<li><code>invalidPassword</code></li>
      		</ul>
      </ul>
  </ul>
</details>

<details>
  <summary><h4 style="display:inline-block;margin:0">bibs.json</h4></summary>
      <ul>
    <li><code>chromium</code>: Hold item for the chromium browser</li>
    	<ul>
         	<li><code>holdItem</code>: A grouped work with a bib record in your ILS that can be placed on hold</li>
        		<ul>
        			<li><code>title</code>: Title exactly as it appears within full record view</li>
        			<li><code>format</code>: Format label value exactly as it appears within grouped work view</li>
        			<li><code>groupedWorkId</code>: Unique ID for the grouped work (can be found in staff view or grouped work URL)</li>
                	<li><code>recordId</code>: Unique ID for the ILS record</li>
      			</ul>
        </ul>
    <li><code>firefox</code>: Hold item for the firefox browser</li>
    	<ul>
         	<li><code>holdItem</code></li>
        		<ul>
        			<li><code>title</code></li>
        			<li><code>format</code></li>
        			<li><code>groupedWorkId</code></li>
                	<li><code>recordId</code></li>
      			</ul>
        </ul>
    <li><code>webkit</code>: Hold item for the safari browser</li>
        	<ul>
         	<li><code>holdItem</code></li>
        		<ul>
        			<li><code>title</code></li>
        			<li><code>format</code></li>
        			<li><code>groupedWorkId</code></li>
                	<li><code>recordId</code></li>
      			</ul>
        </ul>
  </ul>
</details>

<details>
  <summary><h4 style="display:inline-block;margin:0">volumes.json</h4></summary>
      <ul>
    <li><code>chromium</code>: Hold item for the chromium browser</li>
    	<ul>
         	<li><code>volumeHoldItem</code>: A grouped work with a bib record in your ILS that has volume data and can be placed on hold</li>
        		<ul>
        			<li><code>title</code>: Title exactly as it appears within the grouped work or search results</li>
        			<li><code>format</code>: Format label value exactly as it appears within grouped work view</li>
        			<li><code>groupedWorkId</code>: Unique ID for the grouped work (can be found in staff view or grouped work URL)</li>
                	<li><code>recordId</code>: Unique ID for the ILS record</li>
      			</ul>
        </ul>
    <li><code>firefox</code>: Hold item for the firefox browser</li>
    	<ul>
         	<li><code>volumeHoldItem</code></li>
        		<ul>
        			<li><code>title</code></li>
        			<li><code>format</code></li>
        			<li><code>groupedWorkId</code></li>
                	<li><code>recordId</code></li>
      			</ul>
        </ul>
    <li><code>webkit</code>: Hold item for the safari browser</li>
        	<ul>
         	<li><code>volumeHoldItem</code></li>
        		<ul>
        			<li><code>title</code></li>
        			<li><code>format</code></li>
        			<li><code>groupedWorkId</code></li>
                	<li><code>recordId</code></li>
      			</ul>
        </ul>
  </ul>
</details>

## Running Test Suites 🏃‍➡️
Open this repository inside your IDE and open its terminal OR open your computer terminal and navigate to be inside of this repository.

### UI Mode (Recommended)
Running tests in [UI mode](https://playwright.dev/docs/test-ui-mode) gives you the most control over how tests are run and lets you inspect where failures have occurred as a snapshot.
To open UI mode in a separate window, use the following command:
```bash
npx playwright test --ui
```

### Headed Mode (Selenium-esque)
Running tests in headed mode most closely resembles how we ran tests in the Selenium IDE browser extension. To watch your tests in real time using the base `playwright.config.ts` configuration, run:
```bash
npx playwright test --headed
```

### Headless Mode (Playwright default)
To run your tests in the background, run:
```bash
npx playwright test
```

Information about whether your tests passed or failed will display inside the terminal.

Once tests have finished, you can also view test results by running `npx playwright show-report`.

## Directory Structure 🧬
- 📁 `/common`: Contains helper files for TypeScript or project architecture
- 📁 `/domains`: Contains locators, actions, and logic related to a specific area (or domain) of Aspen functionality (e.g., holds, lists, events, etc.)
- 📁 `/sites`: Contains site-specific directories
    - 📁 `/example`: Example site directory
        - 📄 `config.json`: Catalog and test patron information
        - 📄 `bibs.json`: ILS records used in various test suites
        - 📄 `volumes.json`: ILS records that allow item-level requests (mostly just used in the volume holds suite)
- 📁 `/tests`: Contains test suites, organized by related user behavior or workflows (e.g., Holds, Lists, etc.)
- 📁 `/tests/custom`: Contains test suites local to your library (not git tracked)
- 📄 `playwright.config.ts`: Playwright configuration file
