export interface Signal {
  signalData: any;
  signalType: 'REQUEST' | 'CANDIDATE' | 'OFFER' | 'ANSWER';
  senderId: string;
}
