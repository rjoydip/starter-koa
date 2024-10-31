export default /* GraphQL */ `
type Query {
  welcome: Message
  status: StatusData
  _metrics: MetricsData
  _meta: MetaData
  health: HealthData
  getUser(id: ID!): User
  getUsers: [User!]!
}

type Mutation {
  createUser(input: UserInput!): User
  updateUser(id: ID!, input: UserInput!): User
  deleteUser(id: ID!): User
}

type Message {
  message: String
}

type StatusData {
  status: String
}

type MetricsData {
  memoryUsage: MemoryUsage
  loadAverage: [Float!]!
}

type MetaData {
  description: String
  name: String
  license: String
  version: String
}

type CpuUsage {
  user: Float
  system: Float
}

type MemoryUsage {
  rss: Float
  heapTotal: Float
  heapUsed: Float
  external: Float
  arrayBuffers: Float
}

type HealthData {
  db: Boolean
  cache: Boolean
}

type User {
  _id: ID!
  name: String!
  email: String!
  phone: String!
  address: String!
}

input UserInput {
  name: String!
  email: String!
  phone: String!
  address: String!
}
`
