import * as pdfjsLib from '../pdfjslib/build/pdf.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = '../pdfjslib/build/pdf.worker.mjs';

const button = document.getElementById("concerns-button");
const checklist = document.getElementById("concerns-checklist");

button.addEventListener('click', async(event) => {

    // Collect selected user concerns from checkboxes
    const selectedConcerns = [];
    checklist.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        selectedConcerns.push(checkbox.value);
    });

    // joing selected concerns into a whole string 
    const userConcerns = selectedConcerns.length > 0 
        ? selectedConcerns.join(", ") 
        : "None provided";
    
    console.log("User concerns:", userConcerns);

    // hide checklist once button is clicked 
    checklist.style.display = "none";
    console.log("Side panel starting...");

    // Show loading state 
    document.getElementById("status").textContent = "Scanning page for Terms & Conditions...";

    try {
        // Step 1 - Get active tab and ensure we can talk to it
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab?.id) {
            document.getElementById("status").textContent = "No tab found. Open a webpage first.";
            return;
        }

        // Pages like chrome://, edge://, or extension store can't run content scripts
        const restricted = /^(chrome|edge|about|chrome-extension):\/\//.test(tab.url || "");
        if (restricted) {
            document.getElementById("status").textContent = "Open a normal webpage (e.g. a site's Terms or Privacy page) and try again.";
            return;
        }

        // get url of current page
        console.log("Current tab URL:", tab.url);

        let textToAnalyze;

        if(tab.url.endsWith(".pdf")) {
            // text is a plain string of all the pdf content
            textToAnalyze = await extractText(tab.url);
            console.log(textToAnalyze);
        } else {
            // Try to get T&C from content script; inject and retry if not loaded (e.g. tab opened before extension)
            let response;

            try {
                response = await chrome.tabs.sendMessage(tab.id, { action: "extractT&C" });
            } catch (e) {
                if (e?.message?.includes("Receiving end does not exist")) {
                    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
                    response = await chrome.tabs.sendMessage(tab.id, { action: "extractT&C" });
                } else {
                    throw e;
                }
            }
            if (response === undefined) {
                document.getElementById("status").textContent = "Could not read this page. Try refreshing the page, then open the side panel again.";
                return;
            }
    
            if (!response?.found) {
                document.getElementById("status").textContent = "No Terms & Conditions found on this page.";
                console.log("No terms and conditions found");
                return;
            }

            textToAnalyze = response.text;
        }


        console.log(`Found T&C text: ${textToAnalyze.length} characters`);
        document.getElementById("status").textContent = "Analyzing with AI...";

        // Send the text to Flask but with user preferences now 
        const flaskResponse = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textToAnalyze })
        });

        let result;
        try {
            result = await flaskResponse.json();
        } catch (_) {
            result = {};
        }
        if (!flaskResponse.ok) {
            const msg = result?.error || "Server error: " + flaskResponse.status;
            throw new Error(msg);
        }

        // Step 3 - Display the result
        console.log("Analysis result:", result);

        document.getElementById("status").textContent = "";
        displayResults(result);

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("status").textContent = "Error: " + error.message;
    }
});

function displayResults(data) {
    const riskColor = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };
    const scoreColor = data.riskScore >= 7 ? "#ef4444" : data.riskScore >= 4 ? "#f59e0b" : "#22c55e";

    document.getElementById("results").innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <div style="font-size:36px; font-weight:800; color:${scoreColor}">
                ${data.riskScore}/10
            </div>
            <div style="padding:6px 12px; border-radius:20px; background:${riskColor[data.privacyRisk] || riskColor.Medium}; color:white; font-weight:600;">
                ${data.privacyRisk || "—"} Privacy Risk
            </div>
        </div>

        <p style="font-size:13px; color:#333; line-height:1.5;">${data.summary}</p>

        ${renderList("⚠️ Key Concerns", data.keyConcerns, "#fef3c7", (i) => typeof i === "string" ? i : `${i.concern || i.rightLost || ""} (${i.severity}/10) — ${i.explanation || ""}`)}
        ${renderList("🚫 Rights You Give Up", data.rightsGivenUp, "#fee2e2", (i) => typeof i === "string" ? i : `${i.rightLost || i.concern || ""} (${i.severity}/10) — ${i.explanation || ""}`)}
        ${renderList("✅ Positives", data.positives, "#dcfce7")}
    `;
}

function renderList(title, items, bg, formatItem) {
    if (!items?.length) return "";
    const format = formatItem || ((i) => typeof i === "string" ? i : String(i));
    return `
        <div style="background:${bg}; padding:10px 12px; border-radius:8px; margin-bottom:8px;">
            <strong>${title}</strong>
            <ul style="margin:6px 0 0; padding-left:18px;">
                ${items.map(i => `<li style="font-size:12px; margin-bottom:4px;">${format(i)}</li>`).join("")}
            </ul>
        </div>
    `;
}