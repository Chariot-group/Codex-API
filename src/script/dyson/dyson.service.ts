import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { writeFile } from 'fs/promises';
import { Monster } from 'src/common/models/dnd-monsters';
import { Spell } from 'src/common/models/dnd-spell';

@Injectable()
export class DysonService {
    readonly SERVICE_NAME = this.constructor.name;
    readonly BASE_URL = 'https://www.dnd5eapi.co/api';

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async launch(resource: string): Promise<void> {
        const url = `${this.BASE_URL}/${resource}`;

        try {
        Logger.log(`Fetching from ${url}...`, this.SERVICE_NAME);
        const response = await axios.get(url);

        const results = response.data.results;
        const indexes = results.map((item: any) => item.index);

        Logger.log(`Found ${indexes.length} items.`, this.SERVICE_NAME);

        const data: Spell[] | Monster[] = [];
        let i = 0;

        for (const index of indexes) {
            i++;
            const itemUrl = `${this.BASE_URL}/${resource}/${index}`;
            Logger.log(`Fetching ${i}/${indexes.length}`, this.SERVICE_NAME);
            try {
                const itemResponse = await axios.get(itemUrl);
                data.push(itemResponse.data);
            } catch (err) {
                Logger.error(`Error fetching ${itemUrl}: ${err.message}`, this.SERVICE_NAME);
            }

            await this.delay(200); // ⏳ 200ms de pause entre chaque appel (~5/sec)
        }

        await writeFile(`./src/script/output/${resource}.json`, JSON.stringify(data, null, 2));
        Logger.log(`Data saved to ${resource}.json`, this.SERVICE_NAME);

        } catch (error) {
        Logger.error(`Error fetching ${url}: ${error.message}`, this.SERVICE_NAME);
        throw error;
        }
    }
}