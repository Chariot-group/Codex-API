import { MonstersMapper } from "./monsters.mapper";
import { CreateMonsterDto } from "../dtos/create-monster.dto";
import { Monster } from "../schemas/monster.schema";
import { Types } from "mongoose";

describe("MonstersMapper", () => {
  let mapper: MonstersMapper;

  beforeEach(() => {
    mapper = new MonstersMapper();
  });

  describe("dtoToEntity", () => {
    it("should convert a simple CreateMonsterDto to Monster entity", () => {
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

      const result: Monster = mapper.dtoToEntity(dto);

      expect(result).toBeDefined();
      expect(result.languages).toEqual(["en"]);
      expect(result.translations.size).toBe(1);
      expect(result.translations.get("en")).toBeDefined();
      expect(result.translations.get("en")?.name).toBe("Goblin");
      expect(result.translations.get("en")?.srd).toBe(false);
    });

    it("should convert a monster with complete stats", () => {
      const dto: CreateMonsterDto = {
        lang: "fr",
        monsterContent: {
          name: "Gobelin",
          stats: {
            size: 2,
            maxHitPoints: 20,
            currentHitPoints: 15,
            tempHitPoints: 5,
            armorClass: 18,
            passivePerception: 12,
            languages: ["Common", "Goblin"],
            speed: {
              walk: 30,
              climb: 20,
              swim: 10,
              fly: 0,
              burrow: 0,
            },
            abilityScores: {
              strength: 14,
              dexterity: 16,
              constitution: 13,
              intelligence: 10,
              wisdom: 11,
              charisma: 8,
            },
            savingThrows: {
              strength: 2,
              dexterity: 5,
              constitution: 1,
              intelligence: 0,
              wisdom: 0,
              charisma: -1,
            },
            skills: {
              athletics: 4,
              acrobatics: 5,
              stealth: 7,
            },
            senses: [
              { name: "Darkvision", value: 60 },
              { name: "Passive Perception", value: 12 },
            ],
          },
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      expect(result).toBeDefined();
      const content = result.translations.get("fr");
      expect(content).toBeDefined();
      expect(content?.name).toBe("Gobelin");
      expect(content?.stats).toBeDefined();
      expect(content?.stats?.size).toBe(2);
      expect(content?.stats?.maxHitPoints).toBe(20);
      expect(content?.stats?.currentHitPoints).toBe(15);
      expect(content?.stats?.tempHitPoints).toBe(5);
      expect(content?.stats?.armorClass).toBe(18);
      expect(content?.stats?.passivePerception).toBe(12);
      expect(content?.stats?.languages).toEqual(["Common", "Goblin"]);
      expect(content?.stats?.speed).toBeDefined();
      expect(content?.stats?.speed?.walk).toBe(30);
      expect(content?.stats?.abilityScores).toBeDefined();
      expect(content?.stats?.abilityScores?.strength).toBe(14);
      expect(content?.stats?.savingThrows).toBeDefined();
      expect(content?.stats?.savingThrows?.dexterity).toBe(5);
      expect(content?.stats?.skills).toBeDefined();
      expect(content?.stats?.skills?.stealth).toBe(7);
      expect(content?.stats?.senses).toBeDefined();
      expect(content?.stats?.senses?.length).toBe(2);
    });

    it("should convert a monster with affinities", () => {
      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Fire Elemental",
          affinities: {
            resistances: ["cold"],
            immunities: ["fire", "poison"],
            vulnerabilities: ["water"],
            conditionImmunities: ["exhaustion", "paralyzed"],
          },
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.affinities).toBeDefined();
      expect(content?.affinities?.immunities).toContain("fire");
      expect(content?.affinities?.resistances).toContain("cold");
      expect(content?.affinities?.vulnerabilities).toContain("water");
      expect(content?.affinities?.conditionImmunities).toContain("exhaustion");
    });

    it("should convert a monster with abilities", () => {
      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Ancient Dragon",
          abilities: [
            {
              name: "Legendary Resistance",
              description: "Can choose to succeed on a failed saving throw",
            },
            {
              name: "Magic Resistance",
              description: "Advantage on saving throws against spells",
            },
          ],
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.abilities).toBeDefined();
      expect(content?.abilities?.length).toBe(2);
      expect(content?.abilities?.[0].name).toBe("Legendary Resistance");
      expect(content?.abilities?.[1].name).toBe("Magic Resistance");
    });

    it("should convert a monster with spellcasting", () => {
      const spellId1 = new Types.ObjectId();
      const spellId2 = new Types.ObjectId();

      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Wizard",
          spellcasting: [
            {
              ability: "intelligence",
              saveDC: 15,
              attackBonus: 7,
              totalSlots: 10,
              spells: [spellId1.toString(), spellId2.toString()],
              spellSlotsByLevel: {
                "1": 4,
                "2": 3,
                "3": 3,
              },
            },
          ],
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.spellcasting).toBeDefined();
      expect(content?.spellcasting?.length).toBe(1);
      expect(content?.spellcasting?.[0].ability).toBe("intelligence");
      expect(content?.spellcasting?.[0].saveDC).toBe(15);
      expect(content?.spellcasting?.[0].attackBonus).toBe(7);
      expect(content?.spellcasting?.[0].totalSlots).toBe(10);
      expect(content?.spellcasting?.[0].spells).toBeDefined();
      expect(content?.spellcasting?.[0].spells.length).toBe(2);
      expect(content?.spellcasting?.[0].spellSlotsByLevel).toBeDefined();
    });

    it("should convert a monster with actions", () => {
      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Warrior",
          actions: {
            standard: [
              {
                name: "Sword Attack",
                type: "melee",
                attackBonus: 5,
                range: "5 ft",
                description: "A mighty sword strike",
                damage: {
                  dice: "1d8+3",
                  type: "slashing",
                },
              },
            ],
            legendary: [
              {
                name: "Tail Attack",
                type: "melee",
                attackBonus: 8,
                range: "10 ft",
                description: "A powerful tail swipe",
                legendaryActionCost: 2,
                save: {
                  type: "dexterity",
                  dc: 15,
                  successType: "half",
                },
              },
            ],
            legendaryActionsPerDay: 3,
            reactions: [
              {
                name: "Parry",
                type: "reaction",
                description: "Parries an incoming attack",
              },
            ],
            bonus: [
              {
                name: "Quick Strike",
                type: "bonus",
                description: "A quick bonus action attack",
              },
            ],
            lair: [
              {
                name: "Lair Action",
                type: "lair",
                description: "Controls the battlefield",
              },
            ],
          },
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.actions).toBeDefined();
      expect(content?.actions?.standard).toBeDefined();
      expect(content?.actions?.standard?.length).toBe(1);
      expect(content?.actions?.standard?.[0].name).toBe("Sword Attack");
      expect(content?.actions?.standard?.[0].damage).toBeDefined();
      expect(content?.actions?.standard?.[0].damage?.dice).toBe("1d8+3");
      expect(content?.actions?.legendary).toBeDefined();
      expect(content?.actions?.legendary?.length).toBe(1);
      expect(content?.actions?.legendary?.[0].legendaryActionCost).toBe(2);
      expect(content?.actions?.legendary?.[0].save).toBeDefined();
      expect(content?.actions?.legendaryActionsPerDay).toBe(3);
      expect(content?.actions?.reactions).toBeDefined();
      expect(content?.actions?.reactions?.length).toBe(1);
      expect(content?.actions?.bonus).toBeDefined();
      expect(content?.actions?.bonus?.length).toBe(1);
      expect(content?.actions?.lair).toBeDefined();
      expect(content?.actions?.lair?.length).toBe(1);
    });

    it("should convert a monster with actions having usage", () => {
      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Dragon",
          actions: {
            standard: [
              {
                name: "Breath Weapon",
                type: "special",
                description: "Breathes fire",
                usage: {
                  type: "recharge",
                  times: 1,
                  dice: "1d6",
                  minValue: 5,
                },
              },
            ],
          },
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.actions?.standard?.[0].usage).toBeDefined();
      expect(content?.actions?.standard?.[0].usage?.type).toBe("recharge");
      expect(content?.actions?.standard?.[0].usage?.dice).toBe("1d6");
    });

    it("should convert a monster with challenge", () => {
      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Boss Monster",
          challenge: {
            challengeRating: 10,
            experiencePoints: 5900,
          },
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.challenge).toBeDefined();
      expect(content?.challenge?.challengeRating).toBe(10);
      expect(content?.challenge?.experiencePoints).toBe(5900);
    });

    it("should convert a monster with profile", () => {
      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Evil Wizard",
          profile: {
            type: "humanoid",
            subtype: "human",
            alignment: "chaotic evil",
          },
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.profile).toBeDefined();
      expect(content?.profile?.type).toBe("humanoid");
      expect(content?.profile?.subtype).toBe("human");
      expect(content?.profile?.alignment).toBe("chaotic evil");
    });

    it("should handle spellcasting with Map for spellSlotsByLevel", () => {
      const spellId = new Types.ObjectId();
      const spellSlots = new Map([
        ["1", 4],
        ["2", 3],
      ]);

      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Cleric",
          spellcasting: [
            {
              ability: "wisdom",
              saveDC: 13,
              spells: [spellId.toString()],
              spellSlotsByLevel: spellSlots as any,
            },
          ],
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.spellcasting?.[0].spellSlotsByLevel).toBeDefined();
      expect(content?.spellcasting?.[0].spellSlotsByLevel instanceof Map).toBe(true);
    });

    it("should set default values for optional fields", () => {
      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Simple Monster",
          stats: {
            size: 1,
            maxHitPoints: 10,
          },
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.srd).toBe(false);
      expect(content?.stats?.armorClass).toBe(10);
      expect(content?.stats?.currentHitPoints).toBe(10);
      expect(content?.stats?.tempHitPoints).toBe(0);
      expect(content?.stats?.passivePerception).toBe(0);
    });

    it("should handle empty arrays and undefined fields", () => {
      const dto: CreateMonsterDto = {
        lang: "en",
        monsterContent: {
          name: "Minimal Monster",
        },
      } as any;

      const result: Monster = mapper.dtoToEntity(dto);

      const content = result.translations.get("en");
      expect(content?.name).toBe("Minimal Monster");
      expect(content?.abilities).toBeUndefined();
      expect(content?.spellcasting).toBeUndefined();
      expect(content?.actions).toBeUndefined();
    });
  });
});
