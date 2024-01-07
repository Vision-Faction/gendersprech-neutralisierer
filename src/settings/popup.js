let SETTINGS = {
	DEBUG_MODE: false,
	AUTO_RELOAD: false,
	AUTO_RELOAD_TIMEOUT: 10000
};

/**
 * First init loading of settings
 */
const loadSettings = async () => {
	const cacheSettings = await chrome.storage.sync.get("settings");
	if(cacheSettings.settings) {
		SETTINGS = JSON.parse(cacheSettings.settings);
	}
	const debugElement = document.getElementById("debugMode");
	debugElement.checked = SETTINGS.DEBUG_MODE;
	const reloadElement = document.getElementById("reloadMode");
	reloadElement.checked = SETTINGS.AUTO_RELOAD;
	updateSettings();
}

loadSettings();

/**
 * Method to store and send settings
 */
const updateSettings = async () => {
	await chrome.storage.sync.set({settings: JSON.stringify(SETTINGS)});
	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{
				cmd: "settings",
				data: SETTINGS
			}
		);
	});
}

addEventListener("load", () => {
	/**
	 * Update all settings from popup to neutralizer script
	 */
	const reloadElement = document.getElementById("reloadMode");
	reloadElement.checked = SETTINGS.AUTO_RELOAD;
	reloadElement.addEventListener("change", (_e) => {
		SETTINGS.AUTO_RELOAD = reloadElement.checked;
		updateSettings();
	});

	const debugElement = document.getElementById("debugMode");
	debugElement.checked = SETTINGS.DEBUG_MODE;
	debugElement.addEventListener("change", (_e) => {
		SETTINGS.DEBUG_MODE = debugElement.checked;
		updateSettings();
	});

	/**
	 * Update counter method
	 */
	const reload = () => {
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			chrome.tabs.sendMessage(
				tabs[0].id,
				{cmd: "counter"},
				async (response) => {
					if(!chrome.runtime.lastError) {
						document.getElementById("counter").innerText = response;
					}
					await new Promise(resolve => setTimeout(resolve, 500));
					reload();
				}
			);
		});
	}
	
	reload();
});