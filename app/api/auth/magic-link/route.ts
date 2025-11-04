import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { generateMagicToken, sendMagicLinkEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, groupId } = await request.json();

    if (!email || !groupId) {
      return NextResponse.json(
        { error: 'Email and group ID are required' },
        { status: 400 }
      );
    }

    // Find person by email and group
    const person = await prisma.person.findUnique({
      where: {
        groupId_email: {
          groupId,
          email: email.toLowerCase().trim(),
        },
      },
      include: {
        group: true,
      },
    });

    if (!person) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        message: 'If this email is registered, a login link has been sent.',
      });
    }

    if (!person.email) {
      return NextResponse.json({
        message: 'If this email is registered, a login link has been sent.',
      });
    }

    // Generate magic link token
    const token = generateMagicToken({
      personId: person.id,
      email: person.email,
      groupId: person.groupId,
      expires: Date.now() + (15 * 60 * 1000), // 15 minutes
    });

    // Create magic link URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    // Send email
    const emailSent = await sendMagicLinkEmail(
      person.email,
      person.name,
      person.group.name,
      magicLink
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'If this email is registered, a login link has been sent.',
    });
  } catch (error) {
    console.error('Magic link generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}