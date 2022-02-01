import React from 'react'
import MyPlot from './plot'
import DamageForm from './damageForm'
import MyProvider from './provider'
import './App.css'

class App extends React.Component {
  triggerPlot () {
    this.plot.updatePlot(this.provider.state.plotData)
  }

  render () {
    /* eslint-disable no-return-assign */
    return (
      <MyProvider ref={provider => this.provider = provider} triggerPlot={this.triggerPlot.bind(this)}>
        <h1>Damagejs Damage Per Round Calculator</h1>
        <div>
          <p>This D&amp;D 5e Damage Per Round calculator is based on&nbsp;
          <a href='https://forums.giantitp.com/showthread.php?582779-Comprehensive-DPR-Calculator-(v2-0)'>LudicSavant and AureusFulgen&apos;s Comprhensive DPR Calculator</a>
          &nbsp;from the Giant in the Playground forums. They deserve all the credit for the math and the idea! I just reimplemented it to teach myself JavaScript.
          </p>
        </div>
        <MyPlot ref={plot => this.plot = plot}/>
        <DamageForm />
      </MyProvider>
    )
    /* eslint-enable no-return-assign */
  }
}

export default App
