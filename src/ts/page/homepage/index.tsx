import xs from 'xstream';
import tween from 'xstream/extra/tween';
import concat from 'xstream/extra/concat';
import {run} from '@cycle/run';
import {makeDOMDriver} from '@cycle/dom';
import Button from '../../excalibur/Button'
import Loading from '../../excalibur/Loading'
import Select from '../../excalibur/Select'
import Input from '../../excalibur/Input'
import Table from '../../excalibur/Table'
import {Map} from 'immutable'
import '../../../css/page/homepage/index.less'
function main(sources: any) {
  return {
  };
}

const sinks: any = {
}

run(main, sinks);
