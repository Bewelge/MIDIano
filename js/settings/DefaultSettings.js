import { setSetting } from "./Settings.js"

export const getDefaultSettings = () => {
	return defaultSettings
}
const TAB_GENERAL = "General"
const TAB_AUDIO = "Audio"
const TAB_VIDEO = "Video"

const defaultSettings = {
	//tabs
	// General: {
	// 	//default or subcategory
	// 	default: []
	// },

	Video: {
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
				type: "slider",
				id: "noteToHeightConst",
				label: "Note Duration / Height",
				value: 3,
				min: 0.1,
				max: 30,
				step: 0.1,
				onChange: value => setSetting("noteToHeightConst", value)
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
				id: "showHitKeys",
				label: "Show Hit Notes effect",
				value: true,
				onChange: ev => setSetting("showHitKeys", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showPianoKeys",
				label: "Color active piano keys",
				value: true,
				onChange: ev => setSetting("showPianoKeys", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "strokeNotes",
				label: "Stroke notes",
				value: true,
				onChange: ev => setSetting("strokeNotes", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "roundedNotes",
				label: "Rounded notes",
				value: true,
				onChange: ev => setSetting("roundedNotes", ev.target.checked)
			},
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
				type: "checkbox",
				id: "fadeInNotes",
				label: "Enable fade in effect",
				value: true,
				onChange: ev => setSetting("fadeInNotes", ev.target.checked)
			},
			{
				type: "checkbox",
				id: "showNoteDebugInfo",
				label: "Enable debug info on hover over note",
				value: false,
				onChange: ev => setSetting("showNoteDebugInfo", ev.target.checked)
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
				id: "showParticles",
				label: "Enable Particles",
				value: true,
				onChange: ev => setSetting("showParticles", ev.target.checked)
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
				id: "particleAmount",
				label: "Particle Amount (per frame)",
				value: 40,
				min: 0,
				max: 200,
				step: 1,
				onChange: value => setSetting("particleAmount", value)
			},
			{
				type: "slider",
				id: "particleSize",
				label: "Particle Size",
				value: 3,
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
				max: 30,
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
			}
		]
	}
}
