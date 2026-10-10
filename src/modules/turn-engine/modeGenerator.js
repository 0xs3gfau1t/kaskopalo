/**
 * Generates all subset combinations of size >= 2 from an array of members.
 * Total count = 2^N - N - 1.
 *
 * @param {Array<{uid: string, displayName: string}>} members
 * @returns {Array<{modeKey: string, modeLabel: string, memberUids: string[]}>}
 */
export function generateModes(members) {
  if (!members || members.length < 2) return [];

  // Sort members by uid for consistent modeKey formatting
  const sortedMembers = [...members].sort((a, b) => a.uid.localeCompare(b.uid));
  const results = [];

  function combine(start, combo) {
    if (combo.length >= 2) {
      const modeKey = combo.map((m) => m.uid).join('+');
      const modeLabel = combo
        .map((m) => m.displayName || 'Member')
        .sort((a, b) => a.localeCompare(b))
        .join(', ');

      results.push({
        modeKey,
        modeLabel,
        memberUids: combo.map((m) => m.uid),
      });
    }

    for (let i = start; i < sortedMembers.length; i++) {
      combo.push(sortedMembers[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }

  combine(0, []);

  // Sort modes by size first (2-person modes, then 3-person modes...), then label
  return results.sort((a, b) => {
    if (a.memberUids.length !== b.memberUids.length) {
      return a.memberUids.length - b.memberUids.length;
    }
    return a.modeLabel.localeCompare(b.modeLabel);
  });
}
