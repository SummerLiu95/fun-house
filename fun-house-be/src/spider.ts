import superagent from "superagent";
import random_ua from "random-ua";
import cheerio from "cheerio";
import {PageSearcher, PostContentItem} from "./page-searcher";
import async from "async";

export class Spider {
  public pageURLs: string[];
  private searcher: PageSearcher;
  constructor() {
    this.pageURLs = [];
    this.searcher = new PageSearcher();
  }

  index(page: number, baseURL: string, keywords: string[], res: any): void {
    for (let i = 0; i < page; i++) {
      this.pageURLs.push(`${baseURL}/discussion?start=${i * 25}`);
    }

    let self = this;
    async.mapLimit(this.pageURLs, 2, function (url: string, callback: any) {
      self.fetchForumURL(url, callback, self);
    }, function (err, result) {
      let originData = [];

      // 将二维数组更改为一维数组
      for (let i = 0; i < result.length; i++) {
        originData = originData.concat(result[i]);
      }

      async.mapLimit(originData, 1, function (url, callback) {
        self.fetchPostURL(url, callback, keywords, self);
      }, function (err, result) {
        let filterResult = result.filter((page: PostContentItem) => page.score > 0).sort((a: PostContentItem, b: PostContentItem) => {
          return (b.score - a.score);
        });

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // 解决跨域问题，重点
        });
        if (filterResult && filterResult.length > 0) {
          const response = {
            msg: 'SUCCESS',
            data: {
              total: filterResult.length,
              list: filterResult
            }
          };
          res.end(JSON.stringify(response));
        }
      })
    });
  }

  fetchForumURL(url: string, callback: any, env: any): void {
    superagent
      .get(url)
      .set('User-Agent', random_ua.generate())
      .end(function (err, res) {
        //抛错拦截
        if (err) {
          callback(err);
          throw Error(err);
        }
        /**
         * res.txt 包含未解析前的响应内容
         * 我们通过cheerio的load方法解析整个文档，就是html页面所有内容，可以通过console.log($.html())在控制台查看
         */
        let $ = cheerio.load(res.text);
        let array = env.searcher.getPostsOnForum($);
        callback(null, array);
      });
  }

  fetchPostURL(url: string, callback: any, keywords: string[], env: any): void {
    superagent
      .get(url)
      .set('User-Agent', random_ua.generate())
      .end(function (err, res) {
        //抛错拦截
        if (err) {
          callback(err);
          throw Error(err);
        }
        /**
         * res.txt 包含未解析前的响应内容
         * 我们通过cheerio的load方法解析整个文档，就是html页面所有内容，可以通过console.log($.html())在控制台查看
         */
        let $ = cheerio.load(res.text);
        let array = env.searcher.getContentFromPost($, keywords);
        callback(null, array);
      });
  }
}
