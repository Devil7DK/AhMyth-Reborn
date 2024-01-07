import { Service } from 'typedi';

import { VictimStatus } from '../../common/enums';
import { type IVictimModel } from '../../common/interfaces';
import { VictimModel } from '../database';

@Service()
export class VictimService {
    public async addOrUpdate(
        deviceId: string,
        ip: string,
        port: number,
        country: string,
        manf: string,
        model: string,
        release: string,
    ): Promise<VictimModel> {
        const values: Omit<IVictimModel, 'id' | 'createdAt' | 'updatedAt'> = {
            deviceId,
            ip,
            port,
            country,
            manf,
            model,
            release,
            status: VictimStatus.CONNECTED,
        };

        let victim = await VictimModel.findOne({ where: { deviceId } });

        if (victim === null) {
            victim = await VictimModel.create(values);
        } else {
            await VictimModel.update(values, { where: { deviceId } });
        }

        return victim;
    }

    public async updateStatus(
        deviceId: string,
        status: VictimStatus,
    ): Promise<VictimModel> {
        const victim = await VictimModel.findOne({ where: { deviceId } });

        if (victim === null) {
            throw new Error('Victim not found!');
        }

        victim.status = status;

        return await victim.save();
    }

    public async delete(id: number): Promise<void> {
        await VictimModel.destroy({ where: { id } });
    }

    public async findByDeviceId(deviceId: string): Promise<VictimModel | null> {
        return await VictimModel.findOne({ where: { deviceId } });
    }

    public async listConnected(): Promise<VictimModel[]> {
        return await VictimModel.findAll({
            where: { status: VictimStatus.CONNECTED },
        });
    }
}
