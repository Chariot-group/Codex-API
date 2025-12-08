import { Test, TestingModule } from "@nestjs/testing";
import { SpellsService } from "./spells.service";
import { getModelToken } from "@nestjs/mongoose";
import { Spell } from "@/resources/spells/schemas/spell.schema";
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  GoneException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { Types } from "mongoose";
import { CreateSpellTranslationDto } from "@/resources/spells/dtos/create-spell-translation.dto";

describe("SpellsService - create", () => {
  let service: SpellsService;
  let spellModel: any;

  const mockCreateDto = {
    tag: 1,
    spellContent: { name: "Fireball" },
    languages: ["en"],
  };

  const mockCreatedSpell = {
    _id: new Types.ObjectId(),
    tag: 1,
    languages: ["en"],
    translations: new Map([["en", { name: "Fireball" }]]),
  };

  beforeEach(async () => {
    spellModel = {
      constructor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should create a spell successfully", async () => {
    const fakeInstance = { save: jest.fn().mockResolvedValue(mockCreatedSpell) };

    // simulate `new this.spellModel(spell)` returning fake instance
    const ModelFn: any = function () {
      return fakeInstance;
    };
    ModelFn.prototype = {};
    (service as any).spellModel = ModelFn;

    const logSpy = jest.spyOn(service["logger"], "log").mockImplementation(() => {});

    const result = await service.create(mockCreateDto as any);

    expect(result.data).toBeDefined();
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/created in \d+ms/));

    logSpy.mockRestore();
  });

  it("should handle errors", async () => {
    const fakeInstance = { save: jest.fn().mockRejectedValue(new Error("DB fail")) };
    const ModelFn: any = function () {
      return fakeInstance;
    };
    ModelFn.prototype = {};
    (service as any).spellModel = ModelFn;

    const errSpy = jest.spyOn(service["logger"], "error").mockImplementation(() => {});

    await expect(service.create({} as any)).rejects.toThrow(InternalServerErrorException);

    expect(errSpy).toHaveBeenCalledWith(expect.stringMatching(/An error occurred while creating spell/));

    errSpy.mockRestore();
  });
});

