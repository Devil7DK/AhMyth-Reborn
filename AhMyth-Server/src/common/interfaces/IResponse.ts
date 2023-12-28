export interface IResponse {
    message: string;
}

export interface IObjectResponse<T> extends IResponse {
    data: T;
}

export interface IArrayResponse<T> extends IResponse {
    data: T[];
}

export interface IPaginationResponse<T> extends IArrayResponse<T> {
    total: number;
}
