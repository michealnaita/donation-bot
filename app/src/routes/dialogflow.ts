import express, { Router, Response, Request } from 'express';

const route: Router = Router();

route.use(express.json());

route.post('/', (req: Request, res: Response) => {
  try {
    const donationItem = req.body.queryResult.parameters.item;
    console.log(donationItem);
    res.status(400).send('use default response');
  } catch (e) {
    console.log(e);
    res.status(500).send('internal server error');
  }
});
export default route;
