import { Test, TestingModule } from "@nestjs/testing";
import { MonstersService } from "./monsters.service";
import { getModelToken } from "@nestjs/mongoose";
import { Monster } from "./schemas/monster.schema";
import { Spell } from "../spells/schemas/spell.schema";
import {
  InternalServerErrorException,
  NotFoundException,
  GoneException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { Types } from "mongoose";

describe("MonstersService - create", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const mockCreateDto = {
    lang: "en",
    monsterContent: {
      name: "Goblin",
      stats: {
        size: 1,
        maxHitPoints: 7,
      },
    },
  };

  const mockCreatedMonster = {
    _id: new Types.ObjectId(),
    tag: 1,
    languages: ["en"],
    translations: new Map([["en", { name: "Goblin" }]]),
  };

  beforeEach(async () => {
    monsterModel = {
      constructor: jest.fn(),
    };

    spellModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should create a monster successfully", async () => {
    const fakeInstance = { save: jest.fn().mockResolvedValue(mockCreatedMonster) };

    const ModelFn: any = function () {
      return fakeInstance;
    };
    ModelFn.prototype = {};
    (service as any).monsterModel = ModelFn;

    spellModel.exec.mockResolvedValue([]);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.create(mockCreateDto as any);

    expect(result.data).toBeDefined();
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/created in \d+ms/));

    logSpy.mockRestore();
  });

  it("should create a monster with spells", async () => {
    const spellId = new Types.ObjectId();
    const dtoWithSpells = {
      lang: "en",
      monsterContent: {
        name: "Wizard Goblin",
        spellcasting: [
          {
            ability: "intelligence",
            saveDC: 12,
            spells: [spellId.toString()],
          },
        ],
      },
    };

    const fakeInstance = {
      save: jest.fn().mockResolvedValue({
        ...mockCreatedMonster,
        translations: new Map([
          [
            "en",
            {
              name: "Wizard Goblin",
              spellcasting: [
                {
                  ability: "intelligence",
                  saveDC: 12,
                  spells: [spellId],
                },
              ],
            },
          ],
        ]),
      }),
    };

    const ModelFn: any = function () {
      return fakeInstance;
    };
    ModelFn.prototype = {};
    (service as any).monsterModel = ModelFn;

    spellModel.exec.mockResolvedValue([{ _id: spellId }]);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.create(dtoWithSpells as any);

    expect(result.data).toBeDefined();
    expect(spellModel.find).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it("should throw InternalServerErrorException for invalid spell IDs during mapping", async () => {
    const invalidSpellId = "invalid-id";
    const dtoWithInvalidSpells = {
      lang: "en",
      monsterContent: {
        name: "Bad Wizard",
        spellcasting: [
          {
            ability: "intelligence",
            saveDC: 12,
            spells: [invalidSpellId],
          },
        ],
      },
    };

    const fakeInstance = { save: jest.fn() };
    const ModelFn: any = function () {
      return fakeInstance;
    };
    ModelFn.prototype = {};
    (service as any).monsterModel = ModelFn;

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.create(dtoWithInvalidSpells as any)).rejects.toThrow(InternalServerErrorException);

    errSpy.mockRestore();
  });

  it("should throw NotFoundException for non-existent spell IDs", async () => {
    const spellId = new Types.ObjectId();
    const dtoWithNonExistentSpells = {
      lang: "en",
      monsterContent: {
        name: "Bad Wizard",
        spellcasting: [
          {
            ability: "intelligence",
            saveDC: 12,
            spells: [spellId.toString()],
          },
        ],
      },
    };

    spellModel.exec.mockResolvedValue([]);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.create(dtoWithNonExistentSpells as any)).rejects.toThrow(NotFoundException);

    errSpy.mockRestore();
  });

  it("should handle errors during creation", async () => {
    const fakeInstance = { save: jest.fn().mockRejectedValue(new Error("DB fail")) };
    const ModelFn: any = function () {
      return fakeInstance;
    };
    ModelFn.prototype = {};
    (service as any).monsterModel = ModelFn;

    spellModel.exec.mockResolvedValue([]);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.create({} as any)).rejects.toThrow(InternalServerErrorException);

    expect(errSpy).toHaveBeenCalledWith(expect.stringMatching(/An error occurred while creating monster/));

    errSpy.mockRestore();
  });
});

