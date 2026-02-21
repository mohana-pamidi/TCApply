(async () => {
    console.log("Popup starting...");

    // Show loading state
    document.getElementById("status").textContent = "Scanning page for Terms & Conditions...";

    try {
        // Step 1 - Ask content.js to extract T&C text from the page
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { action: "extractT&C" });

        if (!response?.found) {
            document.getElementById("status").textContent = "No Terms & Conditions found on this page.";
            console.log("No terms and conditions found");
            return;
        }

        console.log(`Found T&C text: ${response.text.length} characters`);
        document.getElementById("status").textContent = "Analyzing with AI...";

        // Step 2 - Send the text to Flask
        const flaskResponse = await fetch("http://127.0.0.1:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: response.text })
        });

        if (!flaskResponse.ok) {
            throw new Error("Server error: " + flaskResponse.status);
        }

        // Step 3 - Get the result and display it
        const result = await flaskResponse.json();
        console.log("Analysis result:", result);

        document.getElementById("status").textContent = "";
        displayResults(result);

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("status").textContent = "Error: " + error.message;
    }
})();


function displayResults(data) {
    const riskColor = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };
    const scoreColor = data.riskScore >= 7 ? "#22c55e" : data.riskScore >= 4 ? "#f59e0b" : "#ef4444";

    document.getElementById("results").innerHTML = `
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
            <div style="font-size:36px; font-weight:800; color:${scoreColor}">
                ${data.riskScore}/10
            </div>
            <div style="padding:6px 12px; border-radius:20px; background:${riskColor[data.privacyRisk]}; color:white; font-weight:600;">
                ${data.privacyRisk} Privacy Risk
            </div>
        </div>

        <p style="font-size:13px; color:#333; line-height:1.5;">${data.summary}</p>

        ${renderList("⚠️ Key Concerns", data.keyConcerns, "#fef3c7")}
        ${renderList("⚠️ Targeted Risk Findings", data.targetedRiskFindings, "#fef3c7")}
        ${renderList("🚫 Rights You Give Up", data.rightsGivenUp, "#fee2e2")}
        ${renderList("✅ Positives", data.positives, "#dcfce7")}
    `;
}

function renderList(title, items, bg) {
    if (!items?.length) return "";
    return `
        <div style="background:${bg}; padding:10px 12px; border-radius:8px; margin-bottom:8px;">
            <strong>${title}</strong>
            <ul style="margin:6px 0 0; padding-left:18px;">
                ${items.map(i => `<li style="font-size:12px; margin-bottom:4px;">${i}</li>`).join("")}
            </ul>
        </div>
    `;
}