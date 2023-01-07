import express, { Router, Response, Request } from 'express';
import User from '../models/user';

export type reqBodyType = {
  queryResult: {
    parameters: {
      item?: string;
      person?: string;
    };
  };
  session: string;
};

const route: Router = Router();

route.use(express.json());

route.post(
  '/',
  async (req: Request<any, any, reqBodyType, any>, res: Response) => {
    try {
      const sessionId: string = req.body.session.split('/').pop();
      const donationItem = req.body.queryResult.parameters.item;
      const donarFirstname = req.body.queryResult.parameters.person;

      const user = new User(sessionId);
      await user.loadSession();
      if (donationItem) user.item = donationItem;
      if (donarFirstname) user.item = donarFirstname;
      await user.save();
      res.status(400).send('use default response');
    } catch (e) {
      console.log(e);
      res.status(500).send('internal server error');
    }
  }
);
export default route;
