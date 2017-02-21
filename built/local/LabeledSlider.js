"use strict";
const xstream_1 = require("xstream");
const dom_1 = require("@cycle/dom");
function LabeledSlider(sources) {
    let props$ = sources.props$;
    let initialValue$ = props$.map(props => props.initial).take(1);
    let newValue$ = sources.DOM.select('.slider').events('input')
        .map(ev => parseInt(ev.target.value));
    let value$ = xstream_1.default.merge(initialValue$, newValue$).remember();
    let vtree$ = xstream_1.default.combine(props$, value$)
        .map(([props, value]) => dom_1.div('.labeled-slider', [
        dom_1.span('.label', [props.label + ' ' + value + props.unit]),
        dom_1.input('.slider', {
            attrs: { type: 'range', min: props.min, max: props.max, value: value }
        })
    ]));
    return {
        DOM: vtree$,
        value$: value$,
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LabeledSlider;
//# sourceMappingURL=LabeledSlider.js.map