describe("SpellsService - findAll", () => {
  let service: SpellsService;
  let spellModel: any;

  const mockSpell = {
    _id: new Types.ObjectId(),
    tag: 2,
    languages: ["en", "fr"],
    translations: new Map([
      ["en", { name: "Fire" }],
      ["fr", { name: "Feu" }],
    ]),
    deletedAt: null,
  };

  beforeEach(async () => {
    spellModel = {
      countDocuments: jest.fn(),
      find: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      distinct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should return spells with pagination", async () => {
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const result = await service.findAll({ page: 1, offset: 10 });

    expect(spellModel.countDocuments).toHaveBeenCalled();
    expect(spellModel.skip).toHaveBeenCalledWith(0);
    expect(spellModel.limit).toHaveBeenCalledWith(10);

    expect(result).toHaveProperty("pagination");
    expect(result.data.length).toBe(1);
  });

  it("should search by name and lang", async () => {
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const result = await service.findAll({ name: "Fire", lang: "en" });

    expect(spellModel.countDocuments).toHaveBeenCalled();
    expect(result.pagination.totalItems).toBe(1);
  });

  it("should search by name in all languages", async () => {
    spellModel.distinct.mockResolvedValue(["en", "fr"]);
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const res = await service.findAll({ name: "Fire" });

    expect(spellModel.distinct).toHaveBeenCalledWith("languages");
    expect(res.data).toBeDefined();
  });

  it("should search by languages", async () => {
    spellModel.distinct.mockResolvedValue(["en", "fr"]);
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const res = await service.findAll({ lang: "fr" });

    expect(res.data).toBeDefined();
  });

  it("should search with sort", async () => {
    spellModel.distinct.mockResolvedValue(["en", "fr"]);
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const res = await service.findAll({ lang: "fr", sort: "-tag" });

    expect(res.data).toBeDefined();
  });

  it("should throw InternalServerErrorException on error", async () => {
    spellModel.countDocuments.mockRejectedValue(new Error("DB_ERR"));

    await expect(service.findAll({})).rejects.toThrow(InternalServerErrorException);
  });
});

describe("SpellsService - findOne", () => {
  let service: SpellsService;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockSpell = {
    _id: id,
    tag: 2,
    languages: ["en", "fr"],
    translations: new Map([
      ["en", { name: "Fire" }],
      ["fr", { name: "Feu" }],
    ]),
    deletedAt: null,
  };

  beforeEach(async () => {
    spellModel = {
      findById: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should return a spell with filtered translation", async () => {
    spellModel.exec.mockResolvedValue(mockSpell);

    const result = await service.findOne(id, "fr");

    expect(spellModel.findById).toHaveBeenCalledWith(id);
    expect(result.data).toBeDefined();
  });

  it("should fallback to first language when lang invalid", async () => {
    spellModel.exec.mockResolvedValue(mockSpell);

    const result = await service.findOne(id, "jp");

    expect(result.data).toBeDefined();
  });

  it("should throw NotFoundException if spell not found", async () => {
    spellModel.exec.mockResolvedValue(null);

    await expect(service.findOne(id, "en")).rejects.toThrow(NotFoundException);
  });

  it("should throw GoneException if deleted", async () => {
    spellModel.exec.mockResolvedValue({ ...mockSpell, deletedAt: new Date() });

    await expect(service.findOne(id, "en")).rejects.toThrow(GoneException);
  });

  it("should throw InternalServerErrorException on DB error", async () => {
    spellModel.exec.mockRejectedValue(new Error("DB fail"));

    await expect(service.findOne(id, "en")).rejects.toThrow(InternalServerErrorException);
  });
});

describe("SpellsService - update", () => {
  let service: SpellsService;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockOldSpell = {
    _id: id,
    tag: 2,
    translations: new Map(),
  };

  beforeEach(async () => {
    spellModel = {
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should update a spell", async () => {
    spellModel.exec.mockResolvedValue({});

    const result = await service.update(id, { ...mockOldSpell } as any, { tag: 10 } as any);

    expect(spellModel.updateOne).toHaveBeenCalledWith({ _id: id }, { tag: 10 });
    expect(result.data.tag).toBe(10);
  });

  it("should throw InternalServerErrorException on error", async () => {
    spellModel.exec.mockRejectedValue(new Error("DB fail"));

    await expect(service.update(id, mockOldSpell as any, { tag: 5 } as any)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});

describe("SpellsService - delete", () => {
  let service: SpellsService;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockSpell = {
    _id: id,
    translations: new Map(),
    deletedAt: null,
  };

  beforeEach(async () => {
    spellModel = {
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should soft delete a spell", async () => {
    spellModel.exec.mockResolvedValue({});

    const result = await service.delete(id, { ...mockSpell, languages: ["en"] } as any);

    expect(spellModel.updateOne).toHaveBeenCalled();
    expect(result.data.deletedAt).toBeDefined();
  });

  it("should throw InternalServerErrorException on error", async () => {
    spellModel.exec.mockRejectedValue(new Error("FAIL"));

    await expect(service.delete(id, mockSpell as any)).rejects.toThrow(InternalServerErrorException);
  });
});

describe("SpellsService - getTranslations", () => {
  let service: SpellsService;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockSpell = {
    _id: id,
    tag: 1,
    languages: ["en", "fr"],
    translations: new Map([
      [
        "en",
        {
          srd: true,
          name: "Fireball",
          level: 3,
          school: "Evocation",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [
        "fr",
        {
          srd: false,
          name: "Boule de feu",
          level: 3,
          school: "Évocation",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    ]),
    deletedAt: null,
  };

  beforeEach(async () => {
    spellModel = {
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should return all translations for a spell", async () => {
    spellModel.exec.mockResolvedValue(mockSpell);

    const result = await service.getTranslations(id);

    expect(spellModel.findById).toHaveBeenCalledWith(id);
    expect(result.data.spellId).toBe(id.toString());
    expect(result.data.translations).toHaveLength(2);
    expect(result.data.translations[0].lang).toBe("en");
    expect(result.data.translations[1].lang).toBe("fr");
  });

  it("should exclude deleted translations", async () => {
    const spellWithDeletedTranslation = {
      ...mockSpell,
      translations: new Map([
        [
          "en",
          {
            srd: true,
            name: "Fireball",
            level: 3,
            school: "Evocation",
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        [
          "fr",
          {
            srd: false,
            name: "Boule de feu",
            level: 3,
            school: "Évocation",
            deletedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      ]),
    };
    spellModel.exec.mockResolvedValue(spellWithDeletedTranslation);

    const result = await service.getTranslations(id);

    expect(result.data.translations).toHaveLength(1);
    expect(result.data.translations[0].lang).toBe("en");
  });

  it("should throw NotFoundException if spell not found", async () => {
    spellModel.exec.mockResolvedValue(null);

    await expect(service.getTranslations(id)).rejects.toThrow(NotFoundException);
  });

  it("should throw GoneException if spell is deleted", async () => {
    spellModel.exec.mockResolvedValue({ ...mockSpell, deletedAt: new Date() });

    await expect(service.getTranslations(id)).rejects.toThrow(GoneException);
  });

  it("should throw InternalServerErrorException on DB error", async () => {
    spellModel.exec.mockRejectedValue(new Error("DB fail"));

    await expect(service.getTranslations(id)).rejects.toThrow(InternalServerErrorException);
  });
});

describe("SpellsService - getTranslation", () => {
  let service: SpellsService;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockSpell = {
    _id: id,
    tag: 1,
    languages: ["en", "fr"],
    translations: new Map([
      [
        "en",
        {
          srd: true,
          name: "Fireball",
          level: 3,
          school: "Evocation",
          description: "A fiery spell",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [
        "fr",
        {
          srd: false,
          name: "Boule de feu",
          level: 3,
          school: "Évocation",
          description: "Un sort de feu",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    ]),
    deletedAt: null,
  };

  beforeEach(async () => {
    spellModel = {
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should return a specific translation", async () => {
    spellModel.exec.mockResolvedValue(mockSpell);

    const result = await service.getTranslation(id, "fr");

    expect(spellModel.findById).toHaveBeenCalledWith(id);
    expect(result.data.name).toBe("Boule de feu");
    expect(result.data.level).toBe(3);
  });

  it("should throw NotFoundException if spell not found", async () => {
    spellModel.exec.mockResolvedValue(null);

    await expect(service.getTranslation(id, "en")).rejects.toThrow(NotFoundException);
  });

  it("should throw GoneException if spell is deleted", async () => {
    spellModel.exec.mockResolvedValue({ ...mockSpell, deletedAt: new Date() });

    await expect(service.getTranslation(id, "en")).rejects.toThrow(GoneException);
  });

  it("should throw NotFoundException if translation not found", async () => {
    spellModel.exec.mockResolvedValue(mockSpell);

    await expect(service.getTranslation(id, "de")).rejects.toThrow(NotFoundException);
  });

  it("should throw GoneException if translation is deleted", async () => {
    const spellWithDeletedTranslation = {
      ...mockSpell,
      translations: new Map([
        [
          "en",
          {
            srd: true,
            name: "Fireball",
            level: 3,
            school: "Evocation",
            description: "A fiery spell",
            deletedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      ]),
    };
    spellModel.exec.mockResolvedValue(spellWithDeletedTranslation);

    await expect(service.getTranslation(id, "en")).rejects.toThrow(GoneException);
  });

  it("should throw InternalServerErrorException on DB error", async () => {
    spellModel.exec.mockRejectedValue(new Error("DB fail"));

    await expect(service.getTranslation(id, "en")).rejects.toThrow(InternalServerErrorException);
  });
});

describe("SpellsService - addTranslation", () => {
  let service: SpellsService;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockSpell = {
    _id: id,
    tag: 0,
    languages: ["en"],
    translations: new Map([["en", { name: "Fireball", srd: false }]]),
    deletedAt: null,
  };

  const mockTranslationDto: CreateSpellTranslationDto = {
    srd: false,
    name: "Boule de feu",
    description: "Une boule de feu explose...",
    level: 3,
    school: "Évocation",
    castingTime: "1 action",
    range: "45 mètres",
    components: ["V", "S", "M"],
    duration: "Instantanée",
    effectType: 0,
    damage: "8d6",
  };

  beforeEach(async () => {
    spellModel = {
      findById: jest.fn().mockReturnThis(),
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should add a translation to a homebrew spell (non-admin)", async () => {
    spellModel.exec
      .mockResolvedValueOnce(mockSpell)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ ...mockSpell, languages: ["en", "fr"] });

    const result = await service.addTranslation(id, "fr", mockTranslationDto, false);

    expect(spellModel.findById).toHaveBeenCalledWith(id);
    expect(spellModel.updateOne).toHaveBeenCalled();
    expect(result.message).toContain("Translation 'fr' added to spell");
  });

  it("should throw ForbiddenException if lang format is invalid", async () => {
    await expect(service.addTranslation(id, "FRA", mockTranslationDto, false)).rejects.toThrow(ForbiddenException);

    await expect(service.addTranslation(id, "f", mockTranslationDto, false)).rejects.toThrow(ForbiddenException);
  });

  it("should throw NotFoundException if spell not found", async () => {
    spellModel.exec.mockResolvedValueOnce(null);

    await expect(service.addTranslation(id, "fr", mockTranslationDto, false)).rejects.toThrow(NotFoundException);
  });

  it("should throw GoneException if spell is deleted", async () => {
    spellModel.exec.mockResolvedValueOnce({ ...mockSpell, deletedAt: new Date() });

    await expect(service.addTranslation(id, "fr", mockTranslationDto, false)).rejects.toThrow(GoneException);
  });

  it("should throw ConflictException if translation already exists", async () => {
    spellModel.exec.mockResolvedValueOnce(mockSpell);

    await expect(service.addTranslation(id, "en", mockTranslationDto, false)).rejects.toThrow(ConflictException);
  });

  it("should throw ForbiddenException if non-admin tries to add SRD translation to homebrew", async () => {
    spellModel.exec.mockResolvedValueOnce(mockSpell);

    const srdTranslation = { ...mockTranslationDto, srd: true };

    await expect(service.addTranslation(id, "fr", srdTranslation, false)).rejects.toThrow(ForbiddenException);
  });

  it("should allow admin to add SRD translation to homebrew spell", async () => {
    spellModel.exec
      .mockResolvedValueOnce(mockSpell)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ ...mockSpell, tag: 1, languages: ["en", "fr"] });

    const srdTranslation = { ...mockTranslationDto, srd: true };

    const result = await service.addTranslation(id, "fr", srdTranslation, true);

    expect(result.message).toContain("Translation 'fr' added to spell");
  });

  it("should throw ForbiddenException if non-admin tries to add translation to official spell", async () => {
    const officialSpell = { ...mockSpell, tag: 1 };
    spellModel.exec.mockResolvedValueOnce(officialSpell);

    await expect(service.addTranslation(id, "fr", mockTranslationDto, false)).rejects.toThrow(ForbiddenException);
  });

  it("should allow admin to add translation to official spell", async () => {
    const officialSpell = { ...mockSpell, tag: 1 };
    spellModel.exec
      .mockResolvedValueOnce(officialSpell)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ ...officialSpell, languages: ["en", "fr"] });

    const result = await service.addTranslation(id, "fr", mockTranslationDto, true);

    expect(result.message).toContain("Translation 'fr' added to spell");
  });

  it("should throw InternalServerErrorException on database error", async () => {
    spellModel.exec.mockRejectedValueOnce(new Error("DB error"));

    await expect(service.addTranslation(id, "fr", mockTranslationDto, false)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it("should throw BadRequestException if components count does not match existing translations", async () => {
    const spellWithDifferentComponentsCount = {
      ...mockSpell,
      translations: new Map([["en", { name: "Fireball", srd: false, components: ["V", "S"] }]]),
    };
    spellModel.exec.mockResolvedValueOnce(spellWithDifferentComponentsCount);

    // mockTranslationDto has 3 components: ["V", "S", "M"] but existing has 2: ["V", "S"]
    await expect(service.addTranslation(id, "fr", mockTranslationDto, false)).rejects.toThrow(BadRequestException);
  });

  it("should accept translation with same component count but different values", async () => {
    const spellWithSameComponentCount = {
      ...mockSpell,
      translations: new Map([["en", { name: "Fireball", srd: false, components: ["V", "S", "M"] }]]),
    };
    spellModel.exec
      .mockResolvedValueOnce(spellWithSameComponentCount)
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ ...spellWithSameComponentCount, languages: ["en", "fr"] });

    // Different component values but same count (3)
    const translationWithDifferentComponentValues = {
      ...mockTranslationDto,
      components: ["P", "G", "C"], // French equivalents for example
    };

    const result = await service.addTranslation(id, "fr", translationWithDifferentComponentValues, false);

    expect(result.message).toContain("Translation 'fr' added to spell");
  });
});

describe("SpellsService - findOneWithAllTranslations", () => {
  let service: SpellsService;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockSpell = {
    _id: id,
    tag: 0,
    languages: ["en", "fr"],
    translations: new Map([
      ["en", { name: "Fire", srd: false, deletedAt: null }],
      ["fr", { name: "Feu", srd: false, deletedAt: null }],
    ]),
    deletedAt: null,
  };

  beforeEach(async () => {
    spellModel = {
      findById: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should return spell with all translations", async () => {
    spellModel.exec.mockResolvedValue(mockSpell);

    const result = await service.findOneWithAllTranslations(id);

    expect(spellModel.findById).toHaveBeenCalledWith(id);
    expect(result).toBeDefined();
    expect(result.translations.size).toBe(2);
  });

  it("should throw NotFoundException if spell not found", async () => {
    spellModel.exec.mockResolvedValue(null);

    await expect(service.findOneWithAllTranslations(id)).rejects.toThrow(NotFoundException);
  });

  it("should throw InternalServerErrorException on DB error", async () => {
    spellModel.exec.mockRejectedValue(new Error("DB fail"));

    await expect(service.findOneWithAllTranslations(id)).rejects.toThrow(InternalServerErrorException);
  });
});

describe("SpellsService - deleteTranslation", () => {
  let service: SpellsService;
  let spellModel: any;

  const id = new Types.ObjectId();

  beforeEach(async () => {
    spellModel = {
      updateOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SpellsService, { provide: getModelToken(Spell.name), useValue: spellModel }],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it("should delete a non-SRD translation successfully", async () => {
    const mockSpell = {
      _id: id,
      tag: 0,
      languages: ["en", "fr"],
      translations: new Map([
        ["en", { name: "Fire", srd: false, deletedAt: null }],
        ["fr", { name: "Feu", srd: false, deletedAt: null }],
      ]),
      deletedAt: null,
    };

    spellModel.exec.mockResolvedValue({});

    const result = await service.deleteTranslation(id, "fr", mockSpell as any);

    expect(spellModel.updateOne).toHaveBeenCalled();
    expect(result.deletedLanguage).toBe("fr");
    expect(result.remainingLanguages).toEqual(["en"]);
  });

  it("should throw NotFoundException if translation does not exist", async () => {
    const mockSpell = {
      _id: id,
      tag: 0,
      languages: ["en"],
      translations: new Map([["en", { name: "Fire", srd: false, deletedAt: null }]]),
      deletedAt: null,
    };

    await expect(service.deleteTranslation(id, "fr", mockSpell as any)).rejects.toThrow(NotFoundException);
  });

  it("should throw GoneException if translation already deleted", async () => {
    const mockSpell = {
      _id: id,
      tag: 0,
      languages: ["en", "fr"],
      translations: new Map([
        ["en", { name: "Fire", srd: false, deletedAt: null }],
        ["fr", { name: "Feu", srd: false, deletedAt: new Date() }],
      ]),
      deletedAt: null,
    };

    await expect(service.deleteTranslation(id, "fr", mockSpell as any)).rejects.toThrow(GoneException);
  });

  it("should throw ForbiddenException when trying to delete SRD translation", async () => {
    const mockSpell = {
      _id: id,
      tag: 1,
      languages: ["en", "fr"],
      translations: new Map([
        ["en", { name: "Fireball", srd: true, deletedAt: null }],
        ["fr", { name: "Boule de feu", srd: false, deletedAt: null }],
      ]),
      deletedAt: null,
    };

    await expect(service.deleteTranslation(id, "en", mockSpell as any)).rejects.toThrow(ForbiddenException);
  });

  it("should throw ForbiddenException when trying to delete last active translation", async () => {
    const mockSpell = {
      _id: id,
      tag: 0,
      languages: ["en"],
      translations: new Map([["en", { name: "Fire", srd: false, deletedAt: null }]]),
      deletedAt: null,
    };

    await expect(service.deleteTranslation(id, "en", mockSpell as any)).rejects.toThrow(ForbiddenException);
  });

  it("should throw InternalServerErrorException on DB error", async () => {
    const mockSpell = {
      _id: id,
      tag: 0,
      languages: ["en", "fr"],
      translations: new Map([
        ["en", { name: "Fire", srd: false, deletedAt: null }],
        ["fr", { name: "Feu", srd: false, deletedAt: null }],
      ]),
      deletedAt: null,
    };

    spellModel.exec.mockRejectedValue(new Error("DB fail"));

    await expect(service.deleteTranslation(id, "fr", mockSpell as any)).rejects.toThrow(InternalServerErrorException);
  });
});
