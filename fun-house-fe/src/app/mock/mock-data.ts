import * as Mock from 'mockjs';

export const heroes = Mock.mock({
  'code': '@integer(0,5)',
  'msg': '@sentence(0, 9)',
  'data': {
    'total': 40,
    'list': [
      { id: 11, name: 'Mr. Nice' },
      { id: 12, name: 'Narco' },
      { id: 13, name: 'Bombasto' },
      { id: 14, name: 'Celeritas' },
      { id: 15, name: 'Magneta' },
      { id: 16, name: 'RubberMan' },
      { id: 17, name: 'Dynama' },
      { id: 18, name: 'Dr IQ' },
      { id: 19, name: 'Magma' },
      { id: 20, name: 'Tornado' }
      ],
    'pageNum': 1,
    'pageSize': 10
  }
});

export const crises = Mock.mock({
  'code': '@integer(0,5)',
  'msg': '@sentence(0, 9)',
  'data': {
    'total': 40,
    'list': [
      { id: 1, name: 'Dragon Burning Cities' },
      { id: 2, name: 'Sky Rains Great White Sharks' },
      { id: 3, name: 'Giant Asteroid Heading For Earth' },
      { id: 4, name: 'Procrastinators Meeting Delayed Again' }
    ],
    'pageNum': 1,
    'pageSize': 10
  }
});
