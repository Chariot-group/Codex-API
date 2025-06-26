import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class MetaDataSchema {
  
    @Prop({ required: true, default: true })
    srd: boolean;

}
