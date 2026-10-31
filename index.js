import * as Search from './src/Search/index.js';
import * as Download from './src/Download/index.js';
import * as Stalks from './src/Stalks/index.js';

export { ScraperError } from './src/utils/http.js';
export { Search, Download, Stalks };

export class Scraper {
    constructor() {
        this.Download = Download;
        this.Search = Search;
        this.Stalks = Stalks;
    }
}

export default Scraper;