describe("MonstersService - findAll", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const mockMonster = {
    _id: new Types.ObjectId(),
    tag: 2,
    languages: ["en", "fr"],
    translations: new Map([
      ["en", { name: "Goblin" }],
      ["fr", { name: "Gobelin" }],
    ]),
    deletedAt: null,
  };

  beforeEach(async () => {
    monsterModel = {
      countDocuments: jest.fn(),
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      distinct: jest.fn(),
    };

    spellModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should return monsters with pagination", async () => {
    monsterModel.countDocuments.mockResolvedValue(1);
    monsterModel.exec.mockResolvedValue([mockMonster]);

    const result = await service.findAll({ page: 1, offset: 10 });

    expect(monsterModel.countDocuments).toHaveBeenCalled();
    expect(monsterModel.skip).toHaveBeenCalledWith(0);
    expect(monsterModel.limit).toHaveBeenCalledWith(10);

    expect(result).toHaveProperty("pagination");
    expect(result.data.length).toBe(1);
  });

  it("should search by name and lang", async () => {
    monsterModel.countDocuments.mockResolvedValue(1);
    monsterModel.exec.mockResolvedValue([mockMonster]);

    const result = await service.findAll({ name: "Goblin", lang: "en" });

    expect(monsterModel.countDocuments).toHaveBeenCalled();
    expect(result.pagination.totalItems).toBe(1);
  });

  it("should search by name in all languages", async () => {
    monsterModel.distinct.mockResolvedValue(["en", "fr"]);
    monsterModel.countDocuments.mockResolvedValue(1);
    monsterModel.exec.mockResolvedValue([mockMonster]);

    const res = await service.findAll({ name: "Goblin" });

    expect(monsterModel.distinct).toHaveBeenCalledWith("languages");
    expect(res.data).toBeDefined();
  });

  it("should filter translations when searching by name without lang", async () => {
    const monsterWithMultipleTranslations = {
      _id: new Types.ObjectId(),
      tag: 3,
      languages: ["en", "fr", "es"],
      translations: new Map([
        ["en", { name: "Dragon" }],
        ["fr", { name: "Gobelin" }],
        ["es", { name: "Dragon" }],
      ]),
      deletedAt: null,
    };

    monsterModel.distinct.mockResolvedValue(["en", "fr", "es"]);
    monsterModel.countDocuments.mockResolvedValue(1);
    monsterModel.exec.mockResolvedValue([monsterWithMultipleTranslations]);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const res = await service.findAll({ name: "Dragon" });

    expect(monsterModel.distinct).toHaveBeenCalledWith("languages");
    expect(res.data).toBeDefined();
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it("should search by languages", async () => {
    monsterModel.distinct.mockResolvedValue(["en", "fr"]);
    monsterModel.countDocuments.mockResolvedValue(1);
    monsterModel.exec.mockResolvedValue([mockMonster]);

    const res = await service.findAll({ lang: "fr" });

    expect(res.data).toBeDefined();
  });

  it("should search with sort", async () => {
    monsterModel.distinct.mockResolvedValue(["en", "fr"]);
    monsterModel.countDocuments.mockResolvedValue(1);
    monsterModel.exec.mockResolvedValue([mockMonster]);

    const res = await service.findAll({ lang: "fr", sort: "-tag" });

    expect(res.data).toBeDefined();
  });

  it("should search with sort ascending", async () => {
    monsterModel.distinct.mockResolvedValue(["en", "fr"]);
    monsterModel.countDocuments.mockResolvedValue(1);
    monsterModel.exec.mockResolvedValue([mockMonster]);

    const res = await service.findAll({ lang: "fr", sort: "tag" });

    expect(res.data).toBeDefined();
  });

  it("should throw InternalServerErrorException on error", async () => {
    monsterModel.countDocuments.mockRejectedValue(new Error("DB_ERR"));

    await expect(service.findAll({})).rejects.toThrow(InternalServerErrorException);
  });

  it("should rethrow HttpException errors", async () => {
    const httpError = new NotFoundException("Custom not found");
    monsterModel.countDocuments.mockRejectedValue(httpError);

    await expect(service.findAll({})).rejects.toThrow(NotFoundException);
  });
});

describe("MonstersService - findOne", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockMonster = {
    _id: id,
    tag: 2,
    languages: ["en", "fr"],
    translations: new Map([
      ["en", { name: "Goblin" }],
      ["fr", { name: "Gobelin" }],
    ]),
    deletedAt: null,
  };

  beforeEach(async () => {
    monsterModel = {
      findById: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    spellModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should return a monster with filtered translation", async () => {
    monsterModel.exec.mockResolvedValue(mockMonster);

    const result = await service.findOne(id, "fr");

    expect(monsterModel.findById).toHaveBeenCalledWith(id);
    expect(result.data).toBeDefined();
  });

  it("should fallback to first language when lang invalid", async () => {
    monsterModel.exec.mockResolvedValue(mockMonster);

    const result = await service.findOne(id, "jp");

    expect(result.data).toBeDefined();
  });

  it("should throw NotFoundException if monster not found", async () => {
    monsterModel.exec.mockResolvedValue(null);

    await expect(service.findOne(id, "en")).rejects.toThrow(NotFoundException);
  });

  it("should throw GoneException if deleted", async () => {
    monsterModel.exec.mockResolvedValue({ ...mockMonster, deletedAt: new Date() });

    await expect(service.findOne(id, "en")).rejects.toThrow(GoneException);
  });

  it("should throw InternalServerErrorException on DB error", async () => {
    monsterModel.exec.mockRejectedValue(new Error("DB fail"));

    await expect(service.findOne(id, "en")).rejects.toThrow(InternalServerErrorException);
  });
});

describe("MonstersService - delete", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockMonster = {
    _id: id,
    tag: 0,
    languages: ["en"],
    translations: new Map([["en", { name: "Goblin", srd: false }]]),
    deletedAt: null,
  };

  beforeEach(async () => {
    monsterModel = {
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    spellModel = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should soft delete a monster successfully", async () => {
    monsterModel.exec.mockResolvedValue({});

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.delete(id, mockMonster as any);

    expect(monsterModel.updateOne).toHaveBeenCalledWith(
      { _id: id },
      expect.objectContaining({ deletedAt: expect.any(Date) }),
    );
    expect(result.data.deletedAt).toBeDefined();
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/deleted in \d+ms/));

    logSpy.mockRestore();
  });

  it("should throw InternalServerErrorException on error", async () => {
    monsterModel.exec.mockRejectedValue(new Error("DB fail"));

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.delete(id, mockMonster as any)).rejects.toThrow(InternalServerErrorException);

    expect(errSpy).toHaveBeenCalledWith(expect.stringMatching(/Error while deleting monster/));

    errSpy.mockRestore();
  });

  it("should rethrow HttpException errors", async () => {
    const httpError = new NotFoundException("Custom not found");
    monsterModel.exec.mockRejectedValue(httpError);

    await expect(service.delete(id, mockMonster as any)).rejects.toThrow(NotFoundException);
  });
});

