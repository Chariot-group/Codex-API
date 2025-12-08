import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

/**
 * DTO pour la traduction des capacités (abilities).
 * Ne contient que les champs textuels traduisibles.
 */
export class AbilityTranslationDto {
  @ApiProperty({
    description: "Nom de la capacité traduit",
    example: "Vision dans le noir",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Description de la capacité traduite",
    example: "Le monstre peut voir dans l'obscurité jusqu'à 60 pieds.",
  })
  @IsString()
  description: string;
}

/**
 * DTO pour la traduction des actions.
 * Ne contient que les champs textuels traduisibles (name, description).
 * Les valeurs numériques (attackBonus, damage, etc.) ne sont pas modifiables.
 */
export class ActionTranslationDto {
  @ApiPropertyOptional({
    description: "Nom de l'action traduit",
    example: "Attaque multiattaque",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Description de l'action traduite",
    example: "Le dragon effectue trois attaques : une morsure et deux griffes.",
  })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO pour la traduction des groupes d'actions.
 * Contient les traductions pour standard, legendary, lair, reactions et bonus.
 */
export class ActionsTranslationDto {
  @ApiPropertyOptional({
    description: "Actions standard traduites",
    type: [ActionTranslationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionTranslationDto)
  standard?: ActionTranslationDto[];

  @ApiPropertyOptional({
    description: "Actions légendaires traduites",
    type: [ActionTranslationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionTranslationDto)
  legendary?: ActionTranslationDto[];

  @ApiPropertyOptional({
    description: "Actions d'antre traduites",
    type: [ActionTranslationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionTranslationDto)
  lair?: ActionTranslationDto[];

  @ApiPropertyOptional({
    description: "Réactions traduites",
    type: [ActionTranslationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionTranslationDto)
  reactions?: ActionTranslationDto[];

  @ApiPropertyOptional({
    description: "Actions bonus traduites",
    type: [ActionTranslationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionTranslationDto)
  bonus?: ActionTranslationDto[];
}

/**
 * DTO pour la traduction du profil.
 * Ne contient que les champs textuels traduisibles.
 */
export class ProfileTranslationDto {
  @ApiPropertyOptional({
    description: "Type du monstre traduit",
    example: "Dragon",
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: "Sous-type du monstre traduit",
    example: "Rouge",
  })
  @IsOptional()
  @IsString()
  subtype?: string;

  @ApiPropertyOptional({
    description: "Alignement du monstre traduit",
    example: "Chaotique mauvais",
  })
  @IsOptional()
  @IsString()
  alignment?: string;
}

/**
 * DTO pour la traduction des statistiques.
 * Ne contient que les langues qui sont des chaînes traduisibles.
 * Les valeurs numériques (HP, AC, etc.) ne sont pas modifiables.
 */
export class StatsTranslationDto {
  @ApiPropertyOptional({
    description: "Langues parlées par le monstre traduites",
    example: ["Commun", "Draconique"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}

/**
 * DTO pour les traductions de contenu de monstre.
 * Ne contient QUE les champs textuels traduisibles.
 * Les valeurs numériques (stats, challenge, affinities, spellcasting, etc.)
 * sont copiées depuis la traduction originale et ne peuvent pas être modifiées.
 */
export class CreateMonsterTranslationDto {
  @ApiProperty({
    description: "Nom du monstre traduit",
    example: "Dragon Rouge Adulte",
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: "Traduction des statistiques (uniquement les langues)",
    type: StatsTranslationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => StatsTranslationDto)
  stats?: StatsTranslationDto;

  @ApiPropertyOptional({
    description: "Capacités spéciales du monstre traduites",
    type: [AbilityTranslationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbilityTranslationDto)
  abilities?: AbilityTranslationDto[];

  @ApiPropertyOptional({
    description: "Actions du monstre traduites (name et description uniquement)",
    type: ActionsTranslationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ActionsTranslationDto)
  actions?: ActionsTranslationDto;

  @ApiPropertyOptional({
    description: "Profil du monstre traduit (type, sous-type, alignement)",
    type: ProfileTranslationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileTranslationDto)
  profile?: ProfileTranslationDto;
}
