
export enum CallStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}

export interface TranscriptEntry {
  role: 'agent' | 'user';
  text: string;
}

export interface RetellUpdate {
  transcript: TranscriptEntry[];
}
