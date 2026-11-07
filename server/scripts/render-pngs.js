import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");
const publicDir = path.resolve(rootDir, "client/public");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

if (fs.existsSync(edgePath)) {
  const htmlFile = path.resolve(publicDir, "temp-render.html");

  // Create an HTML page containing the SVG at exact size
  const svgContent = fs.readFileSync(path.join(publicDir, "logo.svg"), "utf8");
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; width: 512px; height: 512px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    svg { width: 512px; height: 512px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  fs.writeFileSync(htmlFile, html, "utf8");

  try {
    const png512 = path.resolve(publicDir, "logo-512.png");
    execSync(`"${edgePath}" --headless --disable-gpu --default-background-color=00000000 --force-device-scale-factor=1 --window-size=512,512 --screenshot="${png512}" "file:///${htmlFile.replace(/\\\\/g, "/")}"`);
    console.log("Successfully generated:", png512);

    // Also generate 192x192
    const html192 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; width: 192px; height: 192px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    svg { width: 192px; height: 192px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;
    const html192File = path.resolve(publicDir, "temp-render-192.html");
    fs.writeFileSync(html192File, html192, "utf8");
    const png192 = path.resolve(publicDir, "logo-192.png");
    execSync(`"${edgePath}" --headless --disable-gpu --default-background-color=00000000 --force-device-scale-factor=1 --window-size=192,192 --screenshot="${png192}" "file:///${html192File.replace(/\\\\/g, "/")}"`);
    console.log("Successfully generated:", png192);

    // Clean up temporary HTML files
    fs.unlinkSync(htmlFile);
    fs.unlinkSync(html192File);
  } catch (err) {
    console.warn("Could not render PNG via Edge:", err.message);
  }
}

