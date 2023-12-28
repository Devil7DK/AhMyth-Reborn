import { Inject, Service } from 'typedi';
import { DataSource, type Repository } from 'typeorm';

import { VictimStatus } from '../../common/enums';
import { VictimEntity } from '../entities';

@Service()
export class VictimService {
    private readonly repository: Repository<VictimEntity>;

    public constructor(@Inject() private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(VictimEntity);
    }

    public async addOrUpdate(
        deviceId: string,
        ip: string,
        port: number,
        country: string,
        manf: string,
        model: string,
        release: string,
    ): Promise<VictimEntity> {
        const victim =
            (await this.repository.findOne({ where: { deviceId } })) ??
            this.repository.create();

        victim.deviceId = deviceId;
        victim.ip = ip;
        victim.port = port;
        victim.country = country;
        victim.manf = manf;
        victim.model = model;
        victim.release = release;
        victim.status = VictimStatus.CONNECTED;

        return await this.dataSource.getRepository(VictimEntity).save(victim);
    }

    public async updateStatus(
        deviceId: string,
        status: VictimStatus,
    ): Promise<VictimEntity> {
        const victim = await this.repository.findOne({ where: { deviceId } });

        if (victim === null) {
            throw new Error('Victim not found!');
        }

        victim.status = status;

        return await this.repository.save(victim);
    }

    public async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    public async findByDeviceId(
        deviceId: string,
    ): Promise<VictimEntity | null> {
        return await this.repository.findOne({ where: { deviceId } });
    }

    public async listConnected(): Promise<VictimEntity[]> {
        return await this.repository.find({
            where: { status: VictimStatus.CONNECTED },
        });
    }

    public async list(
        pageNumber: number,
        pageSize: number,
    ): Promise<VictimEntity[]> {
        return await this.repository.find({
            skip: pageNumber * pageSize,
            take: pageSize,
        });
    }
}
