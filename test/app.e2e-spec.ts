import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { Types } from "mongoose";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer()).get("/").expect(200).expect("Hello World!");
  });
});

describe("SpellsController - addTranslation (e2e)", () => {
  let app: INestApplication<App>;
  let createdSpellId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create a test spell for translation tests
    const createSpellDto = {
      lang: "en",
      spellContent: {
        name: "Test Spell",
        description: "A test spell for translation",
        level: 1,
        school: "Abjuration",
        castingTime: "1 action",
        range: "30 feet",
        components: ["V", "S"],
        duration: "1 minute",
      },
    };

    const response = await request(app.getHttpServer()).post("/spells").send(createSpellDto).expect(201);

    createdSpellId = response.body.data._id;
  });

  afterAll(async () => {
    // Clean up: delete the test spell
    if (createdSpellId) {
      await request(app.getHttpServer()).delete(`/spells/${createdSpellId}`);
    }
    await app.close();
  });

  it("POST /spells/:id/translations/:lang - should add a translation successfully", async () => {
    const translationDto = {
      srd: false,
      name: "Sort de test",
      description: "Un sort de test pour la traduction",
      level: 1,
      school: "Abjuration",
      castingTime: "1 action",
      range: "9 mètres",
      components: ["V", "S"],
      duration: "1 minute",
    };

    const response = await request(app.getHttpServer())
      .post(`/spells/${createdSpellId}/translations/fr`)
      .send(translationDto)
      .expect(201);

    expect(response.body.message).toContain("Translation 'fr' added to spell");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.languages).toContain("fr");
  });

  it("POST /spells/:id/translations/:lang - should return 409 if translation already exists", async () => {
    const translationDto = {
      srd: false,
      name: "Test Spell Again",
      description: "Another test",
      level: 1,
      components: ["V"],
    };

    await request(app.getHttpServer())
      .post(`/spells/${createdSpellId}/translations/en`)
      .send(translationDto)
      .expect(409);
  });

  it("POST /spells/:id/translations/:lang - should return 400 for invalid language code", async () => {
    const translationDto = {
      srd: false,
      name: "Test Spell",
      description: "Test",
      level: 1,
      components: ["V"],
    };

    await request(app.getHttpServer())
      .post(`/spells/${createdSpellId}/translations/FRA`)
      .send(translationDto)
      .expect(403);
  });

  it("POST /spells/:id/translations/:lang - should return 400 for invalid level", async () => {
    const translationDto = {
      srd: false,
      name: "Test Spell",
      description: "Test",
      level: 15, // Invalid level
      components: ["V"],
    };

    await request(app.getHttpServer())
      .post(`/spells/${createdSpellId}/translations/de`)
      .send(translationDto)
      .expect(400);
  });

  it("POST /spells/:id/translations/:lang - should return 400 for invalid components", async () => {
    const translationDto = {
      srd: false,
      name: "Test Spell",
      description: "Test",
      level: 1,
      components: ["V", "X"], // Invalid component
    };

    await request(app.getHttpServer())
      .post(`/spells/${createdSpellId}/translations/it`)
      .send(translationDto)
      .expect(400);
  });

  it("POST /spells/:id/translations/:lang - should return 404 for non-existent spell", async () => {
    const fakeId = new Types.ObjectId().toString();
    const translationDto = {
      srd: false,
      name: "Test",
      description: "Test",
      level: 1,
      components: ["V"],
    };

    await request(app.getHttpServer()).post(`/spells/${fakeId}/translations/fr`).send(translationDto).expect(404);
  });

  it("POST /spells/:id/translations/:lang - should return 400 for invalid MongoDB ID", async () => {
    const translationDto = {
      srd: false,
      name: "Test",
      description: "Test",
      level: 1,
      components: ["V"],
    };

    await request(app.getHttpServer()).post(`/spells/invalid-id/translations/fr`).send(translationDto).expect(400);
  });
});

