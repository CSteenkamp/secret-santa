import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;

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

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;
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
  } finally {
    await prisma.$disconnect();
  }
}