/**
 * Dice module. Specifies the class for a Die and exports constants for standard dice.
 * @module src/dice
 */

/**
 * Class representing a basic die.
 * Specifies the minimum, maximum, and average roll values.
 * Includes a method for randomized roll just because
 */
export class Die {
  /**
   * Create a die.
   * @param {number} sides number of sides for the die
  */
  constructor (sides) {
    // validate sides up front
    if (!Number.isInteger(sides) || sides < 0) {
      throw new Error('sides should be an integer >= 0!')
    }
    /**
     * Minimum value the die can roll, 1 unless sides is 0
     * @type {number}
     * @public
     */
    this.min = Math.min(1, sides)
    /**
     * Maximum value the die can roll, which is the number of sides
     * @type {number}
     * @public
     */
    this.max = sides
    /**
     * Average result of a die roll, the average of the minimum and maximum
     * @type {number}
     * @public
     */
    this.avg = (this.max + this.min) / 2
  }

  /**
   * Do a randomized die roll, and get the rolled value
   * @returns {number} the roll result
   */
  roll () {
    return this.min + Math.floor(Math.random() * this.max)
  }
}

// create some standard dice to use
/** @constant {Die} d100 100-sided die */
export const d100 = new Die(100)
/** @constant {Die} d20 20-sided die */
export const d20 = new Die(20)
/** @constant {Die} d12 12-sided die */
export const d12 = new Die(12)
/** @constant {Die} d10 10-sided die */
export const d10 = new Die(10)
/** @constant {Die} d8 8-sided die */
export const d8 = new Die(8)
/** @constant {Die} d6 6-sided die */
export const d6 = new Die(6)
/** @constant {Die} d4 4-sided die */
export const d4 = new Die(4)
/** @constant {Die} d3 3-sided die */
export const d3 = new Die(3)
/** @constant {Die} d2 2-sided die */
export const d2 = new Die(2)
/** @constant {Die} d0 0-sided die (use for flat damage) */
export const d0 = new Die(0)

// module.exports = {
//     d100: d100
//     d20: d20
// }

// demo
// if (require.main === module) {
// console.log('d8 - avg: ' + d8.avg)
// for (let i = 1 i<=10 i++){
//     console.log('roll ' + i + ': ' + d8.roll())
// }
// }
