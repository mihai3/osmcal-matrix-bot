import {
    ICryptoStorageProvider,
    LogService,
    MatrixClient,
    RichConsoleLogger, RustSdkCryptoStorageProvider,
    SimpleFsStorageProvider
} from "matrix-bot-sdk";
import * as path from "path";
import config from "./config.js";
import { getEvents, OSMCALEvents } from "./osmcal.js";
import { I18n } from "i18n-js";
import translations from "./translations.js";

const i18n = new I18n(translations);
i18n.enableFallback = true;

LogService.setLogger(new RichConsoleLogger());

// Print something so we know the bot is working
const log = (...args) => {
    if (args[0] instanceof Error)
        LogService.error("index", args);
    else
        LogService.info("index", ...args);
}

log("Bot starting...");

// Prepare the storage system for the bot
const storage = new SimpleFsStorageProvider(path.join(config.dataPath, "bot.json"));

// Prepare a crypto store if we need that
let cryptoStore: ICryptoStorageProvider;
if (config.encryption) {
    cryptoStore = new RustSdkCryptoStorageProvider(path.join(config.dataPath, "encrypted"));
}

const client = new MatrixClient(config.homeserverUrl, config.accessToken, storage, cryptoStore);

log("Try to join all rooms from the config");
let rooms = await client.getJoinedRooms();
for (const room of config.rooms) {
    if (!rooms.includes(room.id)) {
        log("Trying to join room", room.id);
        try {
            await client.joinRoom(room.id);
        } catch (e) {
            log(e);
        }
    }
}

rooms = await client.getJoinedRooms();
log("Currently in rooms: ", rooms);

const updateFeedsAndPost = async () => {
    for (const room of rooms) {
        const roomConfiguration = config.rooms.find(r => r.id == room);
        if (!roomConfiguration) continue;

        i18n.locale = roomConfiguration.lang || "en";

        const feedStorageKey = `feeds.${roomConfiguration.osmcal}`;
        const updateFeedIntervalMsec = 24*60*60*1000;

        let feedData = JSON.parse(storage.readValue(feedStorageKey) || "null");
        if (!feedData || feedData.updatedAt <= Date.now() - updateFeedIntervalMsec || 
                feedData.lang != roomConfiguration.lang) {
            log("fetching feed data for", roomConfiguration.osmcal);

            try {
                feedData = {
                    result: await getEvents(roomConfiguration.osmcal, roomConfiguration.lang),
                    updatedAt: Date.now(),
                    lang: roomConfiguration.lang
                }
            } catch (e) {
                log(e);
                continue;
            }

            storage.storeValue(feedStorageKey, JSON.stringify(feedData));
        }

        const reportedEventsKey = `reported.${roomConfiguration.id}`;
        const reportedEvents = JSON.parse(storage.readValue(reportedEventsKey) || "[]") as string[];
        const newReportedEvents: string[] = [];

        const reportEventsMaxTimestamp = Date.now() + 3*(24*60*60*1000);

        for (const event of feedData.result as OSMCALEvents) {
            const eventStart = Date.parse(event.date.start);
            if (eventStart > reportEventsMaxTimestamp)
                break;

            if (event.cancelled) {
                if (reportedEvents.includes(`cancelled:${event.url}`))
                    continue;

                log("event has been cancelled", event);
                await client.sendHtmlNotice(room, `<b>[${i18n.t("cancelled")}]</b> <a href="${event.url}">${event.name}</a> – ${event.date.human}`);
                newReportedEvents.push(`cancelled:${event.url}`);
            }

            if (!event.cancelled) {
                if (reportedEvents.includes(event.url))
                    continue;

                log("reporting event", event);
                await client.sendHtmlNotice(room, `<a href="${event.url}">${event.name}</a> – ${event.date.human}`);
                newReportedEvents.push(event.url);
            }
        }

        if (newReportedEvents.length > 0) {
            await storage.storeValue(reportedEventsKey, JSON.stringify(reportedEvents.concat(newReportedEvents)));
            log("finished reporting", newReportedEvents.length, "events");
        }

    }
}

setInterval(updateFeedsAndPost, 3600*1000);

log("Starting sync...");
await client.start(); // This blocks until the bot is killed