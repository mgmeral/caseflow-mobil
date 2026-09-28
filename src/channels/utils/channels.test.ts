import { formatEventName, parseSubscribedEvents } from './channels';

describe('parseSubscribedEvents', () => {
  it('parses the JSON-encoded string the backend returns', () => {
    expect(parseSubscribedEvents('["TICKET_CREATED","TICKET_RESOLVED"]')).toEqual(['TICKET_CREATED', 'TICKET_RESOLVED']);
  });

  it('falls back to an empty list for empty or malformed values', () => {
    expect(parseSubscribedEvents(null)).toEqual([]);
    expect(parseSubscribedEvents('')).toEqual([]);
    expect(parseSubscribedEvents('not json')).toEqual([]);
    expect(parseSubscribedEvents('{"a":1}')).toEqual([]);
  });

  it('accepts a native array too', () => {
    expect(parseSubscribedEvents(['TICKET_CREATED'])).toEqual(['TICKET_CREATED']);
  });
});

describe('formatEventName', () => {
  it('turns enum names into labels', () => {
    expect(formatEventName('OUTBOUND_EMAIL_FAILED')).toBe('Outbound Email Failed');
  });
});
