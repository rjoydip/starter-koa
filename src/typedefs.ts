export default /* GraphQL */ `
type Query {
    index: Index
    status: Status
    metrics: Metrics
    health: Health
}

type Index {
    message: String
}

type Status {
    data: StatusData
}

type StatusData {
    status: String
}

type Metrics {
    data: MetricsData
}

type MetricsData {
    memoryUsage: MemoryUsage
    cpuUsage: CpuUsage
    loadAverage: [Float]!
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

type Health {
    data: HealthData
}

type HealthData  {
    db: Boolean
    redis: Boolean
}
`
