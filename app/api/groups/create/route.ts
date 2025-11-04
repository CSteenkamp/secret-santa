import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateGroupInviteCode } from "@/lib/utils";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { groupName, adminPassword, year } = await request.json();

    if (!groupName || groupName.trim().length === 0) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    if (!adminPassword || adminPassword.length < 6) {
      return NextResponse.json(
        { error: "Admin password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Generate unique invite code
    let inviteCode = generateGroupInviteCode();
    let exists = await prisma.group.findUnique({ where: { inviteCode } });

    // Regenerate if code already exists (very unlikely)
    while (exists) {
      inviteCode = generateGroupInviteCode();
      exists = await prisma.group.findUnique({ where: { inviteCode } });
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create group with admin config
    const group = await prisma.group.create({
      data: {
        name: groupName.trim(),
        inviteCode,
        year: year || new Date().getFullYear(),
        adminConfig: {
          create: {
            hashedPassword,
          },
        },
      },
      include: {
        adminConfig: true,
      },
    });

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        inviteCode: group.inviteCode,
        year: group.year,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
