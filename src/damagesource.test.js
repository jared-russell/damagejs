import { d6, d8 } from './dice'
import { DamageSource, Damages } from './damagesource'
import { jest } from '@jest/globals'

// mock the d6
jest.mock('./dice')
d6.min = 1
d6.max = 6
d6.avg = 3.5
d6.roll = jest.fn()
d6.roll.mockReturnValue(4)
// mock the d8
d8.min = 1
d8.max = 8
d8.avg = 4.5
d8.roll = jest.fn()
d8.roll.mockReturnValue(5)

test('Result from a fully-defined DamageSource constructor should match inputs', () => {
  const myds = new DamageSource(2, d6, 3, 'fire', false)
  expect(myds.nDice).toBe(2)
  expect(myds.die).toBe(d6)
  expect(myds.modifier).toBe(3)
  expect(myds.min).toBe(5) // 1 + 1 + 3
  expect(myds.max).toBe(15) // 6 + 6 + 3
  expect(myds.avg).toBe(10) // 3.5 + 3.5 + 3
  expect(myds.minCrit).toBe(7) // 1 * 4 + 3
  expect(myds.maxCrit).toBe(27) // 6 * 4 + 3
  expect(myds.avgCrit).toBe(17) // 3.5 * 4 + 3
  expect(myds.damageType).toBe('fire')
  expect(myds.isMagical).toBe(false)
  expect(myds.description()).toBe('2d6 + 3 nonmagical fire damage')
  // check that rolling results are expected given the specified mock
  expect(myds.roll()).toBe(11) // 4 + 4 + 3
  // for a crit
  expect(myds.roll(true)).toBe(19) // 4 * 4 + 3
})

test('Default damage type assumptions should be null/false', () => {
  const myds = new DamageSource(2, d6, 3)
  expect(myds.damageType).toBe(null)
  expect(myds.isMagical).toBe(false)
  expect(myds.description()).toBe('2d6 + 3 nonmagical damage')
})

test('Default physical damage type assumptions should be nonmagical', () => {
  const myds = new DamageSource(2, d6, 3, 'bludgeoning')
  expect(myds.damageType).toBe('bludgeoning')
  expect(myds.isMagical).toBe(false)
  expect(myds.description()).toBe('2d6 + 3 nonmagical bludgeoning damage')
})

test('Default nonphysical damage type assumptions should be magical', () => {
  const myds = new DamageSource(2, d6, 3, 'force')
  expect(myds.damageType).toBe('force')
  expect(myds.isMagical).toBe(true)
  expect(myds.description()).toBe('2d6 + 3 magical force damage')
})

test('Null type magical damage can be specified', () => {
  const myds = new DamageSource(2, d6, 3, null, true)
  expect(myds.damageType).toBe(null)
  expect(myds.isMagical).toBe(true)
  expect(myds.description()).toBe('2d6 + 3 magical damage')
})

test('minimumDamage overrides other inputs', () => {
  const myds = new DamageSource(1, d6, 0, null, null, 42)
  expect(myds.min).toBe(42)
  expect(myds.max).toBe(42)
  expect(myds.avg).toBe(42)
  expect(myds.minCrit).toBe(42)
  expect(myds.maxCrit).toBe(42)
  expect(myds.avgCrit).toBe(42)
})

test('Input validation throws on bad inputs', () => {
  // nDice checks
  /* eslint-disable no-new */
  expect(() => {
    new DamageSource(-1, d6, 3)
  }).toThrow('nDice')
  expect(() => {
    new DamageSource(1.1, d6, 3)
  }).toThrow('nDice')
  expect(() => {
    new DamageSource('1', d6, 3)
  }).toThrow('nDice')
  expect(() => {
    new DamageSource(null, d6, 3)
  }).toThrow('nDice')

  // die tests
  expect(() => {
    new DamageSource(2, 0, 3)
  }).toThrow('dieType')
  expect(() => {
    new DamageSource(2, null, 3)
  }).toThrow('dieType')
  expect(() => {
    new DamageSource(2, 'd6', 3)
  }).toThrow('dieType')

  // modifier tests
  expect(() => {
    new DamageSource(1, d6, 3.1)
  }).toThrow('modifier')
  expect(() => {
    new DamageSource(1, d6, '3')
  }).toThrow('modifier')
  expect(() => {
    new DamageSource(1, d6, null)
  }).toThrow('modifier')

  // Unsupported damage type should throw an error
  expect(() => {
    new DamageSource(2, d6, 3, 'spooky')
  }).toThrow('damageType')
  expect(() => {
    new DamageSource(2, d6, 3, 0)
  }).toThrow('damageType')

  // isMagical should be None or bool
  expect(() => {
    new DamageSource(2, d6, 3, null, 0)
  }).toThrow('isMagical')
  expect(() => {
    new DamageSource(2, d6, 3, null, 'false')
  }).toThrow('isMagical')

  // minimum damage checks
  expect(() => {
    new DamageSource(1, d6, 1, null, null, -1)
  }).toThrow('minimumDamage')
  expect(() => {
    new DamageSource(1, d6, 1, null, null, 1.1)
  }).toThrow('minimumDamage')
  expect(() => {
    new DamageSource(1, d6, 1, null, null, '0')
  }).toThrow('minimumDamage')
  expect(() => {
    new DamageSource(1, d6, 1, null, null, null)
  }).toThrow('minimumDamage')

  // multiple
  expect(() => {
    new DamageSource(-1, 0, 1.1, false, 'hi', null)
  }).toThrow('minimumDamage')

  /* eslint-enable no-new */
})

