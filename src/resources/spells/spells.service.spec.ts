import { Test, TestingModule } from '@nestjs/testing';
import { SpellsService } from './spells.service';
import { getModelToken } from '@nestjs/mongoose';
import { Spell } from './schemas/spell.schema';
import { InternalServerErrorException, NotFoundException, GoneException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('SpellsService - create', () => {
  let service: SpellsService;
  let spellModel: any;

  const mockCreateDto = {
    tag: 1,
    spellContent: { name: 'Fireball' },
    languages: ['en'],
  };

  const mockCreatedSpell = {
    _id: new Types.ObjectId(),
    tag: 1,
    languages: ['en'],
    translations: new Map([['en', { name: 'Fireball' }]]),
  };

  beforeEach(async () => {
    spellModel = {
      constructor: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpellsService,
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it('should create a spell successfully', async () => {
    const fakeInstance = { save: jest.fn().mockResolvedValue(mockCreatedSpell) };

    // simulate `new this.spellModel(spell)` returning fake instance
    const ModelFn: any = function () {
      return fakeInstance;
    };
    ModelFn.prototype = {};
    (service as any).spellModel = ModelFn;

    const logSpy = jest.spyOn(service['logger'], 'log').mockImplementation(() => {});

    const result = await service.create(mockCreateDto as any);

    expect(result.data).toBeDefined();
    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/created in \d+ms/));

    logSpy.mockRestore();
  });

  it('should handle errors', async () => {
    const fakeInstance = { save: jest.fn().mockRejectedValue(new Error('DB fail')) };
    const ModelFn: any = function () { return fakeInstance; };
    ModelFn.prototype = {};
    (service as any).spellModel = ModelFn;

    const errSpy = jest.spyOn(service['logger'], 'error').mockImplementation(() => {});

    await expect(service.create({} as any)).rejects.toThrow(InternalServerErrorException);

    expect(errSpy).toHaveBeenCalledWith(expect.stringMatching(/An error occurred while creating spell/));

    errSpy.mockRestore();
  });
});

describe('SpellsService - findAll', () => {
  let service: SpellsService;
  let spellModel: any;

  const mockSpell = {
    _id: new Types.ObjectId(),
    tag: 2,
    languages: ['en', 'fr'],
    translations: new Map([['en', { name: 'Fire' }], ['fr', { name: 'Feu' }]]),
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
      providers: [
        SpellsService,
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it('should return spells with pagination', async () => {
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const result = await service.findAll({ page: 1, offset: 10 });

    expect(spellModel.countDocuments).toHaveBeenCalled();
    expect(spellModel.skip).toHaveBeenCalledWith(0);
    expect(spellModel.limit).toHaveBeenCalledWith(10);

    expect(result).toHaveProperty('pagination');
    expect(result.data.length).toBe(1);
  });

  it('should search by name and lang', async () => {
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const result = await service.findAll({ name: 'Fire', lang: 'en' });

    expect(spellModel.countDocuments).toHaveBeenCalled();
    expect(result.pagination.totalItems).toBe(1);
  });

  it('should search by name in all languages', async () => {
    spellModel.distinct.mockResolvedValue(['en', 'fr']);
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const res = await service.findAll({ name: 'Fire' });

    expect(spellModel.distinct).toHaveBeenCalledWith('languages');
    expect(res.data).toBeDefined();
  });

  it('should search by languages', async () => {
    spellModel.distinct.mockResolvedValue(['en', 'fr']);
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const res = await service.findAll({ lang: 'fr' });

    expect(res.data).toBeDefined();
  });

  it('should search with sort', async () => {
    spellModel.distinct.mockResolvedValue(['en', 'fr']);
    spellModel.countDocuments.mockResolvedValue(1);
    spellModel.exec.mockResolvedValue([mockSpell]);

    const res = await service.findAll({ lang: 'fr', sort: '-tag' });

    expect(res.data).toBeDefined();
  });

  it('should throw InternalServerErrorException on error', async () => {
    spellModel.countDocuments.mockRejectedValue(new Error('DB_ERR'));

    await expect(service.findAll({})).rejects.toThrow(InternalServerErrorException);
  });
});

describe('SpellsService - findOne', () => {
  let service: SpellsService;
  let spellModel: any;

  const id = new Types.ObjectId();

  const mockSpell = {
    _id: id,
    tag: 2,
    languages: ['en', 'fr'],
    translations: new Map([['en', { name: 'Fire' }], ['fr', { name: 'Feu' }]]),
    deletedAt: null,
  };

  beforeEach(async () => {
    spellModel = {
      findById: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpellsService,
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it('should return a spell with filtered translation', async () => {
    spellModel.exec.mockResolvedValue(mockSpell);

    const result = await service.findOne(id, 'fr');

    expect(spellModel.findById).toHaveBeenCalledWith(id);
    expect(result.data).toBeDefined();
  });

  it('should fallback to first language when lang invalid', async () => {
    spellModel.exec.mockResolvedValue(mockSpell);

    const result = await service.findOne(id, 'jp');

    expect(result.data).toBeDefined();
  });

  it('should throw NotFoundException if spell not found', async () => {
    spellModel.exec.mockResolvedValue(null);

    await expect(service.findOne(id, 'en')).rejects.toThrow(NotFoundException);
  });

  it('should throw GoneException if deleted', async () => {
    spellModel.exec.mockResolvedValue({ ...mockSpell, deletedAt: new Date() });

    await expect(service.findOne(id, 'en')).rejects.toThrow(GoneException);
  });

  it('should throw InternalServerErrorException on DB error', async () => {
    spellModel.exec.mockRejectedValue(new Error('DB fail'));

    await expect(service.findOne(id, 'en')).rejects.toThrow(InternalServerErrorException);
  });
});

describe('SpellsService - update', () => {
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
      providers: [
        SpellsService,
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it('should update a spell', async () => {
    spellModel.exec.mockResolvedValue({});

    const result = await service.update(id, { ...mockOldSpell } as any, { tag: 10 } as any);

    expect(spellModel.updateOne).toHaveBeenCalledWith({ _id: id }, { tag: 10 });
    expect(result.data.tag).toBe(10);
  });

  it('should throw InternalServerErrorException on error', async () => {
    spellModel.exec.mockRejectedValue(new Error('DB fail'));

    await expect(service.update(id, mockOldSpell as any, { tag: 5 } as any)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});

describe('SpellsService - delete', () => {
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
      providers: [
        SpellsService,
        { provide: getModelToken(Spell.name), useValue: spellModel },
      ],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  it('should soft delete a spell', async () => {
    spellModel.exec.mockResolvedValue({});

    const result = await service.delete(id, { ...mockSpell, languages: ['en'] } as any);

    expect(spellModel.updateOne).toHaveBeenCalled();
    expect(result.data.deletedAt).toBeDefined();
  });

  it('should throw InternalServerErrorException on error', async () => {
    spellModel.exec.mockRejectedValue(new Error('FAIL'));

    await expect(service.delete(id, mockSpell as any)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});