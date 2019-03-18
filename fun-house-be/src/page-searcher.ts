export interface PostContentItem {
  href: string;
  score: number;
  title: string;
}
export class PageSearcher {
  constructor() {}

  getPostsOnForum(finder: CheerioStatic): string[] {
    let result = [];
    let itemList = finder('table.olt');
    itemList.find('tr').each(function (item) {
      let tr = finder(this);
      let a_href = tr.find('.title').children('a').attr('href');
      // let a_title = tr.find('.title').children('a').attr('title');
      if (a_href) {
        result.push(a_href);
      }
    });
    return result;
  }

  getContentFromPost(finder: CheerioStatic, keywords: string[]): PostContentItem {
    let result = {
      href: '',
      score: 0,
      title: ''
    };
    // 从目标页面正文部分匹配关键词
    let node = finder('div#link-report');
    let contentNode = node.find('div.topic-content');
    let content = contentNode.text();
    let score = 0,
      total = 0,
      temp = 0;
    for (let i = 0; i < keywords.length; i++) {
      total += (i + 1);
      if (content.indexOf(keywords[i]) !== -1) {
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
    result = Object.assign(result, {
      href: realTargetURL[0],
      score: score,
      title: title.trim()
    });
    return result;
  }
}
