/**
 * Module for calculating to-hit probability and damage per hit and per round
 * @module src/calculators
 */

/**
 * Calculate the basic probability of achieving a certain roll target with a bonus.
 * @param {number} target Armor Class or saving throw DC
 * @param {number} bonus The bonus to add to the die roll
 * @returns {number} The probability of a successful hit or save
 */
function basicD20Probability (target, bonus) {
  return Math.min(Math.max((21 - target + bonus) / 20, 0), 1)
}

/**
 * Calculate the probability to hit for disadvantage, a normal roll, and advantage.
 * @param {number} ac Target Armor class
 * @param {numer} bonus The bonus to add to the die roll
 * @returns {number[]} The probability to hit with [disadvantage, normal roll, advantage]
 */
function probabilityToHit (ac, bonus) {
  // calculate probability to hit based on AC and attack bonus
  const p = basicD20Probability(ac, bonus)

  // TODO factor in various feats, bonus/penalty dice, etc
  // see https://forums.giantitp.com/showthread.php?582779-Comprehensive-DPR-Calculator-(v2-0)

  // disadvantage, base, advantage
  return [p ** 2, p, 1 - (1 - p) ** 2]
}

/**
 * Calculate the probability for a critical hit at disadvantage, a normal roll, and advantage.
 * @param {number} critAt The minimum roll for a critical hit - usually 20, can be as low as 18 (default 20)
 * @returns {number} The probability to crit with [disadvantage, normal roll, advantage]
 */
function probabilityToCrit (critAt = 20) {
  const c = basicD20Probability(critAt, 0)

  // TODO factor in various feats, bonus/penalty dice, etc
  // see https://forums.giantitp.com/showthread.php?582779-Comprehensive-DPR-Calculator-(v2-0)

  // disadvantage, base, advantage
  return [c ** 2, c, 1 - (1 - c) ** 2]
}

/**
 * Calculate the probability that a target will fail a saving throw at at disadvantage, a normal roll, and advantage.
 * @param {number} dc The save DC for the roll
 * @param {number} bonus Target's bonus to the saving throw
 * @returns {number} The probability that the target will fail the save based on whether the target has [disadvantage, normal roll, advantage]
 */
function probabilityToNotSave (dc, bonus) {
  // calculate probability that an enemy will not save based on DC and their save bonus
  const p = basicD20Probability(dc, bonus)

  // probability based on whether ENEMY has disadvantage, base, advantage
  return [1 - p ** 2, 1 - p, (1 - p) ** 2]
}

/**
 * Calculate the probability of at least one hit in a round.
 * @param {number} p Probability to hit with an attack
 * @param {number} nAttacks Number of attacks in a round.
 * @returns {number} Probability of at least one hit
 */
function probabilityOneHit (p, nAttacks) {
  return 1 - ((1 - p) ** nAttacks)
}

/**
 * Calculate the additional damage from a first-hit effect like sneak attack.
 * @param {number} dAvg Average damage for the first-hit effect
 * @param {number} dAddFromCrit Additional damage from the extra dice for a critical hit
 * @param {number} pOnceTotal Total probability of hitting the target at least once in the round
 * @param {number} pOnceMain Probability of hitting the target with the main attack
 * @param {number} pOnceBonus Probability of hitting the target with the bonus action attack
 * @param {number} c Chance of a critical hit
 * @param {number} p Chance of a hit with the main attack
 * @param {number} b Chance of a hit with the bonus action attack
 * @returns {number} The average additional damage from the first-hit attack
 */
function firstHitAdditionalDamage (dAvg, dAddFromCrit, p, b, c, nMainAttacks, nBonusAttacks) {
  const pOnce = probabilityOneHit(p, nMainAttacks)
  const bOnce = probabilityOneHit(b, nBonusAttacks)
  const pOnceTotal = pOnce + bOnce - (pOnce * bOnce)
  let damage = dAvg * pOnceTotal // pOnceTotal will be 0 if both p and b are 0
  if (p > 0) {
    damage += dAddFromCrit * pOnce * c / p
  }
  if (b > 0) {
    damage += dAddFromCrit * (1 - pOnce) * bOnce * c / b
  }
  return damage
}

/**
 * Calculate the damage per hit for a specific attack
 * @param {number} ac Target armor class
 * @param {number} hitBonus Bonus to hit to add to the die roll
 * @param {damagesource.Damages} damage Damages done by this attack
 * @param {number} critThreshold Critical Hit roll threshold (default 20)
 * @returns {number} Average damage per hit given the probability of hitting the target and average damage from the attack given [disadvantage, normal roll, advantage]
 */
