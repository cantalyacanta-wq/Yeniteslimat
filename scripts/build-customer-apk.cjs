const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const crypto = require('crypto');
const sharp = require('sharp');
const { ApkSigner, SigningKey } = require('apk_sign_ts');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_APK_PATH = path.join(ROOT_DIR, 'public', 'downloads', 'Antalya-Kurye-Talep-Havuzu.apk');
const OUT_APK_PATH = path.join(ROOT_DIR, 'public', 'downloads', 'Antalya-Kurye-Cagir.apk');
const DIST_APK_PATH = path.join(ROOT_DIR, 'dist', 'downloads', 'Antalya-Kurye-Cagir.apk');
const KEY_PATH = path.join(ROOT_DIR, 'scripts', 'keys', 'release-key.pem');
const CERT_PATH = path.join(ROOT_DIR, 'scripts', 'keys', 'release-cert.pem');

// Adler32 implementation for Android DEX header
function calcAdler32(buf) {
  let a = 1, b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

async function generateCustomerIcons() {
  console.log('[1/5] Generating Google Play Store 512x512 icon and launcher mipmaps...');
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="45%" stop-color="#047857" />
      <stop offset="85%" stop-color="#0d9488" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#011b15" flood-opacity="0.6" />
    </filter>
  </defs>

  <!-- Background squircle -->
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)" />
  <rect x="10" y="10" width="492" height="492" rx="105" fill="none" stroke="#6ee7b7" stroke-width="4" stroke-opacity="0.4" />

  <!-- Delivery Bicycle & Package Icon -->
  <g transform="translate(96, 75) scale(13)" filter="url(#shadow)">
    <!-- Back & Front Wheels -->
    <circle cx="5.5" cy="17" r="3.5" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
    <circle cx="18.5" cy="17" r="3.5" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
    <!-- Courier Frame -->
    <path d="M5.5 17L10 11h4l3 6M10 11l2 6" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Handlebar & Courier Rider Head -->
    <circle cx="14.5" cy="5" r="1.3" fill="#ffffff" />
    <path d="M12 11l2.5-4h2.5" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Front Package Basket -->
    <rect x="18" y="7.5" width="4.5" height="4" rx="0.8" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8" />
  </g>

  <!-- Bottom Banner: 'KURYE ÇAĞIR' Badge -->
  <g transform="translate(56, 395)" filter="url(#shadow)">
    <rect width="400" height="74" rx="37" fill="url(#badgeGrad)" stroke="#fef08a" stroke-width="3" />
    <text x="200" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">KURYE ÇAĞIR</text>
  </g>

  <!-- Fast delivery lightning badge top-right -->
  <g transform="translate(370, 45)">
    <circle cx="36" cy="36" r="36" fill="#fbbf24" stroke="#ffffff" stroke-width="3" />
    <path d="M38 16L22 38h14l-4 22 20-26H38z" fill="#78350f" />
  </g>
</svg>
`;

  const logoBuf = Buffer.from(svg.trim());
  const publicLogoPath = path.join(ROOT_DIR, 'public', 'customer-app-logo.png');
  await sharp(logoBuf).png().toFile(publicLogoPath);
  console.log('Saved 512x512 Play Store icon to public/customer-app-logo.png');

  const sizes = {
    'res/mipmap-mdpi-v4/ic_launcher.png': 48,
    'res/mipmap-hdpi-v4/ic_launcher.png': 72,
    'res/mipmap-xhdpi-v4/ic_launcher.png': 96,
    'res/mipmap-xxhdpi-v4/ic_launcher.png': 144,
    'res/mipmap-xxxhdpi-v4/ic_launcher.png': 192,
  };

  const iconBuffers = {};
  for (const [entryPath, sz] of Object.entries(sizes)) {
    iconBuffers[entryPath] = await sharp(logoBuf).resize(sz, sz).png().toBuffer();
  }
  return iconBuffers;
}

function processClassesDex(rawDex) {
  console.log('[2/5] Customizing classes.dex for Customer Courier Calling (#kurye-cagir)...');
  const dex = Buffer.from(rawDex);

  // Exact-length replacements ensuring zero offset shift
  // 1. URLs: #pakettalebi (11 chars) -> #kurye-cagir (11 chars)
  const oldUrlPart = Buffer.from('pakettalebi');
  const newUrlPart = Buffer.from('kurye-cagir');
  let idx = 0;
  let countUrl = 0;
  while ((idx = dex.indexOf(oldUrlPart, idx)) !== -1) {
    newUrlPart.copy(dex, idx);
    countUrl++;
    idx += newUrlPart.length;
  }
  console.log(`Replaced ${countUrl} URL occurrences in DEX`);

  // 2. Package path in descriptors:
  // com/antalyakurye/talep (22 chars) -> com/antalyakurye/cagir (22 chars)
  const oldPkgPath = Buffer.from('com/antalyakurye/talep');
  const newPkgPath = Buffer.from('com/antalyakurye/cagir');
  idx = 0;
  let countPkg = 0;
  while ((idx = dex.indexOf(oldPkgPath, idx)) !== -1) {
    newPkgPath.copy(dex, idx);
    countPkg++;
    idx += newPkgPath.length;
  }
  console.log(`Replaced ${countPkg} package path occurrences in DEX`);

  // 3. Package dot notation:
  // com.antalyakurye.talep (22 chars) -> com.antalyakurye.cagir (22 chars)
  const oldPkgDot = Buffer.from('com.antalyakurye.talep');
  const newPkgDot = Buffer.from('com.antalyakurye.cagir');
  idx = 0;
  let countDot = 0;
  while ((idx = dex.indexOf(oldPkgDot, idx)) !== -1) {
    newPkgDot.copy(dex, idx);
    countDot++;
    idx += newPkgDot.length;
  }
  console.log(`Replaced ${countDot} package dot occurrences in DEX`);

  // 4. UserAgent tag:
  // TalepHavuzu (11 chars) -> KuryeCagir  (11 chars)
  const oldUa = Buffer.from('TalepHavuzu');
  const newUa = Buffer.from('KuryeCagir ');
  idx = 0;
  while ((idx = dex.indexOf(oldUa, idx)) !== -1) {
    newUa.copy(dex, idx);
    idx += newUa.length;
  }

  // 5. Recompute DEX Checksums (SHA-1 at 12..32, Adler32 at 8..12)
  const sha1 = crypto.createHash('sha1').update(dex.slice(32)).digest();
  sha1.copy(dex, 12);

  const adler = calcAdler32(dex.slice(12)) >>> 0;
  dex.writeUInt32LE(adler, 8);

  console.log('Successfully recalculated DEX SHA-1 and Adler-32 checksums.');
  return dex;
}

function processAndroidManifest(rawManifest) {
  console.log('[3/5] Customizing AndroidManifest.xml for Google Play Store (com.antalyakurye.cagir v1.0.0)...');
  const manifest = Buffer.from(rawManifest);

  // In UTF-16LE, replace com.antalyakurye.talep with com.antalyakurye.cagir
  const oldPkgU16 = Buffer.from('com.antalyakurye.talep', 'utf16le');
  const newPkgU16 = Buffer.from('com.antalyakurye.cagir', 'utf16le');

  let idx = 0;
  let countPkg = 0;
  while ((idx = manifest.indexOf(oldPkgU16, idx)) !== -1) {
    newPkgU16.copy(manifest, idx);
    countPkg++;
    idx += newPkgU16.length;
  }
  console.log(`Replaced ${countPkg} package occurrences in binary AndroidManifest.xml`);

  // Replace version 1.5.0 with 1.0.0 (5 chars UTF-16LE)
  const oldVerU16 = Buffer.from('1.5.0', 'utf16le');
  const newVerU16 = Buffer.from('1.0.0', 'utf16le');
  idx = 0;
  while ((idx = manifest.indexOf(oldVerU16, idx)) !== -1) {
    newVerU16.copy(manifest, idx);
    idx += newVerU16.length;
  }

  return manifest;
}

async function buildAndSignCustomerApk() {
  if (!fs.existsSync(BASE_APK_PATH)) {
    throw new Error(`Base APK not found at: ${BASE_APK_PATH}`);
  }
  if (!fs.existsSync(KEY_PATH) || !fs.existsSync(CERT_PATH)) {
    throw new Error(`Signing keys not found in: ${KEY_PATH}`);
  }

  const iconBuffers = await generateCustomerIcons();

  console.log('[4/5] Reading base template and packaging customer APK archive...');
  const baseZip = new AdmZip(BASE_APK_PATH);

  // Extract raw entries
  const rawDex = baseZip.readFile('classes.dex');
  const rawManifest = baseZip.readFile('AndroidManifest.xml');
  const rawArsc = baseZip.readFile('resources.arsc');
  const rawSound = baseZip.readFile('res/raw/order_alert.wav');

  const modifiedDex = processClassesDex(rawDex);
  const modifiedManifest = processAndroidManifest(rawManifest);

  // Create clean zip without existing signatures
  const newZip = new AdmZip();
  newZip.addFile('AndroidManifest.xml', modifiedManifest);
  newZip.addFile('classes.dex', modifiedDex);
  newZip.addFile('resources.arsc', rawArsc);
  if (rawSound) {
    newZip.addFile('res/raw/order_alert.wav', rawSound);
  }

  // Add customized launcher icons
  for (const [entryPath, buf] of Object.entries(iconBuffers)) {
    newZip.addFile(entryPath, buf);
  }

  const unsignedApkBuffer = newZip.toBuffer();
  console.log(`Unsigned APK archive packaged: ${unsignedApkBuffer.length} bytes`);

  console.log('[5/5] Signing APK with Google Play release keys (Scheme v1, v2, v3)...');
  const keyPem = fs.readFileSync(KEY_PATH, 'utf8');
  const certPem = fs.readFileSync(CERT_PATH, 'utf8');
  const signingKey = SigningKey.fromPEM(keyPem, certPem);
  const signer = new ApkSigner({
    signingKey,
    jarKeyName: 'ANTALYACAGIR',
  });

  const { signedApk } = await signer.sign(new Uint8Array(unsignedApkBuffer));
  const finalApkBuffer = Buffer.from(signedApk);

  // Validate signed APK
  signer.validateApk(finalApkBuffer);
  console.log('APK signature verified cleanly with ApkSigner!');

  fs.mkdirSync(path.dirname(OUT_APK_PATH), { recursive: true });
  fs.writeFileSync(OUT_APK_PATH, finalApkBuffer);
  console.log(`Successfully generated public APK: ${OUT_APK_PATH} (${(finalApkBuffer.length / 1024).toFixed(1)} KB)`);

  const distDir = path.dirname(DIST_APK_PATH);
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(DIST_APK_PATH, finalApkBuffer);
    console.log(`Synced to dist APK: ${DIST_APK_PATH}`);
  }

  // Verify internal structure
  const verifyZip = new AdmZip(OUT_APK_PATH);
  const entries = verifyZip.getEntries().map((e) => e.entryName);
  console.log('Signed APK entries count:', entries.length);
  console.log('Entries:', entries);

  console.log('\n======================================================');
  console.log('🎉 Antalya Kurye Çağır (Google Play Store Hazır) APK Başarıyla Oluşturuldu!');
  console.log(`📦 Dosya Adı: Antalya-Kurye-Cagir.apk`);
  console.log(`📁 İndirme Yolu: /downloads/Antalya-Kurye-Cagir.apk`);
  console.log(`🆔 Paket Adı: com.antalyakurye.cagir`);
  console.log(`🏷️ Sürüm: v1.0.0 (VersionCode: 1)`);
  console.log(`🔏 İmza: Scheme v1 + Scheme v2 + Scheme v3`);
  console.log('======================================================\n');
}

buildAndSignCustomerApk().catch((err) => {
  console.error('Fatal error building customer APK:', err);
  process.exit(1);
});
