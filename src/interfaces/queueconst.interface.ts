export interface QueueConstType {
    queue_name: {
        deeplink: string
    },
    worker: {
        max_concurrency: number
    }
}