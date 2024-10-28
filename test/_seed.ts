import type { UserInput } from '../src/schema'
import { faker } from '@faker-js/faker/locale/en'

const {
  person,
  internet,
  phone,
  datatype,
  location,
  string,
  date,
} = faker

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

export function getTestUsers(number_of_users: number = 0): UserInput[] {
  return Array.from({ length: number_of_users }).map(() => {
    return testUser()
  })
}
export function getTestUser(): UserInput {
  return testUser()
}

export function getUUID(): string {
  return string.uuid()
}

export function getName(): string {
  return string.alphanumeric(5)
}

export function getDate(): Date {
  return date.anytime()
}
