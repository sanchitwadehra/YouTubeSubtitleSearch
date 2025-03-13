chrome.commands.onCommand.addListener((command) => {
  if (command === "open-search") {
    chrome.scripting.executeScript({
      target: { allFrames: true },
      files: ["src/js/content.js"],
    });
  }
}); 