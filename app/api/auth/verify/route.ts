import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { verifyMagicToken } from '@/lib/email';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid or missing token' },
        { status: 400 }
      );
    }

    // Verify the magic token
    const tokenData = verifyMagicToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Verify person still exists and email matches
    const person = await prisma.person.findUnique({
      where: { id: tokenData.personId },
      include: {
        group: true,
      },
    });

    if (!person || person.email !== tokenData.email || person.groupId !== tokenData.groupId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 400 }
      );
    }

    // Token is valid - create session data
    const sessionData = {
      personId: person.id,
      groupId: person.groupId,
      groupName: person.group.name,
      personName: person.name,
      loginMethod: 'magic-link',
    };

    // Return success with session data
    return NextResponse.json({
      success: true,
      person: {
        id: person.id,
        name: person.name,
        groupId: person.groupId,
        groupName: person.group.name,
      },
      sessionData,
    });
  } catch (error) {
    console.error('Magic link verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}