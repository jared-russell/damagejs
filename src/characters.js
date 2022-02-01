/**
 * Module for high level classes to collect attack and character information for calculating DPR
 * @module src/characters
 */

import { Damages } from './damagesource.js'
import { damagePerRound } from './calculators.js'

/**
 * Collect information about an attack - Damages, as well as number of attacks and toHit bonus
 */
export class AttackInfo {
  /**
   * Create an instance of the AttackInfo class
   * @param {Damages} attackDamages Damage done by the attack
   * @param {number} toHitBonus bonus to hit with the attack
   * @param {number} nAttacks number of attacks done with the attack action
   */
  constructor (attackDamages, toHitBonus, nAttacks) {
    /**
     * Damage done by the attack
     * @type {Damages}
     * @public
     */
    this.attackDamages = attackDamages
    /**
     * Number of attacks with each attack action
     * @type {number}
     * @public
     */
    this.nAttacks = nAttacks
    /**
     * Bonus to hit with this attack
     * @type {number}
     * @public
     */
    this.toHitBonus = toHitBonus

    this.validate()
  }

  /**
   * Validate input values
   * @private
   */
  validate () {
    const errors = []
    // attackDamages should be null or of the Damages class
    if (this.attackDamages !== null && this.attackDamages.constructor !== Damages) {
      errors.push('attackDamages should be of the Damages class or null!')
    }

    // nAttacks should be an integer >= 0
    if (!Number.isInteger(this.nAttacks) || this.nAttacks < 0) {
      errors.push('nAttacks should be an integer >= 0!')
    }

    // toHitBonus should be an integer
    if (!Number.isInteger(this.toHitBonus)) {
      errors.push('toHitBonus should be an integer!')
    }

    // throw an error if any of these issues are true
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
  }
}

/**
 * Collect information about a character - main/bonus action attacks and other effects
 */
export class Character {
  /**
   * Create an instance of a Character
   * @param {AttackInfo} mainAttackInfo AttackInfo for the main attack action (or null)
   * @param {AttackInfo} bonusAttackInfo AttackInfo for the bonus action attack (or null)
   * @param {Damages} firstAttackAdditional Additional damage to be dealt with the first hit (such as with Sneak Attack)
   * @param {number} critThreshold D20 roll on which the character scores a critical hit
   * @param {null} feats (unused for now, will be used to track various damage-altering feats)
   */
  constructor (
    mainAttackInfo,
    bonusAttackInfo,
    firstAttackAdditional = null,
    critThreshold = 20,
    feats = null
  ) {
    /**
     * AttackInfo for the main action attack
     * @type {AttackInfo}
     * @public
     */
    this.mainAttackInfo = mainAttackInfo === null ? new AttackInfo(null, 0, 0) : mainAttackInfo// AttackInfo
    /**
     * AttackInfo for the bonus action attack
     * @type {AttackInfo}
     * @public
     */
    this.bonusAttackInfo = bonusAttackInfo === null ? new AttackInfo(null, 0, 0) : bonusAttackInfo // AttackInfo
    /**
     * Damage done on the first hit in a turn
     * @type {Damages}
     * @public
     */
    this.firstAttackAdditional = firstAttackAdditional // Damages or null
    /**
     * D20 roll on which the character scores a critical hit
     * @type {number}
     * @public
     */
    this.critThreshold = critThreshold
    /**
     * Feats that adjust damage this character has
     * @type {null}
     * @private
     */
    this.feats = feats

    this.validate()
  }

  /**
   * Validate input values
   * @private
   */
  validate () {
    // validate inputs
    const errors = []
    if (this.mainAttackInfo.constructor !== AttackInfo) {
      errors.push('mainAttackInfo should be of the AttackInfo class or null!')
    }

    if (this.bonusAttackInfo.constructor !== AttackInfo) {
      errors.push('bonusAttackInfo should be of the AttackInfo class or null!')
    }

    if (this.firstAttackAdditional !== null && this.firstAttackAdditional.constructor !== Damages) {
      errors.push('firstAttackAdditional should be of the Damages class or null!')
    }

    if (!Number.isInteger(this.critThreshold) || this.critThreshold < 1 || this.critThreshold > 20) {
      errors.push('critThreshold should be an integer between 1 and 20!')
    }

    if (this.feats !== null) {
      errors.push('Feats have not been implemented yet')
    }

    // throw an error if any of these issues are true
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
  }

  /**
   * Calculate DPR against an enemy
   * @param {Enemy} enemy the target of the attack
   */
  calculateDPR (enemy) {
    return damagePerRound(
      this.mainAttackInfo.toHitBonus, this.mainAttackInfo.attackDamages, this.mainAttackInfo.nAttacks,
      this.bonusAttackInfo.toHitBonus, this.bonusAttackInfo.attackDamages, this.bonusAttackInfo.nAttacks,
      this.firstAttackAdditional, enemy.ac, this.critThreshold
    )
  }
}

/**
 * Container to hold information about an enemy/target
 */
export class Enemy {
  /**
   *
   * @param {number} ac Armor Class
   * @param {null} resistances (unused for now, will be used to track any resistances to particular damage types)
   * @param {null} vulnerabilities (unused for now, will be used to track any vulnerabilities to particular damage types)
   * @param {null} saveBonuses (unused for now, will be used to track saving throw bonuses)
   */
  constructor (ac, resistances, vulnerabilities, saveBonuses) {
    /**
     * Armor Class
     * @type {number}
     * @public
     */
    this.ac = ac // armor class
    /**
     * Damage types the target has resistance to
     * @type {null}
     * @private
     */
    this.resistances = resistances // array strings of damage types it's resistant to
    /**
     * Damage types the target has vulnerability to
     * @type {null}
     * @private
     */
    this.vulnerabilities = vulnerabilities // array strings of damage types it's vulnerable to
    /**
     * Target's bonuses to saving throws
     * @type {null}
     * @private
     */
    this.saveBonuses = saveBonuses // bonuses to saving throws

    this.validate()
  }

  /**
   * Validate input values
   * @private
   */
  validate () {
    const errors = []
    if (this.resistances !== null) {
      errors.push('Resistances have not been implemented yet')
    }

    if (this.vulnerabilities !== null) {
      errors.push('Vulnerabilities have not been implemented yet')
    }

    if (this.saveBonuses !== null) {
      errors.push('Saving throws have not been implemented yet')
    }

    // ac should be an integer >= 0
    if (!Number.isInteger(this.ac) || this.ac < 0) {
      errors.push('ac should be an integer >= 0!')
    }

    // throw an error if any of these issues are true
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
  }
}
