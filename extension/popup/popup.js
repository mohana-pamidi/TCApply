// to send a message to another part of extension 
(async () => {
    console.log("Popup starting...");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {action: "extractT&C"});

    if(!response?.found) {
        console.log("No terms and conditions found");
    } else {
        console.log(response.text);
    }

    // do something with response

})();