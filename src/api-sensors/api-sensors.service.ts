import { Injectable, Logger, RequestMethod } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosHeaders, AxiosRequestConfig, AxiosResponse } from 'axios';
import { JSONObject } from 'src/interfaces/json-interface';
import { Observable, firstValueFrom } from 'rxjs';
import { userDto } from './dtos/user.dto';

@Injectable()
export class ApiSensorsService {
    private headers: AxiosHeaders;
    private logger = new Logger(ApiSensorsService.name);
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.headers = new AxiosHeaders(
            {
                'Content-Type': 'application/json',
                'v': configService.get('api.version'),
                'X-Api-Key': configService.get('api.xapi'),
            });
    }

    private async makeRequest<T = any>(service: Observable<AxiosResponse<T>>): Promise<any> {
        return await firstValueFrom(service);
    }

    async isAlive(): Promise<boolean> {
        try {
            const resp: JSONObject | any = await this.makeRequest(
                this.httpService.get(`${this.configService.get('api.url')}/healthcheck`)
            );
            return (Object.keys(resp).includes('uptime'));
        } catch (err) {
            throw new Error(`Unable to request information: ${err.message}`);
        }
    }

    async createUser(newUser: CreateUserDto) {
        try {
            this.logger.debug(`${this.configService.get('api.url')}/users`);
            const axioConfig: AxiosRequestConfig = {
                method: 'POST',
                url: `${this.configService.get('api.url')}/users`,
                headers: this.headers,
                data: JSON.stringify(newUser),
            }
            const resp  = await this.makeRequest(
                this.httpService.request(axioConfig)
            );

            const { data } = resp;

            return data as userDto;
        } catch (err) {
            throw new Error(`Unable to request information: ${err.message}`);
        }
    }

    async getUserByChatId(chatId: number): Promise<userDto> {
        try {
            const axioConfig: AxiosRequestConfig = {
                method: 'GET',
                url: `${this.configService.get('api.url')}/users/chat/${chatId}`,
                headers: this.headers,
            }
            const resp  = await this.makeRequest(
                this.httpService.request(axioConfig)
            );

            const { data } = resp;

            return data as userDto;
        } catch (err) {
            throw new Error(`Unable to request information: ${err.message}`);
        }

    }

    async updateUserDeviceId(ids: { user: string, chat: number, device: string }): Promise<userDto> {
        try {
            const axioConfig: AxiosRequestConfig = {
                method: 'PUT',
                url: `${this.configService.get('api.url')}/users/${ids.user}/chat/${ids.chat}/device/${ids.device}`,
                headers: this.headers,
            }
            const resp  = await this.makeRequest(
                this.httpService.request(axioConfig)
            );

            const { data } = resp;

            return data as userDto;
        } catch (err) {
            throw new Error(`Unable to request information: ${err.message}`);
        }
    }

    async getSensorValue(deviceId: string, sensor: string): Promise<number> {
        try {
            this.logger.debug(`${this.configService.get('api.url')}/records/${sensor.toLocaleLowerCase()}/device/${deviceId}`);
            const axioConfig: AxiosRequestConfig = {
                method: 'GET',
                url: `${this.configService.get('api.url')}/records/${sensor.toLocaleLowerCase()}/device/${deviceId}`,
                headers: this.headers,
            }
            const resp  = await this.makeRequest(
                this.httpService.request(axioConfig)
            );

            const { data } = resp;

            if (!Object.keys(data).includes('value')) {
                return -1;
            }

            return data.value;
        } catch (err) {
            throw new Error(`Unable to request information: ${err.message}`);
        }
    }

    async getSoilSensorValues(deviceId: string): Promise<JSONObject> {
        try {
            this.logger.debug(`${this.configService.get('api.url')}/records/soil/device/${deviceId}`);
            const axioConfig: AxiosRequestConfig = {
                method: 'GET',
                url: `${this.configService.get('api.url')}/records/soil/device/${deviceId}`,
                headers: this.headers,
            }
            const resp  = await this.makeRequest(
                this.httpService.request(axioConfig)
            );

            const { data } = resp;

            if (!Object.keys(data)) {
                return {};
            }

            return data;
        } catch (err) {
            throw new Error(`Unable to request information: ${err.message}`);
        }
    }

    
}
