import { getSetting, setSetting } from "./Settings.js"

export const getDefaultSettings = () => {
	let copy = {}
	for (let tab in defaultSettings) {
		copy[tab] = {}
		for (let category in defaultSettings[tab]) {
			copy[tab][category] = []
			defaultSettings[tab][category].forEach(setting => {
				let settingCopy = {}
				for (let attribute in setting) {
					settingCopy[attribute] = setting[attribute]
				}
				copy[tab][category].push(settingCopy)
			})
		}
	}
	return copy
}
const TAB_GENERAL = "General"
const TAB_AUDIO = "Audio"
const TAB_VIDEO = "Video"

const defaultSettings = {
	//tabs
	General: {
		//default or subcategory
		default: [
			{
				type: "slider",
				id: "renderOffset",
				label: "Render offset (ms)",
				value: 0,
				min: -250,
				max: 250,
				step: 1,
				onChange: value => setSetting("renderOffset", value)
			},
			{
				type: "checkbox",
				id: "reverseNoteDirection",
				label: "Reverse note direction",
				value: false,
				onChange: ev => {
					setSetting("reverseNoteDirection", ev.target.checked)
					setSetting(
						"pianoPosition",
						Math.abs(parseInt(getSetting("pianoPosition")) + 1)
					)
				}
			},

			{
				type: "checkbox",
				id: "showBPM",
				label: "Show BPM",
				value: true,
				onChange: ev => setSetting("showBPM", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showMiliseconds",
				label: "Show Miliseconds",
				value: true,
				onChange: ev => setSetting("showMiliseconds", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showNoteDebugInfo",
				label: "Enable debug info on hover over note",
				value: false,
				onChange: ev => setSetting("showNoteDebugInfo", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showMarkersSong",
				label: "Show markers in the song",
				value: false,
				onChange: ev => setSetting("showMarkersSong", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showMarkersTimeline",
				label: "Show markers on timeline",
				value: false,
				onChange: ev => setSetting("showMarkersTimeline", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showFps",
				label: "Show FPS",
				value: true,
				onChange: ev => setSetting("showFps", ev.target.checked)
			},
			{
				type: "color",
				id: "inputNoteColor",
				label: "Your note color",
				value: "rgba(40,155,155,0.8)",
				onChange: value => setSetting("inputNoteColor", value)
			}
		],
		"On Screen Piano": [
			{
				type: "checkbox",
				id: "clickablePiano",
				label: "Clickable piano",
				value: true,
				onChange: ev => setSetting("clickablePiano", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showKeyNamesOnPianoWhite",
				label: "Show white key names on piano",
				value: true,
				onChange: ev =>
					setSetting("showKeyNamesOnPianoWhite", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showKeyNamesOnPianoBlack",
				label: "Show black key names on piano",
				value: true,
				onChange: ev =>
					setSetting("showKeyNamesOnPianoBlack", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "highlightActivePianoKeys",
				label: "Color active piano keys",
				value: true,
				onChange: ev => setSetting("showPianoKeys", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "drawPianoKeyHitEffect",
				label: "Piano Hit key effect",
				value: true,
				onChange: ev => setSetting("drawPianoKeyHitEffect", ev.target.checked)
			},
			{
				type: "slider",
				id: "pianoPosition",
				label: "Piano Position",
				value: 20,
				min: 0,
				max: 100,
				step: 1,
				onChange: value => setSetting("pianoPosition", value)
			},
			{
				type: "slider",
				id: "whiteKeyHeight",
				label: "Height (%) - White keys",
				value: 100,
				min: 0,
				max: 200,
				step: 1,
				onChange: value => setSetting("whiteKeyHeight", value)
			},
			{
				type: "slider",
				id: "blackKeyHeight",
				label: "Height (%) - Black keys",
				value: 100,
				min: 0,
				max: 200,
				step: 1,
				onChange: value => setSetting("blackKeyHeight", value)
			}
		]
	},

	Video: {
		default: [
			{
				type: "slider",
				id: "noteToHeightConst",
				label: "Seconds shown on screen",
				value: 3,
				min: 0.1,
				max: 30,
				step: 0.1,
				onChange: value => setSetting("noteToHeightConst", value)
			}
		],
		"Note Appearance": [
			{
				type: "checkbox",
				id: "showHitKeys",
				label: "Active Notes effect",
				value: true,
				onChange: ev => setSetting("showHitKeys", ev.target.checked)
			},

			{
				type: "checkbox",
				id: "strokeActiveNotes",
				label: "Stroke active notes",
				value: true,
				onChange: ev => setSetting("strokeActiveNotes", ev.target.checked)
			},
			{
				type: "color",
				id: "strokeActiveNotesColor",
				label: "Stroke color",
				value: "rgba(240,240,240,0.5)",
				onChange: value => setSetting("strokeActiveNotesColor", value)
			},
			{
				type: "slider",
				id: "strokeActiveNotesWidth",
				label: "Stroke width",
				value: "4",
				min: 1,
				max: 10,
				step: 0.5,
				onChange: value => setSetting("strokeActiveNotesWidth", value)
			},
			{
				type: "checkbox",
				id: "strokeNotes",
				label: "Stroke notes",
				value: true,
				onChange: ev => setSetting("strokeNotes", ev.target.checked)
			},
			{
				type: "color",
				id: "strokeNotesColor",
				label: "Stroke color",
				value: "rgba(0,0,0,1)",
				onChange: value => setSetting("strokeNotesColor", value)
			},
			{
				type: "slider",
				id: "strokeNotesWidth",
				label: "Stroke width",
				value: "1",
				min: 1,
				max: 10,
				step: 0.5,
				onChange: value => setSetting("strokeNotesWidth", value)
			},
			{
				type: "checkbox",
				id: "roundedNotes",
				label: "Rounded notes",
				value: true,
				onChange: ev => setSetting("roundedNotes", ev.target.checked)
			},
			//TODO fix getAlphaFromY in Noterender.
			// {
			// 	type: "checkbox",
			// 	id: "fadeInNotes",
			// 	label: "Enable fade in effect",
			// 	value: true,
			// 	onChange: ev => setSetting("fadeInNotes", ev.target.checked)
			// },
			{
				type: "slider",
				id: "noteBorderRadius",
				label: "Note border radius (%)",
				value: 15,
				min: 0,
				max: 50,
				step: 1,
				onChange: value => setSetting("noteBorderRadius", value)
			},
			{
				type: "slider",
				id: "minNoteHeight",
				label: "Minimum Note height (px)",
				value: 10,
				min: 1,
				max: 50,
				step: 1,
				onChange: value => setSetting("minNoteHeight", value)
			},
			{
				type: "slider",
				id: "noteEndedShrink",
				label: "Played Notes shrink speed",
				value: 1,
				min: 0,
				max: 5,
				step: 0.1,
				onChange: value => setSetting("noteEndedShrink", value)
			},
			{
				type: "slider",
				id: "playedNoteFalloffSpeed",
				label: "Played Note Speed",
				value: 1,
				min: 0.1,
				max: 10,
				step: 0.1,
				onChange: value => setSetting("playedNoteFalloffSpeed", value)
			}
		],
		Sustain: [
			{
				type: "checkbox",
				id: "showSustainOnOffs",
				label: "Draw Sustain On/Off Events",
				value: false,
				onChange: function (ev) {
					setSetting("showSustainOnOffs", ev.target.checked)
				}
			},
			{
				type: "checkbox",
				id: "showSustainPeriods",
				label: "Draw Sustain Periods",
				value: false,
				onChange: ev => setSetting("showSustainPeriods", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showSustainedNotes",
				label: "Draw Sustained Notes",
				value: false,
				onChange: ev => setSetting("showSustainedNotes", ev.target.checked)
			},
			{
				type: "slider",
				id: "sustainedNotesOpacity",
				label: "Sustained Notes Opacity (%)",
				value: 50,
				min: 0,
				max: 100,
				step: 1,
				onChange: value => setSetting("sustainedNotesOpacity", value)
			}
		],
		Particles: [
			{
				type: "checkbox",
				id: "showParticlesTop",
				label: "Enable top particles",
				value: true,
				onChange: ev => setSetting("showParticlesTop", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showParticlesBottom",
				label: "Enable bottom particles ",
				value: true,
				onChange: ev => setSetting("showParticlesBottom", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "particleStroke",
				label: "Stroke particles",
				value: true,
				onChange: ev => setSetting("particleStroke", ev.target.checked)
			},
			{
				type: "slider",
				id: "particleBlur",
				label: "Particle blur amount (px)",
				value: 3,
				min: 0,
				max: 10,
				step: 1,
				onChange: value => setSetting("particleBlur", value)
			},
			{
				type: "slider",
				id: "particleAmount",
				label: "Particle Amount (per frame)",
				value: 3,
				min: 0,
				max: 15,
				step: 1,
				onChange: value => setSetting("particleAmount", value)
			},
			{
				type: "slider",
				id: "particleSize",
				label: "Particle Size",
				value: 6,
				min: 0,
				max: 10,
				step: 1,
				onChange: value => setSetting("particleSize", value)
			},
			{
				type: "slider",
				id: "particleLife",
				label: "Particle Duration",
				value: 20,
				min: 1,
				max: 150,
				step: 1,
				onChange: value => setSetting("particleLife", value)
			},
			{
				type: "slider",
				id: "particleSpeed",
				label: "Particle Speed",
				value: 4,
				min: 1,
				max: 15,
				step: 1,
				onChange: value => setSetting("particleSpeed", value)
			}
		],
		Background: [
			{
				type: "color",
				id: "bgCol1",
				label: "Background fill color 1",
				value: "rgba(40,40,40,0.8)",
				onChange: value => {
					setSetting("bgCol1", value)
				}
			},
			{
				type: "color",
				id: "bgCol2",
				label: "Background fill color 2",
				value: "rgba(25,25,25,1)",
				onChange: value => {
					setSetting("bgCol2", value)
				}
			},
			{
				type: "color",
				id: "bgCol3",
				label: "Background stroke color",
				value: "rgba(10,10,10,0.5)",
				onChange: value => {
					setSetting("bgCol3", value)
				}
			}
		]
	},
	Audio: {
		default: [
			{
				type: "list",
				id: "soundfontName",
				label: "Soundfont",
				value: "MusyngKite",
				list: ["MusyngKite", "FluidR3_GM", "FatBoy"],
				onChange: newVal => setSetting("soundfontName", newVal)
			},
			{
				type: "checkbox",
				id: "sustainEnabled",
				label: "Enable Sustain",
				value: true,
				onChange: function (ev) {
					setSetting("sustainEnabled", ev.target.checked)
				}.bind(this)
			},
			{
				type: "checkbox",
				id: "enableMetronome",
				label: "Enable Metronome",
				value: true,
				onChange: function (ev) {
					setSetting("enableMetronome", ev.target.checked)
				}.bind(this)
			},
			{
				type: "slider",
				id: "metronomeVolume",
				label: "Metronome Volume",
				value: 0.5,
				min: 0,
				max: 1,
				step: 0.1,
				onChange: value => setSetting("metronomeVolume", value)
			}
		],
		"ADSR Envelope": [
			{
				type: "slider",
				id: "adsrAttack",
				label: "Attack (Seconds)",
				value: 0,
				min: 0,
				max: 2,
				step: 0.01,
				onChange: value => setSetting("adsrAttack", value)
			},
			{
				type: "slider",
				id: "adsrDecay",
				label: "Decay (Seconds)",
				value: 0,
				min: 0,
				max: 0.5,
				step: 0.01,
				onChange: value => setSetting("adsrDecay", value)
			},
			{
				type: "slider",
				id: "adsrSustain",
				label: "Sustain (%)",
				value: 100,
				min: 0,
				max: 100,
				step: 1,
				onChange: value => setSetting("adsrSustain", value)
			},
			{
				type: "slider",
				id: "adsrReleaseKey",
				label: "Release - Key (Seconds)",
				value: 0.2,
				min: 0,
				max: 2,
				step: 0.01,
				onChange: value => setSetting("adsrReleaseKey", value)
			},
			{
				type: "slider",
				id: "adsrReleasePedal",
				label: "Release - Pedal (Seconds)",
				value: 0.2,
				min: 0,
				max: 2,
				step: 0.01,
				onChange: value => setSetting("adsrReleasePedal", value)
			}
		]
	}
}
