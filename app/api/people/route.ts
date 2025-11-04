import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateLoginCode } from "@/lib/utils";

// GET all people for a group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const people = await prisma.person.findMany({
      where: { groupId },
      include: {
        wishlistItems: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { wishlistItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ people });
  } catch (error) {
    console.error("Error fetching people:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create a new person in a group
export async function POST(request: NextRequest) {
  try {
    const { name, email, groupId } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Validate email if provided
    if (email && email.trim()) {
      const emailTrimmed = email.trim().toLowerCase();

      // Check if email is already used in this group
      const existingEmail = await prisma.person.findFirst({
        where: {
          groupId,
          email: emailTrimmed
        },
      });

      if (existingEmail) {
        return NextResponse.json({ error: "Email is already used in this group" }, { status: 400 });
      }
    }

    // Generate unique login code for this group
    let loginCode = generateLoginCode();
    let exists = await prisma.person.findFirst({
      where: { groupId, loginCode },
    });

    // Regenerate if code already exists in this group (very unlikely)
    while (exists) {
      loginCode = generateLoginCode();
      exists = await prisma.person.findFirst({
        where: { groupId, loginCode },
      });
    }

    const person = await prisma.person.create({
      data: {
        name: name.trim(),
        email: email && email.trim() ? email.trim().toLowerCase() : null,
        loginCode,
        groupId,
      },
    });

    return NextResponse.json({ person }, { status: 201 });
  } catch (error) {
    console.error("Error creating person:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
