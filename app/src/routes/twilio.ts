import { twiml } from 'twilio';
import { Router, Response, Request } from 'express';
import processReply from '../utils/dialogflow-response';
const route: Router = Router();
// type MessageRequest = Request<>
route.post('/handle-user-message', async (req: Request, res: Response) => {
  const response = new twiml.MessagingResponse();
  try {
    const sessionId: string = req.body.From;
    const message: string = req.body.Body;
    const reply: string = await processReply(sessionId, message);
    response.message(reply);
    res.type('text/xml');
    res.send(response.toString());
  } catch (e) {
    console.log(e);
    response.message('internal server error');
    res.type('text/xml');
    res.send(response.toString());
  }
});
export default route;
