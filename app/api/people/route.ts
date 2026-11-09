import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateLoginCode } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { enforceParticipantLimit } from "@/lib/plan-limits";

// GET all people for a group
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Verify the user has access to this group
    if (session.isAdmin && session.adminGroupId !== groupId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (session.isLoggedIn && session.groupId !== groupId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

// POST create a new person in a group (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isAdmin) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 403 });
    }

    const { name, email, groupId } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Verify admin owns this group
    if (session.adminGroupId !== groupId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Free groups are capped; Unlimited groups are not
    const limit = await enforceParticipantLimit(groupId);
    if (!limit.allowed) {
      return NextResponse.json({ error: limit.message, code: limit.code }, { status: 403 });
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
