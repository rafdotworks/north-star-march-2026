/**
 * Timezone Component Verification Script
 * 
 * This script tests the timezone calculation logic to verify it works correctly
 * across various edge cases and scenarios.
 */

// Simulate the timezone calculation logic from the hook
function calculateTimezoneMessage(userHour, userMinute, torontoHour, torontoMinute) {
  const torontoTotalMinutes = torontoHour * 60 + torontoMinute;
  const userTotalMinutes = userHour * 60 + userMinute;

  // Calculate difference in minutes
  let differenceMinutes = torontoTotalMinutes - userTotalMinutes;

  // Handle day boundary crossing (normalize to -12 to +12 hours range)
  if (differenceMinutes > 12 * 60) {
    differenceMinutes -= 24 * 60;
  } else if (differenceMinutes < -12 * 60) {
    differenceMinutes += 24 * 60;
  }

  // Convert to hours (round to nearest hour)
  const differenceHours = Math.round(differenceMinutes / 60);

  // Generate user-friendly message
  let message = "";
  if (differenceHours === 0) {
    message = "Raf is in your timezone";
  } else if (differenceHours > 0) {
    message = `Raf is ${differenceHours} hour${differenceHours !== 1 ? 's' : ''} ahead of you`;
  } else {
    message = `Raf is ${Math.abs(differenceHours)} hour${Math.abs(differenceHours) !== 1 ? 's' : ''} behind you`;
  }

  return { differenceHours, differenceMinutes, message };
}

// Test cases
const testCases = [
  {
    name: "Same timezone (both 3:00 PM)",
    user: { hour: 15, minute: 0 },
    toronto: { hour: 15, minute: 0 },
    expected: { hours: 0, message: "Raf is in your timezone" }
  },
  {
    name: "User 3 hours ahead (User 6:00 PM, Toronto 3:00 PM)",
    user: { hour: 18, minute: 0 },
    toronto: { hour: 15, minute: 0 },
    expected: { hours: -3, message: "Raf is 3 hours behind you" }
  },
  {
    name: "User 3 hours behind (User 12:00 PM, Toronto 3:00 PM)",
    user: { hour: 12, minute: 0 },
    toronto: { hour: 15, minute: 0 },
    expected: { hours: 3, message: "Raf is 3 hours ahead of you" }
  },
  {
    name: "Day boundary - Toronto 1 AM, User 11 PM previous day",
    user: { hour: 23, minute: 0 },
    toronto: { hour: 1, minute: 0 },
    expected: { hours: 2, message: "Raf is 2 hours ahead of you" }
  },
  {
    name: "Day boundary - Toronto 11 PM, User 1 AM next day",
    user: { hour: 1, minute: 0 },
    toronto: { hour: 23, minute: 0 },
    expected: { hours: -2, message: "Raf is 2 hours behind you" }
  },
  {
    name: "Exactly 12 hours difference - Toronto 12 PM, User 12 AM",
    user: { hour: 0, minute: 0 },
    toronto: { hour: 12, minute: 0 },
    expected: { hours: 12, message: "Raf is 12 hours ahead of you" }
  },
  {
    name: "Exactly 12 hours difference - Toronto 12 AM, User 12 PM",
    user: { hour: 12, minute: 0 },
    toronto: { hour: 0, minute: 0 },
    expected: { hours: -12, message: "Raf is 12 hours behind you" }
  },
  {
    name: "Edge case: 12 hours 1 minute - should normalize (User 0:01, Toronto 12:02)",
    user: { hour: 0, minute: 1 },
    toronto: { hour: 12, minute: 2 },
    expected: { hours: -12, message: "Raf is 12 hours behind you" }
  },
  {
    name: "Edge case: 11 hours 59 minutes (User 0:01, Toronto 12:00)",
    user: { hour: 0, minute: 1 },
    toronto: { hour: 12, minute: 0 },
    expected: { hours: 12, message: "Raf is 12 hours ahead of you" }
  },
  {
    name: "Edge case: Just over 12 hours (User 23:59, Toronto 12:01)",
    user: { hour: 23, minute: 59 },
    toronto: { hour: 12, minute: 1 },
    expected: { hours: -12, message: "Raf is 12 hours behind you" }
  },
  {
    name: "With minutes: User 2:30 PM, Toronto 5:45 PM",
    user: { hour: 14, minute: 30 },
    toronto: { hour: 17, minute: 45 },
    expected: { hours: 3, message: "Raf is 3 hours ahead of you" }
  },
  {
    name: "With minutes: User 5:45 PM, Toronto 2:30 PM",
    user: { hour: 17, minute: 45 },
    toronto: { hour: 14, minute: 30 },
    expected: { hours: -3, message: "Raf is 3 hours behind you" }
  },
  {
    name: "Singular hour: User 2:00 PM, Toronto 3:00 PM",
    user: { hour: 14, minute: 0 },
    toronto: { hour: 15, minute: 0 },
    expected: { hours: 1, message: "Raf is 1 hour ahead of you" }
  },
  {
    name: "Singular hour: User 3:00 PM, Toronto 2:00 PM",
    user: { hour: 15, minute: 0 },
    toronto: { hour: 14, minute: 0 },
    expected: { hours: -1, message: "Raf is 1 hour behind you" }
  }
];

