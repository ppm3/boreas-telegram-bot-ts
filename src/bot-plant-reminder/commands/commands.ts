import { BotStateEnum } from "src/user-state/enums/bot-states.enum";

interface Commands {
    command: string;
    description: string;
}

interface ICommandState {
    command: string;
    state: string;
}

export const commandsMenu: Commands[] = [
    { command: 'inicio', description: 'Iniciar interacción con el bot' },
    { command: 'alertas', description: 'Modificar la configuración de las alertas' },
    { command: 'sensores', description: 'Obtener información en tiempo real' },
    { command: 'promedios', description: 'Muestra el promedio de los sensores (últimos 5 días)' },
    { command: 'ayuda', description: 'Commandos disponibles' },
    { command: 'cancel', description: 'Cancel conversación' },
];

export const commandStates:  ICommandState[] = [
    { command: 'cancel', state: BotStateEnum.cancel },
    { command: 'ayuda', state: BotStateEnum.showHelp },
    { command: 'start', state: BotStateEnum.userValidation },
    { command: 'inicio', state: BotStateEnum.userValidation },
    { command: 'alertas', state: BotStateEnum.showMenuAlerts },
    { command: 'sensores', state: BotStateEnum.showMenuSensors },
    { command: 'promedios', state: BotStateEnum.showMenuAverages },

];