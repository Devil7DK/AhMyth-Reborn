import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { PayloadLogStatus } from '../../common/enums';
import { type IPayloadLogEntity } from '../../common/interfaces';
import { BaseEntity } from './BaseEntity';
import { PayloadEntity } from './PayloadEntity';

@Entity('payload_logs')
export class PayloadLogEntity extends BaseEntity implements IPayloadLogEntity {
    @Column()
    public status!: PayloadLogStatus;

    @Column()
    public message!: string;

    @Column({ nullable: true })
    public error?: string;

    @Column()
    public payloadId!: string;

    @JoinColumn({ name: 'payloadId' })
    @ManyToOne(() => PayloadEntity, (payload) => payload.logs)
    public payload?: PayloadEntity;

    public constructor();
    public constructor(message: string, payload: PayloadEntity);
    public constructor(message?: string, payload?: PayloadEntity) {
        super();

        if (message && payload) {
            this.status = PayloadLogStatus.INPROGRESS;
            this.message = message;
            this.payloadId = payload.id;
        }
    }
}