describe("MonstersService - update", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockMonster = {
    _id: id,
    tag: 0,
    languages: ["en"],
    translations: new Map([["en", { name: "Goblin", srd: false }]]),
  };

  beforeEach(async () => {
    monsterModel = {
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    spellModel = {
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should update a monster successfully", async () => {
    const updateData = { tag: 1 } as any;
    spellModel.exec.mockResolvedValue({});

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.update(id, mockMonster as any, updateData);

    expect(spellModel.updateOne).toHaveBeenCalledWith({ _id: id }, updateData);
    expect(result.data.tag).toBe(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/updated in \d+ms/));

    logSpy.mockRestore();
  });

  it("should throw InternalServerErrorException on error", async () => {
    const updateData = { tag: 1 } as any;
    spellModel.exec.mockRejectedValue(new Error("DB fail"));

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.update(id, mockMonster as any, updateData)).rejects.toThrow(InternalServerErrorException);

    expect(errSpy).toHaveBeenCalledWith(expect.stringMatching(/Error while updating monster/));

    errSpy.mockRestore();
  });

  it("should rethrow HttpException errors", async () => {
    const updateData = { tag: 1 } as any;
    const httpError = new NotFoundException("Custom not found");
    spellModel.exec.mockRejectedValue(httpError);

    await expect(service.update(id, mockMonster as any, updateData)).rejects.toThrow(NotFoundException);
  });
});

describe("MonstersService - validateSpells", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  beforeEach(async () => {
    monsterModel = {};

    spellModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should validate spells successfully", async () => {
    const spellIds = [new Types.ObjectId(), new Types.ObjectId()];
    spellModel.exec.mockResolvedValue([{ _id: spellIds[0] }, { _id: spellIds[1] }]);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    await (service as any).validateSpells(spellIds);

    expect(spellModel.find).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Successfully validated"));

    logSpy.mockRestore();
  });

  it("should handle empty spell array", async () => {
    await (service as any).validateSpells([]);

    expect(spellModel.find).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException for invalid spell IDs", async () => {
    const invalidIds = ["invalid-id" as any];

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect((service as any).validateSpells(invalidIds)).rejects.toThrow(BadRequestException);

    errSpy.mockRestore();
  });

  it("should throw NotFoundException for missing spells", async () => {
    const spellIds = [new Types.ObjectId(), new Types.ObjectId()];
    spellModel.exec.mockResolvedValue([{ _id: spellIds[0] }]);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect((service as any).validateSpells(spellIds)).rejects.toThrow(NotFoundException);

    errSpy.mockRestore();
  });

  it("should throw InternalServerErrorException on DB error", async () => {
    const spellIds = [new Types.ObjectId()];
    spellModel.exec.mockRejectedValue(new Error("DB fail"));

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect((service as any).validateSpells(spellIds)).rejects.toThrow(InternalServerErrorException);

    errSpy.mockRestore();
  });
});

describe("MonstersService - extractSpellIds", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  beforeEach(async () => {
    monsterModel = {};
    spellModel = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should extract spell IDs from monster", () => {
    const spellId1 = new Types.ObjectId();
    const spellId2 = new Types.ObjectId();

    const monster = {
      translations: new Map([
        [
          "en",
          {
            spellcasting: [
              {
                spells: [spellId1, spellId2],
              },
            ],
          },
        ],
      ]),
    } as any;

    const result = (service as any).extractSpellIds(monster);

    expect(result).toHaveLength(2);
    expect(result.map((id: Types.ObjectId) => id.toString())).toContain(spellId1.toString());
    expect(result.map((id: Types.ObjectId) => id.toString())).toContain(spellId2.toString());
  });

  it("should return empty array for monster without spells", () => {
    const monster = {
      translations: new Map([["en", { name: "Goblin" }]]),
    } as any;

    const result = (service as any).extractSpellIds(monster);

    expect(result).toHaveLength(0);
  });

  it("should handle duplicate spell IDs", () => {
    const spellId = new Types.ObjectId();

    const monster = {
      translations: new Map([
        [
          "en",
          {
            spellcasting: [
              {
                spells: [spellId],
              },
            ],
          },
        ],
        [
          "fr",
          {
            spellcasting: [
              {
                spells: [spellId],
              },
            ],
          },
        ],
      ]),
    } as any;

    const result = (service as any).extractSpellIds(monster);

    expect(result).toHaveLength(1);
  });
});

