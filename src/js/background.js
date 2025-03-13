chrome.commands.onCommand.addListener((command) => {
  if (command === "open-search") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url.includes("youtube.com/watch")) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggle-search" });
      } else {
        console.log("Not on a YouTube video page");
      }
    });
  }
}); 