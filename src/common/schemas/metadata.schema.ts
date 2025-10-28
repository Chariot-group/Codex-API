import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class MetaDataSchema {
  
    /**
    * O: homebrew, 1: Certifié par Chariot
    */
    @Prop({ required: true, default: true })
    tag: number;
    
    /**
    * Liste des langues vérifier disponible
    */
    @Prop({
        type: [String],
        default: [],
            validate: {
            validator: function (languages: string[]) {
                return Array.isArray(languages) && languages.every(lang => /^[a-z]{2}$/.test(lang));
            },
            message: "Each language must be a 2-letter ISO code in lowercase (e.g., FRA, USA, DEU)."
        }
    })
    languages: string[];

}
