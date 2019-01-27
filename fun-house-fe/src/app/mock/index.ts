import { heroes } from './mock-data';

export default {
  'GET heroes': (req) => {
    return heroes;
  }
};
