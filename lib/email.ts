import nodemailer from 'nodemailer';
import crypto from 'crypto';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

interface MagicLinkData {
  personId: string;
  email: string;
  groupId: string;
  expires: number;
}

// Create email transporter
function createTransporter(): nodemailer.Transporter {
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
    from: process.env.EMAIL_FROM || 'Secret Santa <noreply@localhost>',
  };

  return nodemailer.createTransport(config);
}

function getMagicLinkSecret(): string {
  const secret = process.env.MAGIC_LINK_SECRET;
  if (!secret) {
    throw new Error('MAGIC_LINK_SECRET environment variable is required but not set');
  }
  return secret;
}

// Generate magic link token
export function generateMagicToken(data: MagicLinkData): string {
  const secret = getMagicLinkSecret();
  const expiresMinutes = parseInt(process.env.MAGIC_LINK_EXPIRES_MINUTES || '15');
  const expires = Date.now() + (expiresMinutes * 60 * 1000);

  const payload = {
    ...data,
    expires,
  };

  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');

  return Buffer.from(JSON.stringify({ payload: payloadString, signature })).toString('base64url');
}

// Verify magic link token
export function verifyMagicToken(token: string): MagicLinkData | null {
  try {
    const secret = getMagicLinkSecret();
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString());
    const { payload, signature } = decoded;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return null;
    }

    const data: MagicLinkData = JSON.parse(payload);

    // Check expiration
    if (Date.now() > data.expires) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

// Send magic link email
export async function sendMagicLinkEmail(
  email: string,
  name: string,
  groupName: string,
  magicLink: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Secret Santa Login Link</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    .emoji { font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><span class="emoji">🎄</span> Secret Santa Login</h1>
      <p>Access your ${groupName} gift exchange</p>
    </div>
    <div class="content">
      <h2>Hi ${name}! 👋</h2>
      <p>Click the button below to securely log in to your Secret Santa account:</p>

      <a href="${magicLink}" class="button">
        🎁 Log In to Secret Santa
      </a>

      <p><strong>This link will expire in 15 minutes</strong> for your security.</p>

      <p>If you didn't request this login link, you can safely ignore this email.</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="font-size: 14px; color: #666;">
        <strong>What happens next:</strong><br>
        • View and edit your wishlist<br>
        • See who you're buying gifts for<br>
        • Check other family members' wishlists<br>
      </p>
    </div>
    <div class="footer">
      <p>Sent from your family's Secret Santa app</p>
      <p>This is an automated email, please don't reply to this address.</p>
    </div>
  </div>
</body>
</html>`;

    const textContent = `
🎄 Secret Santa Login - ${groupName}

Hi ${name}!

Click this link to log in to your Secret Santa account:
${magicLink}

This link will expire in 15 minutes for your security.

If you didn't request this login link, you can safely ignore this email.

What happens next:
• View and edit your wishlist
• See who you're buying gifts for
• Check other family members' wishlists

Sent from your family's Secret Santa app
`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Secret Santa <noreply@localhost>',
      to: email,
      subject: `🎁 Your Secret Santa Login Link - ${groupName}`,
      text: textContent,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    return false;
  }
}

// Send the organizer their group details so they can find their way back in.
// The address is used once for this email and is not stored.
export async function sendOrganizerWelcomeEmail(
  email: string,
  groupName: string,
  inviteCode: string,
  organizerLink: string,
  joinLink: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const textContent = `Your Secret Santa group "${groupName}" is ready.

Invite code: ${inviteCode}

Organizer dashboard (you will be asked for the admin password you chose):
${organizerLink}

Link to share with participants:
${joinLink}

Keep this email: the invite code plus your admin password are the only way back into the dashboard.
`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Secret Santa group is ready</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .code { font-family: monospace; font-size: 28px; letter-spacing: 4px; background: #fff; border: 1px solid #ddd; padding: 12px 20px; display: inline-block; border-radius: 6px; }
    .button { display: inline-block; background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 16px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎄 Your Secret Santa group is ready</h1>
      <p>${groupName}</p>
    </div>
    <div class="content">
      <p>Your invite code:</p>
      <p><span class="code">${inviteCode}</span></p>
      <p><a class="button" href="${organizerLink}">Open organizer dashboard</a><br>
      <small>You will be asked for the admin password you chose.</small></p>
      <p>Link to share with participants:<br><a href="${joinLink}">${joinLink}</a></p>
      <p>Keep this email. The invite code plus your admin password are the only way back into the dashboard.</p>
    </div>
    <div class="footer">
      <p>You received this because this address was entered when the group was created. We do not store it.</p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Secret Santa <noreply@localhost>',
      to: email,
      subject: `🎄 Your Secret Santa group "${groupName}" is ready - invite code ${inviteCode}`,
      text: textContent,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Failed to send organizer welcome email:', error);
    return false;
  }
}

// Test email configuration
export async function testEmailConfig(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
}