describe("MonstersService - populateSpells", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  beforeEach(async () => {
    monsterModel = {};

    spellModel = {
      find: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should populate spells in monster", async () => {
    const spellId = new Types.ObjectId();

    const monster = {
      translations: new Map([
        [
          "en",
          {
            spellcasting: [
              {
                spells: [spellId],
              },
            ],
          },
        ],
      ]),
    };

    const mockSpell = {
      _id: spellId,
      languages: ["en"],
      translations: new Map([
        [
          "en",
          {
            name: "Fireball",
            level: 3,
            description: "A ball of fire",
            srd: true,
          },
        ],
      ]),
    };

    spellModel.exec.mockResolvedValue([mockSpell]);

    const result = await (service as any).populateSpells(monster, "en");

    expect(result.translations.get("en").spellcasting[0].spells[0]).toHaveProperty("name", "Fireball");
  });

  it("should return monster unchanged if no spells", async () => {
    const monster = {
      translations: new Map([["en", { name: "Goblin" }]]),
    };

    const result = await (service as any).populateSpells(monster, "en");

    expect(result).toEqual(monster);
  });

  it("should fallback to first language if target lang not available", async () => {
    const spellId = new Types.ObjectId();

    const monster = {
      translations: new Map([
        [
          "en",
          {
            spellcasting: [
              {
                spells: [spellId],
              },
            ],
          },
        ],
      ]),
    };

    const mockSpell = {
      _id: spellId,
      languages: ["fr"],
      translations: new Map([
        [
          "fr",
          {
            name: "Boule de feu",
            level: 3,
            description: "Une boule de feu",
            srd: false,
          },
        ],
      ]),
    };

    spellModel.exec.mockResolvedValue([mockSpell]);

    const result = await (service as any).populateSpells(monster, "en");

    expect(result.translations.get("en").spellcasting[0].spells[0]).toHaveProperty("name", "Boule de feu");
  });

  it("should skip spell if spellContent is not found in any language", async () => {
    const spellId = new Types.ObjectId();

    const monster = {
      translations: new Map([
        [
          "en",
          {
            spellcasting: [
              {
                spells: [spellId],
              },
            ],
          },
        ],
      ]),
    };

    const mockSpell = {
      _id: spellId,
      languages: [],
      translations: new Map(),
    };

    spellModel.exec.mockResolvedValue([mockSpell]);

    const result = await (service as any).populateSpells(monster, "en");

    expect(result.translations.get("en").spellcasting[0].spells).toHaveLength(0);
  });

  it("should handle errors gracefully", async () => {
    const monster = {
      translations: new Map([
        [
          "en",
          {
            spellcasting: [
              {
                spells: [new Types.ObjectId()],
              },
            ],
          },
        ],
      ]),
    };

    spellModel.exec.mockRejectedValue(new Error("DB error"));

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    const result = await (service as any).populateSpells(monster, "en");

    expect(result).toEqual(monster);
    expect(errSpy).toHaveBeenCalled();

    errSpy.mockRestore();
  });
});

describe("MonstersService - getTranslations", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const mockMonsterId = new Types.ObjectId();

  beforeEach(async () => {
    monsterModel = {
      findById: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    spellModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should return list of translations successfully", async () => {
    const mockMonster = {
      _id: mockMonsterId,
      languages: ["en", "fr"],
      deletedAt: null,
      translations: new Map([
        ["en", { srd: true, name: "Goblin", deletedAt: null, createdAt: new Date(), updatedAt: new Date() }],
        ["fr", { srd: false, name: "Gobelin", deletedAt: null, createdAt: new Date(), updatedAt: new Date() }],
      ]),
    };

    monsterModel.exec.mockResolvedValue(mockMonster);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.getTranslations(mockMonsterId);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].lang).toBe("en");
    expect(result.data[0].name).toBe("Goblin");
    expect(result.data[1].lang).toBe("fr");
    expect(result.data[1].name).toBe("Gobelin");

    logSpy.mockRestore();
  });

  it("should throw NotFoundException when monster not found", async () => {
    monsterModel.exec.mockResolvedValue(null);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.getTranslations(mockMonsterId)).rejects.toThrow(NotFoundException);

    errSpy.mockRestore();
  });

  it("should throw GoneException when monster is deleted", async () => {
    const mockMonster = {
      _id: mockMonsterId,
      languages: ["en"],
      deletedAt: new Date(),
      translations: new Map([["en", { name: "Goblin" }]]),
    };

    monsterModel.exec.mockResolvedValue(mockMonster);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.getTranslations(mockMonsterId)).rejects.toThrow(GoneException);

    errSpy.mockRestore();
  });

  it("should exclude deleted translations", async () => {
    const mockMonster = {
      _id: mockMonsterId,
      languages: ["en", "fr"],
      deletedAt: null,
      translations: new Map([
        ["en", { srd: true, name: "Goblin", deletedAt: null }],
        ["fr", { srd: false, name: "Gobelin", deletedAt: new Date() }],
      ]),
    };

    monsterModel.exec.mockResolvedValue(mockMonster);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.getTranslations(mockMonsterId);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].lang).toBe("en");

    logSpy.mockRestore();
  });
});

