import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { normalizePlan, PLANS } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const groupId = params.id;

    // Verify user has access to this group
    const userGroupId = session.isAdmin ? session.adminGroupId : session.groupId;
    if (userGroupId !== groupId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            people: true,
            assignments: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const plan = normalizePlan(group.plan);
    const maxParticipants = PLANS[plan].maxParticipants;
    return NextResponse.json({
      group: {
        ...group,
        plan,
        maxParticipants: Number.isFinite(maxParticipants) ? maxParticipants : null,
      },
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const groupId = params.id;

    // Only admins can modify groups
    if (!session.isAdmin || session.adminGroupId !== groupId) {
      return NextResponse.json({ error: "Admin authentication required" }, { status: 403 });
    }

    const { budgetAmount, budgetCurrency } = await request.json();

    // Validate currency if provided
    const validCurrencies = [
      'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'ZAR', 'JPY', 'CHF',
      'SEK', 'NOK', 'DKK', 'NZD', 'MXN', 'BRL', 'INR', 'CNY',
      'KRW', 'SGD'
    ];

    if (budgetCurrency && !validCurrencies.includes(budgetCurrency)) {
      return NextResponse.json(
        { error: "Invalid currency code" },
        { status: 400 }
      );
    }

    if (budgetAmount !== undefined && budgetAmount !== null && (isNaN(budgetAmount) || budgetAmount < 0)) {
      return NextResponse.json(
        { error: "Budget amount must be a positive number" },
        { status: 400 }
      );
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        budgetAmount: budgetAmount,
        budgetCurrency: budgetCurrency || "USD",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
