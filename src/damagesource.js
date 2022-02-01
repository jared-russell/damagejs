
/**
 * Damage Source module - specifies classes for collecting attack damage sources
 * @module src/damagesource
 */
import { Die } from './dice.js'

/** @constant {string[]} damageTypes array of all valid damage types in 5e */
const damageTypes = [
  'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning', 'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'
]

/** @constant {string[]} physicalDamageTypes array of all damage types in 5e considered to be 'physical' damage */
const physicalDamageTypes = ['bludgeoning', 'piercing', 'slashing']

/**
 * Class representing a single source of damage, such as from a weapon or spell.
 * The damage type and whether it's magical can be specified.
 * Examples might be a damaging spell (firebolt), or a nonmagical or +1 weapon.
 * A single damageSource should represent a single kind of die roll and damage type.
 * Attacks can combine multiple damageSources as needed.
 * @see Damages
 */
export class DamageSource {
  /**
   * Create a damageSource
   * @param {number} nDice The number of dice of the specified type this source rolls
   * @param {Die} dieType The die this source rolls
   * @param {number} modifier The flat damage modifier this source adds
   * @param {string} damageType The type of damage this source does (treats as nonmagical physical damage if unspecified)
   * @param {boolean} isMagical Whether the damage is magical (assumes nonphysical damage is magical by default)
   */
  constructor (nDice, dieType, modifier, damageType = null, isMagical = null, minimumDamage = 0) {
    // assign direct inputs
    /**
     * The number of dice of the specified type this source rolls
     * @type {number}
     * @public
     */
    this.nDice = nDice
    /**
     * The die to roll for this damage type
     * @type {dice.Die}
     * @public
     */
    this.die = dieType
    /**
     * The flat damage modifier this source adds
     * @type {number}
     * @public
     */
    this.modifier = modifier
    /**
     * The damage type this source does
     * @type {string}
     * @public
     */
    this.damageType = damageType
    /**
     * Whether the damage is magical
     * @type {boolean}
     * @public
     */
    this.isMagical = isMagical

    /**
     * The minimum damage an attack can do (in the event of a negative modifier)
     * @type {number}
     * @public
     */
    this.minimumDamage = minimumDamage

    // validate inputs here
    this.validate()

    // make assumptions about magicalness based on damage type if undefined
    if (this.damageType !== null) {
      if (this.isMagical === null) {
        // if null or false, cross check vs damage type
        if (physicalDamageTypes.includes(this.damageType)) {
          // assume normal physical damage is nonmagical
          this.isMagical = false
        } else {
          // assume other damage is magical
          this.isMagical = true
        }
      }
    } else if (this.isMagical === null) {
      // assume it's not magical if damage type is unspecified
      this.isMagical = false
    }

    // assign derived properties
    /**
     * The minimum damage this source can do
     * @type {number}
     * @public
     */
    this.min = Math.max(nDice * this.die.min + modifier, this.minimumDamage)
    /**
     * The maximum damage this source can do
     * @type {number}
     * @public
     */
    this.max = Math.max(nDice * this.die.max + modifier, this.minimumDamage)
    /**
     * The average damage this source will do
     * @type {number}
     * @public
     */
    this.avg = Math.max(nDice * this.die.avg + modifier, this.minimumDamage)
    /**
     * The minimum damage this source can do on a critical hit
     * @type {number}
     * @public
     */
    this.minCrit = Math.max(2 * nDice * this.die.min + modifier, this.minimumDamage)
    /**
     * The maximum damage this source can do on a critical hit
     * @type {number}
     * @public
     */
    this.maxCrit = Math.max(2 * nDice * this.die.max + modifier, this.minimumDamage)
    /**
     * The average damage this source will do on a critical hit
     * @type {number}
     * @public
     */
    this.avgCrit = Math.max(2 * nDice * this.die.avg + modifier, this.minimumDamage)
  }

  /**
   * Validate input values
   * @private
   */
  validate () {
    const errors = []
    // nDice should be an integer >= 0
    if (!Number.isInteger(this.nDice) || this.nDice < 0) {
      errors.push('nDice should be an integer >= 0!')
    }

    // die should be a Die
    if (!this.die || this.die.constructor !== Die) {
      console.log(this.die)
      console.log(this.die.constructor)
      errors.push('dieType should be of the Die class!')
    }

    // modifier should be an integer
    if (!Number.isInteger(this.modifier)) {
      errors.push('modifier should be an integer!')
    }

    // damageType should be a valid one based on damageTypes
    if (this.damageType !== null && !damageTypes.includes(this.damageType)) {
      errors.push(`Unrecognized damageType ${this.damageType}`)
    }

    // isMagical should be null or a boolean
    if (this.isMagical !== null && typeof this.isMagical !== 'boolean') {
      errors.push('isMagical should be null or a boolean')
    }

    if (!Number.isInteger(this.minimumDamage) || this.minimumDamage < 0) {
      errors.push('minimumDamage should be an integer >= 0!')
    }

    // throw an error if any of these issues are true
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
  }

  /**
   * Roll damage for this damage source
   * @param {boolean} crit Whether to roll damage as a critical hit
   * @returns {number} The amount of damage rolled
   */
  roll (crit = false) {
    let damage = this.modifier
    const rollN = (crit) ? 2 * this.nDice : this.nDice
    for (let i = 0; i < rollN; i++) {
      damage += this.die.roll()
    }
    return damage
  }

