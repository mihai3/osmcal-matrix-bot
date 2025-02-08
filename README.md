# osmcal-matrix-bot

https://github.com/mihai3/osmcal-matrix-bot.git

A Matrix bot for posting osmcal.org reminders to a Matrix channel.
You can configure which channels should receive reminders for which locations and in which language.

## Running / Building

* Edit `config/production.yaml`, see `config/default.yaml`
* Make sure you have Node.js 20+ installed
* run `./osmcal-matrix-bot`

Or with Docker: `docker build -t osmcal-matrix-bot:latest .`
To run the Docker image (after building): `docker run --rm -it -v $(pwd)/config:/bot/config -v $(pwd)/storage:/bot/storage osmcal-matrix-bot:latest`

## Project highlights

### `src/index.ts`

This is where most of the bot is.

### `src/login.ts`

A helper command line script for logging in the bot and getting an access token.

## Credits

Based on the [matrix-bot-sdk-bot-template](https://github.com/turt2live/matrix-bot-sdk-bot-template), originally licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0), for creating bots with [matrix-bot-sdk](https://www.npmjs.com/package/matrix-bot-sdk).