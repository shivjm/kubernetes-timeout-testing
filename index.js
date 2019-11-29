const puppeteer = require("puppeteer");

const ONE_HOUR_MS = 60 * 60 * 1000;

if (process.argv.length < 3) {
  throw new Error(
    `You must specify a URL and optionally a proxy server (including the protocol).`)
}

const [_node, _script, url, proxy] = process.argv;

const args = [
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
];

if (proxy !== undefined) {
    args.push(`--proxy-server=${proxy}`);
}

const DOCKER = process.env.IN_DOCKER === "1";

if (DOCKER) {
    args.push("--no-sandbox");
    args.push("--disable-dev-shm-usage=true");
}

const KUBERNETES = process.env.IN_KUBERNETES === "1";

async function run() {
    console.log(
      `Launching browser (Docker: ${DOCKER}, Kubernetes: ${KUBERNETES})...`);
    const browser = await puppeteer.launch({
        args,
        headless: true,
        ignoreHTTPSErrors: true,
    });

    const start = new Date();

    await Promise.all([
        openWithTimeoutMethod(browser, "setDefaultTimeout", start),
        openWithTimeoutMethod(browser, "setDefaultNavigationTimeout",
            start),
    ]);

    await browser.close();
}

async function openWithTimeoutMethod(browser, method, start) {
    console.log(`[${method}] Opening tab...`);
    const page = await browser.newPage();
    page[method](ONE_HOUR_MS);

    try {
        console.log(`[${method}] Visiting URL...`);
        await page.goto(url);

        console.log(
            `[${method}] Succeeded in ${elapsed(start).toLocaleString()} seconds.`);
    } catch (e) {
        console.log(
            `[${method}] Failed in ${elapsed(start).toLocaleString()} seconds:`, e.message);
    }
}

function elapsed(start) {
    const end = new Date();
    return (end - start) / 1000;
}

run();
