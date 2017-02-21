import Cycle from '@cycle/xstream-run';
import {makeDOMDriver} from '@cycle/dom';
import BmiCalculator from './BmiCalculator';
const {rerunner, restartable} = require('cycle-restart');
// 此处只能用require，具体原因待查

const makeDrivers = () => ({
  DOM: restartable(makeDOMDriver('#main-container'), {pauseSinksWhileReplaying: false}),
});

let rerun = rerunner(Cycle, makeDrivers);
rerun(BmiCalculator);

declare const module:any;
if (module.hot) {
  // ./BmiCalculator目录下的文件更新，会导致浏览器强刷，这是为了避免热更新造成的state不匹配
  // 除此之外，其他文件都是热更新
  // 如何安排文件目录是关键！
  module.hot.accept('./BmiCalculator', () => {
    const newApp = require('./BmiCalculator').default;
    rerun(newApp);
  });
}
