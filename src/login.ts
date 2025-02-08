import { MatrixAuth } from "matrix-bot-sdk";
import config from "./config.js";
import * as readline from 'node:readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
console.log("config is", config, config.homeserverUrl);

const username = await rl.question(`Username: `);
const password = await rl.question(`Password: `);

const auth = new MatrixAuth(config.homeserverUrl);
const client = await auth.passwordLogin(username, password);

console.log("Copy this access token to your bot's config: ", client.accessToken);