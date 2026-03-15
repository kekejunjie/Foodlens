/**
 * CLI test script for the /api/scan endpoint.
 *
 * Usage:
 *   npx tsx scripts/test-scan.ts [email] [password]
 *
 * Reads the demo image from public/demo/sample-label.svg,
 * authenticates with Supabase, then calls the local scan API.
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/test-scan.ts <email> <password>");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env");
    process.exit(1);
  }

  const imagePath = path.resolve(__dirname, "../public/demo/sample-label.svg");
  if (!fs.existsSync(imagePath)) {
    console.error(`Demo image not found at ${imagePath}`);
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString("base64");
  console.log(`[test] Image loaded: ${imageBase64.length} chars base64`);

  console.log(`[test] Logging in as ${email}...`);
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.session) {
    console.error("[test] Login failed:", authError?.message ?? "no session");
    process.exit(1);
  }

  const { access_token, refresh_token } = authData.session;
  console.log("[test] Login successful");

  const supabaseRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] ?? "app";
  const cookieName = `sb-${supabaseRef}-auth-token`;
  const cookiePayload = JSON.stringify({
    access_token,
    refresh_token,
    token_type: "bearer",
    expires_in: authData.session.expires_in,
    expires_at: authData.session.expires_at,
  });

  console.log(`[test] Calling ${BASE_URL}/api/scan ...`);
  const startTime = Date.now();

  const res = await fetch(`${BASE_URL}/api/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${cookieName}=${encodeURIComponent(cookiePayload)}`,
    },
    body: JSON.stringify({ imageBase64 }),
  });

  const elapsed = Date.now() - startTime;
  const data = await res.json();

  console.log(`[test] Response status: ${res.status} (${elapsed}ms)`);
  console.log("[test] Response:", JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error("[test] Fatal error:", err);
  process.exit(1);
});