  /**
   * A constructed sentence describing this damage source
   * @returns {string} A description of the damage
   */
  description () {
    let desc = `${this.nDice}d${this.die.max}`
    if (this.modifier) {
      desc += ` + ${this.modifier}`
    }
    if (this.isMagical) {
      desc += ' magical'
    } else {
      desc += ' nonmagical'
    }
    if (this.damageType) {
      desc += ` ${this.damageType}`
    }
    desc += ' damage'
    return desc
  }
}

/**
 * A class collecting damageSources that are issued together.
 * For example, 1d6+5 piercing damage from a shortsword and 1d8 fire damage from Green Flame Blade
 */
export class Damages {
  /**
   * Create an empty collection of damageSources
   * @param {string} name The name to use to refer to this collection
   */
  constructor (name) {
    if (!name || typeof name !== 'string') {
      throw new Error('name input should be a string')
    }
    /**
     * The name of this collection of damageSources
     * @type {string}
     * @public
     */
    this.name = name
    /**
     * A mapping of damageSources to their names
     * @type {Map<string:damageSource>}
     * @private
     */
    this.sources = new Map()
  }

  /**
   * Add a DamageSource to the Damages collection
   * @param {string} name name of the DamageSource
   * @param {DamageSource} damage DamageSource to be added
   */
  addSource (name, damage) {
    // validate inputs
    const errors = []
    if (!name || typeof name !== 'string') {
      errors.push('name input should be a string')
    }
    if (this.sources.has(name)) {
      errors.push('name input should be unique')
    }
    if (!damage || damage.constructor !== DamageSource) {
      errors.push('damage input should be a DamageSource')
    }
    // throw an error if any of these issues are true
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
    this.sources.set(name, damage)
  }

  /**
   * Remove a DamageSource from the Damages collection
   * @param {string} name name of the DamageSource to remove
   */
  removeSource (name) {
    // validate input
    if (!name || typeof name !== 'string' || !this.sources.has(name)) {
      throw new Error('name input should be already in the map')
    }

    this.sources.delete(name)
  }

  /**
   * The minimum damage from this collection of sources
   * @param {boolean} crit Whether the damage is a critical hit
   * @returns {number} The minimum damage
   */
  min (crit = false) {
    let damage = 0
    for (const source of this.sources) {
      damage += (crit) ? source[1].minCrit : source[1].min
    }
    return damage
  }

  /**
   * The maximum damage from this collection of sources
   * @param {boolean} crit Whether the damage is a critical hit
   * @returns {number} The maximum damage
   */
  max (crit = false) {
    let damage = 0
    for (const source of this.sources) {
      damage += (crit) ? source[1].maxCrit : source[1].max
    }
    return damage
  }

  /**
   * The average damage from this collection of sources
   * @param {boolean} crit Whether the damage is a critical hit
   * @returns {number} The average damage
   */
  avg (crit = false) {
    let damage = 0
    for (const source of this.sources) {
      damage += (crit) ? source[1].avgCrit : source[1].avg
    }
    return damage
  }

  /**
   * Roll damage from this collection of sources
   * @param {boolean} crit Whether the damage is a critical hit
   * @returns {number} The rolled damage
   */
  roll (crit = false) {
    let damage = 0
    for (const source of this.sources) {
      damage += source[1].roll(crit)
    }
    return damage
  }

  /**
   * A description of this collection of damages
   * @returns {string} The description of the damage
   */
  description () {
    let desc = `Damage collection '${this.name}':\n`
    for (const source of this.sources) {
      desc += `  ${source[1].description()} (${source[0]})\n`
    }
    return desc
  }
}

// TODO add saving throw attack support

// import { d6, d8, d10 } from './dice.js'
// const my_damage = new DamageSource(3, d8, 3, 'fire', false)
// const sneak_atk = new DamageSource(2, d6, 0, 'piercing')
// console.log(my_damage.description())
// console.log('min: ' + my_damage.min)
// console.log('max: ' + my_damage.max)
// console.log('avg: ' + my_damage.avg)
// // for(let i=1 i<=10 i++) {
// //     console.log('roll ' + i + ': ' + my_damage.roll())
// // }
// console.log('')
// const my_attack = new Damages('rapier attack')
// my_attack.sources.set('sneak attack', sneak_atk)
// my_attack.sources.set('green flame blade', new DamageSource(1, d8, 0, 'fire', true))
// my_attack.sources.set('rapier', new DamageSource(1, d8, 5, 'piercing', false))
// console.log(my_attack.description())
// console.log(`min: ${my_attack.min()}`)
// console.log(`max: ${my_attack.max()}`)
// console.log(`avg: ${my_attack.avg()}`)
// console.log('')
// const my_bident = new Damages('bident attack')
// my_bident.sources.set('green flame blade', new DamageSource(1, d8, 0, 'fire', true))
// my_bident.sources.set('spear', new DamageSource(1, d8, 4, 'piercing', true))
// my_bident.sources.set('bident cold', new DamageSource(2, d10, 0, 'cold', true))
// console.log(my_bident.description())
// console.log(`min: ${my_bident.min()}`)
// console.log(`max: ${my_bident.max()}`)
// console.log(`avg: ${my_bident.avg()}`)
// console.log('')
// const my_keysword = new Damages('key sword attack')
// my_keysword.sources.set('sneak attack', sneak_atk)
// my_keysword.sources.set('green flame blade', new DamageSource(1, d8, 0, 'fire', true))
// my_keysword.sources.set('rapier', new DamageSource(1, d6, 6, 'piercing', false))
// console.log(my_keysword.description())
// console.log(`min: ${my_keysword.min()}`)
// console.log(`max: ${my_keysword.max()}`)
// console.log(`avg: ${my_keysword.avg()}`)
