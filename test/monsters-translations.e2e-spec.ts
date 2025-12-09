import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "@/app.module";
import { getModelToken } from "@nestjs/mongoose";
import { Monster } from "@/resources/monsters/schemas/monster.schema";
import { Types } from "mongoose";

describe("Monsters Translations (e2e)", () => {
  let app: INestApplication<App>;
  let monsterModel: any;
  let testMonsterId: Types.ObjectId;

  const mockMonsterData = {
    tag: 1,
    languages: ["en", "fr", "es"],
    deletedAt: null,
    translations: new Map([
      [
        "en",
        {
          srd: true,
          name: "Goblin",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          stats: { size: 1, maxHitPoints: 7 },
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
          stats: { size: 1, maxHitPoints: 7 },
        },
      ],
      [
        "es",
        {
          srd: false,
          name: "Trasgo",
          deletedAt: new Date(), // This one is deleted
          createdAt: new Date(),
          updatedAt: new Date(),
          stats: { size: 1, maxHitPoints: 7 },
        },
      ],
    ]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    monsterModel = moduleFixture.get(getModelToken(Monster.name));
  });

  afterAll(async () => {
    // Clean up test data
    if (testMonsterId) {
      await monsterModel.deleteOne({ _id: testMonsterId });
    }
    await app.close();
  });

  describe("GET /monsters/:id/translations", () => {
    beforeAll(async () => {
      // Create a test monster
      const monster = new monsterModel(mockMonsterData);
      const saved = await monster.save();
      testMonsterId = saved._id;
    });

    it("should return list of available translations", async () => {
      const response = await request(app.getHttpServer()).get(`/monsters/${testMonsterId}/translations`).expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      // Should only return non-deleted translations (en and fr, not es)
      expect(response.body.data.length).toBe(2);

      const langs = response.body.data.map((t: any) => t.lang);
      expect(langs).toContain("en");
      expect(langs).toContain("fr");
      expect(langs).not.toContain("es"); // Deleted translation

      // Check structure of translation summary
      const enTranslation = response.body.data.find((t: any) => t.lang === "en");
      expect(enTranslation).toHaveProperty("srd", true);
      expect(enTranslation).toHaveProperty("name", "Goblin");
    });

    it("should return 404 for non-existent monster", async () => {
      const fakeId = new Types.ObjectId();
      const response = await request(app.getHttpServer()).get(`/monsters/${fakeId}/translations`).expect(404);

      expect(response.body).toHaveProperty("status", 404);
    });

    it("should return 400 for invalid monster ID", async () => {
      await request(app.getHttpServer()).get("/monsters/invalid-id/translations").expect(400);
    });

    it("should return 410 for deleted monster", async () => {
      // Create a deleted monster
      const deletedMonster = new monsterModel({
        ...mockMonsterData,
        deletedAt: new Date(),
      });
      const saved = await deletedMonster.save();

      const response = await request(app.getHttpServer()).get(`/monsters/${saved._id}/translations`).expect(410);

      expect(response.body).toHaveProperty("status", 410);

      // Clean up
      await monsterModel.deleteOne({ _id: saved._id });
    });
  });

  describe("GET /monsters/:id/translations/:lang", () => {
    it("should return specific translation", async () => {
      const response = await request(app.getHttpServer()).get(`/monsters/${testMonsterId}/translations/fr`).expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe("Gobelin");
      expect(response.body.data.srd).toBe(false);
    });

    it("should return 404 for non-existent translation", async () => {
      const response = await request(app.getHttpServer()).get(`/monsters/${testMonsterId}/translations/de`).expect(404);

      expect(response.body).toHaveProperty("status", 404);
    });

    it("should return 404 for non-existent monster", async () => {
      const fakeId = new Types.ObjectId();
      const response = await request(app.getHttpServer()).get(`/monsters/${fakeId}/translations/en`).expect(404);

      expect(response.body).toHaveProperty("status", 404);
    });

    it("should return 400 for invalid language code", async () => {
      await request(app.getHttpServer()).get(`/monsters/${testMonsterId}/translations/invalid`).expect(400);
    });

    it("should return 400 for uppercase language code", async () => {
      await request(app.getHttpServer()).get(`/monsters/${testMonsterId}/translations/FR`).expect(400);
    });

    it("should return 410 for deleted translation", async () => {
      // es translation is marked as deleted
      const response = await request(app.getHttpServer()).get(`/monsters/${testMonsterId}/translations/es`).expect(410);

      expect(response.body).toHaveProperty("status", 410);
    });

    it("should return 410 for deleted monster", async () => {
      // Create a deleted monster
      const deletedMonster = new monsterModel({
        ...mockMonsterData,
        deletedAt: new Date(),
      });
      const saved = await deletedMonster.save();

      const response = await request(app.getHttpServer()).get(`/monsters/${saved._id}/translations/en`).expect(410);

      expect(response.body).toHaveProperty("status", 410);

      // Clean up
      await monsterModel.deleteOne({ _id: saved._id });
    });
  });
});
