"use strict";
const xstream_1 = require("xstream");
const dom_1 = require("@cycle/dom");
const isolate_1 = require("@cycle/isolate");
const LabeledSlider_1 = require("./LabeledSlider");
function BmiCalculator(sources) {
    let WeightSlider = isolate_1.default(LabeledSlider_1.default);
    let HeightSlider = isolate_1.default(LabeledSlider_1.default);
    let weightProps$ = xstream_1.default.of({
        label: 'Weight', unit: 'kg', min: 40, initial: 70, max: 140
    }).remember();
    let heightProps$ = xstream_1.default.of({
        label: 'Height', unit: 'cm', min: 140, initial: 170, max: 210
    }).remember();
    let weightSlider = WeightSlider({ DOM: sources.DOM, props$: weightProps$ });
    let heightSlider = HeightSlider({ DOM: sources.DOM, props$: heightProps$ });
    let bmi$ = xstream_1.default.combine(weightSlider.value$, heightSlider.value$)
        .map(([weight, height]) => {
        let heightMeters = height * 0.01;
        let bmi = Math.round(weight / (heightMeters * heightMeters));
        return bmi;
    }).remember();
    return {
        DOM: xstream_1.default.combine(bmi$, weightSlider.DOM, heightSlider.DOM)
            .map(([bmi, weightVTree, heightVTree]) => dom_1.div([
            weightVTree,
            heightVTree,
            dom_1.h2('BMsss ssssd Idssssssssssssss i s ' + bmi)
        ]))
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BmiCalculator;
//# sourceMappingURL=BmiCalculator.js.map