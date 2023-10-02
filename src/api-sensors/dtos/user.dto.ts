export class userDto {
    id?: string;
    _id: string;
    first_name?: string;
    last_name?: string;
    chat_id?: number;
    language_code?: string;
    username?: string;
    device_id?: string;
    configuration?: {
        alerts?: {
            temperature?: boolean;
            humidity?: boolean;
            sensor_soil?: boolean;
        };
        totalAlerts?: {
            temperature?: number;
            humidity?: number;
            sensor_soil?: number;
        };
    };

}