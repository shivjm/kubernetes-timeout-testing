const puppeteer = require("puppeteer");

const ONE_HOUR_MS = 60 * 60 * 1000;

const [_node, _script, url, proxy] = process.argv;

const args = [
  "--disable-accelerated-2d-canvas",
  "--disable-gpu",
];

if (proxy !== undefined) {
  args.push(`--proxy-server=${proxy}`);
}

if (process.env.IN_DOCKER === "1") {
  args.push("--no-sandbox");
  args.push("--disable-dev-shm-usage=true");
}

let browser;

async function run() {
  console.log("Launching browser...");
  browser = await puppeteer.launch({
    args,
    headless: true,
    ignoreHTTPSErrors: true,
  });

  console.log("Opening tab...");
  const page = await browser.newPage();
  page.setDefaultTimeout(ONE_HOUR_MS);

  console.log("Opening URL...");
  await page.goto(url);

  console.log("Closing browser...");
  await browser.close();
}

run().catch(async (e) => {
  console.error(e.stack);
  await browser.close();
});
