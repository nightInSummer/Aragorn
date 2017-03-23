import xs from 'xstream';
import tween from 'xstream/extra/tween';
import concat from 'xstream/extra/concat';
import {run} from '@cycle/run';
import {makeDOMDriver} from '@cycle/dom';
import Button from '../excalibur/Button'
import Loading from '../excalibur/Loading'
import Select from '../excalibur/Select'
import Input from '../excalibur/Input'
import Table from '../excalibur/Table'
import {Map} from 'immutable'
function main(sources: any) {
    const valueTextField = Table({
      DOM: sources.DOM,
      props: xs.of({
        columns: [
  { text: 'Full Name', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
  { text: 'Age', width: 100, dataIndex: 'age', key: 'age', fixed: 'left' },
  { text: 'Column 1', dataIndex: 'address', key: '1' },
  { text: 'Column 2', dataIndex: 'address', key: '2' },
  { text: 'Column 3', dataIndex: 'address', key: '3' },
  { text: 'Column 4', dataIndex: 'address', key: '4' },
  { text: 'Column 5', dataIndex: 'address', key: '5' },
  { text: 'Column 6', dataIndex: 'address', key: '6' },
  { text: 'Column 7', dataIndex: 'address', key: '7' },
  { text: 'Column 8', dataIndex: 'address', key: '8' },
  {
    text: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 100,
    render: () => <a href="#">action</a>,
  },
],
        header: '岚烨你妈比',
        data: [{
          name: '胡彦斌',
          age: 32,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }, {
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号'
        }]
      })
    })
    const textField = Input({
      DOM: sources.DOM,
      props: valueTextField.props.map(
        (props: Map<string, any>) => Map({
          value: props.get('value'),
          label: '岚烨',
          loading: !!props.get('value')
        })
      )
    })
    const vnode$ = xs.combine(
      valueTextField.DOM,
      textField.DOM
    ).map(([a, b]) => <div>{a}-------------{b}</div>)
  return {
    DOM: vnode$
  };
}

const sinks: any = {
  DOM: makeDOMDriver('#main-container')
}

run(main, sinks);
