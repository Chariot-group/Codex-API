import { Test, TestingModule } from "@nestjs/testing";
import { MonstersController } from "@/resources/monsters/monsters.controller";
import { MonstersService } from "@/resources/monsters/monsters.service";

describe("MonstersController", () => {
  let controller: MonstersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonstersController],
      providers: [MonstersService],
    }).compile();

    controller = module.get<MonstersController>(MonstersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
