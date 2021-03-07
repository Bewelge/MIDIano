export var CONST = {
	TRACK_COLORS: [
		{ white: "#ffa000", black: "#ff8f00" }, //orange
		{ white: "#1e88e5", black: "#1976d2" }, //blue
		{ white: "#43a047", black: "#388e3c" }, //green
		{ white: "#ffeb3b", black: "#fdd835" }, //yellow
		{ white: "#9c27b0", black: "#8e24aa" }, //pink
		{ white: "#f44336", black: "#e53935" }, //red
		{ white: "#673ab7", black: "#5e35b1" } //purple

		// { white: "rgb(40,50,90)", black: "Blue" },
		// { white: "rgb(50,90,60)", black: "rgb(20,85,40)" },
		// { white: "rgb(40,50,90)", black: "Blue" },
		// { white: "rgb(50,90,60)", black: "rgb(20,85,40)" }
	],
	INSTRUMENTS: {
		BY_ID: {
			0: {
				id: "acoustic_grand_piano",
				instrument: "Acoustic Grand Piano",
				number: 0,
				category: "Piano"
			},
			1: {
				id: "bright_acoustic_piano",
				instrument: "Bright Acoustic Piano",
				number: 1,
				category: "Piano"
			},
			2: {
				id: "electric_grand_piano",
				instrument: "Electric Grand Piano",
				number: 2,
				category: "Piano"
			},
			3: {
				id: "honkytonk_piano",
				instrument: "Honky-tonk Piano",
				number: 3,
				category: "Piano"
			},
			4: {
				id: "electric_piano_1",
				instrument: "Electric Piano 1",
				number: 4,
				category: "Piano"
			},
			5: {
				id: "electric_piano_2",
				instrument: "Electric Piano 2",
				number: 5,
				category: "Piano"
			},
			6: {
				id: "harpsichord",
				instrument: "Harpsichord",
				number: 6,
				category: "Piano"
			},
			7: {
				id: "clavinet",
				instrument: "Clavinet",
				number: 7,
				category: "Piano"
			},
			8: {
				id: "celesta",
				instrument: "Celesta",
				number: 8,
				category: "Chromatic Percussion"
			},
			9: {
				id: "glockenspiel",
				instrument: "Glockenspiel",
				number: 9,
				category: "Chromatic Percussion"
			},
			10: {
				id: "music_box",
				instrument: "Music Box",
				number: 10,
				category: "Chromatic Percussion"
			},
			11: {
				id: "vibraphone",
				instrument: "Vibraphone",
				number: 11,
				category: "Chromatic Percussion"
			},
			12: {
				id: "marimba",
				instrument: "Marimba",
				number: 12,
				category: "Chromatic Percussion"
			},
			13: {
				id: "xylophone",
				instrument: "Xylophone",
				number: 13,
				category: "Chromatic Percussion"
			},
			14: {
				id: "tubular_bells",
				instrument: "Tubular Bells",
				number: 14,
				category: "Chromatic Percussion"
			},
			15: {
				id: "dulcimer",
				instrument: "Dulcimer",
				number: 15,
				category: "Chromatic Percussion"
			},
			16: {
				id: "drawbar_organ",
				instrument: "Drawbar Organ",
				number: 16,
				category: "Organ"
			},
			17: {
				id: "percussive_organ",
				instrument: "Percussive Organ",
				number: 17,
				category: "Organ"
			},
			18: {
				id: "rock_organ",
				instrument: "Rock Organ",
				number: 18,
				category: "Organ"
			},
			19: {
				id: "church_organ",
				instrument: "Church Organ",
				number: 19,
				category: "Organ"
			},
			20: {
				id: "reed_organ",
				instrument: "Reed Organ",
				number: 20,
				category: "Organ"
			},
			21: {
				id: "accordion",
				instrument: "Accordion",
				number: 21,
				category: "Organ"
			},
			22: {
				id: "harmonica",
				instrument: "Harmonica",
				number: 22,
				category: "Organ"
			},
			23: {
				id: "tango_accordion",
				instrument: "Tango Accordion",
				number: 23,
				category: "Organ"
			},
			24: {
				id: "acoustic_guitar_nylon",
				instrument: "Acoustic Guitar (nylon)",
				number: 24,
				category: "Guitar"
			},
			25: {
				id: "acoustic_guitar_steel",
				instrument: "Acoustic Guitar (steel)",
				number: 25,
				category: "Guitar"
			},
			26: {
				id: "electric_guitar_jazz",
				instrument: "Electric Guitar (jazz)",
				number: 26,
				category: "Guitar"
			},
			27: {
				id: "electric_guitar_clean",
				instrument: "Electric Guitar (clean)",
				number: 27,
				category: "Guitar"
			},
			28: {
				id: "electric_guitar_muted",
				instrument: "Electric Guitar (muted)",
				number: 28,
				category: "Guitar"
			},
			29: {
				id: "overdriven_guitar",
				instrument: "Overdriven Guitar",
				number: 29,
				category: "Guitar"
			},
			30: {
				id: "distortion_guitar",
				instrument: "Distortion Guitar",
				number: 30,
				category: "Guitar"
			},
			31: {
				id: "guitar_harmonics",
				instrument: "Guitar Harmonics",
				number: 31,
				category: "Guitar"
			},
			32: {
				id: "acoustic_bass",
				instrument: "Acoustic Bass",
				number: 32,
				category: "Bass"
			},
			33: {
				id: "electric_bass_finger",
				instrument: "Electric Bass (finger)",
				number: 33,
				category: "Bass"
			},
			34: {
				id: "electric_bass_pick",
				instrument: "Electric Bass (pick)",
				number: 34,
				category: "Bass"
			},
			35: {
				id: "fretless_bass",
				instrument: "Fretless Bass",
				number: 35,
				category: "Bass"
			},
			36: {
				id: "slap_bass_1",
				instrument: "Slap Bass 1",
				number: 36,
				category: "Bass"
			},
			37: {
				id: "slap_bass_2",
				instrument: "Slap Bass 2",
				number: 37,
				category: "Bass"
			},
			38: {
				id: "synth_bass_1",
				instrument: "Synth Bass 1",
				number: 38,
				category: "Bass"
			},
			39: {
				id: "synth_bass_2",
				instrument: "Synth Bass 2",
				number: 39,
				category: "Bass"
			},
			40: {
				id: "violin",
				instrument: "Violin",
				number: 40,
				category: "Strings"
			},
			41: {
				id: "viola",
				instrument: "Viola",
				number: 41,
				category: "Strings"
			},
			42: {
				id: "cello",
				instrument: "Cello",
				number: 42,
				category: "Strings"
			},
			43: {
				id: "contrabass",
				instrument: "Contrabass",
				number: 43,
				category: "Strings"
			},
			44: {
				id: "tremolo_strings",
				instrument: "Tremolo Strings",
				number: 44,
				category: "Strings"
			},
			45: {
				id: "pizzicato_strings",
				instrument: "Pizzicato Strings",
				number: 45,
				category: "Strings"
			},
			46: {
				id: "orchestral_harp",
				instrument: "Orchestral Harp",
				number: 46,
				category: "Strings"
			},
			47: {
				id: "timpani",
				instrument: "Timpani",
				number: 47,
				category: "Strings"
			},
			48: {
				id: "string_ensemble_1",
				instrument: "String Ensemble 1",
				number: 48,
				category: "Ensemble"
			},
			49: {
				id: "string_ensemble_2",
				instrument: "String Ensemble 2",
				number: 49,
				category: "Ensemble"
			},
			50: {
				id: "synth_strings_1",
				instrument: "Synth Strings 1",
				number: 50,
				category: "Ensemble"
			},
			51: {
				id: "synth_strings_2",
				instrument: "Synth Strings 2",
				number: 51,
				category: "Ensemble"
			},
			52: {
				id: "choir_aahs",
				instrument: "Choir Aahs",
				number: 52,
				category: "Ensemble"
			},
			53: {
				id: "voice_oohs",
				instrument: "Voice Oohs",
				number: 53,
				category: "Ensemble"
			},
			54: {
				id: "synth_choir",
				instrument: "Synth Choir",
				number: 54,
				category: "Ensemble"
			},
			55: {
				id: "orchestra_hit",
				instrument: "Orchestra Hit",
				number: 55,
				category: "Ensemble"
			},
			56: {
				id: "trumpet",
				instrument: "Trumpet",
				number: 56,
				category: "Brass"
			},
			57: {
				id: "trombone",
				instrument: "Trombone",
				number: 57,
				category: "Brass"
			},
			58: {
				id: "tuba",
				instrument: "Tuba",
				number: 58,
				category: "Brass"
			},
			59: {
				id: "muted_trumpet",
				instrument: "Muted Trumpet",
				number: 59,
				category: "Brass"
			},
			60: {
				id: "french_horn",
				instrument: "French Horn",
				number: 60,
				category: "Brass"
			},
			61: {
				id: "brass_section",
				instrument: "Brass Section",
				number: 61,
				category: "Brass"
			},
			62: {
				id: "synth_brass_1",
				instrument: "Synth Brass 1",
				number: 62,
				category: "Brass"
			},
			63: {
				id: "synth_brass_2",
				instrument: "Synth Brass 2",
				number: 63,
				category: "Brass"
			},
			64: {
				id: "soprano_sax",
				instrument: "Soprano Sax",
				number: 64,
				category: "Reed"
			},
			65: {
				id: "alto_sax",
				instrument: "Alto Sax",
				number: 65,
				category: "Reed"
			},
			66: {
				id: "tenor_sax",
				instrument: "Tenor Sax",
				number: 66,
				category: "Reed"
			},
			67: {
				id: "baritone_sax",
				instrument: "Baritone Sax",
				number: 67,
				category: "Reed"
			},
			68: {
				id: "oboe",
				instrument: "Oboe",
				number: 68,
				category: "Reed"
			},
			69: {
				id: "english_horn",
				instrument: "English Horn",
				number: 69,
				category: "Reed"
			},
			70: {
				id: "bassoon",
				instrument: "Bassoon",
				number: 70,
				category: "Reed"
			},
			71: {
				id: "clarinet",
				instrument: "Clarinet",
				number: 71,
				category: "Reed"
			},
			72: {
				id: "piccolo",
				instrument: "Piccolo",
				number: 72,
				category: "Pipe"
			},
			73: {
				id: "flute",
				instrument: "Flute",
				number: 73,
				category: "Pipe"
			},
			74: {
				id: "recorder",
				instrument: "Recorder",
				number: 74,
				category: "Pipe"
			},
			75: {
				id: "pan_flute",
				instrument: "Pan Flute",
				number: 75,
				category: "Pipe"
			},
			76: {
				id: "blown_bottle",
				instrument: "Blown Bottle",
				number: 76,
				category: "Pipe"
			},
			77: {
				id: "shakuhachi",
				instrument: "Shakuhachi",
				number: 77,
				category: "Pipe"
			},
			78: {
				id: "whistle",
				instrument: "Whistle",
				number: 78,
				category: "Pipe"
			},
			79: {
				id: "ocarina",
				instrument: "Ocarina",
				number: 79,
				category: "Pipe"
			},
			80: {
				id: "lead_1_square",
				instrument: "Lead 1 (square)",
				number: 80,
				category: "Synth Lead"
			},
			81: {
				id: "lead_2_sawtooth",
				instrument: "Lead 2 (sawtooth)",
				number: 81,
				category: "Synth Lead"
			},
			82: {
				id: "lead_3_calliope",
				instrument: "Lead 3 (calliope)",
				number: 82,
				category: "Synth Lead"
			},
			83: {
				id: "lead_4_chiff",
				instrument: "Lead 4 (chiff)",
				number: 83,
				category: "Synth Lead"
			},
			84: {
				id: "lead_5_charang",
				instrument: "Lead 5 (charang)",
				number: 84,
				category: "Synth Lead"
			},
			85: {
				id: "lead_6_voice",
				instrument: "Lead 6 (voice)",
				number: 85,
				category: "Synth Lead"
			},
			86: {
				id: "lead_7_fifths",
				instrument: "Lead 7 (fifths)",
				number: 86,
				category: "Synth Lead"
			},
			87: {
				id: "lead_8_bass__lead",
				instrument: "Lead 8 (bass + lead)",
				number: 87,
				category: "Synth Lead"
			},
			88: {
				id: "pad_1_new_age",
				instrument: "Pad 1 (new age)",
				number: 88,
				category: "Synth Pad"
			},
			89: {
				id: "pad_2_warm",
				instrument: "Pad 2 (warm)",
				number: 89,
				category: "Synth Pad"
			},
			90: {
				id: "pad_3_polysynth",
				instrument: "Pad 3 (polysynth)",
				number: 90,
				category: "Synth Pad"
			},
			91: {
				id: "pad_4_choir",
				instrument: "Pad 4 (choir)",
				number: 91,
				category: "Synth Pad"
			},
			92: {
				id: "pad_5_bowed",
				instrument: "Pad 5 (bowed)",
				number: 92,
				category: "Synth Pad"
			},
			93: {
				id: "pad_6_metallic",
				instrument: "Pad 6 (metallic)",
				number: 93,
				category: "Synth Pad"
			},
			94: {
				id: "pad_7_halo",
				instrument: "Pad 7 (halo)",
				number: 94,
				category: "Synth Pad"
			},
			95: {
				id: "pad_8_sweep",
				instrument: "Pad 8 (sweep)",
				number: 95,
				category: "Synth Pad"
			},
			96: {
				id: "fx_1_rain",
				instrument: "FX 1 (rain)",
				number: 96,
				category: "Synth Effects"
			},
			97: {
				id: "fx_2_soundtrack",
				instrument: "FX 2 (soundtrack)",
				number: 97,
				category: "Synth Effects"
			},
			98: {
				id: "fx_3_crystal",
				instrument: "FX 3 (crystal)",
				number: 98,
				category: "Synth Effects"
			},
			99: {
				id: "fx_4_atmosphere",
				instrument: "FX 4 (atmosphere)",
				number: 99,
				category: "Synth Effects"
			},
			100: {
				id: "fx_5_brightness",
				instrument: "FX 5 (brightness)",
				number: 100,
				category: "Synth Effects"
			},
			101: {
				id: "fx_6_goblins",
				instrument: "FX 6 (goblins)",
				number: 101,
				category: "Synth Effects"
			},
			102: {
				id: "fx_7_echoes",
				instrument: "FX 7 (echoes)",
				number: 102,
				category: "Synth Effects"
			},
			103: {
				id: "fx_8_scifi",
				instrument: "FX 8 (sci-fi)",
				number: 103,
				category: "Synth Effects"
			},
			104: {
				id: "sitar",
				instrument: "Sitar",
				number: 104,
				category: "Ethnic"
			},
			105: {
				id: "banjo",
				instrument: "Banjo",
				number: 105,
				category: "Ethnic"
			},
			106: {
				id: "shamisen",
				instrument: "Shamisen",
				number: 106,
				category: "Ethnic"
			},
			107: {
				id: "koto",
				instrument: "Koto",
				number: 107,
				category: "Ethnic"
			},
			108: {
				id: "kalimba",
				instrument: "Kalimba",
				number: 108,
				category: "Ethnic"
			},
			109: {
				id: "bagpipe",
				instrument: "Bagpipe",
				number: 109,
				category: "Ethnic"
			},
			110: {
				id: "fiddle",
				instrument: "Fiddle",
				number: 110,
				category: "Ethnic"
			},
			111: {
				id: "shanai",
				instrument: "Shanai",
				number: 111,
				category: "Ethnic"
			},
			112: {
				id: "tinkle_bell",
				instrument: "Tinkle Bell",
				number: 112,
				category: "Percussive"
			},
			113: {
				id: "agogo",
				instrument: "Agogo",
				number: 113,
				category: "Percussive"
			},
			114: {
				id: "steel_drums",
				instrument: "Steel Drums",
				number: 114,
				category: "Percussive"
			},
			115: {
				id: "woodblock",
				instrument: "Woodblock",
				number: 115,
				category: "Percussive"
			},
			116: {
				id: "taiko_drum",
				instrument: "Taiko Drum",
				number: 116,
				category: "Percussive"
			},
			117: {
				id: "melodic_tom",
				instrument: "Melodic Tom",
				number: 117,
				category: "Percussive"
			},
			118: {
				id: "synth_drum",
				instrument: "Synth Drum",
				number: 118,
				category: "Percussive"
			},
			119: {
				id: "reverse_cymbal",
				instrument: "Reverse Cymbal",
				number: 119,
				category: "Sound effects"
			},
			120: {
				id: "guitar_fret_noise",
				instrument: "Guitar Fret Noise",
				number: 120,
				category: "Sound effects"
			},
			121: {
				id: "breath_noise",
				instrument: "Breath Noise",
				number: 121,
				category: "Sound effects"
			},
			122: {
				id: "seashore",
				instrument: "Seashore",
				number: 122,
				category: "Sound effects"
			},
			123: {
				id: "bird_tweet",
				instrument: "Bird Tweet",
				number: 123,
				category: "Sound effects"
			},
			124: {
				id: "telephone_ring",
				instrument: "Telephone Ring",
				number: 124,
				category: "Sound effects"
			},
			125: {
				id: "helicopter",
				instrument: "Helicopter",
				number: 125,
				category: "Sound effects"
			},
			126: {
				id: "applause",
				instrument: "Applause",
				number: 126,
				category: "Sound effects"
			},
			127: {
				id: "gunshot",
				instrument: "Gunshot",
				number: 127,
				category: "Sound effects"
			},
			"-1": {
				id: "percussion",
				instrument: "Percussion",
				number: -1,
				category: "Percussion"
			}
		}
	},
	KEY_TO_NOTE: {
		A0: 21,
		Bb0: 22,
		B0: 23,
		C1: 24,
		Db1: 25,
		D1: 26,
		Eb1: 27,
		E1: 28,
		F1: 29,
		Gb1: 30,
		G1: 31,
		Ab1: 32,
		A1: 33,
		Bb1: 34,
		B1: 35,
		C2: 36,
		Db2: 37,
		D2: 38,
		Eb2: 39,
		E2: 40,
		F2: 41,
		Gb2: 42,
		G2: 43,
		Ab2: 44,
		A2: 45,
		Bb2: 46,
		B2: 47,
		C3: 48,
		Db3: 49,
		D3: 50,
		Eb3: 51,
		E3: 52,
		F3: 53,
		Gb3: 54,
		G3: 55,
		Ab3: 56,
		A3: 57,
		Bb3: 58,
		B3: 59,
		C4: 60,
		Db4: 61,
		D4: 62,
		Eb4: 63,
		E4: 64,
		F4: 65,
		Gb4: 66,
		G4: 67,
		Ab4: 68,
		A4: 69,
		Bb4: 70,
		B4: 71,
		C5: 72,
		Db5: 73,
		D5: 74,
		Eb5: 75,
		E5: 76,
		F5: 77,
		Gb5: 78,
		G5: 79,
		Ab5: 80,
		A5: 81,
		Bb5: 82,
		B5: 83,
		C6: 84,
		Db6: 85,
		D6: 86,
		Eb6: 87,
		E6: 88,
		F6: 89,
		Gb6: 90,
		G6: 91,
		Ab6: 92,
		A6: 93,
		Bb6: 94,
		B6: 95,
		C7: 96,
		Db7: 97,
		D7: 98,
		Eb7: 99,
		E7: 100,
		F7: 101,
		Gb7: 102,
		G7: 103,
		Ab7: 104,
		A7: 105,
		Bb7: 106,
		B7: 107,
		C8: 108
	},
	MIDI_NOTE_TO_KEY: {
		21: "A0",
		22: "Bb0",
		23: "B0",
		24: "C1",
		25: "Db1",
		26: "D1",
		27: "Eb1",
		28: "E1",
		29: "F1",
		30: "Gb1",
		31: "G1",
		32: "Ab1",
		33: "A1",
		34: "Bb1",
		35: "B1",
		36: "C2",
		37: "Db2",
		38: "D2",
		39: "Eb2",
		40: "E2",
		41: "F2",
		42: "Gb2",
		43: "G2",
		44: "Ab2",
		45: "A2",
		46: "Bb2",
		47: "B2",
		48: "C3",
		49: "Db3",
		50: "D3",
		51: "Eb3",
		52: "E3",
		53: "F3",
		54: "Gb3",
		55: "G3",
		56: "Ab3",
		57: "A3",
		58: "Bb3",
		59: "B3",
		60: "C4",
		61: "Db4",
		62: "D4",
		63: "Eb4",
		64: "E4",
		65: "F4",
		66: "Gb4",
		67: "G4",
		68: "Ab4",
		69: "A4",
		70: "Bb4",
		71: "B4",
		72: "C5",
		73: "Db5",
		74: "D5",
		75: "Eb5",
		76: "E5",
		77: "F5",
		78: "Gb5",
		79: "G5",
		80: "Ab5",
		81: "A5",
		82: "Bb5",
		83: "B5",
		84: "C6",
		85: "Db6",
		86: "D6",
		87: "Eb6",
		88: "E6",
		89: "F6",
		90: "Gb6",
		91: "G6",
		92: "Ab6",
		93: "A6",
		94: "Bb6",
		95: "B6",
		96: "C7",
		97: "Db7",
		98: "D7",
		99: "Eb7",
		100: "E7",
		101: "F7",
		102: "Gb7",
		103: "G7",
		104: "Ab7",
		105: "A7",
		106: "Bb7",
		107: "B7",
		108: "C8"
	}
}
