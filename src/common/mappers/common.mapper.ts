interface Translatable {
  languages: string[];
  translations: Record<string, any>;
}
/**
 * Generic class allowing modification of a DTO
 * @param T must have languages and translations
 */
export class DtoMapper<T extends Translatable>{

    /**
     * Subtracted from languages, languages already in translations
     * @param entry a dto that has languages and translations
     * @returns the dto with modified languages
     */
    calculAvailablesLanguages(entry: T): T {
        const languages = entry.languages;
        const currentTranslations =
        entry.translations instanceof Map
            ? Array.from(entry.translations.keys())
            : Object.keys(entry.translations);

        const availables = languages.filter(lang => !currentTranslations.includes(lang));

        entry.languages = availables;
        return entry;
    }

    /**
     * Subtracted from languages, languages already in translations for each dto
     * @param entry list of dtos that has languages and translations
     * @returns the dto list with modified languages
     */
    calculAvailablesLanguagesList(entry: T[]): T[] {
        return entry.map(val => {
            return this.calculAvailablesLanguages(val);
        });
    }

}