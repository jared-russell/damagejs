// separate file to test Character.calculateDPR via async imports
// calculators.damagePerRound needs to be mocked before it's imported because it's an ES module
// using this pattern for all the other tests in characters.test.js would be cluttered and annoying
// so I broke this one out.
// see https://github.com/facebook/jest/issues/12145
import { jest } from '@jest/globals'

jest.unstable_mockModule('./calculators.js', () => ({
  damagePerRound: jest.fn(() => [1, 1, 1])
}))

test('calculateDPR calls damagePerRound', async () => {
  const { Character, Enemy } = await import('./characters.js')
  const { damagePerRound } = await import('./calculators.js')
  const myChar = new Character(null, null, null)
  const myEn = new Enemy(11, null, null, null)
  const [myDis, myAtk, myAdv] = myChar.calculateDPR(myEn)
  // mocked to return [1, 1, 1] (should be [0, 0, 0] with these inputs!)
  expect(myDis).toBe(1)
  expect(myAtk).toBe(1)
  expect(myAdv).toBe(1)
  expect(damagePerRound).toHaveBeenCalledWith(0, null, 0, 0, null, 0, null, 11, 20)
  expect(damagePerRound).toHaveBeenCalledTimes(1)
})
