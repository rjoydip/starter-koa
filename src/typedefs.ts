export default /* GraphQL */ `
type Query {
  health: HealthData
  getUser(id: ID!): User
  getUsers: [User!]!
}

type Mutation {
  createUser(input: UserInput!): User
  updateUser(id: ID!, input: UserInput!): User
  deleteUser(id: ID!): DeleteResponse
}

type HealthData {
  db: Boolean
  cache: Boolean
}

type User {
  id: ID!
  name: String!
  email: String!
  phone: String!
  address: String!
}

input UserInput {
  name: String
  email: String
  phone: String
  address: String
}

type DeleteResponse {
  success: Boolean!
  message: String
}
`
