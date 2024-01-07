import {
    type BindingMethod,
    type PackagingMode,
    type VictimOrder,
} from '../enums';

export interface IGenerateAPKPayload {
    server: string;
    port: number;
    permissions: VictimOrder[];
    packagingMode: PackagingMode;
    bindingMethod: BindingMethod;
}