describe("MonstersService - getTranslation", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const mockMonsterId = new Types.ObjectId();

  beforeEach(async () => {
    monsterModel = {
      findById: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    spellModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should return translation successfully", async () => {
    const mockMonster = {
      _id: mockMonsterId,
      languages: ["en", "fr"],
      deletedAt: null,
      translations: new Map([
        ["en", { srd: true, name: "Goblin", deletedAt: null }],
        ["fr", { srd: false, name: "Gobelin", deletedAt: null }],
      ]),
    };

    monsterModel.exec.mockResolvedValue(mockMonster);
    spellModel.exec.mockResolvedValue([]);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.getTranslation(mockMonsterId, "fr");

    expect(result.data.name).toBe("Gobelin");
    expect(result.data.srd).toBe(false);

    logSpy.mockRestore();
  });

  it("should throw NotFoundException when monster not found", async () => {
    monsterModel.exec.mockResolvedValue(null);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.getTranslation(mockMonsterId, "en")).rejects.toThrow(NotFoundException);

    errSpy.mockRestore();
  });

  it("should throw GoneException when monster is deleted", async () => {
    const mockMonster = {
      _id: mockMonsterId,
      languages: ["en"],
      deletedAt: new Date(),
      translations: new Map([["en", { name: "Goblin" }]]),
    };

    monsterModel.exec.mockResolvedValue(mockMonster);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.getTranslation(mockMonsterId, "en")).rejects.toThrow(GoneException);

    errSpy.mockRestore();
  });

  it("should throw NotFoundException when translation not found", async () => {
    const mockMonster = {
      _id: mockMonsterId,
      languages: ["en"],
      deletedAt: null,
      translations: new Map([["en", { name: "Goblin", deletedAt: null }]]),
    };

    monsterModel.exec.mockResolvedValue(mockMonster);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.getTranslation(mockMonsterId, "fr")).rejects.toThrow(NotFoundException);

    errSpy.mockRestore();
  });

  it("should throw GoneException when translation is deleted", async () => {
    const mockMonster = {
      _id: mockMonsterId,
      languages: ["en", "fr"],
      deletedAt: null,
      translations: new Map([
        ["en", { name: "Goblin", deletedAt: null }],
        ["fr", { name: "Gobelin", deletedAt: new Date() }],
      ]),
    };

    monsterModel.exec.mockResolvedValue(mockMonster);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.getTranslation(mockMonsterId, "fr")).rejects.toThrow(GoneException);

    errSpy.mockRestore();
  });

  it("should populate spells in translation", async () => {
    const spellId = new Types.ObjectId();

    const mockMonster = {
      _id: mockMonsterId,
      languages: ["en"],
      deletedAt: null,
      translations: new Map([
        [
          "en",
          {
            name: "Wizard Goblin",
            deletedAt: null,
            spellcasting: [
              {
                ability: "intelligence",
                spells: [spellId],
              },
            ],
          },
        ],
      ]),
    };

    const mockSpell = {
      _id: spellId,
      languages: ["en"],
      translations: new Map([
        [
          "en",
          {
            name: "Fireball",
            level: 3,
            description: "A ball of fire",
            srd: true,
          },
        ],
      ]),
    };

    monsterModel.exec.mockResolvedValue(mockMonster);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.getTranslation(mockMonsterId, "en");

    expect(result.data.spellcasting[0].spells[0]).toHaveProperty("name", "Fireball");

    logSpy.mockRestore();
  });
});

