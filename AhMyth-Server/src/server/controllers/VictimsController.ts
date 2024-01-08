import { Controller, Get } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { type IArrayResponse } from '../../common/interfaces';
import { type VictimModel } from '../database';
import { VictimService } from '../services';

@Service()
@Controller('/victims')
export class HelloWorldController {
    @Inject(() => VictimService)
    private readonly victimService!: VictimService;

    @Get('/connected')
    public async listConnected(): Promise<IArrayResponse<VictimModel>> {
        const victims = await this.victimService.listConnected();

        return {
            message: "Successfully retrieved connected victims' list.",
            data: victims.map((victim) => victim.toJSON()),
        };
    }
}
