import { twiml } from 'twilio';
import { Router, Response, Request } from 'express';
import utils from '../utils/dialogflow';
import User from '../models/user';
const route: Router = Router();
export type MessageRequest = {
  NumMedia: string;
  WaId: string;
  Body: string;
  MediaUrl0?: string;
  Longitude?: string;
  Latitude?: string;
};
route.post(
  '/handle-user-message',
  async (req: Request<any, any, MessageRequest, any, any>, res: Response) => {
    let reply: string;

    const location = {
      lat: req.body.Latitude,
      long: req.body.Longitude,
    };
    const sessionId = req.body.WaId;
    const message = req.body.Body;
    const response = new twiml.MessagingResponse();

    // Initialise User and load session
    const user = new User(sessionId);
    await user.loadSession();

    try {
      if (req.body.NumMedia && parseInt(req.body.NumMedia) > 0) {
        // Check if user has sent media
        reply = await utils.triggerEvent(sessionId, 'GET_IMAGE');
        user.image = req.body.MediaUrl0;
      } else if (location.lat && location.long) {
        // Check if user has sent location pin
        user.location = [parseFloat(location.lat), parseFloat(location.long)];
        reply = await utils.triggerEvent(sessionId, 'GET_LOCATION');
      } else {
        // process reply based on user text
        const { text, payload } = await utils.processReply(sessionId, message);
        reply = text;
        if (payload) user[payload.key] = payload.value;
      }

      // save current user session
      await user.save();

      if (!user.missing().length) user.submit();

      response.message(reply);
      res.type('text/xml');
      res.send(response.toString());
    } catch (e) {
      console.log(e);
      response.message('internal server error');
      res.type('text/xml');
      res.send(response.toString());
    }
  }
);
export default route;
