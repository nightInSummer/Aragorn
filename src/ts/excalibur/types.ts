import { DOMSource } from '@cycle/dom'
import { Stream } from 'xstream'

export interface DOMComponent {
  (
    sources: {
      DOM: DOMSource,
      [x: string]: any
    }
  ): {
    DOM: Stream<JSX.Element | JSX.Element[]>,
    [x: string]: any
  }
}

export interface Sources {
  DOM: DOMSource,
  props: Stream<Object>
}
