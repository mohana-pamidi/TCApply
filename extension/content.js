// has access to the DOM (HTML elements and text) of the current page
// searches page looking for most relevant text that looks like T&C

function extractTermsAndConditions() {
    // list of keywords to look for in the text
    const keywords = ["terms", "conditions", "privacy", "policy", "terms of service", "privacy policy", "terms and conditions", "agreement", "consent"];

    // returns a static list of all HTML elements on the page based on selector
    const elements = document.querySelectorAll("div, section, article, textarea, p");

    // best text found so far
    let bestMatch = null;
    // how many keywords the best match contains
    let bestScore = 0;

    // loops through all elements on the page
    for (const element of elements) {
        // get the visible text of the element (what user sees)
        // falls back to empty string if no text
        const text = element.innerText || "";

        // convert text to lowercase for case-insensitive matching
        const lower = text.toLowerCase();

        // score each element by how many T&C keywords it contains
        // .includes(k) checks if keyword k is in the text
        // filter() keeps only matching keywords
        // .length() counts the number of matching keywords
        const score = keywords.filter(k => lower.includes(k)).length;

        // only consider elements with substantial text (exclude buttons, label)
        if (score > bestScore && text.length > 500) {
            bestScore = score;
            bestMatch = text;
        }
    }

    const MIN_SCORE = 2;
    if (!bestMatch || bestScore < MIN_SCORE) return null;

    return bestMatch;
}

function handleMessages(message, sender, sendResponse) {
    if (message.action === 'extractT&C') {
        console.log("Message received");
        const text = extractTermsAndConditions();
        sendResponse({ 
            text,
            found: Boolean(text)

        });
    }
    return true;
}

chrome.runtime.onMessage.addListener(handleMessages);