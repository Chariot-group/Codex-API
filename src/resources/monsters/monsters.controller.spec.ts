import { Test, TestingModule } from "@nestjs/testing";
import { MonstersController } from "./monsters.controller";
import { MonstersService } from "./monsters.service";
import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";
import { PaginationMonster } from "./dtos/find-all.dto";
import { CreateMonsterDto } from "./dtos/create-monster.dto";

describe("MonstersController", () => {
  let controller: MonstersController;
  let service: MonstersService;

  const id = new Types.ObjectId();

  const mockMonster = {
    _id: id,
    tag: 1,
    languages: ["en", "fr"],
    translations: new Map([
      ["en", { name: "Goblin", srd: false }],
      ["fr", { name: "Gobelin", srd: false }],
    ]),
  };

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonstersController],
      providers: [{ provide: MonstersService, useValue: mockService }],
    }).compile();

    controller = module.get<MonstersController>(MonstersController);
    service = module.get<MonstersService>(MonstersService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------
  // findAll
  // -------------------------------------------------------------
  describe("findAll", () => {
    it("should return paginated monsters", async () => {
      const query: PaginationMonster = { page: 1, offset: 20 };
      mockService.findAll.mockResolvedValue({ data: [mockMonster] });

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [mockMonster] });
    });

    it("should return monsters filtered by name", async () => {
      const query: PaginationMonster = { page: 1, offset: 20, name: "Goblin" };
      mockService.findAll.mockResolvedValue({ data: [mockMonster] });

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [mockMonster] });
    });

    it("should return monsters filtered by language", async () => {
      const query: PaginationMonster = { page: 1, offset: 20, lang: "fr" };
      mockService.findAll.mockResolvedValue({ data: [mockMonster] });

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [mockMonster] });
    });
  });

  // -------------------------------------------------------------
  // findOne
  // -------------------------------------------------------------
  describe("findOne", () => {
    it("should return a monster with default lang", async () => {
      mockService.findOne.mockResolvedValue({ data: mockMonster });

      const result = await controller.findOne(id as any, {});

      expect(service.findOne).toHaveBeenCalledWith(id, "en");
      expect(result).toEqual({ data: mockMonster });
    });

    it("should return a monster with provided lang", async () => {
      mockService.findOne.mockResolvedValue({ data: mockMonster });

      const result = await controller.findOne(id as any, { lang: "fr" });

      expect(service.findOne).toHaveBeenCalledWith(id, "fr");
      expect(result).toEqual({ data: mockMonster });
    });

    it("should throw BadRequestException for invalid id", async () => {
      await expect(controller.findOne("bad-id" as any, {})).rejects.toThrow(BadRequestException);
    });
  });

  // -------------------------------------------------------------
  // create
  // -------------------------------------------------------------
  describe("create", () => {
    it("should create a monster", async () => {
      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Goblin",
          stats: {
            size: 1,
            maxHitPoints: 7,
            currentHitPoints: 7,
            armorClass: 15,
            passivePerception: 9,
          },
        },
      } as any;

      mockService.create.mockResolvedValue({ data: mockMonster });

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ data: mockMonster });
    });
  });

  // -------------------------------------------------------------
  // delete
  // -------------------------------------------------------------
  describe("delete", () => {
    it("should delete a monster when no SRD translations", async () => {
      mockService.findOne.mockResolvedValue({ data: mockMonster });
      mockService.delete.mockResolvedValue({ data: { ...mockMonster, deletedAt: new Date() } });

      const result = await controller.delete(id as any);

      expect(service.findOne).toHaveBeenCalledWith(id, "en");
      expect(service.delete).toHaveBeenCalledWith(id, mockMonster);
      expect(result.data.deletedAt).toBeDefined();
    });

    it("should throw ForbiddenException when monster has SRD translation", async () => {
      const mockSRDMonster = {
        _id: id,
        tag: 1,
        languages: ["en"],
        translations: new Map([["en", { name: "Goblin", srd: true }]]),
      };

      mockService.findOne.mockResolvedValue({ data: mockSRDMonster });

      await expect(controller.delete(id as any)).rejects.toThrow(
        "Cannot delete monster #" + id + ": it has at least one SRD translation",
      );

      expect(service.delete).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------
  // update
  // -------------------------------------------------------------
  describe("update", () => {
    it("should update a monster when no SRD translations", async () => {
      const updateDto = { tag: 1 } as any;
      mockService.findOne.mockResolvedValue({ data: mockMonster });
      mockService.update.mockResolvedValue({ data: { ...mockMonster, tag: 1 } });

      const result = await controller.update(id as any, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(id, "en");
      expect(service.update).toHaveBeenCalledWith(id, mockMonster, updateDto);
      expect(result.data.tag).toBe(1);
    });

    it("should throw ForbiddenException when monster has SRD translation", async () => {
      const mockSRDMonster = {
        _id: id,
        tag: 0,
        languages: ["en", "fr"],
        translations: new Map([
          ["en", { name: "Goblin", srd: true }],
          ["fr", { name: "Gobelin", srd: false }],
        ]),
      };

      const updateDto = { tag: 1 } as any;
      mockService.findOne.mockResolvedValue({ data: mockSRDMonster });

      await expect(controller.update(id as any, updateDto)).rejects.toThrow(
        "Cannot update monster #" + id + ": it has at least one SRD translation",
      );

      expect(service.update).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------
  // validateResource
  // -------------------------------------------------------------
  describe("validateResource", () => {
    it("should validate and return a monster", async () => {
      mockService.findOne.mockResolvedValue({ data: mockMonster });

      const result = await (controller as any).validateResource(id, "en");

      expect(service.findOne).toHaveBeenCalledWith(id, "en");
      expect(result).toEqual({ data: mockMonster });
    });

    it("should throw BadRequestException for invalid ObjectId", async () => {
      const invalidId = "invalid-id";

      await expect((controller as any).validateResource(invalidId as any, "en")).rejects.toThrow(BadRequestException);
    });
  });
});
