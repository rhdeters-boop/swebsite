import { jest } from '@jest/globals';

describe('Timers example', () => {
  test('delays callback', () => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    const cb = jest.fn();

    setTimeout(cb, 5000);
    jest.advanceTimersByTime(4999);
    expect(cb).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});