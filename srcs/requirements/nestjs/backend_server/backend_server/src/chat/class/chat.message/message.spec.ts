import { Message } from './message.class';

describe('Message', () => {
  it('should be defined', () => {
    expect(new Message(null, null, null)).toBeDefined();
  });
});
