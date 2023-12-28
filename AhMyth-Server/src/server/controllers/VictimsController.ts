import { Controller, Get } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { type IArrayResponse } from '../../common/interfaces';
import { type VictimEntity } from '../entities';
import { VictimService } from '../services';

@Service()
@Controller('/victims')
export class HelloWorldController {
    @Inject(() => VictimService)
    private readonly victimService!: VictimService;

    @Get('/connected')
    public async listConnected(): Promise<IArrayResponse<VictimEntity>> {
        return {
            message: "Successfully retrieved connected victims' list.",
            data: await this.victimService.listConnected(),
        };
    }
}
