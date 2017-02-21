import { Stream, MemoryStream } from 'xstream';
import { VNode } from '@cycle/dom';
import { DOMSource } from '@cycle/dom/xstream-typings';
export interface LabeledSliderProps {
    label: string;
    unit: string;
    min: number;
    initial: number;
    max: number;
}
export declare type Sources = {
    DOM: DOMSource;
    props$: Stream<LabeledSliderProps>;
};
export declare type Sinks = {
    DOM: Stream<VNode>;
    value$: MemoryStream<number>;
};
declare function LabeledSlider(sources: Sources): Sinks;
export default LabeledSlider;
