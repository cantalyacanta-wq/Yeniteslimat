import fs from 'fs';
import path from 'path';
import { ApkSigner, SigningKey } from 'apk_sign_ts';

export async function signApkFile() {
  const rootDir = process.cwd();
  const apkPath = path.join(rootDir, 'public', 'downloads', 'Antalya-Kurye-Talep-Havuzu.apk');
  const keyPath = path.join(rootDir, 'scripts', 'keys', 'release-key.pem');
  const certPath = path.join(rootDir, 'scripts', 'keys', 'release-cert.pem');

  if (!fs.existsSync(apkPath)) {
    throw new Error('APK not found at ' + apkPath);
  }
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error('Release key or cert not found');
  }

  const rawApk = fs.readFileSync(apkPath);
  const keyPem = fs.readFileSync(keyPath, 'utf8');
  const certPem = fs.readFileSync(certPath, 'utf8');

  console.log('Reading APK (size:', rawApk.length, 'bytes)...');
  const signingKey = SigningKey.fromPEM(keyPem, certPem);
  const signer = new ApkSigner({
    signingKey,
    jarKeyName: 'ANTALYAK',
  });

  console.log('Signing APK with Scheme v1, Scheme v2, and Scheme v3...');
  const { signedApk } = await signer.sign(new Uint8Array(rawApk));

  fs.writeFileSync(apkPath, Buffer.from(signedApk));
  console.log('Saved signed APK to public/downloads/ (size:', signedApk.length, 'bytes)');

  const distDir = path.join(rootDir, 'dist', 'downloads');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'Antalya-Kurye-Talep-Havuzu.apk'), Buffer.from(signedApk));
    console.log('Updated dist/downloads/Antalya-Kurye-Talep-Havuzu.apk');
  }
}

signApkFile().catch((err) => {
  console.error('Error signing APK:', err);
  process.exit(1);
});
