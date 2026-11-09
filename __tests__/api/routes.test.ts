import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Mock the shared prisma client (`@/lib/db`) used by every route
// ---------------------------------------------------------------------------
const mockPrismaDb = {
  group: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  person: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  wishlistItem: {
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
  assignment: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  adminConfig: {
    findUnique: jest.fn(),
  },
  $disconnect: jest.fn(),
};

jest.mock('@/lib/db', () => ({
  prisma: mockPrismaDb,
}));

// ---------------------------------------------------------------------------
// Mock iron-session wrapper. Each test installs the session it needs via
// `useSession(...)`; the default (set in beforeEach) is an anonymous session.
// ---------------------------------------------------------------------------
jest.mock('@/lib/session', () => ({
  getSession: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Mock rate limiting: always allow. This also avoids importing the real
// module, whose module-level setInterval keeps the Jest worker alive.
// ---------------------------------------------------------------------------
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({ success: true })),
  authRateLimit: jest.fn(() => ({ success: true })),
  magicLinkRateLimit: jest.fn(() => ({ success: true })),
  adminAuthRateLimit: jest.fn(() => ({ success: true })),
}));

// ---------------------------------------------------------------------------
// Mock bcryptjs
// ---------------------------------------------------------------------------
jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Mock @/lib/utils
// ---------------------------------------------------------------------------
jest.mock('@/lib/utils', () => ({
  generateGroupInviteCode: jest.fn().mockReturnValue('ABC123'),
  generateLoginCode: jest.fn().mockReturnValue('LOGIN123'),
  validateWishlistItems: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Mock @/lib/email
// ---------------------------------------------------------------------------
jest.mock('@/lib/email', () => ({
  generateMagicToken: jest.fn().mockReturnValue('mock-magic-token'),
  sendMagicLinkEmail: jest.fn().mockResolvedValue(true),
  verifyMagicToken: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Mock @/lib/secret-santa
// ---------------------------------------------------------------------------
jest.mock('@/lib/secret-santa', () => ({
  generateSecretSantaAssignments: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import { authRateLimit, magicLinkRateLimit, adminAuthRateLimit } from '@/lib/rate-limit';
import { generateGroupInviteCode, generateLoginCode, validateWishlistItems } from '@/lib/utils';
import { generateMagicToken, sendMagicLinkEmail, verifyMagicToken } from '@/lib/email';
import { generateSecretSantaAssignments } from '@/lib/secret-santa';

import { POST as createGroup } from '@/app/api/groups/create/route';
import { POST as verifyGroup } from '@/app/api/groups/verify/route';
import { GET as getGroup, PATCH as patchGroup } from '@/app/api/groups/[id]/route';
import { POST as loginAuth } from '@/app/api/auth/login/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { GET as getSessionRoute } from '@/app/api/auth/session/route';
import { POST as magicLink } from '@/app/api/auth/magic-link/route';
import { GET as verifyAuth } from '@/app/api/auth/verify/route';
import { GET as getPeople, POST as createPerson } from '@/app/api/people/route';
import { DELETE as deletePerson } from '@/app/api/people/[id]/route';
import { POST as updateWishlist } from '@/app/api/wishlist/route';
import { POST as generateAssignments } from '@/app/api/assignments/generate/route';
import { GET as getAssignments, DELETE as deleteAssignments } from '@/app/api/assignments/route';
import { POST as adminAuth } from '@/app/api/admin/auth/route';

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------
type MockSession = Record<string, unknown> & {
  save: jest.Mock;
  destroy: jest.Mock;
};

function makeSession(fields: Record<string, unknown> = {}): MockSession {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn(),
    ...fields,
  };
}

/** Anonymous visitor: no participant login, no admin login. */
function anonSession(): MockSession {
  return makeSession();
}

/** Admin logged in to `groupId`. */
function adminSession(groupId = 'group-1'): MockSession {
  return makeSession({
    isAdmin: true,
    adminGroupId: groupId,
    adminGroupName: 'Test Group',
    adminInviteCode: 'ABC123',
  });
}

/** Participant `personId` logged in to `groupId`. */
function participantSession(personId = 'person-1', groupId = 'group-1'): MockSession {
  return makeSession({
    isLoggedIn: true,
    personId,
    personName: 'Alice',
    groupId,
    groupName: 'Test Group',
    loginMethod: 'code',
  });
}

function useSession(session: MockSession): MockSession {
  (getSession as jest.Mock).mockResolvedValue(session);
  return session;
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------
function makePostRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeGetRequest(url: string): NextRequest {
  return new NextRequest(url);
}

function makeDeleteRequest(url: string): NextRequest {
  return new NextRequest(url, { method: 'DELETE' });
}

function makePatchRequest(url: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

/** A group row as `enforceParticipantLimit` and GET /api/groups/[id] read it. */
function groupRow(plan: string, peopleCount: number, extra: Record<string, unknown> = {}) {
  return {
    id: 'group-1',
    name: 'Test Group',
    inviteCode: 'ABC123',
    year: 2026,
    plan,
    budgetAmount: null,
    budgetCurrency: 'USD',
    _count: { people: peopleCount, assignments: 0 },
    subscription: null,
    ...extra,
  };
}

const VALID_PASSWORD = 'Password12345';

// ---------------------------------------------------------------------------
// Reset all mocks before each test; default to an anonymous session
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
  useSession(anonSession());
});

// ===========================================================================
// 1. POST /api/groups/create
// ===========================================================================
describe('POST /api/groups/create', () => {
  const url = 'http://localhost:3000/api/groups/create';

  it('returns 400 when group name is missing', async () => {
    const req = makePostRequest(url, { groupName: '', adminPassword: VALID_PASSWORD });
    const res = await createGroup(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group name is required');
  });

  it('returns 400 when admin password is shorter than 12 characters', async () => {
    const req = makePostRequest(url, { groupName: 'Test Group', adminPassword: 'Short1' });
    const res = await createGroup(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Password must be at least 12 characters long');
  });

  it('returns 400 when admin password has no uppercase letter', async () => {
    const req = makePostRequest(url, { groupName: 'Test Group', adminPassword: 'password12345' });
    const res = await createGroup(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Password must contain at least one uppercase letter');
  });

  it('returns 400 when admin password has no number', async () => {
    const req = makePostRequest(url, { groupName: 'Test Group', adminPassword: 'PasswordWithoutDigits' });
    const res = await createGroup(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Password must contain at least one number');
  });

  it('returns 201 on successful group creation', async () => {
    mockPrismaDb.group.findUnique.mockResolvedValue(null); // invite code doesn't exist
    mockPrismaDb.group.create.mockResolvedValue({
      id: 'group-1',
      name: 'Test Group',
      inviteCode: 'ABC123',
      year: 2026,
      adminConfig: { id: 'ac-1', hashedPassword: 'hashed-password', groupId: 'group-1' },
    });

    const req = makePostRequest(url, { groupName: 'Test Group', adminPassword: VALID_PASSWORD });
    const res = await createGroup(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.group).toEqual({
      id: 'group-1',
      name: 'Test Group',
      inviteCode: 'ABC123',
      year: 2026,
    });

    expect(generateGroupInviteCode).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith(VALID_PASSWORD, 12);
    expect(mockPrismaDb.group.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Test Group', inviteCode: 'ABC123' }),
      }),
    );
  });

  it('regenerates the invite code when it already exists', async () => {
    mockPrismaDb.group.findUnique
      .mockResolvedValueOnce({ id: 'other-group' })
      .mockResolvedValueOnce(null);
    mockPrismaDb.group.create.mockResolvedValue({
      id: 'group-1',
      name: 'Test Group',
      inviteCode: 'ABC123',
      year: 2026,
    });

    const req = makePostRequest(url, { groupName: 'Test Group', adminPassword: VALID_PASSWORD });
    const res = await createGroup(req);
    expect(res.status).toBe(201);
    expect(generateGroupInviteCode).toHaveBeenCalledTimes(2);
  });
});

// ===========================================================================
// 2. POST /api/groups/verify
// ===========================================================================
describe('POST /api/groups/verify', () => {
  const url = 'http://localhost:3000/api/groups/verify';

  it('returns 400 when invite code is missing', async () => {
    const req = makePostRequest(url, {});
    const res = await verifyGroup(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invite code is required');
  });

  it('returns 404 when invite code is invalid', async () => {
    mockPrismaDb.group.findUnique.mockResolvedValue(null);

    const req = makePostRequest(url, { inviteCode: 'WRONG1' });
    const res = await verifyGroup(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Invalid invite code');
  });

  it('returns 200 with group data for valid invite code', async () => {
    const groupData = { id: 'group-1', name: 'Test', inviteCode: 'ABC123', year: 2026 };
    mockPrismaDb.group.findUnique.mockResolvedValue(groupData);

    const req = makePostRequest(url, { inviteCode: 'abc123' });
    const res = await verifyGroup(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.group).toEqual(groupData);

    // Verify case-insensitive lookup
    expect(mockPrismaDb.group.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { inviteCode: 'ABC123' } }),
    );
  });
});

// ===========================================================================
// 3. GET /api/groups/[id]
// ===========================================================================
describe('GET /api/groups/[id]', () => {
  const params = (id: string) => ({ params: { id } }) as any;

  it('returns 403 for an anonymous session', async () => {
    const req = makeGetRequest('http://localhost:3000/api/groups/group-1');
    const res = await getGroup(req, params('group-1'));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockPrismaDb.group.findUnique).not.toHaveBeenCalled();
  });

  it('returns 403 when the admin belongs to a different group', async () => {
    useSession(adminSession('group-2'));

    const req = makeGetRequest('http://localhost:3000/api/groups/group-1');
    const res = await getGroup(req, params('group-1'));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
  });

  it('returns 403 when the participant belongs to a different group', async () => {
    useSession(participantSession('person-1', 'group-2'));

    const req = makeGetRequest('http://localhost:3000/api/groups/group-1');
    const res = await getGroup(req, params('group-1'));
    expect(res.status).toBe(403);
  });

  it('returns 404 when group is not found', async () => {
    useSession(adminSession('nonexistent'));
    mockPrismaDb.group.findUnique.mockResolvedValue(null);

    const req = makeGetRequest('http://localhost:3000/api/groups/nonexistent');
    const res = await getGroup(req, params('nonexistent'));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Group not found');
  });

  it('returns 200 with plan "free" and maxParticipants 10 for the admin of a free group', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.group.findUnique.mockResolvedValue(groupRow('free', 5, { _count: { people: 5, assignments: 5 } }));

    const req = makeGetRequest('http://localhost:3000/api/groups/group-1');
    const res = await getGroup(req, params('group-1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.group).toMatchObject({
      id: 'group-1',
      name: 'Test Group',
      inviteCode: 'ABC123',
      year: 2026,
      plan: 'free',
      maxParticipants: 10,
      _count: { people: 5, assignments: 5 },
    });

    expect(mockPrismaDb.group.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'group-1' },
        include: { _count: { select: { people: true, assignments: true } } },
      }),
    );
  });

  it('returns plan "unlimited" and maxParticipants null for an unlimited group', async () => {
    useSession(participantSession('person-1', 'group-1'));
    mockPrismaDb.group.findUnique.mockResolvedValue(groupRow('unlimited', 50));

    const req = makeGetRequest('http://localhost:3000/api/groups/group-1');
    const res = await getGroup(req, params('group-1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.group.plan).toBe('unlimited');
    expect(json.group.maxParticipants).toBeNull();
  });

  it('normalizes legacy "plus"/"pro" plans to "unlimited"', async () => {
    useSession(adminSession('group-1'));

    for (const legacy of ['plus', 'pro']) {
      mockPrismaDb.group.findUnique.mockResolvedValue(groupRow(legacy, 3));
      const req = makeGetRequest('http://localhost:3000/api/groups/group-1');
      const res = await getGroup(req, params('group-1'));
      const json = await res.json();
      expect(json.group.plan).toBe('unlimited');
      expect(json.group.maxParticipants).toBeNull();
    }
  });
});

// ===========================================================================
// 4. PATCH /api/groups/[id]
// ===========================================================================
describe('PATCH /api/groups/[id]', () => {
  const url = 'http://localhost:3000/api/groups/group-1';
  const params = { params: { id: 'group-1' } } as any;

  it('returns 403 when not authenticated as admin', async () => {
    useSession(participantSession('person-1', 'group-1'));

    const req = makePatchRequest(url, { budgetAmount: 50, budgetCurrency: 'USD' });
    const res = await patchGroup(req, params);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Admin authentication required');
    expect(mockPrismaDb.group.update).not.toHaveBeenCalled();
  });

  it('returns 403 when the admin belongs to a different group', async () => {
    useSession(adminSession('group-2'));

    const req = makePatchRequest(url, { budgetAmount: 50, budgetCurrency: 'USD' });
    const res = await patchGroup(req, params);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Admin authentication required');
  });

  it('returns 400 for invalid currency code', async () => {
    useSession(adminSession('group-1'));

    const req = makePatchRequest(url, { budgetAmount: 50, budgetCurrency: 'INVALID' });
    const res = await patchGroup(req, params);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid currency code');
  });

  it('returns 400 for negative budget amount', async () => {
    useSession(adminSession('group-1'));

    const req = makePatchRequest(url, { budgetAmount: -10, budgetCurrency: 'USD' });
    const res = await patchGroup(req, params);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Budget amount must be a positive number');
  });

  it('returns 200 on valid budget update', async () => {
    useSession(adminSession('group-1'));
    const updatedGroup = {
      id: 'group-1',
      name: 'Test',
      budgetAmount: 50,
      budgetCurrency: 'EUR',
    };
    mockPrismaDb.group.update.mockResolvedValue(updatedGroup);

    const req = makePatchRequest(url, { budgetAmount: 50, budgetCurrency: 'EUR' });
    const res = await patchGroup(req, params);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.group).toEqual(updatedGroup);
    expect(mockPrismaDb.group.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'group-1' },
        data: expect.objectContaining({ budgetAmount: 50, budgetCurrency: 'EUR' }),
      }),
    );
  });
});

// ===========================================================================
// 5. POST /api/auth/login
// ===========================================================================
describe('POST /api/auth/login', () => {
  const url = 'http://localhost:3000/api/auth/login';

  it('returns the rate limiter response when rate limited', async () => {
    (authRateLimit as jest.Mock).mockReturnValueOnce({
      success: false,
      response: NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }),
    });

    const req = makePostRequest(url, { loginCode: 'CODE1234', groupId: 'group-1' });
    const res = await loginAuth(req);
    expect(res.status).toBe(429);
    expect(mockPrismaDb.person.findFirst).not.toHaveBeenCalled();
  });

  it('returns 400 when loginCode is missing', async () => {
    const req = makePostRequest(url, { groupId: 'group-1' });
    const res = await loginAuth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Login code is required');
  });

  it('returns 400 when groupId is missing', async () => {
    const req = makePostRequest(url, { loginCode: 'CODE1234' });
    const res = await loginAuth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group ID is required');
  });

  it('returns 401 for invalid login code', async () => {
    mockPrismaDb.person.findFirst.mockResolvedValue(null);

    const req = makePostRequest(url, { loginCode: 'WRONG123', groupId: 'group-1' });
    const res = await loginAuth(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Invalid login code for this group');
    expect(getSession).not.toHaveBeenCalled();
  });

  it('returns 200 with person data and saves a server-side session for valid login', async () => {
    const session = useSession(anonSession());
    const personData = {
      id: 'person-1',
      name: 'Alice',
      loginCode: 'CODE1234',
      group: { id: 'group-1', name: 'Test', year: 2026 },
      wishlistItems: [],
      giverFor: [
        {
          id: 'assign-1',
          receiver: { id: 'person-2', name: 'Bob', wishlistItems: [] },
        },
      ],
    };
    mockPrismaDb.person.findFirst.mockResolvedValue(personData);

    const req = makePostRequest(url, { loginCode: 'code1234', groupId: 'group-1' });
    const res = await loginAuth(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.person.id).toBe('person-1');
    expect(json.person.name).toBe('Alice');
    expect(json.person.assignment).toEqual(personData.giverFor[0]);

    // Verify case-insensitive lookup
    expect(mockPrismaDb.person.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ loginCode: 'CODE1234' }),
      }),
    );

    expect(authRateLimit).toHaveBeenCalledWith(req);
    expect(session).toMatchObject({
      personId: 'person-1',
      personName: 'Alice',
      groupId: 'group-1',
      groupName: 'Test',
      loginMethod: 'code',
      isLoggedIn: true,
    });
    expect(session.save).toHaveBeenCalledTimes(1);
  });
});

