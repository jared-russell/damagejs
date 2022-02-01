import React from 'react'
import PropTypes from 'prop-types'
import { MContext } from './provider'

export class DamageSource extends React.Component {
  propTypes = {
    args: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    triggerUpdate: PropTypes.func.isRequired,
    removeClick: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      name: this.props.args.name,
      nDice: this.props.args.nDice,
      die: this.props.args.die,
      modifier: this.props.args.modifier
    }
  }

  handleNameChange (event) {
    this.setState({ name: event.target.value }, () => (this.props.triggerUpdate({ state: this.state, key: this.props.index })))
    // this.props.triggerUpdate({state: this.state, key: this.props.index})
  }

  handleNumDieChange (event) {
    this.setState({ nDice: event.target.value }, () => (this.props.triggerUpdate({ state: this.state, key: this.props.index })))
    // this.props.triggerUpdate({state: this.state, key: this.props.index})
  }

  handleDieChang (event) {
    this.setState({ die: event.target.value }, () => (this.props.triggerUpdate({ state: this.state, key: this.props.index })))
    // this.props.triggerUpdate({state: this.state, key: this.props.index})
  }

  handleModChange (event) {
    this.setState({ modifier: event.target.value }, () => (this.props.triggerUpdate({ state: this.state, key: this.props.index })))
    // this.props.triggerUpdate({state: this.state, key: this.props.index})
  }

  render () {
    return (
      <div key={this.state.name}>
        Name: <input type='text' value={this.state.name} onChange={this.handleNameChange.bind(this)}/>&nbsp;
        Damage: <input type='number' min='0' value={this.state.nDice} onChange={this.handleNumDieChange.bind(this)}/>d
        <select name='die' id='die-select' value={this.state.die} onChange={this.handleDieChange.bind(this)}>
          <option value='0'>0</option>
          <option value='2'>2</option>
          <option value='3'>3</option>
          <option value='4'>4</option>
          <option value='6'>6</option>
          <option value='8'>8</option>
          <option value='10'>10</option>
          <option value='12'>12</option>
        </select> +
        <input type='number' value={this.state.modifier} onChange={this.handleModChange.bind(this)}/>
        <input type='button' value='remove' onClick={this.props.removeClick.bind(this)}/>
      </div>
    )
  }
}

class AttackInfo extends React.Component {
  propTypes = {
    args: PropTypes.object.isRequired,
    triggerUpdate: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      toHit: this.props.args.toHit,
      nAttacks: this.props.args.nAttacks,
      damageSources: this.props.args.damageSources
    }
  }

  handleToHitChange (event) {
    this.setState({ toHit: event.target.value }, () => this.props.triggerUpdate(this.state))
  }

  handleNAattacksChange (event) {
    this.setState({ nAttacks: event.target.value }, () => this.props.triggerUpdate(this.state))
  }

  // handleDamageSourceUpdate(event, i) {
  //   let damageSources = [...this.state.damageSources]
  //   damageSources[i] = {

  //   }
  //   this.setState({ damageSources })
  // }
  handleDamageSourceUpdate = (damageSourceData) => {
    const damageSources = [...this.state.damageSources]
    console.log('got a source update')
    console.dir(damageSourceData)
    damageSources[damageSourceData.key] = damageSourceData.state
    this.setState({ damageSources }, () => this.props.triggerUpdate(this.state))
  }

  addClick () {
    this.setState(prevState => ({ damageSources: [...prevState.damageSources, { name: `damage${prevState.damageSources.length}`, nDice: '0', die: '0', modifier: '0' }] }), () => this.props.triggerUpdate(this.state))
  }

  removeClick (i) {
    const damageSources = [...this.state.damageSources]
    damageSources.splice(i, 1)
    this.setState({ damageSources }, () => this.props.triggerUpdate(this.state))
  }

  render () {
    return (
        <div>
          To Hit: <input type='number' value={this.state.toHit} onChange={this.handleToHitChange.bind(this)}/>&nbsp;
          Number of Attacks: <input type='number' min='0' value={this.state.nAttacks} onChange={this.handleNAattacksChange.bind(this)}/>
          {this.state.damageSources.map((dmg, i) => (
            <DamageSource
              key={i}
              index={i}
              removeClick={this.removeClick.bind(this, i)}
              triggerUpdate={this.handleDamageSourceUpdate}
              args={dmg}
            />
          ))}
          <input type='button' value='add damage' onClick={this.addClick.bind(this)}/>
        </div>
    )
  }
}

