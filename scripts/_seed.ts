import type { UserInput, UserSelect } from '../src/schema'
import { faker } from '@faker-js/faker/locale/en'

/**
 * Description placeholder
 *
 * @type {*}
 */
const {
  person,
  internet,
  phone,
  datatype,
  location,
  string,
  date,
} = faker

/**
 * Description placeholder
 *
 * @returns {UserInput} User details
 */
function testUser(): UserInput {
  faker.seed()
  return {
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerified: datatype.boolean(),
    password: internet.password(),
    address: `${location.streetAddress()}, ${location.city()}, ${location.state()}, ${location.zipCode()}, ${location.country()}`,
    role: 'admin',
  }
}

/**
 * Description placeholder
 *
 * @export
 * @param {number} [number_of_users]
 * @returns {UserInput[]} User details
 */
export function getTestUsers(number_of_users: number = 0): UserInput[] {
  return Array.from({ length: number_of_users }).map(() => testUser())
}

/**
 * Description placeholder
 *
 * @export
 * @returns {UserInput} User details
 */
export function getTestUser(): UserInput {
  return testUser()
}

/**
 * Description placeholder
 *
 * @export
 * @returns {UserSelect} Selected user details
 */
export function getSelectedTestUser(): UserSelect {
  return {
    id: getUUID(),
    ...testUser(),
    isVerified: true,
    role: 'admin',
    createdAt: getDate(),
    updatedAt: getDate(),
  }
}

/**
 * Description placeholder
 *
 * @export
 * @returns {string} UUID
 */
export function getUUID(): string {
  return string.uuid()
}

/**
 * Description placeholder
 *
 * @export
 * @returns {string}
 */
export function getName(): string {
  return string.alphanumeric(5)
}

/**
 * Description placeholder
 *
 * @export
 * @returns {Date} Get Date
 */
export function getDate(): Date {
  return date.anytime()
}
