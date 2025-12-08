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
