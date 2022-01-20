import { damagePerHit, damagePerRound, exportedForTesting } from './calculators'

const { probabilityToHit, probabilityToCrit, probabilityToNotSave, probabilityOneHit, firstHitAdditionalDamage } = exportedForTesting

// decimal places to check for floating point probabilities
const places = 6

test('Probability to hit with an AC of 11 and no modifier should be 50%', () => {
  const [pDis, pNorm, pAdv] = probabilityToHit(11, 0)
  expect(pDis).toBeCloseTo(0.25, places)
  expect(pNorm).toBeCloseTo(0.5, places)
  expect(pAdv).toBeCloseTo(0.75, places)
})

// should be the same as above
test('Probability to hit with an AC of 13 and +2 modifier should be 50%', () => {
  const [pDis, pNorm, pAdv] = probabilityToHit(13, 2)
  expect(pDis).toBeCloseTo(0.25, places)
  expect(pNorm).toBeCloseTo(0.5, places)
  expect(pAdv).toBeCloseTo(0.75, places)
})

test('Critical hit should be 5% chance normally', () => {
  const [pDis, pNorm, pAdv] = probabilityToCrit()
  expect(pDis).toBeCloseTo(0.0025, places)
  expect(pNorm).toBeCloseTo(0.05, places)
  expect(pAdv).toBeCloseTo(0.0975, places)
})

test('Critical hit chance should increase by 5% as threshold drops by 1', () => {
  const [pDis, pNorm, pAdv] = probabilityToCrit(19)
  expect(pDis).toBeCloseTo(0.01, places)
  expect(pNorm).toBeCloseTo(0.1, places)
  expect(pAdv).toBeCloseTo(0.19, places)
})

// for this case advantage/disadvantage vs to hit should be the inverse of ToHit for the same arguments
test('Probability to not save a DC 11 and no modifier should be 50%', () => {
  const [pDis, pNorm, pAdv] = probabilityToNotSave(11, 0)
  expect(pDis).toBeCloseTo(0.75, places)
  expect(pNorm).toBeCloseTo(0.5, places)
  expect(pAdv).toBeCloseTo(0.25, places)
})

test('Probability to not save a DC 13 with a +2 modifier should be 50%', () => {
  const [pDis, pNorm, pAdv] = probabilityToNotSave(13, 2)
  expect(pDis).toBeCloseTo(0.75, places)
  expect(pNorm).toBeCloseTo(0.5, places)
  expect(pAdv).toBeCloseTo(0.25, places)
})

test('Damage per Hit calcs track with damage and probability', () => {
  // make a dummy Damages object with avg that returns 10 damage normally and 15 on a crit
  const myDamages = { avg: function (crit) { return crit ? 15 : 10 } }
  // pick some settings that make the math easier by hand
  const [dDis, dNorm, dAdv] = damagePerHit(11, 0, myDamages, 19)
  // (0.25 - 0.01) * 10 + 0.01 * 15 = 2.4 + 0.15 = 2.55
  expect(dDis).toBeCloseTo(2.55, places)
  // (0.5 - 0.1) * 10 + 0.1 * 15 = 4 + 1.5 = 5.5
  expect(dNorm).toBeCloseTo(5.5, places)
  // (0.75 - 0.19) * 10 + 0.19 * 15 = 5.6 + 2.85 = 8.45
  expect(dAdv).toBeCloseTo(8.45, places)
})

test('Damage per Round for 1 hit is Damage per Hit', () => {
  // make a dummy Damages object with avg that returns 10 damage normally and 15 on a crit
  const myDamages = { avg: function (crit) { return crit ? 15 : 10 } }
  // pick the same setting as above
  // for one attack DPR = DPH
  const [dDis, dNorm, dAdv] = damagePerRound(0, myDamages, 1, 0, null, 0, null, 11, 19)
  // (0.25 - 0.01) * 10 + 0.01 * 15 = 2.4 + 0.15 = 2.55
  expect(dDis).toBeCloseTo(2.55, places)
  // (0.5 - 0.1) * 10 + 0.1 * 15 = 4 + 1.5 = 5.5
  expect(dNorm).toBeCloseTo(5.5, places)
  // (0.75 - 0.19) * 10 + 0.19 * 15 = 5.6 + 2.85 = 8.45
  expect(dAdv).toBeCloseTo(8.45, places)
})

