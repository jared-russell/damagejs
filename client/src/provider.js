import React from 'react'
import PropTypes from 'prop-types'

export const MContext = React.createContext()
class MyProvider extends React.Component {
  propTypes = {
    children: PropTypes.object.isRequired,
    triggerPlot: PropTypes.func.isRequired
  }

  constructor () {
    super()
    this.state = { acRange: [], disRange: [], normRange: [], advRange: [] }
  }

  pushUpdate (value) {
    this.setState({ plotData: value })
    this.props.triggerPlot()
  }

  render () {
    return (
      <MContext.Provider value={
        {
          state: this.state,
          setPlotData: (value) => { this.pushUpdate(value) }
        }}>
      {this.props.children}
      </MContext.Provider>)
  }
}

export default MyProvider
