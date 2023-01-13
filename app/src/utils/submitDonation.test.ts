import { sessionType } from './../models/session/index';
import submitDonation from './submitDonation';

jest.mock('@googlemaps/google-maps-services-js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    reverseGeocode: jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: {
          results: [
            {
              formated_address: 'address',
            },
          ],
        },
      })
    ),
  })),
}));

jest.mock('twilio', () =>
  jest.fn().mockImplementation(() => ({
    messages: {
      create: () => Promise.resolve({ status: 'sent' }),
    },
  }))
);

describe('Submit Donation', () => {
  it('should send submition message via twilio sms', async () => {
    const userDetails: sessionType = {
      item: 'item',
      firstname: 'test',
      image:
        'https://api.twilio.com/2010-04-01/Accounts/AC009f46575791b298acc39ff5c4e28c34/Messages/MMe9be4269994c495d58247acebd4e69ca/Media/MEd6d4a3ba0932748acf6059d97a664eb0',
      location: [40.714224, -73.961452],
    };
    const res = await submitDonation({
      phone: '+256123456789',
      ...userDetails,
    });
    expect(res.success).toBe(true);
  });
});
