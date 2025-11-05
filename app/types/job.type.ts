export enum JobStatus {
  Restart = 'restart',
  Start = 'start',
}

export interface RestartJobPayload {
  id: string;
  status: JobStatus;
}
