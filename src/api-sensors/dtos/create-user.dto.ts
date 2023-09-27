export class CreateUserDto {
  readonly first_name: string;
  readonly last_name: string;
  readonly chat_id: number;
  readonly language_code: string;
  readonly username: string;
  device_id: string;
  configuration?: {
    alerts?: {
      temperature: boolean;
      humidity: boolean;
      sensor_soil: boolean;
    };
    totalAlerts?: {
      temperature: number;
      humidity: number;
      sensor_soil: number;
    };
  };
}
