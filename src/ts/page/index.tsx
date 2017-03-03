import xs from 'xstream';
import tween from 'xstream/extra/tween';
import concat from 'xstream/extra/concat';
import {run} from '@cycle/run';
import {makeDOMDriver} from '@cycle/dom';
const {html} = require('snabbdom-jsx');

function targetStyle(left: number, top: number) {
  return {
    position: 'relative',
    backgroundColor: 'blue',
    width: '60px',
    height: '60px',
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
  };
};

const buttonStyle = {
  fontSize: '20px',
  marginBottom: '20px',
};

function main(sources: any) {
  const start$ = sources.DOM.select('.animate').events('click').mapTo();

  const leftToRight$ = tween({
    from: 0, to: 250, duration: 500, ease: tween.power3.easeIn
  }).map(x => ({ left: x, top: 0 }));

  const topToBottom$ = tween({
    from: 0, to: 250, duration: 500, ease: tween.power3.easeOut
  }).map(x => ({ left: 250, top: x }));

  const circularReturn$ = tween({
    from: Math.PI / 2, to: Math.PI, duration: 1600, ease: tween.power3.easeInOut
  }).map(x => ({ left: 250 + Math.cos(x) * 250, top: Math.sin(x) * 250}));

  const coords$ = start$.map(() => concat(
    xs.of({ left: 0, top: 0 }), leftToRight$, topToBottom$, circularReturn$
  )).flatten().startWith({ left: 0, top: 0 });

  const vdom$ = coords$.map(({ left, top }: any) =>
    <div>
      <button className="animate" style={buttonStyle} >Animate it!</button>
      <div className="target" style={targetStyle(left, top)} />
    </div>
  );

  return {
    DOM: vdom$
  };
}

const sinks = {
  DOM: makeDOMDriver('#main-container')
}

run(main, sinks);
