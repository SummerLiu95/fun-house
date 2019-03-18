import {QueryType} from "./model";
import superagent from "superagent";
import cheerio from "cheerio";
import async from "async";
import random_ua from "random-ua";
import app from './app';

const port = 8090;

app.listen(port, function () {
  console.log('Express server listening on port ' + port);
});

app.get('*', (req: any, res: any) => {
  let query: QueryType = null;
  query = req.query;
  let targetURL = query.selection;
  let targetPages = +query.pages;
  delete query.pages;
  delete query.selection;
  let keywords = Object.values(query).reverse();
  index(targetPages, targetURL, keywords, res);
});

/**
 * 爬虫开始函数
 * @param page|number 爬虫论坛的页数
 * @param baseURL|string 爬虫论坛baseURL
 * @param keywordsArray|Array 关键词数组
 * @param httpResponse|Object nodejs http响应对象
 */
function index(page: number, baseURL: string, keywordsArray: string[], httpResponse: any) {
  let requestCount = 0,
    concurrencyCount = 0;
  let pageURLs = [];
  for (let i = 0; i < page; i++) {
    pageURLs.push(`${baseURL}/discussion?start=${i * 25}`);
  }
  let fetchURL = function (url, callback, target) {
    requestCount++;
    concurrencyCount++;
    console.time('耗时');
    superagent
      .get(url)
      .set('User-Agent', random_ua.generate())
      .end(function (err, res) {
        console.log('并发数:', concurrencyCount--, '     fetch', url);

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
        let array = getInformation($, target, keywordsArray);
        callback(null, array);
      });
  };

  /**
   * 异步请求并发控制
   * @param pageURLs|array 请求链接数组
   * @param coll|number 最大并发数
   * @param asyncCallback|function 进行异步操作的函数
   * @param callback|function 多个异步操作最终的操作结果回调函数
   */
  async.mapLimit(pageURLs, 2, function (url, callback) {
    fetchURL(url, callback, 'list');
    console.timeEnd('耗时');
  }, function (err, result) {
    let originData = [];

    // 将二维数组更改为一维数组
    for (let i = 0; i < result.length; i++) {
      originData = originData.concat(result[i]);
    }

    async.mapLimit(originData, 1, function (url, callback) {
      fetchURL(url, callback, 'content');
    }, function (err, result) {
      let filterResult = result.filter(page => page['score'] > 0).sort((a: any, b: any) => {
        return (b['score'] - a['score']);
      });

      httpResponse.writeHead(200, {
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
        httpResponse.end(JSON.stringify(response));
      }
    })
  });
}

/**
 * 对 HTML 内容进行爬取
 * @param finder|Object cheerio对象
 * @param target|string 爬取的内容为列表还是正文
 * @param infoArray|Array 关键词数组
 */
function getInformation(finder, target, infoArray) {
  if (target === 'list') {
    let itemData = [];
    let itemList = finder('table.olt');
    itemList.find('tr').each(function (item) {
      let tr = finder(this);
      let a_href = tr.find('.title').children('a').attr('href');
      // let a_title = tr.find('.title').children('a').attr('title');

      if (a_href) {
        itemData.push(a_href);
      }
    });
    return itemData;
  } else if (target === 'content') {
    let itemData = {
      href: '',
      score: 0,
      title: ''
    };
    // 从目标页面正文部分匹配关键词
    let node = finder('div#link-report');
    let contentNode = node.find('div.topic-content');
    let content = contentNode.text();
    let array = infoArray;
    let score = 0,
      total = 0,
      temp = 0;
    for (let i = 0; i < array.length; i++) {
      total += (i + 1);
      if (content.indexOf(array[i]) !== -1) {
        temp += (i + 1);
      }
      score = Math.floor(((temp / total) * 100));
    }
    // 从目标页面中寻找页面URL信息
    let infoNode = finder('div#sep.tabs');
    let targetURL = infoNode.children().first().attr('href');
    let realTargetURL = targetURL.split('#');
    // 从目标页面中寻找文章标题
    let titleNode = finder('div#content');
    let title = titleNode.children().first().text();
    itemData.score = score;
    itemData.href = realTargetURL[0];
    itemData.title = title.trim();
    return itemData;
  }
}
