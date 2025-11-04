import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all assignments for a group and year
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const year = parseInt(searchParams.get("year") || "") || new Date().getFullYear();

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { groupId, year },
      include: {
        giver: true,
        receiver: {
          include: {
            wishlistItems: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { giver: { name: "asc" } },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE all assignments for a group and year
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");
    const year = parseInt(searchParams.get("year") || "") || new Date().getFullYear();

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    await prisma.assignment.deleteMany({
      where: { groupId, year },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
