import xs from 'xstream';
import { Sources } from '../../../excalibur/types';
import { VNode } from 'snabbdom/vnode';
export default function menu(source: Sources): {
    DOM: xs<VNode>;
    History: any;
};
