import React from 'react'
import PropTypes from 'prop-types'

export const MContext = React.createContext()
class MyProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    triggerPlot: PropTypes.func.isRequired
  }

  constructor () {
    super()
    this.state = { acRange: [], disRange: [], normRange: [], advRange: [] }
  }

  pushUpdate (value, propArgs) {
    this.setState({ plotData: value, propArgs: propArgs })
    this.props.triggerPlot()
  }

  render () {
    return (
      <MContext.Provider value={
        {
          state: this.state,
          setPlotData: (value, propArgs) => { this.pushUpdate(value, propArgs) }
        }}>
      {this.props.children}
      </MContext.Provider>)
  }
}

export default MyProvider
