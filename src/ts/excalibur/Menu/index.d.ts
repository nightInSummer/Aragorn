/// <reference types="react" />
import { Sources } from '../types';
import xs from 'xstream';
import { VNode } from 'snabbdom/vnode';
import './styles.less';
declare var _default: (source: Sources) => {
    [x: string]: any;
    DOM: xs<JSX.Element | JSX.Element[] | VNode>;
};
export default _default;
