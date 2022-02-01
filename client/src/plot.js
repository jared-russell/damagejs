import React from 'react'
import Plot from 'react-plotly.js'
import { MContext } from './provider'

export default class MyPlot extends React.Component {
  constructor () {
    super()
    this.state = { data: [], layout: {}, frames: [], config: {} }
    this.state.data = [
      {
        x: Array.from({ length: 26 }, (x, i) => i + 5),
        y: Array.from({ length: 26 }, (x, i) => 0),
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'blue' },
        name: 'Normal'
      },
      {
        x: Array.from({ length: 26 }, (x, i) => i + 5),
        y: Array.from({ length: 26 }, (x, i) => 0),
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'green' },
        name: 'Advantage'
      },
      {
        x: Array.from({ length: 26 }, (x, i) => i + 5),
        y: Array.from({ length: 26 }, (x, i) => 0),
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'red' },
        name: 'Disadvantage'
      }
    ]
    this.state.layout = { autosize: true, yaxis: { rangemode: 'nonnegative' }, title: 'Damage Per Round' }
  }

  updatePlot (plotData) {
    const thisPlotData = [
      {
        x: plotData.ac,
        y: plotData.normal,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'blue' },
        name: 'Normal'
      },
      {
        x: plotData.ac,
        y: plotData.advantage,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'green' },
        name: 'Advantage'
      },
      {
        x: plotData.ac,
        y: plotData.disadvantage,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: 'red' },
        name: 'Disadvantage'
      }
    ]
    this.setState({ data: thisPlotData })
  }

  render () {
    return (
      <MContext.Consumer>
      {(context) => (
        <Plot
          data={this.state.data}
          layout={this.state.layout}
          frames={this.state.frames}
          config={this.state.config}
          onInitialized={(figure) => this.setState(figure)}
          onUpdate={(figure) => this.setState(figure)}
          context={context}
      />
      )}
      </MContext.Consumer>
    )
  }
}
