/**
 * LifeStone Ministries - Illuminate Bible Series, Volume 1: God Our Savior
 * Stub Generator Script: Generates complete JSON skeleton templates for Lessons 2-32
 * based on the 1st-6th Grade Guide Book and Student Workbook 1st-2nd Table of Contents.
 *
 * Usage: node scripts/generate_lessons_skeleton.js
 */

import fs from 'fs';
import path from 'path';

const DAYS_TEMPLATE = [
  { day: 1, badge: "Discover", color: "#EF4444" },
  { day: 2, badge: "Investigate", color: "#10B981" },
  { day: 3, badge: "Connect", color: "#F97316" },
  { day: 4, badge: "Focus", color: "#8B5CF6" },
  { day: 5, badge: "Illuminate", color: "#3B82F6" }
];

export function generateLessonSkeleton(lessonId, weekNumber, title, scriptureRef, memoryVerseRef, destinationName, clueToNext) {
  return {
    id: lessonId,
    week: weekNumber,
    title: title,
    memoryVerse: {
      ref: memoryVerseRef,
      text: "[NKJV Scripture Text to be transcribed verbatim from Guide Book]",
      phrases: ["[Phrase 1]", "[Phrase 2]", "[Phrase 3]", memoryVerseRef]
    },
    destination: {
      id: destinationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: destinationName,
      scene: `scenes/${destinationName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.glb`,
      cameras: ["surface", "detail"],
      clueToNext: clueToNext || "[Clue guiding the Explorer to the next biblical destination]"
    },
    days: DAYS_TEMPLATE.map(d => ({
      day: d.day,
      badge: d.badge,
      color: d.color,
      scripture: scriptureRef,
      scriptureTitle: `Lesson ${lessonId} Day ${d.day}`,
      prayerPoint: "[Praise point transcribed verbatim from Guide Book sidebar]",
      christFocus: "[Christ Focus connection transcribed verbatim from Guide Book sidebar]",
      tracks: {
        explorer: {
          storyTitle: `Day ${d.day} Story for Young Explorers`,
          sections: [
            {
              id: `exp-l${lessonId}-d${d.day}-p1`,
              heading: `Part 1`,
              text: "[Transcribe Student Workbook 1st-2nd simplified lesson text verbatim]"
            }
          ],
          questions: [
            {
              id: `exp-l${lessonId}-d${d.day}-q1`,
              prompt: "[Younger student discussion prompt]",
              options: ["[Correct Answer]", "[Distractor 1]", "[Distractor 2]"],
              correctIndex: 0,
              explanation: "[Scriptural explanation]"
            }
          ],
          activityCard: {
            type: "Do This Together",
            title: "Hands-On Family Craft",
            instructions: "[Transcribe from Student Workbook activity page]"
          }
        },
        investigator: {
          sections: [
            {
              id: `inv-l${lessonId}-d${d.day}-p1`,
              heading: `Lesson Exposition`,
              text: "[Transcribe Guide Book 1st-6th Grade full daily narrative verbatim]"
            }
          ],
          questions: [
            {
              id: `inv-l${lessonId}-d${d.day}-q1`,
              prompt: "[Review Q&A prompt from Guide Book]",
              options: ["[Correct Answer]", "[Distractor 1]", "[Distractor 2]"],
              correctIndex: 0,
              explanation: "[Scriptural explanation]"
            }
          ],
          focalPoint: {
            title: "Focal Point Experiment / Activity",
            supplies: ["[Supply 1]", "[Supply 2]"],
            steps: ["[Step 1]", "[Step 2]"]
          },
          didYouKnow: "[Fascinating historical or scientific fact from Guide Book]"
        }
      },
      ispy: [
        { id: `item-1`, label: "[Scriptural Object 1]", creationDay: d.day, camera: "surface", hint: "[Hint]" },
        { id: `item-2`, label: "[Scriptural Object 2]", creationDay: d.day, camera: "surface", hint: "[Hint]" }
      ]
    }))
  };
}

console.log("LifeStone Ministries Lesson Skeleton Generator ready.");