describe("MonstersService - addTranslation", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const id = new Types.ObjectId();

  // Mock original content with all numeric values
  const mockOriginalContent = {
    name: "Goblin",
    srd: false,
    stats: {
      size: 1,
      maxHitPoints: 7,
      currentHitPoints: 7,
      armorClass: 15,
      passivePerception: 9,
      languages: ["Common", "Goblin"],
    },
    affinities: {
      resistances: [],
      immunities: [],
    },
    abilities: [{ name: "Nimble Escape", description: "Can Disengage or Hide as a bonus action" }],
    actions: {
      standard: [{ name: "Scimitar", description: "Melee attack", attackBonus: 4, damage: { dice: "1d6+2" } }],
    },
    profile: {
      type: "Humanoid",
      subtype: "goblinoid",
      alignment: "Neutral Evil",
    },
    challenge: {
      rating: 0.25,
      xp: 50,
    },
  };

  const mockMonster = {
    _id: id,
    tag: 0, // homebrew
    languages: ["en"],
    translations: new Map([["en", mockOriginalContent]]),
    deletedAt: null,
  };

  // New DTO format - only text/translatable fields
  const mockTranslationDto = {
    name: "Gobelin",
    stats: {
      languages: ["Commun", "Gobelin"],
    },
    abilities: [{ name: "Évasion agile", description: "Peut se désengager ou se cacher comme action bonus" }],
    actions: {
      standard: [{ name: "Cimeterre", description: "Attaque de mêlée" }],
    },
    profile: {
      type: "Humanoïde",
      subtype: "gobelinoïde",
      alignment: "Neutre Mauvais",
    },
  };

  beforeEach(async () => {
    monsterModel = {
      findById: jest.fn().mockReturnThis(),
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    spellModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should add a translation successfully", async () => {
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ ...mockMonster }),
    });
    monsterModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.addTranslation(id, "fr", mockTranslationDto as any, false);

    expect(result.data).toBeDefined();
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/Translation 'fr' added to monster/));

    logSpy.mockRestore();
  });

  it("should throw BadRequestException for invalid language code", async () => {
    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.addTranslation(id, "invalid", mockTranslationDto as any, false)).rejects.toThrow(
      BadRequestException,
    );

    errSpy.mockRestore();
  });

  it("should throw BadRequestException for uppercase language code", async () => {
    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.addTranslation(id, "FR", mockTranslationDto as any, false)).rejects.toThrow(
      BadRequestException,
    );

    errSpy.mockRestore();
  });

  it("should throw NotFoundException if monster not found", async () => {
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.addTranslation(id, "fr", mockTranslationDto as any, false)).rejects.toThrow(NotFoundException);

    errSpy.mockRestore();
  });

  it("should throw GoneException if monster is deleted", async () => {
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ ...mockMonster, deletedAt: new Date() }),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.addTranslation(id, "fr", mockTranslationDto as any, false)).rejects.toThrow(GoneException);

    errSpy.mockRestore();
  });

  it("should throw ConflictException if translation already exists", async () => {
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...mockMonster,
        translations: new Map([
          ["en", mockOriginalContent],
          ["fr", { ...mockOriginalContent, name: "Gobelin" }],
        ]),
      }),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.addTranslation(id, "fr", mockTranslationDto as any, false)).rejects.toThrow(ConflictException);

    errSpy.mockRestore();
  });

  it("should throw ForbiddenException if non-admin tries to add translation to non-homebrew monster", async () => {
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: id,
        tag: 1, // non-homebrew
        languages: ["en"],
        translations: new Map([["en", mockOriginalContent]]),
        deletedAt: null,
      }),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.addTranslation(id, "es", mockTranslationDto as any, false)).rejects.toThrow(
      ForbiddenException,
    );

    errSpy.mockRestore();
  });

  it("should allow admin to add translation to non-homebrew monster", async () => {
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: id,
        tag: 1, // non-homebrew
        languages: ["en"],
        translations: new Map([["en", mockOriginalContent]]),
        deletedAt: null,
      }),
    });
    monsterModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.addTranslation(id, "pt", mockTranslationDto as any, true);

    expect(result.data).toBeDefined();

    logSpy.mockRestore();
  });

  it("should copy SRD status from original content", async () => {
    const srdOriginalContent = { ...mockOriginalContent, srd: true };
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...mockMonster,
        translations: new Map([["en", srdOriginalContent]]),
      }),
    });
    monsterModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.addTranslation(id, "fr", mockTranslationDto as any, false);

    expect(result.data).toBeDefined();

    logSpy.mockRestore();
  });

  it("should throw InternalServerErrorException on DB error", async () => {
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("DB fail")),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.addTranslation(id, "fr", mockTranslationDto as any, false)).rejects.toThrow(
      InternalServerErrorException,
    );

    errSpy.mockRestore();
  });

  it("should rethrow HttpException errors", async () => {
    const httpError = new NotFoundException("Custom not found");
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockRejectedValue(httpError),
    });

    await expect(service.addTranslation(id, "fr", mockTranslationDto as any, false)).rejects.toThrow(NotFoundException);
  });

  it("should throw BadRequestException if monster has no original content", async () => {
    monsterModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...mockMonster,
        translations: new Map(), // Empty translations
      }),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.addTranslation(id, "fr", mockTranslationDto as any, false)).rejects.toThrow(
      BadRequestException,
    );

    errSpy.mockRestore();
  });
});

