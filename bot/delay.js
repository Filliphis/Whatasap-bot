const DEFAULT_DELAY = 8000;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { delay, DEFAULT_DELAY };