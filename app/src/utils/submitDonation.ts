import { sessionType } from '../models/session';
import twilio from 'twilio';
import { Client } from '@googlemaps/google-maps-services-js';

/**
 * Gets location address by reverse geocoding
 * @param location - [latitude, longitude]
 * @returns loaction address string
 * */
async function getAddress(location: [number, number]): Promise<string> {
  const client: Client = new Client();
  try {
    const res = await client.reverseGeocode({
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,
        latlng: location,
      },
    });
    const address = res.data.results[0].formatted_address;
    return address;
  } catch (error) {
    console.log('Get location error: ', error.message);
    throw error;
  }
}

/**
 * Submits donation request to admin viaa whatsApp
 *
 * @param details - users's details about donation request
 * @returns success=true if message sent
 */
export default async function (details: sessionType & { phone: string }) {
  try {
    const address = await getAddress(details.location);
    const { ADMIN, TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID } = process.env;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    //  Generate message from template
    const message = (contact: string) => ({
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+' + contact,
      mediaUrl: [details.image],
      body: `*New Donation Request*\n\n*Donar\'s name:* ${details.firstname}\n*Contact info:* _+${details.phone}_\n*Donation item:* ${details.item}\n*Pick-up location:* _${address}_`,
    });

    // Send message to both user and admin agent
    const adminReq = await client.messages.create(message(ADMIN));
    const userReq = await client.messages.create(message(details.phone));

    if (adminReq.status === 'sent' && userReq.status === 'sent') {
      console.log('message sent');
      return { success: true, err_message: '' };
    }
    return {
      success: false,
      err_message: 'could not send donation request message',
    };
  } catch (e) {
    console.log('Error sending donation request message', e);
    return { success: false, err_message: e.message };
  }
}
