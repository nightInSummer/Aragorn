"use strict";
const xstream_run_1 = require("@cycle/xstream-run");
const dom_1 = require("@cycle/dom");
const BmiCalculator_1 = require("./BmiCalculator");
if (module.hot) {
    module.hot.accept();
}
const main = BmiCalculator_1.default;
xstream_run_1.run(main, {
    DOM: dom_1.makeDOMDriver('#main-container')
});
//# sourceMappingURL=index.js.map