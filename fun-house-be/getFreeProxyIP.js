const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

let proxys = [];  //保存从网站上获取到的代理
let useful = [];  //保存检查过有效性的代理


/**
 * 获取www.xicidaili.com提供的免费代理
 */
function getXici() {
    let url = "http://www.xicidaili.com/wn/";  // 国内高匿代理

    request({
        url: url,
        method: "GET",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36'
        } //给个浏览器头，不然网站拒绝访问
    }, function (error, response, body) {
        if (!error) {
            let $ = cheerio.load(body);
            let trs = $("#ip_list tr");
            for (let i = 1; i < trs.length; i++) {
                let proxy = {};
                let tr = trs.eq(i);
                let tds = tr.children("td");
                proxy['ip'] = tds.eq(1).text();
                proxy['port'] = tds.eq(2).text();
                let speed = tds.eq(6).children("div").attr("title");
                speed = speed.substring(0, speed.length - 1);
                let connectTime = tds.eq(7).children("div").attr("title");
                connectTime = connectTime.substring(0, connectTime.length - 1);
                if (speed <= 5 && connectTime <= 1) { //用速度和连接时间筛选一轮
                    proxys.push(proxy);
                }
                // console.log(proxys);
            }
        }
        check();
    });
}

/**
 * 过滤无效的代理
 */
function check() {
    //尝试请求豆瓣小组主页
    let url = "https://www.douban.com/group/gz020/discussion?start=0";
    let flag = proxys.length;  //检查是否所有异步函数都执行完的标志量
    for (let i = 0; i < proxys.length; i++) {
        let proxy = proxys[i];
        request({
            url: url,
            proxy: "http://" + proxy['ip'] + ":" + proxy['port'],
            method: 'GET',
            timeout: 1000  //20s没有返回则视为代理不行
        }, function (error, response, body) {
            if (!error) {
                if (response.statusCode == 200) {
                    //这里因为nodejs的异步特性，不能push(proxy),那样会存的都是最后一个
                    console.log(response);
                    useful.push(response.request['proxy']['href']);
                    console.log(response.request['proxy']['href'], "useful!");
                } else {
                    console.log(response.request['proxy']['href'], "failed!");
                }
            } else {
                console.log("One proxy failed!");
            }
            flag--;
            if (flag == 0) {
                console.log(useful);
            }
        });
    }
}

getXici();





