export enum BotStateEnum {
  cancel = 'CANCEL',
  nothing = 'NOTHING',
  showHelp = 'SHOW_HELP',
  setDeviceId = 'SET_DEVOCE_ID',
  selectCommand = 'SELECT_COMMAND',
  getActualSoil = 'GET_ACTUAL_SOIL',
  userValidation = 'USER_VALIDATION',
  showMenuAlerts = 'SHOW_MENU_ALERTS',
  showMenuSensors = 'SHOW_MENU_SENSORS',
  registerDeviceId = 'REGISTER_DEVICE_ID',
  showMenuAverages = 'SHOW_MENU_AVERAGES',
  getActualHumidity = 'GET_ACTUAL_HUMIDITY',
  getActualTemperature = 'GET_ACTUAL_TEMPERATURE',
}

export const showMenusStates: string[] = [
  BotStateEnum.showMenuAlerts,
  BotStateEnum.showMenuSensors,
  BotStateEnum.showMenuAverages,
];

export const sensorValuesStates: string[] = [
  BotStateEnum.getActualHumidity,
  BotStateEnum.getActualSoil,
  BotStateEnum.getActualTemperature,
];