import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Affinities } from "@/resources/monsters/schemas/affinities/affinities.schema";
import { Ability } from "@/resources/monsters/schemas/ability/ability.schema";
import { Spellcasting } from "@/resources/monsters/schemas/spellcasting/spellcasting.schema";
import { Stats } from "@/resources/monsters/schemas/stats/stats.schema";
import { Actions } from "@/resources/monsters/schemas/actions/actions.schema";
import { Challenge } from "@/resources/monsters/schemas/challenge/challenge.schema";
import { Profile } from "@/resources/monsters/schemas/profile/profile.schema";

@Schema()
export class MonsterContent {
  @ApiProperty({ example: true })
  @Prop({ required: true, default: true })
  srd: boolean;

  @ApiProperty({ example: null })
  @Prop({ default: null })
  deletedAt?: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ default: new Date() })
  createdAt?: Date;

  @ApiProperty({ example: new Date() })
  @Prop({ default: new Date() })
  updatedAt?: Date;

  @ApiProperty({ example: "Goblin" })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ type: () => Stats })
  @Prop({ type: Stats, default: {} })
  stats: Stats;

  @ApiProperty({ type: () => Affinities })
  @Prop({ type: Affinities, default: {} })
  affinities: Affinities;

  @ApiProperty({ type: () => [Ability] })
  @Prop({ type: [Ability], default: [] })
  abilities: Ability[];

  @ApiProperty({ type: () => [Spellcasting] })
  @Prop({ type: [Spellcasting], default: [] })
  spellcasting: Spellcasting[];

  @ApiProperty({ type: () => Actions })
  @Prop({ type: Actions, default: {} })
  actions: Actions;

  @ApiProperty({ type: () => Challenge })
  @Prop({ type: Challenge, default: {} })
  challenge: Challenge;

  @ApiProperty({ type: () => Profile, required: false })
  @Prop({ type: Profile, default: {} })
  profile?: Profile;
}

export const MonsterContentSchema = SchemaFactory.createForClass(MonsterContent);
