import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ _id: false })
export class Challenge {
  @Prop()
  challengeRating?: number;

  @Prop()
  experiencePoints?: number;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
