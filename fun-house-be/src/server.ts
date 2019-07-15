import {QueryType} from './model';
import app from './app';
import {Spider} from './spider';
import express from 'express';

const port = 8090;
let spider = new Spider();

app.listen(port, function () {
  console.log('Express server listening on port ' + port);
});

app.get('/search', (req: express.Request, res: express.Response) => {
  let query: QueryType = req.query;
  let targetURL = query.selection;
  let targetPages = +query.pages;
  delete query.pages;
  delete query.selection;
  let keywords = Object.values(query).reverse();
  spider.index(targetPages, targetURL, keywords, res);
});
