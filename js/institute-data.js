/**
 * Master Institute Test Repository
 * Target Prelims: 2027 & 2028
 * Institutes: Vision IAS, ForumIAS, InsightsIAS, Vajiram & Ravi, GS Score
 * Rule: First 2 tests of each institute are FREE.
 */

export const institutes = [
  { id: "all", name: "All Institutes" },
  { id: "vision-ias", name: "Vision IAS" },
  { id: "forum-ias", name: "ForumIAS" },
  { id: "insights-ias", name: "InsightsIAS" },
  { id: "vajiram-ravi", name: "Vajiram & Ravi" },
  { id: "gs-score", name: "GS Score" }
];

export const testModules = [
  // ================= Vision IAS =================
  {
    id: "v-01",
    institute: "vision-ias",
    instituteLabel: "Vision IAS",
    targetYear: "2027",
    title: "Vision IAS Prelims 2027: GENERAL STUDIES (P) 2027 - Test 01 - 15601",
    desc: "Historical background, Preamble, Fundamental Rights, Directive Principles, and Basic Structure.",
    questions: 100,
    duration: 120,
    isFree: true, // Free Test 1
    url: "/tests/free/vision-ias-prelims-test-series-2027-01-15601.html"
  },
  {
    id: "v-02",
    institute: "vision-ias",
    instituteLabel: "Vision IAS",
    targetYear: "2027",
    title: "Vision IAS Prelims 2027: GENERAL STUDIES (P) 2027 - Test 02 - 15602",
    desc: "Indus Valley Civilization, Vedic Age, Mauryan & Gupta Empires, Bhakti & Sufi traditions.",
    questions: 100,
    duration: 120,
    isFree: true, // Free Test 2
    url: "/tests/free/vision-ias-prelims-test-series-2027-test-02-15602.html"
  },
  {
    id: "v-03",
    institute: "vision-ias",
    instituteLabel: "Vision IAS",
    targetYear: "2027",
    title: "Vision IAS Prelims 2027: GENERAL STUDIES (P) 2027 - Test 03 - 15603",
    desc: "This test is for UPSC Civil Services preliminary preparation, assessing Indian and physical geography, climate, national schemes, and recent current affairs.   ",
    questions: 100,
    duration: 120,
    isFree: false, // Paid
    url: "/tests/paid/vision-ias-prelims-test-series-2027-test-03-15603.html"
  },

  // ================= ForumIAS =================
  {
    id: "f-01",
    institute: "forum-ias",
    instituteLabel: "ForumIAS",
    targetYear: "2027",
    title: "ForumIAS PTS 2027 Batch 5 Schedule",
    desc: "President, Prime Minister, Union Council of Ministers, and Parliament dynamics.",
    questions: 0,
    duration: 0,
    isFree: true, // Free Test 1
    url: "/tests/free/forum-ias-pts-2027-batch-5-upsc-prelims-test-series-schedule.html"
  },
  {
    id: "f-02",
    institute: "forum-ias",
    instituteLabel: "ForumIAS",
    targetYear: "2027",
    title: "ForumIAS PTS 2027 General Studies Paper-I Mock Test 01",
    desc: "This bilingual UPSC preliminary test paper comprises 100 objective questions covering Indian Polity, Constitutional development, federalism, governance, and recent current affairs, structured for a standard two-hour, negative-marking examination.",
    questions: 100,
    duration: 120,
    isFree: true, // Free Test 2
    url: "/tests/free/forum-ias-pts-2027-batch-5-upsc-prelims-test-series-test-01.html"
  },
  {
    id: "f-03",
    institute: "forum-ias",
    instituteLabel: "ForumIAS",
    targetYear: "2027",
    title: "ForumIAS PTS 2027 General Studies Paper-I Mock Test 02",
    desc: "Bilingual General Studies Prelims mock test paper containing 100 questions on Indian polity, judiciary, constitutional provisions, governance, science, environment, and current affairs with negative marking rules.",
    questions: 100,
    duration: 120,
    isFree: false, // Paid
    url: "/tests/paid/forum-ias-pts-2027-batch-5-upsc-prelims-test-series-test-02.html"
  },

  // ================= Vajiram & Ravi =================
  {
    id: "vr-01",
    institute: "vajiram-ravi",
    instituteLabel: "Vajiram & Ravi",
    targetYear: "2028",
    title: "Vajiram & Ravi PowerUp Prelims 2027 Brochure",
    desc: "This brochure outlines the Batch 1 test series schedule, featuring 30 structured tests, syllabus coverage, and AI-driven performance analytics for UPSC CSE aspirants.   ",
    questions: 100,
    duration: 120,
    isFree: true, // Free Test 1
    url: "/tests/free/vajiram-and-ravi-2027-batch-1-upsc-prelims-power-up-test-series-schedule.html"
  },
  {
    id: "vr-02",
    institute: "vajiram-ravi",
    instituteLabel: "Vajiram & Ravi",
    targetYear: "2028",
    title: "Vajiram & Ravi PowerUp Prelims Test Series 2027: GS Test 01 (NCERT)",
    desc: "100 NCERT-based General Studies practice questions with instructions and marking schemes for UPSC Civil Services preliminary examination preparation.",
    questions: 100,
    duration: 120,
    isFree: true, // Free Test 2
    url: "/tests/free/vajiram-and-ravi-2027-batch-1-upsc-prelims-power-up-test-series-test-01.html"
  },
  {
    id: "vr-03",
    institute: "vajiram-ravi",
    instituteLabel: "Vajiram & Ravi",
    targetYear: "2028",
    title: "Vajiram Prelims 2028: Test 02 (Science, Technology & Biotech)",
    desc: "CRISPR gene editing, Nanotechnology, Space exploration missions, and Defence platforms.",
    questions: 100,
    duration: 120,
    isFree: false, // Paid
    url: "/tests/paid/vajiram-and-ravi-2027-batch-1-upsc-prelims-power-up-test-series-test-02.html"
  }
];