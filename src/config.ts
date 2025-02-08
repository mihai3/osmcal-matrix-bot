// modified: mihai3 2025-02-08
import * as _config from "config";

interface IConfig {
    homeserverUrl: string;
    accessToken: string;
    dataPath: string;
    encryption: boolean;
    rooms: {id: string, osmcal: string; lang?: string; }
}

export default _config.default<IConfig>;
