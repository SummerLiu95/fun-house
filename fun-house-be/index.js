const superagent = require('superagent');
const cheerio = require('cheerio');
const async = require('async');
let http = require('http');
const random_ua = require('random-ua');
const request = require("request");

require('superagent-proxy')(superagent);
require('superagent-retry-delay')(superagent);

/**
 * 对 HTML 内容进行爬取
 * @param finder|Object cheerio对象
 * @param target|string 爬取的内容为列表还是正文
 * @param infoArray|Array 关键词数组
 */
function getInformation(finder, target, infoArray) {
    let itemData;
    if (target === 'list') {
        itemData = new Array();
        let itemList = finder('table.olt');
        itemList.find('tr').each(function (item) {
            let tr = finder(this);
            let a_href = tr.find('.title').children('a').attr('href');
            let a_title = tr.find('.title').children('a').attr('title');

            // 链接和标题都存在的情况下才进行操作
            if (a_href && a_title) {
                itemData.push({
                    href: a_href,
                    title: a_title
                });
            }
        });
    } else if (target === 'content') {
        itemData = {
            href: '',
            score: 0,
            title: ''
        };
        // 从目标页面正文部分匹配关键词
        let node = finder('div#link-report');
        let contentNode = node.find('div.topic-content');
        let content = contentNode.text();
        let array = infoArray;
        let score = 0;
        for (let i = 0; i < array.length; i++) {
            if (content.indexOf(array[i]) !== -1) {
                score += (i + 1);
            }
        }
        // 从目标页面中寻找页面URL信息
        let infoNode = finder('div#sep.tabs');
        let targetURL = infoNode.children().first().attr('href');
        let realTargetURL = targetURL.split('#');
        // 从目标页面中寻找文章标题
        let titleNode = finder('div#content');
        let title = titleNode.children().first().text();
        console.log(title);
        itemData.score = score;
        itemData.href = realTargetURL[0];
        itemData.title = title.trim();
    }
    return itemData;
}

/**
 * 爬虫开始函数
 * @param page|number 爬虫论坛的页数
 * @param baseURL|string 爬虫论坛baseURL
 * @param keywordsArray|Array 关键词数组
 * @param httpResponse|Object nodejs http响应对象
 * @param proxies|Array 代理ip数组
 */
function index(page, baseURL, keywordsArray, httpResponse, proxies) {
    let requestCount = 0;
    let pageURL = '';
    let pageURLs = [];
    for (let i = 0; i < page; i++) {
        pageURL = i * 25;
        pageURLs.push(`${baseURL}/discussion?start=${pageURL}`);
    }

    let concurrencyCount = 0;
    let fetchURL = function (url, callback, target) {
        requestCount++;
        console.time('耗时');
        concurrencyCount++;
        if (proxies && proxies.length > 0){
            let proxyIndex = requestCount % proxies.length;
            superagent
                .get(url)
                .set('User-Agent', random_ua.generate())
                .proxy(proxies[proxyIndex])
                .retry(1, 500, [401, 404])
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
        } else {
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
        }
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

        // 将上面获得的对象数组中的href属性取出来放到新的数组中
        let contentURLS = [];
        for (let i = 0; i < originData.length; i++) {
            contentURLS.push(originData[i].href);
        }


        async.mapLimit(contentURLS, 1, function (url, callback) {
            fetchURL(url, callback, 'content');
        }, function (err, result) {
            // 根据数组中对象元素的score属性进行排序
            result.sort(function (a, b) {
                return (b.score - a.score);
            });

            // 标记score为0的下标位置
            let flag;
            for (let i = 0; i < result.length; i++) {
                if (result[i].score === 0) {
                    flag = i;
                    break;
                }
            }

            // 将结果数组中的score为0的元素除去
            result.splice(flag, result.length - flag);
            httpResponse.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // 解决跨域问题，重点
            });
            httpResponse.end(JSON.stringify(result));
        })
    });
}

/**
 * 将请求url的请求参数全部取出来并放入到一个数组中
 * @param url
 * @returns {string[]}
 */
function parseURL(url) {
    let parts = url.split('?');
    let info = parts[1];
    let result = info.split('&').map(function (value) {
        let temp = value.split('=');
        return temp[1];
    });
    console.log(result);
    return result;
}

function decodeURL(array) {
    let resultArray = [];
    let temp;
    for (let i = 0; i < array.length; i++) {
        temp = decodeURIComponent(array[i]);
        resultArray.push(temp);
    }
    return resultArray;
}

/**
 * 检测代理IP的有效性
 * @param proxy|string 代理IP
 */
function check(proxy) {
    //尝试请求豆瓣小组主页
    let url = "https://www.douban.com/group/gz020/discussion?start=0";
    request({
        url: url,
        proxy: proxy,
        method: 'GET',
        timeout: 1000  //20s没有返回则视为代理不行
    }, function (error, response, body) {
        if (!error) {
            if (response.statusCode == 200) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    });
}

http.createServer(function (request, response) {
    let url = request.url;
    if (url.indexOf('/search?') !== -1) {
        let infoArray = parseURL(url);              // 将url请求链接的请求参数放到数组中
        let baseURL = infoArray.shift();            // 数组第一项为爬虫的目标地址
        let isProxy = +infoArray.pop();
        let pages = +infoArray.pop();
        infoArray.reverse();
        let resultArray = decodeURL(infoArray);
        if (isProxy) {
            let proxyIPs, tempProxyIPs;
            superagent
                .get('http://111.230.72.118:8899/api/v1/proxies')
                .query({countries: 'CN'})
                .query({https: false})
                .end(function (err, res) {
                    if (err) {
                        callback(err);
                        throw Error(err);
                    } else {
                        tempProxyIPs = (JSON.parse(res.text))['proxies'];
                        proxyIPs = tempProxyIPs.map( item => {
                            return `http://${item.ip}:${item.port}`;
                        });
                        let checkedProxies = proxyIPs.filter(ip => {
                            return check(ip);
                        });
                        index(pages, baseURL, resultArray, response, checkedProxies);
                    }
                });
        } else {
            index(pages, baseURL, resultArray, response);
        }
    }
}).listen(8200);
console.log("The server is running at port 8200");





