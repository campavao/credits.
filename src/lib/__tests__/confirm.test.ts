/**
 * @jest-environment jsdom
 */
import { confirmAction } from '../confirm';

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  Alert: { alert: jest.fn() },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rn = require('react-native') as { Platform: { OS: string }; Alert: { alert: jest.Mock } };

describe('confirmAction', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('on web (Alert.alert is a no-op there)', () => {
    beforeEach(() => {
      rn.Platform.OS = 'web';
    });

    it('runs onConfirm when the browser confirm is accepted', () => {
      const onConfirm = jest.fn();
      window.confirm = jest.fn(() => true);

      confirmAction('Sign Out', 'Are you sure?', onConfirm, 'Sign Out', true);

      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(rn.Alert.alert).not.toHaveBeenCalled();
    });

    it('does NOT run onConfirm when the browser confirm is dismissed', () => {
      const onConfirm = jest.fn();
      window.confirm = jest.fn(() => false);

      confirmAction('Sign Out', 'Are you sure?', onConfirm);

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('on native', () => {
    beforeEach(() => {
      rn.Platform.OS = 'ios';
    });

    it('shows a two-button Alert whose confirm button runs onConfirm', () => {
      const onConfirm = jest.fn();

      confirmAction('Remove Friend', 'Remove them?', onConfirm, 'Remove', true);

      expect(rn.Alert.alert).toHaveBeenCalledTimes(1);
      const [title, message, buttons] = rn.Alert.alert.mock.calls[0];
      expect(title).toBe('Remove Friend');
      expect(message).toBe('Remove them?');

      const cancel = buttons.find((b: { text: string }) => b.text === 'Cancel');
      const confirm = buttons.find((b: { text: string }) => b.text === 'Remove');
      expect(cancel.style).toBe('cancel');
      expect(confirm.style).toBe('destructive');

      expect(onConfirm).not.toHaveBeenCalled();
      confirm.onPress();
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
