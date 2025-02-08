import fetch from 'node-fetch';

const version = process.env.npm_package_version;

export async function getEvents(url: string, lang?: string) {
    const headers = { "Client-App": `osmcal-matrix-bot/${version}` };
    if (lang !== undefined)
        headers["Accept-Language"] = lang;

    return (await (await fetch(url, { headers })).json()) as OSMCAL["schemas"]["Events"];
}

// npx openapi-typescript ~/Downloads/openapi.json -o src/osmcal.d.ts
interface OSMCAL {
    schemas: {
        Events: {
            /** @example Mapping Party #23 */
            name: string;
            /**
             * @description Link to event on OSMCAL
             * @example https://osmcal.org/event/23/
             */
            url: string;
            date: OSMCAL["schemas"]["Date"];
            location?: OSMCAL["schemas"]["Location"];
            /**
             * @description Indicates whether event has been cancelled. Omited if not.
             * @default false
             * @example true
             */
            cancelled: boolean;
        }[];
        /** @description Date object, with start date, end date (optional), human date (preferred way of display, localized) and indication, whether the event is a full-day event (`whole_day`). */
        Date: {
            /**
             * @description Start Date as ISO 8601 string
             * @example 2020-05-24T12:00:00+09:00
             */
            start: string;
            /**
             * @description End Date as ISO 8601 string, optional
             * @example 2020-05-24T14:00:00+09:00
             */
            end?: string;
            /** @example 24th May 12:00–14:00 */
            human: string;
            /**
             * @description Only displays the date (range) without time. Useful for e.g. list views.
             * @example 24th May
             */
            human_short: string;
            /** @example false */
            whole_day: boolean;
        };
        EventsV1: {
            /** @example Mapping Party #23 */
            name: string;
            /**
             * @description Link to event on OSMCAL
             * @example https://osmcal.org/event/23/
             */
            url: string;
            date: OSMCAL["schemas"]["DateV1"];
            location?: OSMCAL["schemas"]["Location"];
            /**
             * @description Indicates whether event has been cancelled. Omited if not.
             * @default false
             * @example true
             */
            cancelled: boolean;
        }[];
        /** @description Date object, with start date, end date (optional), human date (preferred way of display, localized) and indication, whether the event is a full-day event (`whole_day`). */
        DateV1: {
            /** @example 2020-05-24 12:00:00 */
            start: string;
            /** @example 2020-05-24 14:00:00 */
            end?: string;
            /** @example 24th May 12:00–14:00 */
            human?: string;
            /** @example false */
            whole_day?: boolean;
        };
        Location: {
            /** @example Osaka, Japan */
            short?: string;
            /** @example Tosabori-dori, Chuo, Osaka, Japan */
            detailed?: string;
            /**
             * @description Coordinates in lon/lat
             * @example [
             *       135.5023,
             *       34.6931
             *     ]
             */
            coords: number[];
            /** @example Cool Pub */
            venue?: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}

export type OSMCALEvents = OSMCAL["schemas"]["Events"];