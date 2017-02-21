import { Stream } from 'xstream';
import { VNode } from '@cycle/dom';
import { DOMSource } from '@cycle/dom/xstream-typings';
export declare type Sources = {
    DOM: DOMSource;
};
export declare type Sinks = {
    DOM: Stream<VNode>;
};
declare function BmiCalculator(sources: Sources): Sinks;
export default BmiCalculator;
