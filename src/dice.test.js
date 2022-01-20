import { jest } from '@jest/globals'
import { Die, d0, d2, d3, d4, d6, d8, d10, d12, d20, d100 } from './dice'

// restore global.Math.random after we mock it in tests of roll
afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore()
})

test('Constructor maps inputs correctly', () => {
  const d7 = new Die(7)
  expect(d7.min).toBe(1)
  expect(d7.max).toBe(7)
  expect(d7.avg).toBe(4)
})

test('Standard dice averages are as expected', () => {
  expect(d0.avg).toBe(0)
  expect(d2.avg).toBe(1.5)
  expect(d3.avg).toBe(2)
  expect(d4.avg).toBe(2.5)
  expect(d6.avg).toBe(3.5)
  expect(d8.avg).toBe(4.5)
  expect(d10.avg).toBe(5.5)
  expect(d12.avg).toBe(6.5)
  expect(d20.avg).toBe(10.5)
  expect(d100.avg).toBe(50.5)
})

test('Roll method performs expected behavior', () => {
  // use a d10 for convenience

  // this should round down to a roll of 1
  jest.spyOn(global.Math, 'random').mockReturnValue(0.001)
  expect(d10.roll()).toBe(1)

  // this should still round down to a roll of 1
  jest.spyOn(global.Math, 'random').mockReturnValue(0.099)
  expect(d10.roll()).toBe(1)

  // this should round to a roll of 2
  jest.spyOn(global.Math, 'random').mockReturnValue(0.1)
  expect(d10.roll()).toBe(2)

  // this should still round to a roll of 2
  jest.spyOn(global.Math, 'random').mockReturnValue(0.199)
  expect(d10.roll()).toBe(2)

  // this should round to a roll of 10
  jest.spyOn(global.Math, 'random').mockReturnValue(0.9)
  expect(d10.roll()).toBe(10)

  // this should still round to a roll of 10
  jest.spyOn(global.Math, 'random').mockReturnValue(0.9999)
  expect(d10.roll()).toBe(10)
})

test('Input validation throws on bad inputs', () => {
  /* eslint-disable no-new */
  expect(() => {
    new Die(-1)
  }).toThrow('sides should be an integer >= 0')
  expect(() => {
    new Die(1.1)
  }).toThrow('sides should be an integer >= 0')
  expect(() => {
    new Die('1')
  }).toThrow('sides should be an integer >= 0')
  expect(() => {
    new Die(null)
  }).toThrow('sides should be an integer >= 0')
  /* eslint-enable no-new */
})