test('Damage per Round maps nAttacks to attack average', () => {
  // make a dummy Damages object with avg that returns 10 damage normally and 15 on a crit
  const myDamages = { avg: function (crit) { return crit ? 15 : 10 } }
  // pick the same setting as above
  // for two attacks DPR = 2 * DPH
  const [dDis, dNorm, dAdv] = damagePerRound(0, myDamages, 2, 0, null, 0, null, 11, 19)
  // (0.25 - 0.01) * 10 + 0.01 * 15 = 2.4 + 0.15 = 2.55 ... 2.55 * 2 = 5.1
  expect(dDis).toBeCloseTo(5.1, places)
  // (0.5 - 0.1) * 10 + 0.1 * 15 = 4 + 1.5 = 5.5 ... 5.5 * 2 = 11
  expect(dNorm).toBeCloseTo(11.0, places)
  // (0.75 - 0.19) * 10 + 0.19 * 15 = 5.6 + 2.85 = 8.45 ... 8.45 * 2 = 16.9
  expect(dAdv).toBeCloseTo(16.9, places)
})

// get branch coverage up by using default critThreshold
test('Damage per Round/Hit calcs track with damage and probability for default critThreshold', () => {
  // make a dummy Damages object with avg that returns 10 damage normally and 20 on a crit
  const myDamages = { avg: function (crit) { return crit ? 20 : 10 } }
  // pick some settings that make the math easier by hand
  const [dDis, dNorm, dAdv] = damagePerHit(11, 0, myDamages)
  // (0.25 - 0.0025) * 10 + 0.0025 * 20 = 2.475 + 0.05 = 2.525
  expect(dDis).toBeCloseTo(2.525, places)
  // (0.5 - 0.05) * 10 + 0.05 * 20 = 4.5 + 1 = 5.5
  expect(dNorm).toBeCloseTo(5.5, places)
  // (0.75 - 0.0975) * 10 + 0.0975 * 20 = 6.525 + 1.95 = 8.475
  expect(dAdv).toBeCloseTo(8.475, places)

  // twice the above
  const [drDis, drNorm, drAdv] = damagePerRound(0, myDamages, 2, 0, null, 0, null, 11)
  expect(drDis).toBeCloseTo(5.05, places)
  expect(drNorm).toBeCloseTo(11, places)
  expect(drAdv).toBeCloseTo(16.95, places)
})

test('Test that an equivalent bonus attack is the same as a main attack for DPR', () => {
  // make a dummy Damages object with avg that returns 10 damage normally and 20 on a crit
  const myDamages = { avg: function (crit) { return crit ? 20 : 10 } }
  // swap main damage for bonus damage for the above
  // pick some settings that make the math easier by hand (see default crit threshold test above)
  const [drDis, drNorm, drAdv] = damagePerRound(0, null, 0, 0, myDamages, 2, null, 11)
  expect(drDis).toBeCloseTo(5.05, places)
  expect(drNorm).toBeCloseTo(11, places)
  expect(drAdv).toBeCloseTo(16.95, places)
})

// confirm probabilityOneHit math
test('Test that probabilityOneHit does math consistently for disadvantage/normal/advantage', () => {
  expect(probabilityOneHit(0.5, 2)).toBeCloseTo(0.75, places)

  // check that 0 probability to hit means 0 chance of hitting once
  expect(probabilityOneHit(0, 2)).toBeCloseTo(0, places)
})

// check firstHitAdditionalDamage math
test('Test that firstHitAdditionalDamage calculations return expected results', () => {
  // simplest pathological case - p and b are 0, no chance to hit -> no damage
  expect(firstHitAdditionalDamage(10, 4, 0, 0, 1, 2, 1)).toBe(0)

  // with only main _or_ bonus damage, results are the same if damages/attacks are
  expect(firstHitAdditionalDamage(10, 4, 0, 0.5, 0.1, 2, 2)).toBeCloseTo(8.1, places)
  expect(firstHitAdditionalDamage(10, 4, 0.5, 0, 0.1, 2, 2)).toBeCloseTo(8.1, places)

  // with both main and bonus damage and same to-hit, attacks are cumulative (1 of each the same as 2 of either)
  expect(firstHitAdditionalDamage(10, 4, 0.5, 0.5, 0.1, 1, 1)).toBeCloseTo(8.1, places)
})

test('Test that firstHitAdditionalDamage adds to main damage', () => {
  const myDamages = { avg: function (crit) { return crit ? 15 : 10 } }
  const myFirstDamages = { avg: function (crit) { return crit ? 14 : 10 } }

  const myDpr = damagePerRound(0, myDamages, 2, 0, null, 0, myFirstDamages, 11, 19)

  // 8.1 from test results above
  // (0.5 - 0.1) * 10 + 0.1 * 15 + (8.1) = (4 + 1.5) * 2 + (8.1) = (5.5 * 2) + (8.1)
  expect(myDpr[1]).toBeCloseTo(19.1, places)
})
