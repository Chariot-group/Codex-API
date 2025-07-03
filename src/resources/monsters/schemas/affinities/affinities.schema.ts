import { Prop } from '@nestjs/mongoose';

export class Affinities {
  @Prop({ type: [String], default: [] })
  resistances: string[];

  @Prop({ type: [String], default: [] })
  immunities: string[];

  @Prop({ type: [String], default: [] })
  vulnerabilities: string[];
}