export function damagePerHit (ac, hitBonus, damage, critThreshold = 20) {
  // calculate damage for a single hit
  // TODO factor in extra crit dice, other damage feats, GWM/sharpshooter
  // TODO consider saving throw attacks
  // TODO consider resistance/vulnerability
  // TODO consider min/max damage instead of avg

  const [pDisadvantageHit, pToHit, pAdvantageHit] = probabilityToHit(ac, hitBonus)
  const [pDisadvantageCrit, pToCrit, pAdvantageCrit] = probabilityToCrit(critThreshold)

  return [
    Math.max(0, (pDisadvantageHit - pDisadvantageCrit)) * damage.avg() + pDisadvantageCrit * damage.avg(true),
    Math.max(0, (pToHit - pToCrit)) * damage.avg() + pToCrit * damage.avg(true),
    Math.max(0, (pAdvantageHit - pAdvantageCrit)) * damage.avg() + pAdvantageCrit * damage.avg(true)
  ]
}

/**
 * Calculate the damage per round from all attacks and once-per-round effects.
 * @param {number} mainHitBonus Bonus to hit for the main attack
 * @param {damagesource.Damages} mainDamage Damage dealt by the main attack
 * @param {number} nMainAttacks Number of main attack action attacks
 * @param {number} bonusHitBonus Bonus to hit for the buns attack
 * @param {damagesource.Damages} bonusDamage Damage dealt by the bonus action attack
 * @param {number} nBonusAttacks Number of bonus action attacks
 * @param {damagesource.Damages} firstAttackDamage Damage dealt by additional effects on the first hit such as Sneak Attack
 * @param {number} ac Target armor class
 * @param {number} critThreshold Critical Hit roll threshold (default 20)
 * @returns {number[]} Average damage per round given the probability of hitting the target and average damage from the attack given [disadvantage, normal roll, advantage]
 */
export function damagePerRound (
  mainHitBonus, mainDamage, nMainAttacks,
  bonusHitBonus, bonusDamage, nBonusAttacks,
  firstAttackDamage, ac, critThreshold = 20
) {
  // main attack(s)
  const [pDis, p, pAdv] = nMainAttacks > 0 ? probabilityToHit(ac, mainHitBonus) : [0, 0, 0]
  // bonus attack(s)
  const [bDis, b, bAdv] = nBonusAttacks > 0 ? probabilityToHit(ac, bonusHitBonus) : [0, 0, 0]
  // crit chance
  const [cDis, c, cAdv] = probabilityToCrit(critThreshold)
  // main attack damage
  const [dMainDis, dMain, dMainAdv] = mainDamage === null ? [0, 0, 0] : damagePerHit(ac, mainHitBonus, mainDamage, critThreshold).map(function (dmg) { return dmg * nMainAttacks })
  // bonus attack damage
  const [dBonusDis, dBonus, dBonusAdv] = bonusDamage === null ? [0, 0, 0] : damagePerHit(ac, bonusHitBonus, bonusDamage, critThreshold).map(function (dmg) { return dmg * nBonusAttacks })

  let dAddDis, dAdd, dAddAdv
  // calculate hit probabilities
  if (firstAttackDamage !== null) {
    // additional damage from extra dice on a crit for first-hit-on-turn damage
    const dAddFromCrit = firstAttackDamage.avg(true) - firstAttackDamage.avg()
    dAddDis = firstHitAdditionalDamage(firstAttackDamage.avg(), dAddFromCrit, pDis, bDis, cDis, nMainAttacks, nBonusAttacks)
    dAdd = firstHitAdditionalDamage(firstAttackDamage.avg(), dAddFromCrit, p, b, c, nMainAttacks, nBonusAttacks)
    dAddAdv = firstHitAdditionalDamage(firstAttackDamage.avg(), dAddFromCrit, pAdv, bAdv, cAdv, nMainAttacks, nBonusAttacks)
  } else {
    dAddDis = 0
    dAdd = 0
    dAddAdv = 0
  }

  return [
    dMainDis + dBonusDis + dAddDis,
    dMain + dBonus + dAdd,
    dMainAdv + dBonusAdv + dAddAdv
  ]
}

// export functions that don't need to be public for the sake of testing them
// Using pattern from https://stackoverflow.com/a/54116079
export const exportedForTesting = {
  probabilityToHit,
  probabilityToCrit,
  probabilityToNotSave,
  probabilityOneHit,
  firstHitAdditionalDamage
}