// ===========================================================================
// 6. POST /api/auth/logout and GET /api/auth/session
// ===========================================================================
describe('POST /api/auth/logout', () => {
  it('destroys the session', async () => {
    const session = useSession(participantSession());

    const res = await logout();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(session.destroy).toHaveBeenCalledTimes(1);
  });
});

describe('GET /api/auth/session', () => {
  it('reports unauthenticated for an anonymous session', async () => {
    const res = await getSessionRoute();
    const json = await res.json();
    expect(json).toEqual({ authenticated: false });
  });

  it('reports participant session fields', async () => {
    useSession(participantSession('person-1', 'group-1'));

    const res = await getSessionRoute();
    const json = await res.json();
    expect(json).toMatchObject({
      authenticated: true,
      isLoggedIn: true,
      personId: 'person-1',
      groupId: 'group-1',
      loginMethod: 'code',
    });
  });

  it('reports admin session fields', async () => {
    useSession(adminSession('group-1'));

    const res = await getSessionRoute();
    const json = await res.json();
    expect(json).toMatchObject({
      authenticated: true,
      isAdmin: true,
      adminGroupId: 'group-1',
      adminInviteCode: 'ABC123',
    });
  });
});

// ===========================================================================
// 7. POST /api/auth/magic-link
// ===========================================================================
describe('POST /api/auth/magic-link', () => {
  const url = 'http://localhost:3000/api/auth/magic-link';

  it('returns the rate limiter response when rate limited', async () => {
    (magicLinkRateLimit as jest.Mock).mockReturnValueOnce({
      success: false,
      response: NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }),
    });

    const req = makePostRequest(url, { email: 'alice@example.com', groupId: 'group-1' });
    const res = await magicLink(req);
    expect(res.status).toBe(429);
    expect(mockPrismaDb.person.findUnique).not.toHaveBeenCalled();
  });

  it('returns 400 when fields are missing', async () => {
    const req = makePostRequest(url, { email: 'test@example.com' });
    const res = await magicLink(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Email and group ID are required');
  });

  it('returns 200 even when person is not found (security)', async () => {
    mockPrismaDb.person.findUnique.mockResolvedValue(null);

    const req = makePostRequest(url, { email: 'unknown@example.com', groupId: 'group-1' });
    const res = await magicLink(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe('If this email is registered, a login link has been sent.');
    expect(sendMagicLinkEmail).not.toHaveBeenCalled();
  });

  it('returns 200 and sends email for valid person', async () => {
    const personData = {
      id: 'person-1',
      name: 'Alice',
      email: 'alice@example.com',
      groupId: 'group-1',
      group: { id: 'group-1', name: 'Test Group' },
    };
    mockPrismaDb.person.findUnique.mockResolvedValue(personData);
    (sendMagicLinkEmail as jest.Mock).mockResolvedValue(true);

    const req = makePostRequest(url, { email: ' Alice@Example.com ', groupId: 'group-1' });
    const res = await magicLink(req);
    expect(res.status).toBe(200);

    // Lookup is by the normalized (lower-cased, trimmed) email
    expect(mockPrismaDb.person.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { groupId_email: { groupId: 'group-1', email: 'alice@example.com' } },
      }),
    );
    expect(generateMagicToken).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: 'person-1',
        email: 'alice@example.com',
        groupId: 'group-1',
      }),
    );
    expect(sendMagicLinkEmail).toHaveBeenCalledWith(
      'alice@example.com',
      'Alice',
      'Test Group',
      expect.stringContaining('mock-magic-token'),
    );
  });

  it('returns 500 when email send fails', async () => {
    const personData = {
      id: 'person-1',
      name: 'Alice',
      email: 'alice@example.com',
      groupId: 'group-1',
      group: { id: 'group-1', name: 'Test Group' },
    };
    mockPrismaDb.person.findUnique.mockResolvedValue(personData);
    (sendMagicLinkEmail as jest.Mock).mockResolvedValue(false);

    const req = makePostRequest(url, { email: 'alice@example.com', groupId: 'group-1' });
    const res = await magicLink(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Failed to send email. Please try again later.');
  });
});

