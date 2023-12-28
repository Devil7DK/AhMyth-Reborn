import { Column, Entity } from 'typeorm';

import { VictimStatus } from '../../common/enums';
import { type IVictim } from '../../common/interfaces';
import { BaseEntity } from './BaseEntity';

@Entity('victims')
export class VictimEntity extends BaseEntity implements IVictim {
    @Column({ unique: true })
    public deviceId!: string;

    @Column()
    public ip!: string;

    @Column()
    public port!: number;

    @Column()
    public country!: string;

    @Column()
    public manf!: string;

    @Column()
    public model!: string;

    @Column()
    public release!: string;

    @Column('simple-enum', {
        enum: VictimStatus,
        default: VictimStatus.DISCONNECTED,
    })
    public status!: VictimStatus;
}
