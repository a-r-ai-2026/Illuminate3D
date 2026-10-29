import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("LifeStone Ministries Illuminate Bible Series: Volume 1 curriculum structure", () => {
  const jsonPath = path.join(ROOT, "content/volume-1.json");
  assert.ok(fs.existsSync(jsonPath), "volume-1.json must exist");

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // Client and publisher checks
  assert.equal(data.publisher, "LifeStone Ministries");
  assert.match(data.heritageNote, /legacy dating to 1902/);
  assert.doesNotMatch(data.heritageNote, /\d+\s+years/i, "Must not express heritage as a year-count");
  assert.match(data.copyrightNotice, /New King James Version/);
  assert.match(data.copyrightNotice, /Thomas Nelson/);

  // Semesters & Units
  assert.equal(data.semesters.length, 2, "Must contain 2 semesters");
  assert.equal(data.semesters[0].title, "The Need for a Savior");
  assert.equal(data.semesters[1].title, "The Savior Revealed");

  // Total 8 units and 32 lessons
  let totalUnits = 0;
  let totalLessons = 0;
  for (const sem of data.semesters) {
    totalUnits += sem.units.length;
    for (const unit of sem.units) {
      totalLessons += unit.lessons.length;
    }
  }
  assert.equal(totalUnits, 8, "Must contain 8 units across the year");
  assert.equal(totalLessons, 32, "Must contain 32 weekly lessons");

  // Lesson 1 full specification
  const lesson1 = data.semesters[0].units[0].lessons[0];
  assert.equal(lesson1.id, 1);
  assert.equal(lesson1.title, "The First Five Days of Creation");
  assert.equal(lesson1.memoryVerse.ref, "Genesis 1:1");
  assert.equal(lesson1.memoryVerse.text, "In the beginning God created the heavens and the earth.");
  assert.equal(lesson1.destination.id, "creation-shore");
  assert.deepEqual(lesson1.destination.cameras, ["surface", "underwater"]);

  // 5 Day badges
  assert.equal(lesson1.days.length, 5);
  const badges = lesson1.days.map((d) => d.badge);
  assert.deepEqual(badges, ["Discover", "Investigate", "Connect", "Focus", "Illuminate"]);

  // Day 1
  const day1 = lesson1.days[0];
  assert.equal(day1.scripture, "Genesis 1:1-23");
  assert.ok(day1.tracks.explorer.sections.length >= 4);
  assert.equal(day1.tracks.explorer.sections[0].heading, "Nothing");
  assert.equal(day1.tracks.explorer.sections[1].heading, "Poof!");
  assert.equal(day1.tracks.explorer.sections[2].heading, "Shaping");
  assert.equal(day1.tracks.explorer.sections[3].heading, "Missing pieces");

  assert.ok(day1.tracks.investigator.sections.length >= 3);
  assert.equal(day1.tracks.investigator.sections[0].heading, "A whole lot of nothing");
  assert.equal(day1.tracks.investigator.sections[1].heading, "Nothing to it!");
  assert.equal(day1.tracks.investigator.sections[2].heading, "Nothing but good");

  // I Spy objects: 18 items
  assert.ok(day1.ispy.length >= 18);
  const surfaceItems = day1.ispy.filter((i) => i.camera === "surface");
  const underwaterItems = day1.ispy.filter((i) => i.camera === "underwater");
  assert.ok(surfaceItems.length >= 9);
  assert.ok(underwaterItems.length >= 9);

  // Day 5 Review Quiz: 12 questions
  const day5 = lesson1.days[4];
  assert.equal(day5.reviewQuiz.length, 12, "Day 5 must contain all 12 Review questions from the Guide Book");
});

test("Verification sheet exists and maps PDF pages to JSON fields", () => {
  const sheetPath = path.join(ROOT, "content/verification-sheet.json");
  assert.ok(fs.existsSync(sheetPath), "verification-sheet.json must exist");
  const sheet = JSON.parse(fs.readFileSync(sheetPath, "utf-8"));
  assert.ok(sheet.mappings.length >= 10);
});

test("Scaling kit: Stub generator and documentation exist", () => {
  assert.ok(fs.existsSync(path.join(ROOT, "scripts/generate_lessons_skeleton.js")));
  assert.ok(fs.existsSync(path.join(ROOT, "content/scene-briefs.md")));
  assert.ok(fs.existsSync(path.join(ROOT, "content/content-entry-guide.md")));
});