// ===========================================================================
// 8. GET /api/auth/verify
// ===========================================================================
describe('GET /api/auth/verify', () => {
  it('returns 400 when token is missing', async () => {
    const req = makeGetRequest('http://localhost:3000/api/auth/verify');
    const res = await verifyAuth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid or missing token');
  });

  it('returns 400 when token is invalid', async () => {
    (verifyMagicToken as jest.Mock).mockReturnValue(null);

    const req = makeGetRequest('http://localhost:3000/api/auth/verify?token=bad-token');
    const res = await verifyAuth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid or expired token');
  });

  it('returns 400 when person data does not match token', async () => {
    (verifyMagicToken as jest.Mock).mockReturnValue({
      personId: 'person-1',
      email: 'alice@example.com',
      groupId: 'group-1',
      expires: Date.now() + 60000,
    });
    mockPrismaDb.person.findUnique.mockResolvedValue({
      id: 'person-1',
      email: 'different@example.com', // mismatch
      groupId: 'group-1',
      name: 'Alice',
      group: { name: 'Test' },
    });

    const req = makeGetRequest('http://localhost:3000/api/auth/verify?token=some-token');
    const res = await verifyAuth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid token data');
    expect(getSession).not.toHaveBeenCalled();
  });

  it('returns 200 and saves a magic-link session for a valid token', async () => {
    const session = useSession(anonSession());
    const tokenData = {
      personId: 'person-1',
      email: 'alice@example.com',
      groupId: 'group-1',
      expires: Date.now() + 60000,
    };
    (verifyMagicToken as jest.Mock).mockReturnValue(tokenData);
    mockPrismaDb.person.findUnique.mockResolvedValue({
      id: 'person-1',
      email: 'alice@example.com',
      groupId: 'group-1',
      name: 'Alice',
      group: { id: 'group-1', name: 'Test Group' },
    });

    const req = makeGetRequest('http://localhost:3000/api/auth/verify?token=valid-token');
    const res = await verifyAuth(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.person).toEqual({
      id: 'person-1',
      name: 'Alice',
      groupId: 'group-1',
      groupName: 'Test Group',
    });
    // Session data lives server-side now and is no longer echoed in the body
    expect(json.sessionData).toBeUndefined();

    expect(session).toMatchObject({
      personId: 'person-1',
      personName: 'Alice',
      groupId: 'group-1',
      groupName: 'Test Group',
      loginMethod: 'magic-link',
      isLoggedIn: true,
    });
    expect(session.save).toHaveBeenCalledTimes(1);
  });
});

