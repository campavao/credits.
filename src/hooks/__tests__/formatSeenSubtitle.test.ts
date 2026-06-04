jest.mock('../../lib/supabase', () => ({ supabase: {} }));

import { formatSeenSubtitle } from '../useTrackedActors';

const actor = (movie_count: number, tv_count: number, seen_count: number) => ({
  id: 1,
  name: 'Test Actor',
  profile_path: null,
  seen_count,
  movie_count,
  tv_count,
});

describe('formatSeenSubtitle', () => {
  it('formats films only, pluralized', () => {
    expect(formatSeenSubtitle(actor(3, 0, 3))).toBe('3 films seen');
  });

  it('uses the singular for a single film', () => {
    expect(formatSeenSubtitle(actor(1, 0, 1))).toBe('1 film seen');
  });

  it('formats shows only, pluralized', () => {
    expect(formatSeenSubtitle(actor(0, 2, 2))).toBe('2 shows seen');
  });

  it('uses the singular for a single show', () => {
    expect(formatSeenSubtitle(actor(0, 1, 1))).toBe('1 show seen');
  });

  it('combines films and shows', () => {
    expect(formatSeenSubtitle(actor(2, 1, 3))).toBe('2 films, 1 show seen');
  });

  it('falls back to the raw seen count when there is no breakdown', () => {
    expect(formatSeenSubtitle(actor(0, 0, 5))).toBe('5 seen');
  });
});
