import { DOMSource } from '@cycle/dom'
import { Stream, MemoryStream } from 'xstream'
import { VNode } from 'snabbdom/vnode'
import { HTTPSource } from '@cycle/http'

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
  props?: Stream<Object | Map<string, any>>,
  HTTP?: HTTPSource,
  History?: any,
  Router?: any,
  MAP?: any
}

export interface Props {
  [x: string]: any
}