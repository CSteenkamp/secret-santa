import { randomBytes } from "crypto";

// Generate a unique login code (8 characters, alphanumeric)
export function generateLoginCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude similar looking chars
  let code = "";
  const bytes = randomBytes(8);

  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
}

// Generate a unique group invite code (6 characters, alphanumeric)
export function generateGroupInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude similar looking chars
  let code = "";
  const bytes = randomBytes(6);

  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }

  return code;
}

// Validate wishlist items (1-5 items with valid URLs)
export function validateWishlistItems(items: Array<{ title: string; link: string }>): { valid: boolean; error?: string } {
  if (items.length < 1) {
    return { valid: false, error: "You must have at least 1 wishlist item" };
  }

  if (items.length > 5) {
    return { valid: false, error: "You can have a maximum of 5 wishlist items" };
  }

  for (const item of items) {
    if (!item.title || item.title.trim().length === 0) {
      return { valid: false, error: "All items must have a title" };
    }

    if (!item.link || item.link.trim().length === 0) {
      return { valid: false, error: "All items must have a link" };
    }

    // Basic URL validation
    try {
      new URL(item.link);
    } catch {
      return { valid: false, error: `Invalid URL: ${item.link}` };
    }
  }

  return { valid: true };
}
