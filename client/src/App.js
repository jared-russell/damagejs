import React from 'react'
import MyPlot from './plot'
import DamageForm from './damageForm'
import MyProvider from './provider'
import './App.css'

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      compare: false
    }
  }

  triggerPlot () {
    this.plot.updatePlot(this.provider.state.plotData, this.provider.state.propArgs)
  }

  setCompare (event) {
    console.log(event.target.checked)
    this.setState({ compare: event.target.checked })
  }

  renderLeft () {
    let title = 'Attack Information'
    if (this.state.compare) {
      title += ' (A)'
    }

    return (
      <td key='primary-cell'>
        <h2>{title}</h2>
        <DamageForm key='primary' args={{ useName: this.state.compare, name: 'A', primary: true }}/>
      </td>
    )
  }

  renderRight () {
    return (
      <td key='secondary-cell' hidden={!this.state.compare}>
        <h2>Attack Information (B)</h2>
        <DamageForm key='secondary' args={{ useName: this.state.compare, name: 'B', primary: false }}/>
      </td>
    )
  }

  render () {
    /* eslint-disable no-return-assign */
    return (
      <MyProvider key='provider' ref={provider => this.provider = provider} triggerPlot={this.triggerPlot.bind(this)}>
        <h1>Damagejs Damage Per Round Calculator</h1>
        <div>
          <p>This D&amp;D 5e Damage Per Round calculator is based on&nbsp;
          <a href='https://forums.giantitp.com/showthread.php?582779-Comprehensive-DPR-Calculator-(v2-0)'>LudicSavant and AureusFulgen&apos;s Comprhensive DPR Calculator</a>
          &nbsp;from the Giant in the Playground forums. They deserve all the credit for the math and the idea! I just reimplemented it to teach myself JavaScript.
          </p>
        </div>
        <MyPlot key='plot' ref={plot => this.plot = plot}/>
        <br/>
        <input type='checkbox' id='compare' name='compare' value='compare' defaultChecked={this.state.compare} onClick={this.setCompare.bind(this)}/>
        <label htmlFor='compare'> Compare multiple</label>
        <table key='table'><tbody key='tbody'><tr key='tr'>
          {this.renderLeft()}
          {this.renderRight()}
        </tr></tbody></table>
      </MyProvider>
    )
    /* eslint-enable no-return-assign */
  }
}

export default App
