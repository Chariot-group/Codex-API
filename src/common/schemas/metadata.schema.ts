import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class MetaDataSchema {
  @Prop({ required: true, default: true })
  srd: boolean;

  @Prop({ length: 5 }) // ex: 'fr-CA', 'fr-FR', 'en-US'
  lang: string;
}