// ===========================================================================
// 9. GET /api/people
// ===========================================================================
describe('GET /api/people', () => {
  it('returns 400 when groupId is missing', async () => {
    useSession(adminSession('group-1'));

    const req = makeGetRequest('http://localhost:3000/api/people');
    const res = await getPeople(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group ID is required');
  });

  it('returns 403 when the admin belongs to a different group', async () => {
    useSession(adminSession('group-2'));

    const req = makeGetRequest('http://localhost:3000/api/people?groupId=group-1');
    const res = await getPeople(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockPrismaDb.person.findMany).not.toHaveBeenCalled();
  });

  it('returns 403 when the participant belongs to a different group', async () => {
    useSession(participantSession('person-1', 'group-2'));

    const req = makeGetRequest('http://localhost:3000/api/people?groupId=group-1');
    const res = await getPeople(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
  });

  it('returns 200 with list of people for the group admin', async () => {
    useSession(adminSession('group-1'));
    const people = [
      { id: 'p-1', name: 'Alice', wishlistItems: [], _count: { wishlistItems: 0 } },
      { id: 'p-2', name: 'Bob', wishlistItems: [], _count: { wishlistItems: 0 } },
    ];
    mockPrismaDb.person.findMany.mockResolvedValue(people);

    const req = makeGetRequest('http://localhost:3000/api/people?groupId=group-1');
    const res = await getPeople(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.people).toEqual(people);
    expect(mockPrismaDb.person.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { groupId: 'group-1' } }),
    );
  });

  it('returns 200 with list of people for a participant of the group', async () => {
    useSession(participantSession('person-1', 'group-1'));
    mockPrismaDb.person.findMany.mockResolvedValue([]);

    const req = makeGetRequest('http://localhost:3000/api/people?groupId=group-1');
    const res = await getPeople(req);
    expect(res.status).toBe(200);
  });
});

