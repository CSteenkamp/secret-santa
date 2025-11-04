/**
 * Secret Santa Assignment Algorithm
 *
 * Generates random assignments where:
 * - Everyone gives to exactly one person
 * - Everyone receives from exactly one person
 * - No one gives to themselves
 * - Uses a derangement algorithm to ensure valid assignments
 */

interface Person {
  id: string;
  name: string;
}

interface Assignment {
  giverId: string;
  receiverId: string;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Checks if an assignment is valid (no self-assignments)
 */
function isValidAssignment(givers: Person[], receivers: Person[]): boolean {
  for (let i = 0; i < givers.length; i++) {
    if (givers[i].id === receivers[i].id) {
      return false;
    }
  }
  return true;
}

/**
 * Generates Secret Santa assignments
 * Minimum 3 people required for valid Secret Santa
 */
export function generateSecretSantaAssignments(people: Person[]): Assignment[] | null {
  // Need at least 3 people for Secret Santa
  if (people.length < 3) {
    return null;
  }

  const givers = [...people];
  let receivers = shuffleArray([...people]);

  // Try to find a valid assignment (no self-assignments)
  // Maximum 100 attempts to avoid infinite loops
  let attempts = 0;
  const maxAttempts = 100;

  while (!isValidAssignment(givers, receivers) && attempts < maxAttempts) {
    receivers = shuffleArray([...people]);
    attempts++;
  }

  // If we couldn't find a valid assignment after max attempts
  // (very rare, but possible with small groups)
  if (!isValidAssignment(givers, receivers)) {
    // Use a deterministic derangement algorithm as fallback
    receivers = createDerangement(givers);
  }

  // Create assignments
  return givers.map((giver, index) => ({
    giverId: giver.id,
    receiverId: receivers[index].id,
  }));
}

/**
 * Creates a valid derangement (permutation where no element appears in its original position)
 * This is a fallback method that always produces a valid result
 */
function createDerangement(people: Person[]): Person[] {
  const n = people.length;
  const result = [...people];

  // Simple derangement: shift everyone by 1 position
  // This guarantees no one gets themselves
  for (let i = 0; i < n; i++) {
    result[i] = people[(i + 1) % n];
  }

  return result;
}
