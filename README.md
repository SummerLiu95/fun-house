# FunHouse

豆瓣租房论坛爬虫



## 后端

superagent+cherrio+async



## 前端

Angular7 + Ng-Zorro + @delon/mock + mockjs



## to-do

- [x] 前端页面改由Nginx部署，后端api保持不变，使用Nginx反向代理实现动静态资源分离，静态资源由Nginx管理，动态资源则使用pm2进行管理。
- [x] 添加代理IP
- [x] 返回结果添加标题选项
- [ ] 前端页面添加使用说明
- [ ] 添加用户注册，登录功能，使用 JWT
- [ ] 用户可收藏搜索结果
- [ ] 前端页面结果表格添加导出数据功能
- [ ] 将爬虫源网页内容文本进行命名实体识别，主要是地名（使用BosonNLP）
