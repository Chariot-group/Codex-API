export interface IResponse<T> {
    message : string,
    data: T
}

export interface IPaginatedResponse<T> extends IResponse<T> {
    pagination: {
        page: number,
        offset: number,
        totalItems: number
    }
}