describe("MonstersService - updateTranslation", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const mockMonsterId = new Types.ObjectId();

  const mockMonster = {
    _id: mockMonsterId,
    tag: 0, // homebrew
    languages: ["en", "fr"],
    deletedAt: null,
    translations: new Map([
      [
        "en",
        {
          srd: false,
          name: "Goblin",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [
        "fr",
        {
          srd: false,
          name: "Gobelin",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    ]),
  };

  const mockUpdateDto = {
    name: "Updated Goblin Name",
  };

  beforeEach(async () => {
    monsterModel = {
      findById: jest.fn().mockReturnThis(),
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    spellModel = {
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should update a translation successfully", async () => {
    const updatedMonster = {
      ...mockMonster,
      translations: new Map([
        [
          "en",
          {
            srd: false,
            name: "Updated Goblin Name",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        [
          "fr",
          {
            srd: false,
            name: "Gobelin",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      ]),
    };

    monsterModel.exec
      .mockResolvedValueOnce(mockMonster)
      .mockResolvedValueOnce({ acknowledged: true })
      .mockResolvedValueOnce(updatedMonster);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.updateTranslation(mockMonsterId, "en", mockUpdateDto, false);

    expect(result.data).toBeDefined();
    expect(monsterModel.updateOne).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/Translation 'en' for monster .* updated in \d+ms/));

    logSpy.mockRestore();
  });

  it("should throw BadRequestException for invalid language code", async () => {
    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.updateTranslation(mockMonsterId, "FRA", mockUpdateDto, false)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.updateTranslation(mockMonsterId, "f", mockUpdateDto, false)).rejects.toThrow(
      BadRequestException,
    );

    errSpy.mockRestore();
  });

  it("should throw NotFoundException if monster does not exist", async () => {
    monsterModel.exec.mockResolvedValue(null);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.updateTranslation(mockMonsterId, "en", mockUpdateDto, false)).rejects.toThrow(
      NotFoundException,
    );

    errSpy.mockRestore();
  });

  it("should throw GoneException if monster is deleted", async () => {
    monsterModel.exec.mockResolvedValue({ ...mockMonster, deletedAt: new Date() });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.updateTranslation(mockMonsterId, "en", mockUpdateDto, false)).rejects.toThrow(GoneException);

    errSpy.mockRestore();
  });

  it("should throw NotFoundException if translation does not exist", async () => {
    const monsterWithoutFr = {
      ...mockMonster,
      translations: new Map([
        [
          "en",
          {
            srd: false,
            name: "Goblin",
            deletedAt: null,
          },
        ],
      ]),
    };

    monsterModel.exec.mockResolvedValue(monsterWithoutFr);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.updateTranslation(mockMonsterId, "fr", mockUpdateDto, false)).rejects.toThrow(
      NotFoundException,
    );

    errSpy.mockRestore();
  });

  it("should throw GoneException if translation is deleted", async () => {
    const monsterWithDeletedTranslation = {
      ...mockMonster,
      translations: new Map([
        [
          "en",
          {
            srd: false,
            name: "Goblin",
            deletedAt: new Date(),
          },
        ],
      ]),
    };

    monsterModel.exec.mockResolvedValue(monsterWithDeletedTranslation);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.updateTranslation(mockMonsterId, "en", mockUpdateDto, false)).rejects.toThrow(GoneException);

    errSpy.mockRestore();
  });

  it("should throw ForbiddenException if trying to modify SRD translation without admin rights", async () => {
    const monsterWithSrdTranslation = {
      ...mockMonster,
      translations: new Map([
        [
          "en",
          {
            srd: true,
            name: "Goblin",
            deletedAt: null,
          },
        ],
      ]),
    };

    monsterModel.exec.mockResolvedValue(monsterWithSrdTranslation);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.updateTranslation(mockMonsterId, "en", mockUpdateDto, false)).rejects.toThrow(
      ForbiddenException,
    );

    errSpy.mockRestore();
  });

  it("should allow admin to modify SRD translation", async () => {
    const monsterWithSrdTranslation = {
      ...mockMonster,
      tag: 1,
      translations: new Map([
        [
          "en",
          {
            srd: true,
            name: "Goblin",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      ]),
    };

    const updatedMonster = {
      ...monsterWithSrdTranslation,
      translations: new Map([
        [
          "en",
          {
            srd: true,
            name: "Updated Goblin Name",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      ]),
    };

    monsterModel.exec
      .mockResolvedValueOnce(monsterWithSrdTranslation)
      .mockResolvedValueOnce({ acknowledged: true })
      .mockResolvedValueOnce(updatedMonster);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.updateTranslation(mockMonsterId, "en", mockUpdateDto, true);

    expect(result.data).toBeDefined();

    logSpy.mockRestore();
  });

  it("should throw ForbiddenException if non-admin tries to modify official monster translation", async () => {
    const officialMonster = {
      ...mockMonster,
      tag: 1, // official
      translations: new Map([
        [
          "en",
          {
            srd: false,
            name: "Goblin",
            deletedAt: null,
          },
        ],
      ]),
    };

    monsterModel.exec.mockResolvedValue(officialMonster);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.updateTranslation(mockMonsterId, "en", mockUpdateDto, false)).rejects.toThrow(
      ForbiddenException,
    );

    errSpy.mockRestore();
  });

  it("should validate spells when spellcasting is updated", async () => {
    const spellId = new Types.ObjectId();
    const updateDtoWithSpells = {
      spellcasting: [
        {
          ability: "Intelligence",
          saveDC: 14,
          spells: [spellId.toString()],
        },
      ],
    };

    const updatedMonster = {
      ...mockMonster,
      translations: new Map([
        [
          "en",
          {
            srd: false,
            name: "Goblin",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            spellcasting: [
              {
                ability: "Intelligence",
                saveDC: 14,
                spells: [spellId],
              },
            ],
          },
        ],
        [
          "fr",
          {
            srd: false,
            name: "Gobelin",
            deletedAt: null,
          },
        ],
      ]),
    };

    monsterModel.exec
      .mockResolvedValueOnce(mockMonster)
      .mockResolvedValueOnce({ acknowledged: true })
      .mockResolvedValueOnce(updatedMonster);

    spellModel.exec.mockResolvedValue([{ _id: spellId }]);

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.updateTranslation(mockMonsterId, "en", updateDtoWithSpells as any, false);

    expect(result.data).toBeDefined();
    expect(spellModel.find).toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it("should throw NotFoundException for non-existent spell IDs", async () => {
    const nonExistentSpellId = new Types.ObjectId();
    const updateDtoWithInvalidSpells = {
      spellcasting: [
        {
          ability: "Intelligence",
          saveDC: 14,
          spells: [nonExistentSpellId.toString()],
        },
      ],
    };

    monsterModel.exec.mockResolvedValueOnce(mockMonster);
    spellModel.exec.mockResolvedValue([]);

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(
      service.updateTranslation(mockMonsterId, "en", updateDtoWithInvalidSpells as any, false),
    ).rejects.toThrow(NotFoundException);

    errSpy.mockRestore();
  });

  it("should handle internal errors gracefully", async () => {
    monsterModel.exec.mockRejectedValue(new Error("DB error"));

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.updateTranslation(mockMonsterId, "en", mockUpdateDto, false)).rejects.toThrow(
      InternalServerErrorException,
    );

    errSpy.mockRestore();
  });
});

describe("MonstersService - deleteTranslation", () => {
  let service: MonstersService;
  let monsterModel: any;
  let spellModel: any;

  const id = new Types.ObjectId();

  beforeEach(async () => {
    monsterModel = {
      findById: jest.fn().mockReturnThis(),
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    spellModel = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonstersService,
        { provide: getModelToken(Monster.name), useValue: monsterModel },
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<MonstersService>(MonstersService);
  });

  it("should delete a non-SRD translation successfully", async () => {
    const mockMonster = {
      _id: id,
      tag: 0,
      languages: ["en", "fr"],
      translations: new Map([
        ["en", { name: "Goblin", srd: false, deletedAt: null }],
        ["fr", { name: "Gobelin", srd: false, deletedAt: null }],
      ]),
      deletedAt: null,
    };

    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMonster),
    });
    monsterModel.updateOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.deleteTranslation(id, "fr");

    expect(result.data.deletedLang).toBe("fr");
    expect(result.data.remainingLanguages).toEqual(["en"]);
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/deleted in \d+ms/));

    logSpy.mockRestore();
  });

  it("should throw NotFoundException if monster not found", async () => {
    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.deleteTranslation(id, "fr")).rejects.toThrow(NotFoundException);

    errSpy.mockRestore();
  });

  it("should throw GoneException if monster is deleted", async () => {
    const mockMonster = {
      _id: id,
      tag: 0,
      languages: ["en", "fr"],
      translations: new Map([
        ["en", { name: "Goblin", srd: false }],
        ["fr", { name: "Gobelin", srd: false }],
      ]),
      deletedAt: new Date(),
    };

    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMonster),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.deleteTranslation(id, "fr")).rejects.toThrow(GoneException);

    errSpy.mockRestore();
  });

  it("should throw NotFoundException if translation not found", async () => {
    const mockMonster = {
      _id: id,
      tag: 0,
      languages: ["en"],
      translations: new Map([["en", { name: "Goblin", srd: false }]]),
      deletedAt: null,
    };

    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMonster),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.deleteTranslation(id, "fr")).rejects.toThrow(NotFoundException);

    errSpy.mockRestore();
  });

  it("should throw GoneException if translation already deleted", async () => {
    const mockMonster = {
      _id: id,
      tag: 0,
      languages: ["en"],
      translations: new Map([
        ["en", { name: "Goblin", srd: false, deletedAt: null }],
        ["fr", { name: "Gobelin", srd: false, deletedAt: new Date() }],
      ]),
      deletedAt: null,
    };

    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMonster),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.deleteTranslation(id, "fr")).rejects.toThrow(GoneException);

    errSpy.mockRestore();
  });

  it("should throw ForbiddenException when trying to delete SRD translation", async () => {
    const mockMonster = {
      _id: id,
      tag: 1,
      languages: ["en", "fr"],
      translations: new Map([
        ["en", { name: "Goblin", srd: true, deletedAt: null }],
        ["fr", { name: "Gobelin", srd: false, deletedAt: null }],
      ]),
      deletedAt: null,
    };

    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMonster),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.deleteTranslation(id, "en")).rejects.toThrow(ForbiddenException);
    await expect(service.deleteTranslation(id, "en")).rejects.toThrow(/SRD translations are protected/);

    errSpy.mockRestore();
  });

  it("should throw ForbiddenException when trying to delete the last active translation", async () => {
    const mockMonster = {
      _id: id,
      tag: 0,
      languages: ["en"],
      translations: new Map([["en", { name: "Goblin", srd: false, deletedAt: null }]]),
      deletedAt: null,
    };

    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMonster),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.deleteTranslation(id, "en")).rejects.toThrow(ForbiddenException);
    await expect(service.deleteTranslation(id, "en")).rejects.toThrow(/last active translation/);

    errSpy.mockRestore();
  });

  it("should throw InternalServerErrorException on DB error", async () => {
    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockRejectedValue(new Error("DB fail")),
    });

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.deleteTranslation(id, "fr")).rejects.toThrow(InternalServerErrorException);

    errSpy.mockRestore();
  });

  it("should rethrow HttpException errors", async () => {
    const httpError = new NotFoundException("Custom not found");
    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockRejectedValue(httpError),
    });

    await expect(service.deleteTranslation(id, "fr")).rejects.toThrow(NotFoundException);
  });

  it("should correctly update the database with soft delete", async () => {
    const mockMonster = {
      _id: id,
      tag: 0,
      languages: ["en", "fr", "es"],
      translations: new Map([
        ["en", { name: "Goblin", srd: false, deletedAt: null }],
        ["fr", { name: "Gobelin", srd: false, deletedAt: null }],
        ["es", { name: "Goblin", srd: false, deletedAt: null }],
      ]),
      deletedAt: null,
    };

    const updateOneMock = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    monsterModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMonster),
    });
    monsterModel.updateOne = updateOneMock;

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    await service.deleteTranslation(id, "fr");

    expect(updateOneMock).toHaveBeenCalledWith(
      { _id: id },
      {
        $set: {
          [`translations.fr.deletedAt`]: expect.any(Date),
          languages: ["en", "es"],
        },
      },
    );

    logSpy.mockRestore();
  });
});
