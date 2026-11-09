import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateGroupInviteCode } from "@/lib/utils";
import { validatePassword } from "@/lib/password";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { groupName, adminPassword, year } = await request.json();

    if (!groupName || groupName.trim().length === 0) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const passwordValidation = validatePassword(adminPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
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
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

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

    // Log the creator straight in as admin so they land on the dashboard
    // without re-typing the password they just chose.
    const session = await getSession();
    session.isAdmin = true;
    session.adminGroupId = group.id;
    session.adminGroupName = group.name;
    session.adminInviteCode = group.inviteCode;
    await session.save();

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
