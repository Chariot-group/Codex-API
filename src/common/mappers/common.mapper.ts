interface Translatable {
  languages: string[];
  translations: Record<string, any>;
}
/**
 * Generic class allowing modification of a DTO
 * @param T must have languages and translations
 */
export class DtoMapper<T extends Translatable> {
  /**
   * Returns the entry with languages representing all available translations.
   * The languages array will contain all languages that have translations.
   * @param entry a dto that has languages and translations
   * @returns the dto with languages set to all available translation languages
   */
  calculAvailablesLanguages(entry: T): T {
    const currentTranslations =
      entry.translations instanceof Map ? Array.from(entry.translations.keys()) : Object.keys(entry.translations);

    entry.languages = currentTranslations;
    return entry;
  }

  /**
   * Subtracted from languages, languages already in translations for each dto
   * @param entry list of dtos that has languages and translations
   * @returns the dto list with modified languages
   */
  calculAvailablesLanguagesList(entry: T[]): T[] {
    return entry.map((val) => {
      return this.calculAvailablesLanguages(val);
    });
  }
}
