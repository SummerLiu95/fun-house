import { Request, Response } from 'express';
import { ResponseError } from 'superagent'
import app from '../app';

app.use(function (err: ResponseError, req: Request, res: Response) {
  console.log(err);
  res.status(err.status).send(err.text);
});
