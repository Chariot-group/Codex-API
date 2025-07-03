import { Injectable } from "@nestjs/common";

@Injectable()
export class MonstersService {
  findAll() {
    return `This action returns all monsters`;
  }

  findOne(id: number) {
    return `This action returns a #${id} monster`;
  }
}