describe("MonstersController - addTranslation (e2e)", () => {
  let app: INestApplication<App>;
  let createdMonsterId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create a test monster for translation tests (homebrew, tag=0)
    // Including abilities and actions so we can test translation of those
    const createMonsterDto = {
      lang: "en",
      monsterContent: {
        name: "Test Monster",
        stats: {
          size: 2,
          maxHitPoints: 50,
          armorClass: 15,
          languages: ["Common", "Elvish"],
        },
        abilities: [
          {
            name: "Darkvision",
            description: "Can see in darkness up to 60 feet.",
          },
        ],
        actions: {
          standard: [
            {
              name: "Claw Attack",
              type: "melee",
              attackBonus: 5,
              damage: {
                dice: "1d8+3",
                type: "slashing",
              },
              description: "Melee attack: +5 to hit, reach 5 ft.",
            },
          ],
        },
        profile: {
          type: "humanoid",
          subtype: "elf",
          alignment: "neutral",
        },
        challenge: {
          challengeRating: 2,
          experiencePoints: 450,
        },
      },
    };

    const response = await request(app.getHttpServer()).post("/monsters").send(createMonsterDto).expect(201);

    createdMonsterId = response.body.data._id;
  });

  afterAll(async () => {
    // Clean up: delete the test monster
    if (createdMonsterId) {
      await request(app.getHttpServer()).delete(`/monsters/${createdMonsterId}`);
    }
    await app.close();
  });

  it("POST /monsters/:id/translations/:lang - should add a translation successfully", async () => {
    // New DTO format: only translatable text fields
    const translationDto = {
      name: "Monstre de test",
      stats: {
        languages: ["Commun", "Elfique"],
      },
      abilities: [
        {
          name: "Vision dans le noir",
          description: "Peut voir dans l'obscurité jusqu'à 18 mètres.",
        },
      ],
      actions: {
        standard: [
          {
            name: "Attaque de griffe",
            description: "Attaque de mêlée : +5 pour toucher, allonge 1,50 m.",
          },
        ],
      },
      profile: {
        type: "humanoïde",
        subtype: "elfe",
        alignment: "neutre",
      },
    };

    const response = await request(app.getHttpServer())
      .post(`/monsters/${createdMonsterId}/translations/fr`)
      .send(translationDto)
      .expect(201);

    expect(response.body.message).toContain("Translation 'fr' added to monster");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.languages).toContain("fr");
  });

  it("POST /monsters/:id/translations/:lang - should return 409 if translation already exists", async () => {
    const translationDto = {
      name: "Test Monster Again",
    };

    await request(app.getHttpServer())
      .post(`/monsters/${createdMonsterId}/translations/en`)
      .send(translationDto)
      .expect(409);
  });

  it("POST /monsters/:id/translations/:lang - should return 400 for invalid language code", async () => {
    const translationDto = {
      name: "Test Monster",
    };

    await request(app.getHttpServer())
      .post(`/monsters/${createdMonsterId}/translations/FRA`)
      .send(translationDto)
      .expect(400);
  });

  it("POST /monsters/:id/translations/:lang - should return 404 for non-existent monster", async () => {
    const fakeId = new Types.ObjectId().toString();
    const translationDto = {
      name: "Test",
    };

    await request(app.getHttpServer()).post(`/monsters/${fakeId}/translations/es`).send(translationDto).expect(404);
  });

  it("POST /monsters/:id/translations/:lang - should return 400 for invalid MongoDB ID", async () => {
    const translationDto = {
      name: "Test",
    };

    await request(app.getHttpServer()).post(`/monsters/invalid-id/translations/es`).send(translationDto).expect(400);
  });

  it("POST /monsters/:id/translations/:lang - should return 400 for missing required field (name)", async () => {
    const translationDto = {
      // name is missing
      stats: {
        languages: ["German"],
      },
    };

    await request(app.getHttpServer())
      .post(`/monsters/${createdMonsterId}/translations/pt`)
      .send(translationDto)
      .expect(400);
  });

  it("POST /monsters/:id/translations/:lang - should add translation with abilities", async () => {
    const translationDto = {
      name: "Testmonster",
      abilities: [
        {
          name: "Dunkelsicht",
          description: "Das Monster kann im Dunkeln sehen.",
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post(`/monsters/${createdMonsterId}/translations/de`)
      .send(translationDto)
      .expect(201);

    expect(response.body.data.languages).toContain("de");
  });

  it("POST /monsters/:id/translations/:lang - should add translation with actions", async () => {
    const translationDto = {
      name: "Mostro di prova",
      actions: {
        standard: [
          {
            name: "Attacco con artiglio",
            description: "Attacco in mischia: +5 al tiro per colpire, portata 1,5 metri.",
          },
        ],
      },
    };

    const response = await request(app.getHttpServer())
      .post(`/monsters/${createdMonsterId}/translations/it`)
      .send(translationDto)
      .expect(201);

    expect(response.body.data.languages).toContain("it");
  });
});
