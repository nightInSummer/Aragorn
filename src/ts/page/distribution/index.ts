import {run} from '@cycle/run'
import {makeDOMDriver, DOMSource} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'

import app from './app'

const sinks = {
  DOM: makeDOMDriver('.cycle-container'),
  HTTP: makeHTTPDriver()
}

run(app, sinks)