
let SETTINGS = {
	DEBUG_MODE: false,
	AUTO_RELOAD: false,
	AUTO_RELOAD_TIMEOUT: 10000
};

const REPLACER = [
	{
		regex: /\(innen\)|\(Innen\)/gm,
		replacement: "",
		debug: "✅"
	},
	/** Replace Plural Gendermist :,/,*,i,I,nnen to en (Student*innen -> Studenten) */
	{
		regex: /\b(([a-zA-Z][a-zA-Z0-9]*t)((\*|\_|\:|\-|(\/\-))[i|I]nnen))\b/gm,
		replacement: "$2en",
		debug: "$2en✅"
	},
	/** Replace Plural Gendermist :,/,*,i,I,nnen */
	{
		regex: /\b(([a-zA-Z][a-zA-Z0-9]*)((\*|\_|\:|\-|(\/\-))[i|I]nnen))\b/gm,
		replacement: "$2",
		debug: "$2✅"
	},
	/** Replace Plural Gendermist Innen */
	{
		regex:/\b(([a-zA-Z][a-zA-Z0-9]*)Innen)\b/gm,
		replacement: "$2",
		debug: "$2✅"
	},
	/** Replace Singular Gendermist :,/,*,i,I,n */
	{
		regex: /\b(([A-Z][a-zA-Z0-9]*)((\*|\_|\:|\-|(\/\-))[i|I]n))\b/gm,
		replacement: "$2",
		debug: "$2✅"
	},
	/** Important: Last Statement to replace double wording like 'Studentinnen und Studenten (now Studenten und Studenten)' */
	{
		regex: /\b(([a-zA-Z][a-zA-Z0-9]*)(\s(\/|und)\s)\2)\b/gm,
		replacement: "",
		debug: "✅"
	},
	{
		regex: "Mitarbeitende",
		replacement: "Mitarbeiter",
		debug: "Mitarbeiter✅"
	},
	{
		regex: /Studierenden|Studierende/gm,
		replacement: "Studenten",
		debug: "Studenten✅"
	},
	{
		regex: /Lehrkraft|Lehrende/gm,
		replacement: "Lehrer",
		debug: "Lehrer✅"
	},
	{
		regex: "Teilnehmende",
		replacement: "Teilnehmer",
		debug: "Teilnehmer✅"
	},
	{
		regex: /Lesende|Leserschaft/gm,
		replacement: "Leser",
		debug: "Leser✅"
	},
	{
		regex: /Zuhörende/gm,
		replacement: "Zuhörer",
		debug: "Zuhörer✅"
	},
	/** Correct Adjectives */
	{
		regex: /\b([a-zA-Z0-9][a-zA-Z0-9]*)((\*|\_|\:|\-|(\/\-))((er)|(Er)|e|r))\b/gm,
		replacement: "$1r",
		debug: "$1r✅"
	},
	{
		regex: /\b(([a-zA-Z0-9][a-zA-Z0-9]*)((\*|\_|\:|\-|(\/\-))(e)))\b/gm,
		replacement: "$2",
		debug: "$2✅"
	},
	{
		regex: /der\/die|die\/der/gm,
		replacement: "der",
		debug: "der✅"
	},
	{
		regex: /einer\/eine|eine\/einer/gm,
		replacement: "einer",
		debug: "einer✅"
	}	
]

class Neutralizer {
	constructor() {
		this.lastContent = document.body.innerHTML;
		this.counter = 0;

		chrome.runtime.onMessage.addListener(
			(request, sender, sendResponse) => {
				if(request.cmd) {
					if(request.cmd === "counter") {
						sendResponse(this.counter.toString());
					}else if(request.cmd === "settings" && request.data) {
						SETTINGS = request.data;
						document.body.innerHTML = this.lastContent;
						this.counter = 0;
						this.neutralize();
						sendResponse("set");
					}
				}
			}
		);

		this.load();
	}

	/**
	 * Initilize settings and first neutralization
	 */
	async load() {
		const cacheSettings = await chrome.storage.sync.get("settings");
		if(cacheSettings.settings) {
			SETTINGS = JSON.parse(cacheSettings.settings);
		}
		this.neutralize();
	}

	async neutralize() {
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
		let element = walker.nextNode();
		while(element) {
			if(!(/^(SCRIPT|STYLE)$/.test(element.parentNode.nodeName))) {
				// Replace element value with regex
				let val = element.nodeValue;
				for(const value of REPLACER) {
					const matches = val.match(value.regex);
					if(matches) {
						this.counter = this.counter + matches.length;
						if(SETTINGS.DEBUG_MODE) {
							element.parentElement.style.color = "red";
						}
					}
					val = val.replaceAll(value.regex, SETTINGS.DEBUG_MODE ? value.debug : value.replacement);
				}
				element.nodeValue = val;
			}
			element = walker.nextNode()
		}

		if(SETTINGS.AUTO_RELOAD) {
			await new Promise(resolve => setTimeout(resolve, SETTINGS.AUTO_RELOAD_TIMEOUT));
			await this.neutralize();
		}
	}
}

const neutralizer = new Neutralizer();