// ===========================================================================
// 10. POST /api/people
// ===========================================================================
describe('POST /api/people', () => {
  const url = 'http://localhost:3000/api/people';

  it('returns 403 when not authenticated as admin', async () => {
    useSession(participantSession('person-1', 'group-1'));

    const req = makePostRequest(url, { name: 'Alice', groupId: 'group-1' });
    const res = await createPerson(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Admin authentication required');
    expect(mockPrismaDb.person.create).not.toHaveBeenCalled();
  });

  it('returns 400 when name is missing', async () => {
    useSession(adminSession('group-1'));

    const req = makePostRequest(url, { name: '', groupId: 'group-1' });
    const res = await createPerson(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Name is required');
  });

  it('returns 400 when groupId is missing', async () => {
    useSession(adminSession('group-1'));

    const req = makePostRequest(url, { name: 'Alice' });
    const res = await createPerson(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group ID is required');
  });

  it('returns 403 when the admin belongs to a different group', async () => {
    useSession(adminSession('group-2'));

    const req = makePostRequest(url, { name: 'Alice', groupId: 'group-1' });
    const res = await createPerson(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockPrismaDb.group.findUnique).not.toHaveBeenCalled();
  });

  it('returns 403 with code PARTICIPANT_LIMIT when a free group already has 10 people', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.group.findUnique.mockResolvedValue({ plan: 'free', _count: { people: 10 }, subscription: null });

    const req = makePostRequest(url, { name: 'Kate', groupId: 'group-1' });
    const res = await createPerson(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.code).toBe('PARTICIPANT_LIMIT');
    expect(json.error).toContain('Free plan allows up to 10 participants');

    expect(mockPrismaDb.group.findUnique).toHaveBeenCalledWith({
      where: { id: 'group-1' },
      include: { _count: { select: { people: true } }, subscription: true },
    });
    expect(mockPrismaDb.person.findFirst).not.toHaveBeenCalled();
    expect(mockPrismaDb.person.create).not.toHaveBeenCalled();
  });

  it('returns 201 when a free group is under the participant limit', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.group.findUnique.mockResolvedValue({ plan: 'free', _count: { people: 9 }, subscription: null });
    mockPrismaDb.person.findFirst.mockResolvedValue(null);
    mockPrismaDb.person.create.mockResolvedValue({ id: 'person-10', name: 'Kate', groupId: 'group-1' });

    const req = makePostRequest(url, { name: 'Kate', groupId: 'group-1' });
    const res = await createPerson(req);
    expect(res.status).toBe(201);
  });

  it('returns 201 when the group plan is unlimited and already has 50 people', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.group.findUnique.mockResolvedValue({ plan: 'unlimited', _count: { people: 50 }, subscription: null });
    mockPrismaDb.person.findFirst.mockResolvedValue(null);
    const personData = { id: 'person-51', name: 'Zed', email: null, loginCode: 'LOGIN123', groupId: 'group-1' };
    mockPrismaDb.person.create.mockResolvedValue(personData);

    const req = makePostRequest(url, { name: 'Zed', groupId: 'group-1' });
    const res = await createPerson(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.person).toEqual(personData);
    expect(mockPrismaDb.person.create).toHaveBeenCalledWith({
      data: { name: 'Zed', email: null, loginCode: 'LOGIN123', groupId: 'group-1' },
    });
  });

  it('returns 400 when email is already used in the group', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.group.findUnique.mockResolvedValue({ plan: 'free', _count: { people: 2 }, subscription: null });
    mockPrismaDb.person.findFirst.mockResolvedValue({ id: 'existing-person' });

    const req = makePostRequest(url, {
      name: 'Alice',
      email: 'alice@example.com',
      groupId: 'group-1',
    });
    const res = await createPerson(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Email is already used in this group');
    expect(mockPrismaDb.person.create).not.toHaveBeenCalled();
  });

  it('returns 201 on successful creation', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.group.findUnique.mockResolvedValue({ plan: 'free', _count: { people: 3 }, subscription: null });
    // No duplicate email, no login code collision
    mockPrismaDb.person.findFirst.mockResolvedValue(null);
    const personData = {
      id: 'person-1',
      name: 'Alice',
      email: 'alice@example.com',
      loginCode: 'LOGIN123',
      groupId: 'group-1',
    };
    mockPrismaDb.person.create.mockResolvedValue(personData);

    const req = makePostRequest(url, {
      name: '  Alice  ',
      email: ' Alice@Example.com ',
      groupId: 'group-1',
    });
    const res = await createPerson(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.person).toEqual(personData);
    expect(generateLoginCode).toHaveBeenCalled();
    expect(mockPrismaDb.person.create).toHaveBeenCalledWith({
      data: { name: 'Alice', email: 'alice@example.com', loginCode: 'LOGIN123', groupId: 'group-1' },
    });
  });
});

