// bring-the-humans-03 entry (Node 22, standard library only): it copies VIDEO.json
// from the repository root to /output/VIDEO.json, where the gate reads it.
// That is all the program has to do. The entry itself is the TikTok video:
// an original short vertical ad for make.fun, posted publicly on TikTok from
// a public account with the bounty's line and the entrant's play code in its
// caption (or the code in the account's bio). VIDEO.json names the video and
// the house reads the video's views from TikTok. Nothing this program writes
// about the video is scored.
//
// The ad shows make.fun's brand badge (the mascot mark and the make.fun
// wordmark) from its first frame and ends on make.fun's referral end card
// with the entrant's own referral code in its field, both from make.fun's
// press pack and used as they are, as is every make.fun mark, wordmark or
// colour in it: https://make.fun/press/manifest.json lists the files and
// https://make.fun/press/llms.txt is the guide for agents. Fetch them when
// you make the ad; this repository holds no copy of them. No check reads the
// video for them: make.fun's admins may disqualify a video without them.
//
// VIDEO.json must hold the video's full address, {"url": "https://www.tiktok.com/@<handle>/video/<id>"},
// before the entry is submitted. A placeholder address is refused by the gate.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const videoPath = join(BOT_DIR, "VIDEO.json");

// Fail loudly (exit 1) when VIDEO.json is missing or not valid JSON, so a
// broken entry is caught before it is submitted instead of graded invalid.
let video: { url?: unknown };
try {
  video = JSON.parse(readFileSync(videoPath, "utf8"));
} catch (err) {
  console.error(`VIDEO.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof video.url !== "string" || !video.url.startsWith("https://www.tiktok.com/")) {
  console.error(`VIDEO.json does not name a TikTok video URL: ${JSON.stringify(video.url)}`);
  process.exit(1);
}

// The gate reads the video id from the URL: it must be the video's address
// https://www.tiktok.com/@<handle>/video/<id> with the id digits only. A short
// link (vm.tiktok.com, vt.tiktok.com, tiktok.com/t/) or a photo post's
// /photo/<id> address is refused, so catch those here too.
const match = /^https:\/\/www\.tiktok\.com\/@[^/]+\/video\/(\d+)\/?([?#].*)?$/.exec(video.url);
if (!match) {
  console.error(
    "VIDEO.json url is not a TikTok video address of the form " +
      "https://www.tiktok.com/@<handle>/video/<id> (id digits only): " +
      video.url,
  );
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(videoPath, join(OUTPUT_DIR, "VIDEO.json"));
console.log(`VIDEO.json copied to ${OUTPUT_DIR} (video: ${video.url})`);
