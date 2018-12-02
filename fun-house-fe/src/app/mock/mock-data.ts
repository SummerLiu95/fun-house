import * as Mock from 'mockjs';
import { Random } from 'mockjs';

export const players = Mock.mock({
  'errorCode': '@integer(0,5)',
  'msg': '@sentence(0, 9)',
  'data|1-10': [{
    'name': '@first @last',
    'age': '@integer(0, 100)',
    'address': '@county(true)',
    'email': '@EMAIL'
  }]
});
