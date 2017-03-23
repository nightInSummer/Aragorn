import { DOMSource } from '@cycle/dom'
import { Stream } from 'xstream'
import { VNode } from 'snabbdom/vnode'

export interface DOMComponent {
  (
    sources: {
      DOM: DOMSource,
      [x: string]: any
    }
  ): {
    DOM: Stream<JSX.Element | JSX.Element[] | VNode>,
    [x: string]: any
  }
}

export interface Sources {
  DOM: DOMSource,
  props: Stream<Object | Map<string, any>>
}

export interface Props {
  [x: string]: any
}