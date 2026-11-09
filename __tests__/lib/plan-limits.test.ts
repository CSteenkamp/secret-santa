// ---------------------------------------------------------------------------
// Mock the shared prisma client used by lib/plan-limits
// ---------------------------------------------------------------------------
const mockPrisma = {
  group: {
    findUnique: jest.fn(),
  },
};

jest.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

import { enforceParticipantLimit, enforceWishlistLimit, checkGroupLimits } from '@/lib/plan-limits';

function mockGroup(plan: string | null, peopleCount: number) {
  mockPrisma.group.findUnique.mockResolvedValue({
    id: 'group-1',
    name: 'Test Group',
    plan,
    _count: { people: peopleCount },
    subscription: null,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('enforceParticipantLimit', () => {
  it('queries the group with its participant count and subscription', async () => {
    mockGroup('free', 0);

    await enforceParticipantLimit('group-1');

    expect(mockPrisma.group.findUnique).toHaveBeenCalledWith({
      where: { id: 'group-1' },
      include: {
        _count: { select: { people: true } },
        subscription: true,
      },
    });
  });

  it('refuses with PARTICIPANT_LIMIT when a free group already has 10 people', async () => {
    mockGroup('free', 10);

    const result = await enforceParticipantLimit('group-1');

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('PARTICIPANT_LIMIT');
    expect(result.message).toContain('Free plan allows up to 10 participants');
  });

  it('refuses when a free group is over the limit', async () => {
    mockGroup('free', 12);

    const result = await enforceParticipantLimit('group-1');

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('PARTICIPANT_LIMIT');
  });

  it('allows a free group that is under the limit', async () => {
    mockGroup('free', 9);

    const result = await enforceParticipantLimit('group-1');

    expect(result).toEqual({ allowed: true });
  });

  it('allows an unlimited group with many people', async () => {
    mockGroup('unlimited', 50);

    const result = await enforceParticipantLimit('group-1');

    expect(result).toEqual({ allowed: true });
  });

  it('treats legacy "plus" and "pro" plans as unlimited', async () => {
    mockGroup('plus', 50);
    expect(await enforceParticipantLimit('group-1')).toEqual({ allowed: true });

    mockGroup('pro', 50);
    expect(await enforceParticipantLimit('group-1')).toEqual({ allowed: true });
  });

  it('treats an unknown plan value as free', async () => {
    mockGroup('enterprise', 10);

    const result = await enforceParticipantLimit('group-1');

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('PARTICIPANT_LIMIT');
  });

  it('refuses without a limit code when the group does not exist', async () => {
    mockPrisma.group.findUnique.mockResolvedValue(null);

    const result = await enforceParticipantLimit('missing');

    expect(result.allowed).toBe(false);
    expect(result.code).toBeUndefined();
    expect(result.message).toBe('Group not found');
  });
});

describe('checkGroupLimits', () => {
  it('returns null when the group does not exist', async () => {
    mockPrisma.group.findUnique.mockResolvedValue(null);

    expect(await checkGroupLimits('missing')).toBeNull();
  });

  it('reports the normalized plan and participant headroom', async () => {
    mockGroup('free', 4);

    const info = await checkGroupLimits('group-1');

    expect(info).toMatchObject({
      plan: 'free',
      currentParticipants: 4,
      canAddParticipant: true,
      maxWishlistItems: 5,
      subscription: null,
    });
    expect(info?.limits.maxParticipants).toBe(10);
  });
});

describe('enforceWishlistLimit', () => {
  it('allows up to 5 items on the free plan', async () => {
    mockGroup('free', 1);

    expect(await enforceWishlistLimit('group-1', 5)).toEqual({ allowed: true });
  });

  it('refuses more than 5 items', async () => {
    mockGroup('unlimited', 1);

    const result = await enforceWishlistLimit('group-1', 6);

    expect(result.allowed).toBe(false);
    expect(result.message).toContain('up to 5 wishlist items');
  });
});
