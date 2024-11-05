import type { UserInput, UserSelect } from '../src/schema'
import { faker } from '@faker-js/faker/locale/en'

// Destructure frequently used Faker modules for easy access
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
 * Generates a single test user with randomized data.
 *
 * @param {boolean} [isAdmin] - Role is admin.
 * @returns {UserInput} A mock user object with essential details such as name, email, phone, and address.
 */
function testUser(isAdmin: boolean = false): UserInput {
  faker.seed() // Ensure consistent results across tests
  return {
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerified: datatype.boolean(),
    password: internet.password(),
    address: `${location.streetAddress()}, ${location.city()}, ${location.state()}, ${location.zipCode()}, ${location.country()}`,
    role: isAdmin ? 'admin' : 'user', // Default role for testing
  }
}

/**
 * Creates an array of test users with randomized data.
 *
 * @export
 * @param {number} [number_of_users] - The number of users to generate; defaults to 0.
 * @param {boolean} [isAdmin] - Role is admin.
 * @returns {UserInput[]} An array of mock user objects.
 */
export function getTestUsers(number_of_users: number = 0, isAdmin: boolean = false): UserInput[] {
  return Array.from({ length: number_of_users }).map(() => testUser(isAdmin))
}

/**
 * Retrieves a single test user with randomized data.
 *
 * @export
 * @param {boolean} [isAdmin] - Role is admin.
 * @returns {UserInput} A mock user object with essential user details.
 */
export function getTestUser(isAdmin: boolean = false): UserInput {
  return testUser(isAdmin)
}

/**
 * Retrieves a test user with additional selected attributes.
 *
 * @export
 * @param {boolean} [isAdmin] - Role is admin.
 * @returns {UserSelect} A mock user object with selected properties like ID, created/updated timestamps.
 */
export function getSelectedTestUser(isAdmin: boolean = false): UserSelect {
  return {
    id: getUUID(),
    ...testUser(),
    isVerified: true, // Ensures the user is verified
    role: isAdmin ? 'admin' : 'user',
    createdAt: getDate(),
    updatedAt: getDate(),
  }
}

/**
 * Generates a unique identifier (UUID).
 *
 * @export
 * @returns {string} A random UUID string for identification purposes.
 */
export function getUUID(): string {
  return string.uuid()
}

/**
 * Generates a random alphanumeric string, useful for testing names or short identifiers.
 *
 * @export
 * @returns {string} A random alphanumeric string of 5 characters.
 */
export function getName(): string {
  return string.alphanumeric(5)
}

/**
 * Generates a random Date object within a typical timeframe.
 *
 * @export
 * @returns {Date} A random date for use in mock data.
 */
export function getDate(): Date {
  return date.anytime()
}
