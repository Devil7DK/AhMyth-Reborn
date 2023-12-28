import {
    BaseEntity as TypeORMBaseEntity,
    BeforeInsert,
    BeforeUpdate,
    Column,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { type IBaseEntity } from '../../common/interfaces';

export class BaseEntity extends TypeORMBaseEntity implements IBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column('bigint')
    public createdAt!: number;

    @Column('bigint')
    public updatedAt!: number;

    @BeforeInsert()
    public beforeInsert(): void {
        this.createdAt = this.updatedAt = Date.now();
    }

    @BeforeUpdate()
    public beforeUpdate(): void {
        this.updatedAt = Date.now();
    }
}
