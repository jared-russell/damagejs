// integration test
// truth values from LudicSavant and AureusFulgen's spreadsheet v2.51
// accessed 1/20/2022
// https://docs.google.com/spreadsheets/d/14WlZE_UKwn3Vhv4i8ewVOc-f2-A7tMW_VRum_p3YNHQ/edit?usp=sharing
import { d4, d6, d8 } from '../src/dice'
import { DamageSource, Damages } from '../src/damagesource'
import { AttackInfo, Character, Enemy } from '../src/characters'

// check results to this precision
const places = 2

// fairly basic attack - no power attacks, bonus dice, or feats
test('Test that our calculator yields the same results as the spreadsheet', () => {
  // main attack, +6 to hit, 2d8 + 5 damage, 1 attack, crits on 20
  const rapier = new DamageSource(1, d8, 5, 'piercing')
  const gfb = new DamageSource(1, d8, 0, 'fire')
  const mainDamages = new Damages('gfb rapier')
  mainDamages.addSource('rapier', rapier)
  mainDamages.addSource('gfb', gfb)
  const mainAttack = new AttackInfo(mainDamages, 6, 1)

  // bonus attack, +3 to hit, 1d4+4 damage, 2 attacks
  const dagger = new DamageSource(1, d4, 4)
  const bonusDamages = new Damages('dagger or whatever')
  bonusDamages.addSource('dagger', dagger)
  const bonusAttack = new AttackInfo(bonusDamages, 3, 2)

  // sneak attack, 2d6
  const sneak = new DamageSource(2, d6, 0, 'piercing')
  const firstDamages = new Damages('sneak attack')
  firstDamages.addSource('sneak attack', sneak)

  // enemy ac 15
  const myEnemy = new Enemy(15, null, null, null)
  const myCharacter = new Character(mainAttack, bonusAttack, firstDamages)
  const [dmgDis, dmg, dmgAdv] = myCharacter.calculateDPR(myEnemy)

  expect(dmgDis).toBeCloseTo(11.90, places)
  expect(dmg).toBeCloseTo(21.67, places)
  expect(dmgAdv).toBeCloseTo(29.91, places)
})
