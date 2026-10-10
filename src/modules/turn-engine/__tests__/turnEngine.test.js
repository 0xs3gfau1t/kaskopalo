import { describe, it, expect } from 'vitest';
import { generateModes } from '../modeGenerator.js';
import {
  initializeQueue,
  getWhoseTurn,
  processMarkDone,
  processSkip,
} from '../turnEngine.js';

describe('modeGenerator', () => {
  it('generates 0 modes for 1 member', () => {
    expect(generateModes([{ uid: 'A', displayName: 'Alice' }])).toEqual([]);
  });

  it('generates 1 mode for 2 members', () => {
    const modes = generateModes([
      { uid: 'A', displayName: 'Alice' },
      { uid: 'B', displayName: 'Bob' },
    ]);
    expect(modes).toHaveLength(1);
    expect(modes[0].modeLabel).toBe('Alice, Bob');
  });

  it('generates 4 modes for 3 members (C(3,2) + C(3,3) = 3 + 1 = 4)', () => {
    const members = [
      { uid: 'A', displayName: 'Alice' },
      { uid: 'B', displayName: 'Bob' },
      { uid: 'C', displayName: 'Charlie' },
    ];
    const modes = generateModes(members);
    expect(modes).toHaveLength(4);
    const labels = modes.map((m) => m.modeLabel);
    expect(labels).toContain('Alice, Bob');
    expect(labels).toContain('Alice, Charlie');
    expect(labels).toContain('Bob, Charlie');
    expect(labels).toContain('Alice, Bob, Charlie');
  });

  it('generates 11 modes for 4 members (2^4 - 4 - 1 = 11)', () => {
    const members = [
      { uid: 'A', displayName: 'Alice' },
      { uid: 'B', displayName: 'Bob' },
      { uid: 'C', displayName: 'Charlie' },
      { uid: 'D', displayName: 'Dave' },
    ];
    const modes = generateModes(members);
    expect(modes).toHaveLength(11);
  });
});

describe('turnEngine algorithms', () => {
  it('rotates turns round robin on regular completion', () => {
    let q = initializeQueue('A+B+C', 'Alice, Bob, Charlie', ['A', 'B', 'C']);

    expect(getWhoseTurn(q)).toBe('A');
    q = processMarkDone(q, 'A');
    expect(getWhoseTurn(q)).toBe('B');
    q = processMarkDone(q, 'B');
    expect(getWhoseTurn(q)).toBe('C');
    q = processMarkDone(q, 'C');
    expect(getWhoseTurn(q)).toBe('A');
  });

  it('records debt when a member is skipped', () => {
    let q = initializeQueue('A+B+C', 'Alice, Bob, Charlie', ['A', 'B', 'C']);

    // A is skipped -> A gets 1 debt, moves to B
    q = processSkip(q, 'A');
    expect(q.debt['A']).toBe(1);
    expect(getWhoseTurn(q)).toBe('B');

    // B does their turn -> moves to C
    q = processMarkDone(q, 'B');
    expect(getWhoseTurn(q)).toBe('C');

    // C does their turn -> moves back to A
    q = processMarkDone(q, 'C');
    expect(getWhoseTurn(q)).toBe('A');

    // A does a turn -> debt decrements from 1 to 0, still A's turn!
    q = processMarkDone(q, 'A');
    expect(q.debt['A']).toBe(0);
    expect(getWhoseTurn(q)).toBe('A'); // Stays on A for their regular turn

    // A does regular turn -> advances to B
    q = processMarkDone(q, 'A');
    expect(getWhoseTurn(q)).toBe('B');
  });

  it('decrements debt if someone with debt does chore out-of-turn', () => {
    let q = initializeQueue('A+B+C', 'Alice, Bob, Charlie', ['A', 'B', 'C']);

    // A is skipped -> A gets debt=1, turn moves to B
    q = processSkip(q, 'A');
    expect(getWhoseTurn(q)).toBe('B');
    expect(q.debt['A']).toBe(1);

    // A does chore out-of-turn while it's B's turn
    q = processMarkDone(q, 'A');
    expect(q.debt['A']).toBe(0);
    // B's turn is NOT consumed
    expect(getWhoseTurn(q)).toBe('B');
  });
});
