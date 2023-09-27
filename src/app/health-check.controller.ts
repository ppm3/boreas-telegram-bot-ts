import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller('health-check')
export class HealthCheckController {
 constructor(
    private readonly appService: AppService
 ) {}

 @Get()
 getHealthCheckStatus() {
    return this.appService.getHealthCheck();
 } 
}