import { act, renderHook, waitFor } from '@testing-library/react-native';

const mockRpc = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: { rpc: (...a: unknown[]) => mockRpc(...a) },
}));
jest.mock('../../providers/AuthProvider', () => {
  // Stable user reference, like the real AuthProvider (session.user) — so the
  // hook's useCallback([user]) doesn't change identity every render.
  const user = { id: 'u1' };
  return { useAuth: () => ({ user }) };
});

import { useStats } from '../useStats';

describe('useStats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('clears loading and exposes stats after a successful load', async () => {
    mockRpc.mockResolvedValue({ data: [{ total_watched: 3 }], error: null });

    const { result } = renderHook(() => useStats());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toEqual({ total_watched: 3 });
  });

  it('clears loading even when the request throws (resilience — no stuck spinner)', async () => {
    mockRpc.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useStats());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toBeNull();
  });

  it('does not re-enter the loading state during a refresh (silent — no skeleton flash on focus)', async () => {
    mockRpc.mockResolvedValue({ data: [{ total_watched: 1 }], error: null });

    const { result } = renderHook(() => useStats());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Make the refresh hang so we can observe the in-flight loading state.
    let resolveSecond!: (v: unknown) => void;
    mockRpc.mockReturnValueOnce(
      new Promise((res) => {
        resolveSecond = res;
      })
    );

    let inFlightLoading: boolean | undefined;
    await act(async () => {
      const pending = result.current.refresh();
      await Promise.resolve(); // flush any state updates from the start of the refresh
      inFlightLoading = result.current.loading;
      resolveSecond({ data: [{ total_watched: 2 }], error: null });
      await pending;
    });

    expect(inFlightLoading).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(mockRpc).toHaveBeenCalledTimes(2); // mount + refresh
  });
});