console.log("=".repeat(80));
console.log("TIMEZONE COMPONENT VERIFICATION TEST");
console.log("=".repeat(80));
console.log();

let passed = 0;
let failed = 0;
const failures = [];

testCases.forEach((testCase, index) => {
  const result = calculateTimezoneMessage(
    testCase.user.hour,
    testCase.user.minute,
    testCase.toronto.hour,
    testCase.toronto.minute
  );

  const hoursMatch = result.differenceHours === testCase.expected.hours;
  const messageMatch = result.message === testCase.expected.message;
  const testPassed = hoursMatch && messageMatch;

  if (testPassed) {
    passed++;
    console.log(`✓ Test ${index + 1}: ${testCase.name}`);
    console.log(`  Result: ${result.message} (${result.differenceHours} hours)`);
  } else {
    failed++;
    failures.push({
      test: testCase.name,
      expected: testCase.expected,
      actual: { hours: result.differenceHours, message: result.message }
    });
    console.log(`✗ Test ${index + 1}: ${testCase.name}`);
    console.log(`  Expected: ${testCase.expected.message} (${testCase.expected.hours} hours)`);
    console.log(`  Actual:   ${result.message} (${result.differenceHours} hours)`);
  }
  console.log();
});

console.log("=".repeat(80));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log("=".repeat(80));

if (failures.length > 0) {
  console.log("\nFAILURES:");
  failures.forEach((failure, index) => {
    console.log(`${index + 1}. ${failure.test}`);
    console.log(`   Expected: ${failure.expected.message} (${failure.expected.hours} hours)`);
    console.log(`   Actual:   ${failure.actual.message} (${failure.actual.hours} hours)`);
  });
}

// Test the actual Intl API behavior
console.log("\n" + "=".repeat(80));
console.log("TESTING ACTUAL INTL API BEHAVIOR");
console.log("=".repeat(80));
console.log();

const now = new Date();
const torontoFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Toronto",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
});

const torontoParts = torontoFormatter.formatToParts(now);
const torontoHour = parseInt(torontoParts.find(p => p.type === "hour")?.value || "0", 10);
const torontoMinute = parseInt(torontoParts.find(p => p.type === "minute")?.value || "0", 10);
const userHour = now.getHours();
const userMinute = now.getMinutes();

console.log(`Current UTC time: ${now.toISOString()}`);
console.log(`User local time: ${userHour}:${userMinute.toString().padStart(2, '0')}`);
console.log(`Toronto time: ${torontoHour}:${torontoMinute.toString().padStart(2, '0')}`);

const actualResult = calculateTimezoneMessage(userHour, userMinute, torontoHour, torontoMinute);
console.log(`Result: ${actualResult.message}`);
console.log(`Difference: ${actualResult.differenceHours} hours (${actualResult.differenceMinutes} minutes)`);

process.exit(failed > 0 ? 1 : 0);

