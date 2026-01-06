// JSONL logging for raw responses and graded results

import { appendFileSync, mkdirSync } from 'fs'
import type { RawResponse, GradedResult } from './types'

export class Logger {
  private runDir: string

  constructor(runId: string) {
    this.runDir = `results/${runId}`
  }

  async init() {
    mkdirSync(this.runDir, { recursive: true })
  }

  async logRaw(response: RawResponse) {
    const line = JSON.stringify(response) + '\n'
    appendFileSync(`${this.runDir}/raw_responses.jsonl`, line)
  }

  async logGraded(result: GradedResult) {
    const line = JSON.stringify(result) + '\n'
    appendFileSync(`${this.runDir}/graded_results.jsonl`, line)
  }

  async logSummary(summary: object) {
    await Bun.write(
      `${this.runDir}/summary.json`,
      JSON.stringify(summary, null, 2)
    )
  }
}
