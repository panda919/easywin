// @flow
import { v4 as uuidv4 } from 'uuid';

const intervals = {};

const { now } = Date;

const setInterval = (cb, delay) => {
  const id = uuidv4();
  let planned = now() + delay;

  const tick = () => {
    cb && cb();

    if (intervals[id]) {
      planned += delay;
      let interval = planned - now();

      if (interval < 0) {
        interval = 0;
      }

      intervals[id] = setTimeout(tick, interval);
    }
  };

  intervals[id] = setTimeout(tick, delay);

  return id;
};

const clearInterval = (id) => {
  clearTimeout(intervals[id]);
  delete intervals[id];
};

export default {
  setInterval,
  clearInterval,
};
