const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const svg = `
<svg width="512" height="512" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="31" fill="#F3EDE4"/>
  <text
    x="21"
    y="43"
    font-family="Georgia, serif"
    font-style="italic"
    font-weight="700"
    font-size="30"
    fill="#6B4356"
    text-anchor="middle"
  >Un</text>
  <circle cx="47" cy="35" r="2.8" fill="#6B4356"/>
</svg>
`;

const outputDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [192, 512];

async function generate() {
  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  const maskableSvg = svg.replace('fill="#F3EDE4"', 'fill="#6B4356"').replace('fill="#6B4356"/>\n  <circle', 'fill="#F3EDE4"/>\n  <circle').replace(/fill="#6B4356"(?=\s+text-anchor)/, 'fill="#F3EDE4"');

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, "icon-maskable-512.png"));
  console.log("Generated icon-maskable-512.png");
}

generate();