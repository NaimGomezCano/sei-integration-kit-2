export type JobHandler = (...args: any[]) => Promise<any> | any

export interface JobDefinition {
  queue: string
  name: string
  handler: JobHandler
}

const registry: JobDefinition[] = []

export function addJob(queue: string, name: string, handler: JobHandler): void {
  registry.push({ queue, name, handler })
}

export function getAllJobs(): JobDefinition[] {
  return [...registry]
}

export function clearJobRegistry(): void {
  registry.length = 0
}
