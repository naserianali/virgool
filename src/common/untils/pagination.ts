import {PaginationDto} from "../dto/pagination.dto";

export function Pagination(paginationDto: PaginationDto) {
    let {perPage = 10, page = 1} = paginationDto;
    if (!page || page <= 0) page = 1;
    else page -= 1;
    if (!perPage || perPage <= 0) perPage = 10;
    let skip = page * perPage;
    return {
        page: page === 0 ? 1 : page,
        perPage: perPage,
        skip: skip,
    }
}

export function PaginationGenerator(count: number = 0, page: number = 0, perPage: number = 0) {
    return {
        totalCount: count,
        page: +page,
        perPage: +perPage,
        pageCount: Math.ceil(count / perPage),
    }
}