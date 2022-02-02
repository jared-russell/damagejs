import React from 'react'
import Plot from 'react-plotly.js'
import { MContext } from './provider'

export default class MyPlot extends React.Component {
  constructor () {
    super()
    this.state = { data: [], primaryData: [], secondaryData: [], layout: {}, frames: [], config: {}, visibility: [] }
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

  updatePlot (plotData, plotArgs) {
    console.dir(plotArgs)
    let nameSuffix = ''
    if (plotArgs.useName) {
      nameSuffix += ` (${plotArgs.name})`
    }
    let visibilityOffset = 0
    const colors = []
    if (plotArgs.primary) {
      colors.push(...['blue', 'green', 'red'])
    } else {
      colors.push(...['cornflowerblue', 'darkgreen', 'crimson'])
      if (this.state.data.length > 3) { visibilityOffset += 3 }
    }

    // handle visibility: collect non-false visibility
    const visibility = []
    for (const [index, line] of this.state.data.entries()) {
      if (!('visible' in line)) {
        console.log(index + ' default true')
        visibility.push(true)
      } else if (line.visible) {
        visibility.push(line.visible)
      } else {
        visibility.push(this.state.visibility[index])
      }
      console.log(index, visibility[index])
    }
    // handle initial visibility of secondary lines
    if (!plotArgs.primary && visibility.length < 4) { visibility.push(...visibility) }
    this.setState({ visibility: visibility })

    const thisPlotData = []
    // if (plotArgs.primary || plotArgs.useName) {
    thisPlotData.push(...[
      {
        x: plotData.ac,
        y: plotData.normal,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: colors[0] },
        name: 'Normal' + nameSuffix,
        visible: (plotArgs.primary || plotArgs.useName) ? visibility[0 + visibilityOffset] : false
      },
      {
        x: plotData.ac,
        y: plotData.advantage,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: colors[1] },
        name: 'Advantage' + nameSuffix,
        visible: (plotArgs.primary || plotArgs.useName) ? visibility[1 + visibilityOffset] : false
      },
      {
        x: plotData.ac,
        y: plotData.disadvantage,
        type: 'scatter',
        mode: 'lines+markers',
        marker: { color: colors[2] },
        name: 'Disadvantage' + nameSuffix,
        visible: (plotArgs.primary || plotArgs.useName) ? visibility[2 + visibilityOffset] : false
      }
    ])
    // }
    if (plotArgs.primary) {
      console.log('updating primary')
      this.setState({ primaryData: thisPlotData }, () => (this.updateData()))
    } else {
      console.log('updating secondary')
      console.dir(thisPlotData)
      this.setState({ secondaryData: thisPlotData }, () => (this.updateData()))
    }
  }

  updateData () {
    this.setState({ data: this.state.primaryData.concat(this.state.secondaryData) })
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
