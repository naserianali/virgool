import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from './dto/update-category.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {CategoryEntity} from "./entities/category.entity";
import {Repository} from "typeorm";
import {PaginationDto} from "../../common/dto/pagination.dto";
import {Pagination, PaginationGenerator} from "../../common/untils/pagination";

@Injectable()
export class CategoryService {
    constructor(@InjectRepository(CategoryEntity) private categoryRepository: Repository<CategoryEntity>) {
    }

    async create(createCategoryDto: CreateCategoryDto) {
        let {title, priority} = createCategoryDto;
        title = await this.checkIfTitleExists(title)
        const category = this.categoryRepository.create({
            title,
            priority,
        });
        await this.categoryRepository.save(category);
        return {
            message: 'Category created',
        }
    }

    async insetByTitle(title: string) {
        const category = this.categoryRepository.create({
            title,
            priority: null,
        });
        return await this.categoryRepository.save(category);
    }

    async checkIfTitleExists(title: string) {
        title = title.trim().toLowerCase();
        const category = await this.categoryRepository.findOneBy({title});
        if (category) throw new BadRequestException("category already exists");
        return title;
    }

    async findAll(paginationDto: PaginationDto) {
        /*console.log(paginationDto);*/
        const {page, perPage, skip} = Pagination(paginationDto);
        const [categories, count] = await this.categoryRepository.findAndCount({
            where: {},
            skip,
            take: perPage,
        });
        return {
            pagination: PaginationGenerator(count, page, perPage),
            categories
        }
    }

    async findOne(id: string) {
        const category = await this.categoryRepository.findOneBy({id});
        if (!category) throw new NotFoundException("category not found");
        return category;
    }

    async findOneByTitle(title: string) {
        return await this.categoryRepository.findOneBy({title});
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        const {title, priority} = updateCategoryDto;
        const category = await this.findOne(id);
        if (title) category.title = title;
        if (priority) category.priority = priority;
        await this.categoryRepository.save(category);
        return {
            message: 'Category updated',
        }
    }

    async remove(id: string) {
        const category = await this.findOne(id);
        await this.categoryRepository.remove(category);
        return {
            message: "Category deleted",
        }
    }
}
