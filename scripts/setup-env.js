const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

console.log("Generating Cloka Protocol Agent Wallet...");
const wallet = ethers.Wallet.createRandom();

const envContent = `
# GOAT Bitcoin L2 Testnet
GOAT_RPC_URL="https://rpc.testnet.goat.network"
AGENT_WALLET_ADDRESS="${wallet.address}"
AGENT_PRIVATE_KEY="${wallet.privateKey}"

# Strava API (For Runner Queues & Verification)
STRAVA_CLIENT_ID=""
STRAVA_CLIENT_SECRET=""

# Telegram Bot (For Announcements & Recaps)
TELEGRAM_BOT_TOKEN=""
TELEGRAM_GROUP_ID=""

# Twitter API (For Announcements & Recaps)
TWITTER_API_KEY=""
TWITTER_API_SECRET=""
TWITTER_ACCESS_TOKEN=""
TWITTER_ACCESS_SECRET=""

# Weather API (OpenWeatherMap)
WEATHER_API_KEY=""

# AQI API
AQI_API_KEY=""

# LazAI DAT API
LAZAI_API_KEY=""
`;

fs.writeFileSync(envPath, envContent.trim());
console.log("Agent Wallet Generated & .env written successfully.");
console.log("Address:", wallet.address);
