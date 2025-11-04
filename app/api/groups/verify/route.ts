import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    // Find group by invite code
    const group = await prisma.group.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        year: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error verifying group:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
