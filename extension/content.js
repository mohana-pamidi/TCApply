function extractTermsAndConditions() {
    const keywords = ["terms", "conditions", "privacy", "policy", "terms of service", "privacy policy", "terms and conditions", "agreement", "consent"];

    const elements = document.querySelectorAll("div, section, article, textarea, p");

    let bestMatch = null;
    let bestScore = 0;

    for (const element of elements) {
        const text = element.innerText || "";
        const lower = text.toLowerCase();

        const score = keywords.filter(k => lower.includes(k)).length;

        // Added upper limit of 50000 chars to avoid grabbing the entire page wrapper
        if (score > bestScore && text.length > 500 && text.length < 50000) {
            bestScore = score;
            bestMatch = text;
        }
    }

    const MIN_SCORE = 2;
    if (!bestMatch || bestScore < MIN_SCORE) return null;

    // Trim to 12000 chars so Flask/Gemini isn't overwhelmed
    return bestMatch.slice(0, 12000);
}

function handleMessages(message, sender, sendResponse) {
    if (message.action === 'extractT&C') {
        console.log("Message received");
        const text = extractTermsAndConditions();

        if (text) {
            console.log(`Found T&C text: ${text.length} characters`);
        } else {
            console.log("No T&C text found on this page");
        }

        sendResponse({ 
            text,
            found: Boolean(text)
        });
    }
    return true;
}

chrome.runtime.onMessage.addListener(handleMessages);