import { Damages } from './damagesource'
import { AttackInfo, Character, Enemy } from './characters'

test('AttackInfo constructor just maps properties directly with expected inputs', () => {
  const myDam = new Damages('stuff')
  const myAI = new AttackInfo(myDam, 2, 1)
  expect(myAI.attackDamages).toBe(myDam)
  expect(myAI.toHitBonus).toBe(2)
  expect(myAI.nAttacks).toBe(1)

  const myAI2 = new AttackInfo(null, 2, 1)
  expect(myAI2.attackDamages).toBe(null)
})

test('AttackInfo validation throws on bad inputs', () => {
  const myDam = new Damages('stuff')
  /* eslint-disable no-new */
  // attackDamages checks
  expect(() => {
    new AttackInfo('myDam', 2, 1)
  }).toThrow('attackDamages')

  // toHitBonus checks
  expect(() => {
    new AttackInfo(myDam, null, 1)
  }).toThrow('toHitBonus')
  expect(() => {
    new AttackInfo(myDam, 1.1, 1)
  }).toThrow('toHitBonus')
  expect(() => {
    new AttackInfo(myDam, '1', 1)
  }).toThrow('toHitBonus')

  // nAttacks checks
  expect(() => {
    new AttackInfo(myDam, 2, null)
  }).toThrow('nAttacks')
  expect(() => {
    new AttackInfo(myDam, 2, -1)
  }).toThrow('nAttacks')
  expect(() => {
    new AttackInfo(myDam, 2, 1.1)
  }).toThrow('nAttacks')
  expect(() => {
    new AttackInfo(myDam, 2, '1')
  }).toThrow('nAttacks')

  // multiple
  expect(() => {
    new AttackInfo(null, 2.1, '1')
  }).toThrow('nAttacks')
  /* eslint-enable no-new */
})

test('Enemy constructor maps expected inputs to properties', () => {
  const myEn = new Enemy(11, null, null, null)
  expect(myEn.ac).toBe(11)
  expect(myEn.resistances).toBe(null)
  expect(myEn.vulnerabilities).toBe(null)
  expect(myEn.saveBonuses).toBe(null)
})

test('Enemy validation throws on bad inputs', () => {
  /* eslint-disable no-new */
  // ac
  expect(() => {
    new Enemy(null, null, null, null)
  }).toThrow('ac should be an integer')
  expect(() => {
    new Enemy(-11, null, null, null)
  }).toThrow('ac should be an integer')
  expect(() => {
    new Enemy(11.1, null, null, null)
  }).toThrow('ac should be an integer')
  expect(() => {
    new Enemy('11', null, null, null)
  }).toThrow('ac should be an integer')

  // resistances
  expect(() => {
    new Enemy(11, ['fire', 'bludgeoning'], null, null) // this ought to pass once implemented
  }).toThrow('Resistances')

  // vulnerabilities
  expect(() => {
    new Enemy(11, null, ['ice', 'slashing'], null) // this ought to pass once implemented
  }).toThrow('Vulnerabilities')

  // saveBonuses
  expect(() => {
    new Enemy(11, null, null, new Map([['dexterity', 3]])) // this ought to pass once implemented
  }).toThrow('Saving')

  // multiple
  expect(() => {
    new Enemy(11, ['fire', 'bludgeoning'], ['ice', 'slashing'], new Map([['dexterity', 3]]))
  }).toThrow('Saving')
  /* eslint-enable no-new */
})

test('Character constructor maps expected inputs to properties', () => {
  const myMain = new AttackInfo(null, 2, 2)
  const myBonus = new AttackInfo(null, 1, 1)
  const myFirst = new Damages('stuff')

  // pass stuff
  const myChar = new Character(myMain, myBonus, myFirst, 19, null)
  expect(myChar.mainAttackInfo).toBe(myMain)
  expect(myChar.bonusAttackInfo).toBe(myBonus)
  expect(myChar.firstAttackAdditional).toBe(myFirst)
  expect(myChar.critThreshold).toBe(19)
  expect(myChar.feats).toBe(null)

  // nulled out stuff
  const myChar2 = new Character(null, null)
  expect(myChar2.mainAttackInfo.attackDamages).toBe(null)
  expect(myChar2.bonusAttackInfo.attackDamages).toBe(null)
  expect(myChar2.firstAttackAdditional).toBe(null)
  expect(myChar2.critThreshold).toBe(20)
  expect(myChar2.feats).toBe(null)
})

test('Character validation throws on bad inputs', () => {
  /* eslint-disable no-new */
  const myMain = new AttackInfo(null, 2, 2)
  const myBonus = new AttackInfo(null, 1, 1)
  const myFirst = new Damages('stuff')
  // main
  expect(() => {
    new Character('something', myBonus, myFirst)
  }).toThrow('mainAttackInfo')
  expect(() => {
    new Character(0, myBonus, myFirst)
  }).toThrow('mainAttackInfo')

  // bonus
  expect(() => {
    new Character(myMain, 'something', myFirst)
  }).toThrow('bonusAttackInfo')
  expect(() => {
    new Character(myMain, 0, myFirst)
  }).toThrow('bonusAttackInfo')

  // firstAttackAdditional
  expect(() => {
    new Character(myMain, myBonus, '2d6')
  }).toThrow('firstAttackAdditional')
  expect(() => {
    new Character(myMain, myBonus, 0)
  }).toThrow('firstAttackAdditional')

  // critThreshold
  expect(() => {
    new Character(null, null, null, null)
  }).toThrow('critThreshold')
  expect(() => {
    new Character(null, null, null, 0)
  }).toThrow('critThreshold')
  expect(() => {
    new Character(null, null, null, 21)
  }).toThrow('critThreshold')
  expect(() => {
    new Character(null, null, null, 11.1)
  }).toThrow('critThreshold')
  expect(() => {
    new Character(null, null, null, '20')
  }).toThrow('critThreshold')

  // Feats
  expect(() => {
    new Character(null, null, null, 20, ['Elven Accuracy']) // this ought to pass once implemented
  }).toThrow('Feats')

  // Multple
  expect(() => {
    new Character(0, 0, 0, 30, ['Elven Accuracy']) // this ought to pass once implemented
  }).toThrow('Feats')
  /* eslint-enable no-new */
})

// test('calculateDPR calls damagePerRound', () => {
//   const myChar = new Character(null, null, null)
//   const myEn = new Enemy(11, null, null, null)
//   const [myDis, myAtk, myAdv] = myChar.calculateDPR(myEn)
//   // mocked to return [1, 1, 1] (should be [0, 0, 0] with these inputs!)
//   // expect(myDis).toBe(1)
//   // expect(myAtk).toBe(1)
//   // expect(myAdv).toBe(1)
//   // check mock calls!
//   expect(damagePerRound).toHaveBeenCalledWith(0, null, 0, 0, null, 0, null, 11, 20)
//   expect(damagePerRound).toHaveBeenCalledTimes(1)
// })
