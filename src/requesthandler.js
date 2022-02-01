import { damageDieMap } from './dice.js'
import { DamageSource, Damages } from './damagesource.js'
import { AttackInfo, Character, Enemy } from './characters.js'

// todo - validation
// todo - lint, testing
// todo - bonus, firstHit, etc
// todo - all other effects
const acRange = Array.from({ length: 26 }, (x, i) => i + 5)

export function handleRequest (inputData) {
  console.dir(inputData)
  const mainDamages = new Damages('main')
  let thisDamage
  for (const dsinput of inputData.mainAttackInfo.damageSources) {
    thisDamage = new DamageSource(parseInt(dsinput.nDice), damageDieMap.get(dsinput.die), parseInt(dsinput.modifier))
    mainDamages.addSource(dsinput.name, thisDamage)
  }
  const mainAttack = new AttackInfo(mainDamages, parseInt(inputData.mainAttackInfo.toHit), parseInt(inputData.mainAttackInfo.nAttacks))

  const bonusDamages = new Damages('bonus')
  for (const dsinput of inputData.bonusAttackInfo.damageSources) {
    thisDamage = new DamageSource(parseInt(dsinput.nDice), damageDieMap.get(dsinput.die), parseInt(dsinput.modifier))
    bonusDamages.addSource(dsinput.name, thisDamage)
  }
  const bonusAttack = new AttackInfo(bonusDamages, parseInt(inputData.bonusAttackInfo.toHit), parseInt(inputData.bonusAttackInfo.nAttacks))

  const firstDamages = new Damages('first')
  for (const dsinput of inputData.firstAttackDamageSources) {
    thisDamage = new DamageSource(parseInt(dsinput.nDice), damageDieMap.get(dsinput.die), parseInt(dsinput.modifier))
    firstDamages.addSource(dsinput.name, thisDamage)
  }

  const character = new Character(mainAttack, bonusAttack, firstDamages, parseInt(inputData.criticalHitThreshold))
  const disRange = []
  const normRange = []
  const advRange = []
  let thisDis, thisNorm, thisAdv
  for (const ac of acRange) {
    [thisDis, thisNorm, thisAdv] = character.calculateDPR(new Enemy(ac, null, null, null))
    disRange.push(thisDis)
    normRange.push(thisNorm)
    advRange.push(thisAdv)
  }
  return {
    ac: acRange,
    disadvantage: disRange,
    normal: normRange,
    advantage: advRange
  }
}
