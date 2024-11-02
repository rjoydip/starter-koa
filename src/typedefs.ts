export default /* GraphQL */ `
type Query {
  getUser(id: ID!): User
  getUsers: [User!]!
}

type Mutation {
  createUser(input: UserInput!): User
  updateUser(id: ID!, input: UserInput!): User
  deleteUser(id: ID!): User
}

type User {
  id: ID!
  name: String!
  email: String!
  phone: String!
  address: String!
  role: String!
  is_verified: Boolean!
  created_at: String!
  updated_at: String!
}

input UserInput {
  name: String
  email: String
  phone: String
  address: String
  password: String
  role: String
  isVerified: Boolean!
}

type DeleteResponse {
  success: Boolean!
  message: String
}
`