// ===========================================================================
// 11. DELETE /api/people/[id]
// ===========================================================================
describe('DELETE /api/people/[id]', () => {
  const params = (id: string) => ({ params: { id } }) as any;

  it('returns 403 when not authenticated as admin', async () => {
    useSession(participantSession());

    const req = makeDeleteRequest('http://localhost:3000/api/people/person-1');
    const res = await deletePerson(req, params('person-1'));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Admin authentication required');
    expect(mockPrismaDb.person.delete).not.toHaveBeenCalled();
  });

  it('returns 404 when the person does not exist', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.person.findUnique.mockResolvedValue(null);

    const req = makeDeleteRequest('http://localhost:3000/api/people/nonexistent');
    const res = await deletePerson(req, params('nonexistent'));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Person not found');
    expect(mockPrismaDb.person.delete).not.toHaveBeenCalled();
  });

  it("returns 403 when the person belongs to another admin's group", async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.person.findUnique.mockResolvedValue({ id: 'person-1', groupId: 'group-2' });

    const req = makeDeleteRequest('http://localhost:3000/api/people/person-1');
    const res = await deletePerson(req, params('person-1'));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockPrismaDb.person.delete).not.toHaveBeenCalled();
  });

  it('returns 200 on successful delete', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.person.findUnique.mockResolvedValue({ id: 'person-1', groupId: 'group-1' });
    mockPrismaDb.person.delete.mockResolvedValue({ id: 'person-1' });

    const req = makeDeleteRequest('http://localhost:3000/api/people/person-1');
    const res = await deletePerson(req, params('person-1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockPrismaDb.person.delete).toHaveBeenCalledWith({ where: { id: 'person-1' } });
  });

  it('returns 500 on error', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.person.findUnique.mockResolvedValue({ id: 'person-1', groupId: 'group-1' });
    mockPrismaDb.person.delete.mockRejectedValue(new Error('DB error'));

    const req = makeDeleteRequest('http://localhost:3000/api/people/person-1');
    const res = await deletePerson(req, params('person-1'));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Internal server error');
  });
});

