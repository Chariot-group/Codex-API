import { Test, TestingModule } from "@nestjs/testing";
import { SpellsController } from "./spells.controller";
import { SpellsService } from "./spells.service";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { PaginationSpell } from "./dtos/find-all.dto";
import { CreateSpellDto } from "./dtos/create-spell.dto";
import { UpdateSpellDto } from "./dtos/update-spell.dto";

describe("SpellsController", () => {
  let controller: SpellsController;
  let service: SpellsService;

  const id = new Types.ObjectId();

  const mockSpell = {
    _id: id,
    name: "Fireball",
    translations: new Map([
      ["en", { name: "Fireball", srd: false }],
      ["fr", { name: "Boule de feu", srd: false }],
    ]),
  };

  const mockSpellSRD = {
    _id: id,
    name: "Fireball",
    translations: new Map([["en", { name: "Fireball", srd: true }]]),
  };

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpellsController],
      providers: [{ provide: SpellsService, useValue: mockService }],
    }).compile();

    controller = module.get<SpellsController>(SpellsController);
    service = module.get<SpellsService>(SpellsService);
  });

  // -------------------------------------------------------------
  // findAll
  // -------------------------------------------------------------
  describe("findAll", () => {
    it("should return paginated spells", async () => {
      const query: PaginationSpell = { page: 1, offset: 20 };
      mockService.findAll.mockResolvedValue({ data: [mockSpell] });

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [mockSpell] });
    });
  });

  // -------------------------------------------------------------
  // findOne
  // -------------------------------------------------------------
  describe("findOne", () => {
    it("should return a spell with default lang", async () => {
      mockService.findOne.mockResolvedValue({ data: mockSpell });

      const result = await controller.findOne(id as any, {});

      expect(service.findOne).toHaveBeenCalledWith(id, "en");
      expect(result).toEqual({ data: mockSpell });
    });

    it("should return a spell with provided lang", async () => {
      mockService.findOne.mockResolvedValue({ data: mockSpell });

      const result = await controller.findOne(id as any, { lang: "fr" });

      expect(service.findOne).toHaveBeenCalledWith(id, "fr");
      expect(result).toEqual({ data: mockSpell });
    });

    it("should throw BadRequestException for invalid id", async () => {
      await expect(controller.findOne("bad-id" as any, {})).rejects.toThrow(BadRequestException);
    });
  });

  // -------------------------------------------------------------
  // create
  // -------------------------------------------------------------
  describe("create", () => {
    it("should create a spell", async () => {
      const dto: CreateSpellDto = {
        tag: 3,
        spellContent: { name: "Fireball", level: 3, description: "Boom" },
      } as any;

      mockService.create.mockResolvedValue({ data: mockSpell });

      const res = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual({ data: mockSpell });
    });
  });

  // -------------------------------------------------------------
  // update
  // -------------------------------------------------------------
  describe("update", () => {
    it("should update a spell when translations are not SRD", async () => {
      mockService.findOne = jest.fn().mockResolvedValue({ data: mockSpell });
      mockService.update.mockResolvedValue({ data: mockSpell });

      const updateDto: UpdateSpellDto = { tag: 4 } as any;

      const result = await controller.update(id as any, updateDto);

      expect(service.update).toHaveBeenCalled();
      expect(result).toEqual({ data: mockSpell });
    });

    it("should throw ForbiddenException if spell is SRD", async () => {
      mockService.findOne = jest.fn().mockResolvedValue({ data: mockSpellSRD });

      await expect(controller.update(id as any, mockSpellSRD as any)).rejects.toThrow(ForbiddenException);
    });
  });

  // -------------------------------------------------------------
  // delete
  // -------------------------------------------------------------
  describe("delete", () => {
    it("should delete a spell when no SRD translation exists", async () => {
      mockService.findOne = jest.fn().mockResolvedValue({ data: mockSpell });
      mockService.delete.mockResolvedValue({ data: mockSpell });

      const result = await controller.delete(id as any);

      expect(service.delete).toHaveBeenCalledWith(id, mockSpell);
      expect(result).toEqual({ data: mockSpell });
    });

    it("should throw ForbiddenException if spell has an SRD translation", async () => {
      mockService.findOne = jest.fn().mockResolvedValue({ data: mockSpellSRD });

      await expect(controller.delete(id as any)).rejects.toThrow(ForbiddenException);
      await expect(controller.delete(id as any)).rejects.toThrow(
        `Cannot delete spell #${id}: it has at least one SRD translation`,
      );
    });

    it("should throw ForbiddenException if at least one translation has srd: true", async () => {
      const mixedSpell = {
        _id: id,
        name: "Fireball",
        translations: new Map([
          ["en", { name: "Fireball", srd: true }],
          ["fr", { name: "Boule de feu", srd: false }],
        ]),
      };

      mockService.findOne = jest.fn().mockResolvedValue({ data: mixedSpell });

      await expect(controller.delete(id as any)).rejects.toThrow(ForbiddenException);
    });
  });
});
