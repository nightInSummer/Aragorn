import {run} from '@cycle/xstream-run';
import {makeDOMDriver} from '@cycle/dom';
import BmiCalculator from './BmiCalculator.ts';

// if (module.hot) {
//   module.hot.accept();
// }
const main = BmiCalculator;
run(main, {
  DOM: makeDOMDriver('#main-container')
});