
const reload = async () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if(tabs[0]) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {cmd: "counter"},
        async (response) => {
          if(!chrome.runtime.lastError) {
            chrome.action.setBadgeText({
              text: response,
              tabId: tabs[0].id
            });
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          await reload();
        }
      );
    }
	});
}

reload();