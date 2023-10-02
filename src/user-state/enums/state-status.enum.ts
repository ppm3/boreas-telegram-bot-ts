export enum StateStatusEnum {
  sent = 'SENT',
  error = 'ERROR',
  current = 'CURRENT',
  pending = 'PENDING',
  completed = 'COMPLETED',
  transition = 'TRANSITION',
  showOptions = 'SHOW_OPTIONS',
}

export const stateStatus: string[] = [
  StateStatusEnum.current,
  StateStatusEnum.pending,
  StateStatusEnum.error,
];
