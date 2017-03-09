import xs from 'xstream';
import tween from 'xstream/extra/tween';
import concat from 'xstream/extra/concat';
import {run} from '@cycle/run';
import {makeDOMDriver} from '@cycle/dom';
import Button from '../excalibur/Button'
import Loading from '../excalibur/Loading'

function main(sources: any) {
  const props = xs.of({
    text: `谢天`,
    icon: 'nationalattraction'
  })
  return {
    DOM: Loading({DOM: sources.DOM, props: props}).DOM
  };
}

const sinks: any = {
  DOM: makeDOMDriver('#main-container')
}

run(main, sinks);
