import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateWishlistItems } from "@/lib/utils";

// POST/PUT update wishlist items for a person
export async function POST(request: NextRequest) {
  try {
    const { personId, items } = await request.json();

    if (!personId) {
      return NextResponse.json({ error: "Person ID is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Items must be an array" }, { status: 400 });
    }

    // Validate wishlist items
    const validation = validateWishlistItems(items);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Verify person exists
    const person = await prisma.person.findUnique({ where: { id: personId } });
    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    // Delete existing wishlist items
    await prisma.wishlistItem.deleteMany({
      where: { personId },
    });

    // Create new wishlist items
    const wishlistItems = await Promise.all(
      items.map((item, index) =>
        prisma.wishlistItem.create({
          data: {
            personId,
            title: item.title.trim(),
            link: item.link.trim(),
            order: index,
          },
        })
      )
    );

    return NextResponse.json({ wishlistItems });
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
