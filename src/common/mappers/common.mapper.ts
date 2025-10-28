interface Translatable {
  languages: string[];
  translations: Record<string, any>;
}
export class DtoMapper<T extends Translatable>{

    transform(entry: T): T {
        const languages = entry.languages;
        const currentTranslations =
        entry.translations instanceof Map
            ? Array.from(entry.translations.keys())
            : Object.keys(entry.translations);

        const availables = languages.filter(lang => !currentTranslations.includes(lang));

        entry.languages = availables;
        return entry;
    }

    transforms(entry: T[]): T[] {
        return entry.map(val => {
            return this.transform(val);
        });
    }

}