// ===========================================================================
// 12. POST /api/wishlist
// ===========================================================================
describe('POST /api/wishlist', () => {
  const url = 'http://localhost:3000/api/wishlist';

  it('returns 401 when not logged in as a participant', async () => {
    const req = makePostRequest(url, { personId: 'person-1', items: [] });
    const res = await updateWishlist(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Authentication required');
  });

  it('returns 401 for an admin-only session', async () => {
    useSession(adminSession('group-1'));

    const req = makePostRequest(url, { personId: 'person-1', items: [] });
    const res = await updateWishlist(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when modifying another person's wishlist", async () => {
    useSession(participantSession('person-1', 'group-1'));

    const req = makePostRequest(url, { personId: 'person-2', items: [{ title: 'Gift', link: 'http://example.com' }] });
    const res = await updateWishlist(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden: you can only modify your own wishlist');
    expect(mockPrismaDb.wishlistItem.deleteMany).not.toHaveBeenCalled();
  });

  it('returns 403 when personId is missing (session mismatch check runs first)', async () => {
    useSession(participantSession('person-1', 'group-1'));

    const req = makePostRequest(url, { items: [] });
    const res = await updateWishlist(req);
    expect(res.status).toBe(403);
  });

  it('returns 400 when items is not an array', async () => {
    useSession(participantSession('person-1', 'group-1'));

    const req = makePostRequest(url, { personId: 'person-1', items: 'not-array' });
    const res = await updateWishlist(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Items must be an array');
  });

  it('returns 400 when wishlist items fail validation', async () => {
    useSession(participantSession('person-1', 'group-1'));
    (validateWishlistItems as jest.Mock).mockReturnValue({
      valid: false,
      error: 'All items must have a title',
    });

    const req = makePostRequest(url, {
      personId: 'person-1',
      items: [{ title: '', link: 'http://example.com' }],
    });
    const res = await updateWishlist(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('All items must have a title');
  });

  it('returns 404 when person is not found', async () => {
    useSession(participantSession('person-1', 'group-1'));
    (validateWishlistItems as jest.Mock).mockReturnValue({ valid: true });
    mockPrismaDb.person.findUnique.mockResolvedValue(null);

    const req = makePostRequest(url, {
      personId: 'person-1',
      items: [{ title: 'Gift', link: 'http://example.com' }],
    });
    const res = await updateWishlist(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Person not found');
  });

  it("returns 403 when the person belongs to a different group than the session", async () => {
    useSession(participantSession('person-1', 'group-1'));
    (validateWishlistItems as jest.Mock).mockReturnValue({ valid: true });
    mockPrismaDb.person.findUnique.mockResolvedValue({ id: 'person-1', groupId: 'group-2' });

    const req = makePostRequest(url, {
      personId: 'person-1',
      items: [{ title: 'Gift', link: 'http://example.com' }],
    });
    const res = await updateWishlist(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockPrismaDb.wishlistItem.deleteMany).not.toHaveBeenCalled();
  });

  it('returns 200 on valid wishlist update', async () => {
    useSession(participantSession('person-1', 'group-1'));
    (validateWishlistItems as jest.Mock).mockReturnValue({ valid: true });
    mockPrismaDb.person.findUnique.mockResolvedValue({ id: 'person-1', groupId: 'group-1' });
    mockPrismaDb.wishlistItem.deleteMany.mockResolvedValue({ count: 0 });
    const createdItem = {
      id: 'wi-1',
      personId: 'person-1',
      title: 'Cool Gift',
      link: 'http://example.com/gift',
      order: 0,
    };
    mockPrismaDb.wishlistItem.create.mockResolvedValue(createdItem);

    const req = makePostRequest(url, {
      personId: 'person-1',
      items: [{ title: ' Cool Gift ', link: ' http://example.com/gift ' }],
    });
    const res = await updateWishlist(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.wishlistItems).toEqual([createdItem]);

    expect(mockPrismaDb.wishlistItem.deleteMany).toHaveBeenCalledWith({
      where: { personId: 'person-1' },
    });
    expect(mockPrismaDb.wishlistItem.create).toHaveBeenCalledWith({
      data: {
        personId: 'person-1',
        title: 'Cool Gift',
        link: 'http://example.com/gift',
        order: 0,
      },
    });
  });
});

// ===========================================================================
// 13. POST /api/assignments/generate
// ===========================================================================
describe('POST /api/assignments/generate', () => {
  const url = 'http://localhost:3000/api/assignments/generate';

  it('returns 403 when not authenticated as admin', async () => {
    useSession(participantSession());

    const req = makePostRequest(url, { groupId: 'group-1' });
    const res = await generateAssignments(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Admin authentication required');
  });

  it('returns 400 when groupId is missing', async () => {
    useSession(adminSession('group-1'));

    const req = makePostRequest(url, {});
    const res = await generateAssignments(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group ID is required');
  });

  it('returns 403 when the admin belongs to a different group', async () => {
    useSession(adminSession('group-2'));

    const req = makePostRequest(url, { groupId: 'group-1' });
    const res = await generateAssignments(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockPrismaDb.assignment.findMany).not.toHaveBeenCalled();
  });

  it('returns 400 when assignments already exist', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.assignment.findMany.mockResolvedValue([{ id: 'a-1' }]);

    const req = makePostRequest(url, { groupId: 'group-1' });
    const res = await generateAssignments(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Assignments already exist');
  });

  it('returns 400 when there are too few people', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.assignment.findMany.mockResolvedValue([]);
    mockPrismaDb.person.findMany.mockResolvedValue([
      { id: 'p-1', name: 'Alice' },
      { id: 'p-2', name: 'Bob' },
    ]);

    const req = makePostRequest(url, { groupId: 'group-1' });
    const res = await generateAssignments(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('at least 3 people');
  });

  it('returns 500 when the algorithm cannot produce assignments', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.assignment.findMany.mockResolvedValue([]);
    mockPrismaDb.person.findMany.mockResolvedValue([
      { id: 'p-1', name: 'Alice' },
      { id: 'p-2', name: 'Bob' },
      { id: 'p-3', name: 'Charlie' },
    ]);
    (generateSecretSantaAssignments as jest.Mock).mockReturnValue(null);

    const req = makePostRequest(url, { groupId: 'group-1' });
    const res = await generateAssignments(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Failed to generate valid assignments');
    expect(mockPrismaDb.assignment.create).not.toHaveBeenCalled();
  });

  it('returns 200 on successful generation', async () => {
    useSession(adminSession('group-1'));
    const people = [
      { id: 'p-1', name: 'Alice' },
      { id: 'p-2', name: 'Bob' },
      { id: 'p-3', name: 'Charlie' },
    ];
    const assignmentPairs = [
      { giverId: 'p-1', receiverId: 'p-2' },
      { giverId: 'p-2', receiverId: 'p-3' },
      { giverId: 'p-3', receiverId: 'p-1' },
    ];

    mockPrismaDb.assignment.findMany.mockResolvedValue([]);
    mockPrismaDb.person.findMany.mockResolvedValue(people);
    (generateSecretSantaAssignments as jest.Mock).mockReturnValue(assignmentPairs);

    const createdAssignments = assignmentPairs.map((a, i) => ({
      id: `assign-${i}`,
      ...a,
      giver: people.find((p) => p.id === a.giverId),
      receiver: people.find((p) => p.id === a.receiverId),
    }));
    mockPrismaDb.assignment.create
      .mockResolvedValueOnce(createdAssignments[0])
      .mockResolvedValueOnce(createdAssignments[1])
      .mockResolvedValueOnce(createdAssignments[2]);

    const req = makePostRequest(url, { groupId: 'group-1', year: 2026 });
    const res = await generateAssignments(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignments).toHaveLength(3);
    expect(json.count).toBe(3);
    expect(generateSecretSantaAssignments).toHaveBeenCalledWith(people);
    expect(mockPrismaDb.assignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { groupId: 'group-1', giverId: 'p-1', receiverId: 'p-2', year: 2026 },
      }),
    );
  });
});

// ===========================================================================
// 14. GET /api/assignments
// ===========================================================================
describe('GET /api/assignments', () => {
  it('returns 400 when groupId is missing', async () => {
    useSession(adminSession('group-1'));

    const req = makeGetRequest('http://localhost:3000/api/assignments');
    const res = await getAssignments(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group ID is required');
  });

  it('returns 403 for an anonymous session', async () => {
    const req = makeGetRequest('http://localhost:3000/api/assignments?groupId=group-1');
    const res = await getAssignments(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockPrismaDb.assignment.findMany).not.toHaveBeenCalled();
  });

  it('returns 403 when the participant belongs to a different group', async () => {
    useSession(participantSession('person-1', 'group-2'));

    const req = makeGetRequest('http://localhost:3000/api/assignments?groupId=group-1');
    const res = await getAssignments(req);
    expect(res.status).toBe(403);
  });

  it('returns 200 with assignments for the group admin', async () => {
    useSession(adminSession('group-1'));
    const assignments = [
      {
        id: 'a-1',
        giverId: 'p-1',
        receiverId: 'p-2',
        giver: { id: 'p-1', name: 'Alice' },
        receiver: { id: 'p-2', name: 'Bob', wishlistItems: [] },
      },
    ];
    mockPrismaDb.assignment.findMany.mockResolvedValue(assignments);

    const req = makeGetRequest('http://localhost:3000/api/assignments?groupId=group-1&year=2026');
    const res = await getAssignments(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignments).toEqual(assignments);
    expect(mockPrismaDb.assignment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { groupId: 'group-1', year: 2026 } }),
    );
  });

  it('returns 200 with assignments for a participant of the group', async () => {
    useSession(participantSession('person-1', 'group-1'));
    mockPrismaDb.assignment.findMany.mockResolvedValue([]);

    const req = makeGetRequest('http://localhost:3000/api/assignments?groupId=group-1');
    const res = await getAssignments(req);
    expect(res.status).toBe(200);
  });
});

// ===========================================================================
// 15. DELETE /api/assignments
// ===========================================================================
describe('DELETE /api/assignments', () => {
  it('returns 403 when not authenticated as admin', async () => {
    useSession(participantSession('person-1', 'group-1'));

    const req = makeDeleteRequest('http://localhost:3000/api/assignments?groupId=group-1');
    const res = await deleteAssignments(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Admin authentication required');
    expect(mockPrismaDb.assignment.deleteMany).not.toHaveBeenCalled();
  });

  it('returns 400 when groupId is missing', async () => {
    useSession(adminSession('group-1'));

    const req = makeDeleteRequest('http://localhost:3000/api/assignments');
    const res = await deleteAssignments(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group ID is required');
  });

  it('returns 403 when the admin belongs to a different group', async () => {
    useSession(adminSession('group-2'));

    const req = makeDeleteRequest('http://localhost:3000/api/assignments?groupId=group-1');
    const res = await deleteAssignments(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('Forbidden');
    expect(mockPrismaDb.assignment.deleteMany).not.toHaveBeenCalled();
  });

  it('returns 200 on successful deletion', async () => {
    useSession(adminSession('group-1'));
    mockPrismaDb.assignment.deleteMany.mockResolvedValue({ count: 3 });

    const req = makeDeleteRequest('http://localhost:3000/api/assignments?groupId=group-1&year=2026');
    const res = await deleteAssignments(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(mockPrismaDb.assignment.deleteMany).toHaveBeenCalledWith({
      where: { groupId: 'group-1', year: 2026 },
    });
  });
});

// ===========================================================================
// 16. POST /api/admin/auth
// ===========================================================================
describe('POST /api/admin/auth', () => {
  const url = 'http://localhost:3000/api/admin/auth';

  it('returns the rate limiter response when rate limited', async () => {
    (adminAuthRateLimit as jest.Mock).mockReturnValueOnce({
      success: false,
      response: NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }),
    });

    const req = makePostRequest(url, { password: 'secret123', groupId: 'group-1' });
    const res = await adminAuth(req);
    expect(res.status).toBe(429);
    expect(mockPrismaDb.adminConfig.findUnique).not.toHaveBeenCalled();
  });

  it('returns 400 when password is missing', async () => {
    const req = makePostRequest(url, { groupId: 'group-1' });
    const res = await adminAuth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Password is required');
  });

  it('returns 400 when groupId is missing', async () => {
    const req = makePostRequest(url, { password: 'secret123' });
    const res = await adminAuth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Group ID is required');
  });

  it('returns 401 "Invalid credentials" when group is not found (no enumeration)', async () => {
    mockPrismaDb.adminConfig.findUnique.mockResolvedValue(null);

    const req = makePostRequest(url, { password: 'secret123', groupId: 'nonexistent' });
    const res = await adminAuth(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Invalid credentials');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('returns 401 "Invalid credentials" when password is wrong', async () => {
    mockPrismaDb.adminConfig.findUnique.mockResolvedValue({
      id: 'ac-1',
      hashedPassword: 'hashed-password',
      groupId: 'group-1',
      group: { id: 'group-1', name: 'Test', inviteCode: 'ABC123', year: 2026 },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req = makePostRequest(url, { password: 'wrongpassword', groupId: 'group-1' });
    const res = await adminAuth(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Invalid credentials');
    expect(getSession).not.toHaveBeenCalled();
  });

  it('returns 200 and saves an admin session on valid authentication', async () => {
    const session = useSession(anonSession());
    const adminConfig = {
      id: 'ac-1',
      hashedPassword: 'hashed-password',
      groupId: 'group-1',
      group: { id: 'group-1', name: 'Test Group', inviteCode: 'ABC123', year: 2026 },
    };
    mockPrismaDb.adminConfig.findUnique.mockResolvedValue(adminConfig);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const req = makePostRequest(url, { password: 'correct-password', groupId: 'group-1' });
    const res = await adminAuth(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.group).toEqual({
      id: 'group-1',
      name: 'Test Group',
      inviteCode: 'ABC123',
      year: 2026,
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('correct-password', 'hashed-password');

    expect(session).toMatchObject({
      isAdmin: true,
      adminGroupId: 'group-1',
      adminGroupName: 'Test Group',
      adminInviteCode: 'ABC123',
    });
    expect(session.save).toHaveBeenCalledTimes(1);
  });
});
