import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSecretSantaAssignments } from "@/lib/secret-santa";

export async function POST(request: NextRequest) {
  try {
    const { groupId, year } = await request.json();

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    const currentYear = year || new Date().getFullYear();

    // Check if assignments already exist for this group and year
    const existingAssignments = await prisma.assignment.findMany({
      where: { groupId, year: currentYear },
    });

    if (existingAssignments.length > 0) {
      return NextResponse.json(
        { error: "Assignments already exist for this year. Delete them first to regenerate." },
        { status: 400 }
      );
    }

    // Get all people in this group
    const people = await prisma.person.findMany({
      where: { groupId },
      select: { id: true, name: true },
    });

    if (people.length < 3) {
      return NextResponse.json(
        { error: "You need at least 3 people to generate Secret Santa assignments" },
        { status: 400 }
      );
    }

    // Generate assignments
    const assignments = generateSecretSantaAssignments(people);

    if (!assignments) {
      return NextResponse.json(
        { error: "Failed to generate valid assignments" },
        { status: 500 }
      );
    }

    // Save assignments to database
    const createdAssignments = await Promise.all(
      assignments.map((assignment) =>
        prisma.assignment.create({
          data: {
            groupId,
            giverId: assignment.giverId,
            receiverId: assignment.receiverId,
            year: currentYear,
          },
          include: {
            giver: true,
            receiver: true,
          },
        })
      )
    );

    return NextResponse.json({
      assignments: createdAssignments,
      count: createdAssignments.length,
    });
  } catch (error) {
    console.error("Error generating assignments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
