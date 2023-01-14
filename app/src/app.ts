import express, { Express, Request, Response } from 'express';
import twilioRouter from './routes/twilio';
import morgan from 'morgan';
import 'dotenv/config';

const PORT = process.env.PORT || 8080;
const app: Express = express();

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/twilio', twilioRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('hello new world');
});
app.use((error: any, req: Request, res: Response, next: any) => {
  console.log('Internal Server Error: ', error);
  res.status(error.status || 500);
  res.send('Internal Server Error');
});
app.listen(PORT, () => {
  console.log('app running on port %s', PORT);
});