export class DamageForm extends React.Component {
  constructor () {
    super()
    this.state = {
      criticalHitThreshold: '20',
      mainAttackInfo: { toHit: '4', nAttacks: '1', damageSources: [{ name: 'Shortsword', nDice: '1', die: '6', modifier: '4' }] },
      bonusAttackInfo: { toHit: '0', nAttacks: '0', damageSources: [{ name: 'Off-hand', nDice: '1', die: '4', modifier: '0' }] },
      firstAttackDamageSources: [{ name: 'Sneak Attack', nDice: '0', die: '6', modifier: '0' }]
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.context = null
  }

  setContext (context) { this.context = context }

  handleSubmit (context, event) {
    event.preventDefault()
    this.updatePlot(context)
  }

  async updatePlot (context) {
    // alert('Specified Damage: \n' + JSON.stringify(this.state, null, 4))

    console.log(JSON.stringify(this.state))

    try {
      const rawResponse = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state)
      })
      const content = await rawResponse.json()
      console.log(content)
      context.setPlotData(content)
    } catch (error) {
      console.log(error)
    }
  }

  addClick () {
    this.setState(prevState => ({ firstAttackDamageSources: [...prevState.firstAttackDamageSources, { name: `damage${prevState.firstAttackDamageSources.length}`, nDice: '0', die: '0', modifier: '0' }] }))
  }

  removeClick (i) {
    const firstAttackDamageSources = [...this.state.firstAttackDamageSources]
    firstAttackDamageSources.splice(i, 1)
    this.setState({ firstAttackDamageSources })
  }

  handleMainAttackInfoUpdate = (AttackInfoData) => {
    this.setState({ mainAttackInfo: AttackInfoData })
  }

  handleBonusAttackInfoUpdate = (AttackInfoData) => {
    this.setState({ bonusAttackInfo: AttackInfoData })
  }

  handleCritThresholdUpdate (event) {
    this.setState({ criticalHitThreshold: event.target.value })
  }

  handleDamageSourceUpdate = (damageSourceData) => {
    const firstAttackDamageSources = [...this.state.firstAttackDamageSources]
    firstAttackDamageSources[damageSourceData.key] = damageSourceData.state
    this.setState({ firstAttackDamageSources })
  }

  async componentDidMount () {
    this.updatePlot(this.context)
  }

  async componentDidUpdate () {
    this.updatePlot(this.context)
  }

  render () {
    return (
      <MContext.Consumer>
      {(context) => (
        <div>
          {this.setContext(context)}
          <h2>Attack Information</h2>
          Critical Hit Threshold: <input type='number' min='0' max='20' value={this.state.criticalHitThreshold} onChange={this.handleCritThresholdUpdate.bind(this)}/>
          <h3>Main Action Attack</h3>
          <AttackInfo args={this.state.mainAttackInfo} triggerUpdate={this.handleMainAttackInfoUpdate} />
          <h3>Bonus Action Attack</h3>
          <AttackInfo args={this.state.bonusAttackInfo} triggerUpdate={this.handleBonusAttackInfoUpdate} />
          <h3>First Attack Bonus Damage</h3>
          <p>E.g, Sneak Attack</p>
          {this.state.firstAttackDamageSources.map((dmg, i) => (
              <DamageSource
                key={i}
                index={i}
                removeClick={this.removeClick.bind(this, i)}
                triggerUpdate={this.handleDamageSourceUpdate}
                args={dmg}
              />
          ))}
          <input type='button' value='add damage' onClick={this.addClick.bind(this)}/>
        </div>
      )}
      </MContext.Consumer>
    )
  }
}

export default DamageForm
