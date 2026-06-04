import { router } from 'expo-router';
import { goBack } from '../navigation';

jest.mock('expo-router', () => ({
  router: {
    canGoBack: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

const mockRouter = router as unknown as {
  canGoBack: jest.Mock;
  back: jest.Mock;
  replace: jest.Mock;
};

describe('goBack', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses router.back() when there is in-app history', () => {
    mockRouter.canGoBack.mockReturnValue(true);
    goBack();
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('falls back to /(tabs)/home by default when there is no history', () => {
    mockRouter.canGoBack.mockReturnValue(false);
    goBack();
    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home');
  });

  it('falls back to a custom destination when provided', () => {
    mockRouter.canGoBack.mockReturnValue(false);
    goBack('/(tabs)/friends');
    expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/friends');
  });
});