test('Damages constructor should create it with an empty map', () => {
  const mydm = new Damages('test collection')
  expect(mydm.name).toBe('test collection')
  expect(mydm.sources.size).toBe(0)
  expect(mydm.description()).toBe('Damage collection \'test collection\':\n')

  // with no sources added, all damage methods should return 0
  expect(mydm.min()).toBe(0)
  expect(mydm.min(true)).toBe(0)
  expect(mydm.max()).toBe(0)
  expect(mydm.max(true)).toBe(0)
  expect(mydm.avg()).toBe(0)
  expect(mydm.avg(true)).toBe(0)
  expect(mydm.roll()).toBe(0)
  expect(mydm.roll(true)).toBe(0)
})

test('Test that adding sources results in correct damage math and description', () => {
  const mydm = new Damages('test collection')
  expect(mydm.sources.size).toBe(0)
  let expectedName = 'Damage collection \'test collection\':\n'
  expect(mydm.description()).toBe(expectedName)

  const shortSword = new DamageSource(1, d6, 5, 'piercing', false)
  mydm.addSource('short sword', shortSword)
  expectedName += `  ${shortSword.description()} (short sword)\n`
  expect(mydm.sources.size).toBe(1)
  expect(mydm.description()).toBe(expectedName)

  // damage rolls should match shortSword.
  // don't check for DamageSource-specific implementation here, just that the Damages results
  // are the sum of the sources - in this case, just shortSword
  expect(mydm.min()).toBe(shortSword.min)
  expect(mydm.min(true)).toBe(shortSword.minCrit)
  expect(mydm.max()).toBe(shortSword.max)
  expect(mydm.max(true)).toBe(shortSword.maxCrit)
  expect(mydm.avg()).toBe(shortSword.avg)
  expect(mydm.avg(true)).toBe(shortSword.avgCrit)
  expect(mydm.roll()).toBe(shortSword.roll())
  expect(mydm.roll(true)).toBe(shortSword.roll(true))

  // now add another...
  const greenFlameBlade = new DamageSource(2, d8, 0, 'fire', true)
  mydm.addSource('green flame blade', greenFlameBlade)
  expectedName += `  ${greenFlameBlade.description()} (green flame blade)\n`
  expect(mydm.sources.size).toBe(2)
  expect(mydm.description()).toBe(expectedName)

  // damage rolls should match shortSword + greenFlameBlade
  // don't check for DamageSource-specific implementation here, just that the Damages results
  // are the sum of the sources - in this case, just shortSword + greenFlameBlade
  expect(mydm.min()).toBe(shortSword.min + greenFlameBlade.min)
  expect(mydm.min(true)).toBe(shortSword.minCrit + greenFlameBlade.minCrit)
  expect(mydm.max()).toBe(shortSword.max + greenFlameBlade.max)
  expect(mydm.max(true)).toBe(shortSword.maxCrit + greenFlameBlade.maxCrit)
  expect(mydm.avg()).toBe(shortSword.avg + greenFlameBlade.avg)
  expect(mydm.avg(true)).toBe(shortSword.avgCrit + greenFlameBlade.avgCrit)
  expect(mydm.roll()).toBe(shortSword.roll() + greenFlameBlade.roll())
  expect(mydm.roll(true)).toBe(shortSword.roll(true) + greenFlameBlade.roll(true))
})

test('Damages constructor throws on bad name', () => {
  /* eslint-disable no-new */
  expect(() => {
    new Damages(null)
  }).toThrow('string')
  expect(() => {
    new Damages(0)
  }).toThrow('string')
  /* eslint-enable no-new */
})

test('Damages add and remove methods work with expected inputs', () => {
  const mydm = new Damages('test collection')
  const shortSword = new DamageSource(1, d6, 5, 'piercing', false)
  mydm.addSource('short sword', shortSword)
  expect(mydm.sources.has('short sword')).toBe(true)
  mydm.removeSource('short sword')
  expect(mydm.sources.has('short sword')).toBe(false)
})

test('add and remove methods throw on bad inputs', () => {
  const mydm = new Damages('test collection')
  const shortSword = new DamageSource(1, d6, 5, 'piercing', false)
  // check name type validation
  expect(() => {
    mydm.addSource(null, shortSword)
  }).toThrow('string')
  expect(() => {
    mydm.addSource(0, shortSword)
  }).toThrow('string')
  expect(() => {
    mydm.addSource(false, shortSword)
  }).toThrow('string')
  // check damageSource validation
  expect(() => {
    mydm.addSource('short sword', null)
  }).toThrow('DamageSource')
  expect(() => {
    mydm.addSource('short sword', 'sword')
  }).toThrow('DamageSource')
  expect(() => {
    mydm.addSource('short sword', 0)
  }).toThrow('DamageSource')

  // check name uniqueness validation
  mydm.addSource('short sword', shortSword)
  expect(() => {
    mydm.addSource('short sword', shortSword)
  }).toThrow('unique')

  // check multiple for add
  expect(() => {
    mydm.addSource(null, null)
  }).toThrow('DamageSource')

  // check remove
  expect(() => {
    mydm.removeSource(null)
  }).toThrow('name')
  expect(() => {
    mydm.removeSource(0)
  }).toThrow('name')
  expect(() => {
    mydm.removeSource(false)
  }).toThrow('name')
  expect(() => {
    mydm.removeSource('hello')
  }).toThrow('name')
})
