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

let browser, start;

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

  start = new Date();
  console.log("Opening URL...");
  await page.goto(url);

  console.log(
    `Closing browser after ${elapsed(start).toLocaleString()} seconds...`);
  await browser.close();
}

function elapsed(start) {
  const end = new Date();
  return (end - start) / 1000;
}

run().catch(async (e) => {
  console.error(
    `Failed after ${elapsed(start).toLocaleString()} seconds`,
    e.stack);

  await browser.close();
});
