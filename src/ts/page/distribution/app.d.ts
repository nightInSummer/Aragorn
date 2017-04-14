import { Sources } from '../../excalibur/types';
import { VNode } from 'snabbdom/vnode';
import { RequestOptions } from '@cycle/http';
import xs from 'xstream';
export default function app(sources: Sources): {
    DOM: xs<VNode>;
    HTTP: xs<RequestOptions>;
    History: any;
};
