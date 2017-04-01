import xs, {Stream} from 'xstream'
import {run} from '@cycle/run'
import {makeDOMDriver, DOMSource} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import { VNode } from 'snabbdom/vnode'
import app from './app'

const sinks = {
  DOM: makeDOMDriver('.aragorn-main-section')
}

run(app, sinks)
