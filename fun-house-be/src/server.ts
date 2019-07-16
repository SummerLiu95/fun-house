import {QueryType} from './model';
import app from './app';
import {Spider} from './spider';
import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const port = 8090;
let spider = new Spider();
let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.listen(port, function () {
  console.log('Express server listening on port ' + port);
});

app.use(morgan('combined', { stream: accessLogStream }));

app.get('/search', (req: express.Request, res: express.Response) => {
  let query: QueryType = req.query;
  let targetURL = query.selection;
  let targetPages = +query.pages;
  delete query.pages;
  delete query.selection;
  let keywords = Object.values(query).reverse();
  spider.index(targetPages, targetURL, keywords, res);
});
