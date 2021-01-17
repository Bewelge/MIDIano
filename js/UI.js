import { DomHelper } from "./DomHelper.js"

/**
 * Contains all initiation, appending and manipulation of DOM-elements.
 * Callback-bindings for some events are created in  the constructor
 */
export class UI {
	constructor(player, render, isMobile) {
		this.settings = {
			soundfontName: "MusyngKite",
			sustainEnabled: true,
			showSustainOnOffs: true,
			showSustainPeriods: true,
			showSustainedNotes: true,
			sustainedNotesOpacity: 50,
			showBPM: true,
			showParticles: true,
			particleAmount: 40,
			particleSize: 2,
			particleLife: 12,
			particleSpeed: 4,
			showHitKeys: true,
			showPianoKeys: true,
			strokeNotes: true,
			roundedNotes: true,
			fadeInNotes: true,
			renderOffset: 0,
			showNoteDebugInfo: false
		}
		this.midiInputHandler = player.midiInputHandler
		this.player = player

		this.isMobile = window.matchMedia(
			"only screen and (max-width: 1600px)"
		).matches

		//add callbacks to the player
		player.newSongCallbacks.push(this.newSongCallback.bind(this))
		player.onloadStartCallbacks.push(this.startLoad.bind(this))
		player.onloadStopCallbacks.push(this.stopLoad.bind(this))

		render.updateSettings(this.settings)
		player.updateSettings(this.settings)

		document.body.addEventListener("mousemove", this.mouseMoved.bind(this))

		this.createControlMenu()

		this.menuHeight = 200

		document
			.querySelectorAll(".innerMenuDiv")
			.forEach(
				el =>
					(el.style.height =
						"calc(100% - " + (this.getNavBar().clientHeight + 25) + "px)")
			)
	}

	fireInitialListeners() {
		//Todo: or preload glyphs somehow. . .
		window.setTimeout(
			() => this.onMenuHeightChange(this.getNavBar().clientHeight),
			500
		)
	}
	createControlMenu() {
		let topGroupsContainer = DomHelper.createDivWithClass("container")

		let fileGrp = this.getFileButtonGroup()
		let songSpeedGrp = this.getSpeedButtonGroup()
		let songControlGrp = this.getSongControlButtonGroup()
		let volumeGrp = this.getVolumneButtonGroup()
		let settingsGrpRight = this.getSettingsButtonGroup()
		let trackGrp = this.getTracksButtonGroup()

		DomHelper.addClassToElements("align-middle", [
			fileGrp,
			songSpeedGrp,
			songControlGrp,
			trackGrp
		])

		let leftTop = DomHelper.createElementWithClass("topContainer")
		let middleTop = DomHelper.createElementWithClass("topContainer")
		let rightTop = DomHelper.createElementWithClass("topContainer")

		DomHelper.appendChildren(leftTop, [fileGrp, songSpeedGrp])
		DomHelper.appendChildren(middleTop, [songControlGrp])
		DomHelper.appendChildren(rightTop, [volumeGrp, trackGrp, settingsGrpRight])

		DomHelper.appendChildren(topGroupsContainer, [leftTop, middleTop, rightTop])

		let minimizeButton = this.getMinimizeButton()
		let zoomDiv = this.getZoomDiv()

		document.body.appendChild(minimizeButton)
		this.getNavBar().appendChild(topGroupsContainer)

		this.getTrackMenuDiv()
		this.getLoadedSongsDiv()
		this.getSettingsDiv()

		this.createFileDragArea()
	}
	getZoomDiv() {
		//todo
	}
	mouseMoved() {
		this.getMinimizeButton().style.opacity = 1
		if (!this.fadingOutMinimizeButton) {
			this.fadingOutMinimizeButton = true
			window.setTimeout(() => {
				this.getMinimizeButton().style.opacity = 0
				this.fadingOutMinimizeButton = false
			}, 1000)
		}
	}
	getMinimizeButton() {
		if (!this.minimizeButton) {
			this.minimizeButton = DomHelper.createGlyphiconButton(
				"minimizeMenu",
				"chevron-up",
				() => {
					if (!this.navMinimized) {
						this.getNavBar().style.marginTop =
							"-" + this.getNavBar().clientHeight + "px"
						this.navMinimized = true
						this.minimizeButton
							.querySelector("span")
							.classList.remove("glyphicon-chevron-up")
						this.minimizeButton
							.querySelector("span")
							.classList.add("glyphicon-chevron-down")
						this.onMenuHeightChange(0)
					} else {
						this.getNavBar().style.marginTop = "0px"
						this.navMinimized = false

						this.minimizeButton
							.querySelector("span")
							.classList.add("glyphicon-chevron-up")
						this.minimizeButton
							.querySelector("span")
							.classList.remove("glyphicon-chevron-down")
						this.onMenuHeightChange(this.getNavBar().clientHeight)
					}
				}
			)
			this.minimizeButton.style.padding = "0px"
			this.minimizeButton.style.fontSize = "0.5em"
		}
		let navbarHeight = this.navMinimized ? 0 : this.getNavBar().clientHeight
		this.minimizeButton.style.top = navbarHeight + 20 + "px"
		return this.minimizeButton
	}

	getSettingsButtonGroup() {
		let settingsGrpRight = DomHelper.createButtonGroup(true)
		DomHelper.appendChildren(settingsGrpRight, [
			this.getFullscreenButton(),
			this.getSettingsButton()
		])
		return settingsGrpRight
	}
	setOnMenuHeightChange(func) {
		this.onMenuHeightChange = func
	}

	getTracksButtonGroup() {
		let trackGrp = DomHelper.createButtonGroup(true)
		DomHelper.appendChildren(trackGrp, [
			this.getTracksButton(),
			this.getMidiInputButton()
			// this.getChannelsButton()
		])
		return trackGrp
	}

	getVolumneButtonGroup() {
		let volumeGrp = DomHelper.createButtonGroup(true)
		DomHelper.appendChildren(volumeGrp, [
			this.getMainVolumeSlider().container,
			this.getMuteButton()
		])
		return volumeGrp
	}

	getSongControlButtonGroup() {
		let songControlGrp = DomHelper.createButtonGroup(false)
		DomHelper.appendChildren(songControlGrp, [
			this.getPlayButton(),
			this.getPauseButton(),
			this.getStopButton()
		])
		return songControlGrp
	}

	getSpeedButtonGroup() {
		let songSpeedGrp = DomHelper.createButtonGroup(true)
		DomHelper.appendChildren(songSpeedGrp, [this.getSpeedDiv()])
		return songSpeedGrp
	}

	getFileButtonGroup() {
		let fileGrp = DomHelper.createButtonGroup(true)
		DomHelper.appendChildren(fileGrp, [
			this.getLoadSongButton(),
			this.getLoadedSongsButton()
		])
		return fileGrp
	}

	getNavBar() {
		if (!this.navBar) {
			this.navBar = DomHelper.createElement(
				"nav",
				{},
				{
					className: "navbar navbar-wrapper"
				}
			)

			document.body.appendChild(this.navBar)
		}
		return this.navBar
	}
	getSettingsButton() {
		if (!this.settingsButton) {
			this.settingsButton = DomHelper.createGlyphiconButton(
				"settingsButton",
				"cog",
				() => {
					if (this.settingsShown) {
						this.hideSettings()
					} else {
						this.showSettings()
					}
				}
			)
		}
		return this.settingsButton
	}
	hideDiv(div) {
		div.style.visibility = "hidden"
		div.style.opacity = "0"
	}
	showDiv(div) {
		div.style.visibility = "visible"
		div.style.opacity = "1"
	}
	hideSettings() {
		DomHelper.removeClass("selected", this.getSettingsButton())
		this.settingsShown = false
		this.hideDiv(this.getSettingsDiv())
	}
	showSettings() {
		this.hideAllDialogs()
		DomHelper.addClassToElement("selected", this.getSettingsButton())
		this.settingsShown = true
		this.showDiv(this.getSettingsDiv())
	}
	getSettingsDiv() {
		if (!this.settingsDiv) {
			this.settingsDiv = DomHelper.createDivWithIdAndClass(
				"settingsDiv",
				"innerMenuDiv"
			)
			this.hideDiv(this.settingsDiv)
			this.getSettingsContent().forEach(element =>
				this.settingsDiv.appendChild(element)
			)
			document.body.appendChild(this.settingsDiv)
		}
		return this.settingsDiv
	}
	getSettingsContent() {
		let settingsDivs = []

		let loadMessage = this.setLoadMessage.bind(this)
		let soundfontSelect = DomHelper.createInputSelect(
			"Soundfont",
			["MusyngKite", "FluidR3_GM", "FatBoy"],
			function (newVal) {
				this.player.switchSoundfont(newVal, loadMessage)
			}.bind(this)
		)
		settingsDivs.push(soundfontSelect)

		let enableSustainCheckbox = DomHelper.createCheckbox(
			"Enable Sustain",
			ev => {
				this.settings.sustainEnabled = ev.target.checked
				if (!this.settings.sustainEnabled) {
					//TODO
					//if sustain gets disabled in the audio, lets also turn off all rendering of sustains
					// this.settings.showSustainOnOffs = false
					// this.settings.showSustainPeriods = false
					// this.settings.showSustainedNotes = false
				}
			},
			this.settings.sustainEnabled
		)
		settingsDivs.push(enableSustainCheckbox)

		let drawSustainOnOffsCheckbox = DomHelper.createCheckbox(
			"Draw Sustain On/Off Events",
			ev => {
				this.settings.showSustainOnOffs = ev.target.checked
			},
			this.settings.showSustainOnOffs
		)
		settingsDivs.push(drawSustainOnOffsCheckbox)

		let drawSustainPeriodsCheckbox = DomHelper.createCheckbox(
			"Draw Sustain Periods",
			ev => {
				this.settings.showSustainPeriods = ev.target.checked
			},
			this.settings.showSustainPeriods
		)
		settingsDivs.push(drawSustainPeriodsCheckbox)

		let drawSustainedNotesCheckbox = DomHelper.createCheckbox(
			"Draw Sustained Notes",
			ev => {
				this.settings.showSustainedNotes = ev.target.checked
			},
			this.settings.showSustainedNotes
		)
		settingsDivs.push(drawSustainedNotesCheckbox)

		let sustainedNotesOpacitySlider = DomHelper.createSliderWithLabelAndField(
			"sustainedNotesOpacitySlider",
			"Sustained Notes Opacity (%)",
			this.settings.sustainedNotesOpacity,
			0,
			100,
			value => {
				this.settings.sustainedNotesOpacity = value
			}
		)
		settingsDivs.push(sustainedNotesOpacitySlider.container)

		let showBPMCheckbox = DomHelper.createCheckbox(
			"Show BPM",
			ev => {
				this.settings.showBPM = ev.target.checked
			},
			this.settings.showBPM
		)
		settingsDivs.push(showBPMCheckbox)

		let showParticlesCheckbox = DomHelper.createCheckbox(
			"Show Particles",
			ev => {
				this.settings.showParticles = ev.target.checked
			},
			this.settings.showParticles
		)
		settingsDivs.push(showParticlesCheckbox)

		let particleAmountSlider = DomHelper.createSliderWithLabelAndField(
			"particleAmountSlider",
			"Particle Amount",
			this.settings.particleAmount,
			0,
			200,
			value => {
				this.settings.particleAmount = value
			}
		)
		settingsDivs.push(particleAmountSlider.container)
		let particleSizeSlider = DomHelper.createSliderWithLabelAndField(
			"particleSizeSlider",
			"Particle Size",
			this.settings.particleSize,
			0,
			10,
			value => {
				this.settings.particleSize = value
			}
		)
		settingsDivs.push(particleSizeSlider.container)

		let particleSpeedSlider = DomHelper.createSliderWithLabelAndField(
			"particleSpeedSlider",
			"Particle Speed",
			this.settings.particleSpeed,
			1,
			15,
			value => {
				this.settings.particleSpeed = value
			}
		)
		settingsDivs.push(particleSpeedSlider.container)

		let particleLifeSlider = DomHelper.createSliderWithLabelAndField(
			"particleDurationSlider",
			"Particle Duration",
			this.settings.particleLife,
			1,
			30,
			value => {
				this.settings.particleLife = value
			}
		)
		settingsDivs.push(particleLifeSlider.container)

		let showHitKeysCheckbox = DomHelper.createCheckbox(
			"Hit Key Effect",
			ev => {
				this.settings.showHitKeys = ev.target.checked
			},
			this.settings.showHitKeys
		)
		settingsDivs.push(showHitKeysCheckbox)

		let strokeNotesCheckbox = DomHelper.createCheckbox(
			"Stroke Notes",
			ev => {
				this.settings.strokeNotes = ev.target.checked
			},
			this.settings.strokeNotes
		)
		settingsDivs.push(strokeNotesCheckbox)

		let roundedNotesCheckbox = DomHelper.createCheckbox(
			"Rounded Corners Notes",
			ev => {
				this.settings.roundedNotes = ev.target.checked
			},
			this.settings.roundedNotes
		)
		settingsDivs.push(roundedNotesCheckbox)

		let fadeInNotesCheckbox = DomHelper.createCheckbox(
			"Fade in Notes",
			ev => {
				this.settings.fadeInNotes = ev.target.checked
			},
			this.settings.fadeInNotes
		)
		settingsDivs.push(fadeInNotesCheckbox)

		let showPianoKeysCheckbox = DomHelper.createCheckbox(
			"Show Notes on Piano",
			ev => {
				this.settings.showPianoKeys = ev.target.checked
			},
			this.settings.showPianoKeys
		)
		settingsDivs.push(showPianoKeysCheckbox)

		let renderOffsetSlider = DomHelper.createSliderWithLabelAndField(
			"renderOffsetSlider",
			"Render Offset (ms)",
			this.settings.renderOffset,
			-250,
			250,
			value => {
				this.settings.renderOffset = value
			}
		)
		settingsDivs.push(renderOffsetSlider.container)

		let showNoteDebugInfo = DomHelper.createCheckbox(
			"Show Note Debug Info",
			ev => {
				this.settings.showNoteDebugInfo = ev.target.checked
			},
			this.settings.showNoteDebugInfo
		)
		settingsDivs.push(showNoteDebugInfo)

		settingsDivs.forEach(div => div.classList.add("innerMenuContDiv"))

		return settingsDivs
	}
	getFullscreenButton() {
		if (!this.fullscreenButton) {
			this.fullscreen = false
			let clickFullscreen = () => {
				if (!this.fullscreen) {
					document.body.requestFullscreen()
				} else {
					document.exitFullscreen()
				}
			}
			this.fullscreenButton = DomHelper.createGlyphiconButton(
				"fullscreenButton",
				"fullscreen",
				clickFullscreen.bind(this)
			)
			let fullscreenSwitch = () => (this.fullscreen = !this.fullscreen)
			document.body.onfullscreenchange = fullscreenSwitch.bind(this)
		}
		return this.fullscreenButton
	}
	getLoadSongButton() {
		if (!this.loadSongButton) {
			this.loadSongButton = DomHelper.createFileInput(
				"Upload Midi",
				this.handleFileSelect.bind(this)
			)
			DomHelper.addClassToElement("floatSpanLeft", this.loadSongButton)
		}
		return this.loadSongButton
	}
	getLoadedSongsButton() {
		if (!this.loadedSongsButton) {
			this.loadedSongsButton = DomHelper.createGlyphiconTextButton(
				"mute",
				"music",
				"Loaded Songs",
				ev => {
					if (this.loadedSongsShown) {
						this.hideLoadedSongsDiv()
					} else {
						this.showLoadedSongsDiv()
					}
				}
			)
		}
		return this.loadedSongsButton
	}
	showLoadedSongsDiv() {
		this.hideAllDialogs()
		DomHelper.addClassToElement("selected", this.loadedSongsButton)
		this.loadedSongsShown = true
		this.showDiv(this.getLoadedSongsDiv())
	}

	hideLoadedSongsDiv() {
		DomHelper.removeClass("selected", this.loadedSongsButton)
		this.loadedSongsShown = false
		this.hideDiv(this.getLoadedSongsDiv())
	}

	getLoadedSongsDiv() {
		if (!this.loadedSongsDiv) {
			this.loadedSongsDiv = DomHelper.createDivWithClass("innerMenuDiv")
			this.hideDiv(this.loadedSongsDiv)
			document.body.appendChild(this.loadedSongsDiv)
		}
		this.player.loadedSongs.forEach(song => {
			if (!song.div) {
				this.createSongDiv(song)
			}
		})
		return this.loadedSongsDiv
	}
	createSongDiv(song) {
		let wrapper = DomHelper.createDivWithIdAndClass(
			"songWrap" + song.fileName.replaceAll(" ", "_"),
			"innerMenuContDiv"
		)
		song.div = DomHelper.createButton(
			"song" + song.fileName.replaceAll(" ", "_"),
			() => this.player.setSong(song)
		)
		song.div.innerHTML = song.fileName
		wrapper.appendChild(song.div)
		this.getLoadedSongsDiv().appendChild(wrapper)
	}
	createFileDragArea() {
		let dragArea = DomHelper.createElement(
			"div",
			{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				zIndex: 10000,
				visibility: "hidden",
				opacity: "0",
				backgroundColor: "rgba(0,0,0,0.2)",
				transition: "all 0.2s ease-out"
			},
			{
				draggable: "true"
			}
		)

		let dragAreaText = DomHelper.createDivWithClass(
			"centeredBigText",
			{
				marginTop: "25%",
				fontSize: "35px",
				color: "rgba(225,225,225,0.8)"
			},
			{ innerHTML: "Drop Midi File anywhere!" }
		)
		dragArea.appendChild(dragAreaText)

		dragArea.ondrop = ev => {
			console.log(123)
			dragArea.style.backgroundColor = "rgba(0,0,0,0)"
			this.handleDragDropFileSelect(ev)
		}
		let lastTarget
		window.ondragenter = ev => {
			ev.preventDefault()
			lastTarget = ev.target
			dragArea.style.visibility = ""
			dragArea.style.opacity = "1"
		}
		window.ondragleave = ev => {
			if (ev.target === lastTarget || ev.target === document) {
				dragArea.style.visibility = "hidden"
				dragArea.style.opacity = "0"
			}
		}
		window.ondragover = ev => ev.preventDefault()
		window.ondrop = ev => {
			ev.preventDefault()
			dragArea.style.visibility = "hidden"
			dragArea.style.opacity = "0"
			this.handleDragDropFileSelect(ev)
		}
		document.body.appendChild(dragArea)
	}
	handleDragOverFile(ev) {
		this.createFileDragArea().style
	}
	handleDragDropFileSelect(ev) {
		if (ev.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			if (ev.dataTransfer.items.length > 0) {
				if (ev.dataTransfer.items[0].kind === "file") {
					var file = ev.dataTransfer.items[0].getAsFile()
					this.readFile(file)
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			if (ev.dataTransfer.files.length > 0) {
				var file = ev.dataTransfer.files[0]
				this.readFile(file)
			}
		}
	}
	handleFileSelect(evt) {
		var files = evt.target.files
		for (var i = 0, f; (f = files[i]); i++) {
			console.log(f)
			this.readFile(f)
		}
	}
	readFile(file) {
		let reader = new FileReader()
		let fileName = file.name
		reader.onload = function (theFile) {
			this.player.loadSong(
				reader.result,
				fileName,
				this.setLoadMessage.bind(this)
			)
		}.bind(this)
		reader.readAsDataURL(file)
	}
	startLoad() {
		this.getLoadingDiv().style.display = "block"
		this.getLoadingText().innerHTML = "Loading"
		this.loading = true
		this.loadAnimation()
	}
	stopLoad() {
		this.getLoadingDiv().style.display = "none"
		this.loading = false
	}
	loadAnimation() {
		let currentText = this.getLoadingText().innerHTML
		currentText = currentText.replace("...", " ..")
		currentText = currentText.replace(" ..", ". .")
		currentText = currentText.replace(". .", ".. ")
		currentText = currentText.replace(".. ", "...")
		this.getLoadingText().innerHTML = currentText
		if (this.loading) {
			window.requestAnimationFrame(this.loadAnimation.bind(this))
		}
	}
	setLoadMessage(msg) {
		this.getLoadingText().innerHTML = msg + "..."
	}
	getLoadingText() {
		if (!this.loadingText) {
			this.loadingText = DomHelper.createElement("p")
			this.getLoadingDiv().appendChild(this.loadingText)
		}
		return this.loadingText
	}
	getLoadingDiv() {
		if (!this.loadingDiv) {
			this.loadingDiv = DomHelper.createDivWithIdAndClass(
				"loadingDiv",
				"fullscreen"
			)

			let spinner = DomHelper.createSpinner()
			this.loadingDiv.appendChild(spinner)
			document.body.appendChild(this.loadingDiv)
		}
		return this.loadingDiv
	}
	getSpeedDiv() {
		if (!this.speedDiv) {
			this.speedDiv = DomHelper.createDivWithClass(
				"btn-group btn-group-vertical"
			)
			this.speedDiv.appendChild(this.getSpeedUpButton())
			this.speedDiv.appendChild(this.getSpeedDisplayField())
			this.speedDiv.appendChild(this.getSpeedDownButton())
		}
		return this.speedDiv
	}
	getSpeedUpButton() {
		if (!this.speedUpButton) {
			this.speedUpButton = DomHelper.createGlyphiconButton(
				"speedUp",
				"triangle-top",
				ev => {
					this.player.playbackSpeed += 0.05
					this.updateSpeed()
				}
			)
			this.speedUpButton.className += " btn-xs forcedThinButton"
		}
		return this.speedUpButton
	}
	updateSpeed() {
		this.getSpeedDisplayField().value =
			Math.floor(this.player.playbackSpeed * 100) + "%"
	}
	getSpeedDisplayField() {
		if (!this.speedDisplay) {
			this.speedDisplay = DomHelper.createTextInput(
				ev => {
					let newVal = Math.max(1, Math.min(1000, parseInt(ev.target.value)))
					if (!isNaN(newVal)) {
						ev.target.value = newVal + "%"
						this.player.playbackSpeed = newVal / 100
					}
				},
				{
					float: "none",
					textAlign: "center"
				},
				{
					value: Math.floor(this.player.playbackSpeed * 100) + "%",
					className: "forcedThinButton",
					type: "text"
				}
			)
		}
		return this.speedDisplay
	}
	getSpeedDownButton() {
		if (!this.speedDownButton) {
			this.speedDownButton = DomHelper.createGlyphiconButton(
				"speedUp",
				"triangle-bottom",
				ev => {
					this.player.playbackSpeed -= 0.05
					this.updateSpeed()
				}
			)
			this.speedDownButton.className += " btn-xs forcedThinButton"
		}
		return this.speedDownButton
	}
	getTracksButton() {
		if (!this.tracksButton) {
			this.tracksButton = DomHelper.createGlyphiconTextButton(
				"tracks",
				"align-justify",
				"Tracks",
				ev => {
					if (this.tracksShown) {
						this.hideTracks()
					} else {
						this.showTracks()
					}
				}
			)
			DomHelper.addClassToElement("floatSpanLeft", this.tracksButton)
		}
		return this.tracksButton
	}
	hideTracks() {
		DomHelper.removeClass("selected", this.tracksButton)
		this.tracksShown = false
		this.hideDiv(this.getTrackMenuDiv())
	}

	showTracks() {
		this.hideAllDialogs()
		DomHelper.addClassToElement("selected", this.tracksButton)
		this.tracksShown = true
		this.showDiv(this.getTrackMenuDiv())
	}

	getMidiInputButton() {
		if (!this.midiInputButton) {
			this.midiInputButton = DomHelper.createGlyphiconTextButton(
				"midiInput",
				"tower",
				"Midi-Input",
				ev => {
					if (this.midiInputDialogShown) {
						this.hideMidiInputDialog()
					} else {
						this.showMidiInputDialog()
					}
				}
			)
			DomHelper.addClassToElement("floatSpanLeft", this.midiInputButton)
		}
		return this.midiInputButton
	}
	hideMidiInputDialog() {
		DomHelper.removeClass("selected", this.midiInputButton)
		this.midiInputDialogShown = false
		this.hideDiv(this.getMidiInputDialog())
	}

	showMidiInputDialog() {
		this.hideAllDialogs()
		DomHelper.addClassToElement("selected", this.midiInputButton)
		this.midiInputDialogShown = true

		this.showDiv(this.getMidiInputDialog())
	}
	getChannelsButton() {
		if (!this.channelsButton) {
			let channelMenuDiv = this.getChannelMenuDiv()
			this.channelsButton = DomHelper.createGlyphiconTextButton(
				"channels",
				"align-justify",
				"Channels",
				ev => {
					if (this.channelsShown) {
						this.hideChannels(channelMenuDiv)
					} else {
						this.showChannels(channelMenuDiv)
					}
				}
			)
			DomHelper.addClassToElement("floatSpanLeft", this.channelsButton)

			//Todo. decide what channel info to show...
			this.channelsButton.style.opacity = 0
		}
		return this.channelsButton
	}
	getChannelMenuDiv() {
		if (!this.channelMenuDiv) {
			this.channelMenuDiv = DomHelper.createDivWithId("trackContainerDiv")
			this.channelMenuDiv.style.display = "none"
			this.channelMenuDiv.style.top = this.getNavBar().style.height
			document.body.appendChild(this.channelMenuDiv)
		}
		return this.channelMenuDiv
	}
	showChannels(channelMenuDiv) {
		if (this.tracksShown) {
			this.hideTracks()
		}
		DomHelper.addClassToElement("selected", this.tracksButton)
		this.channelsShown = true
		channelMenuDiv.style.display = "block"
	}

	hideChannels(channelMenuDiv) {
		DomHelper.removeClass("selected", this.tracksButton)
		this.channelsShown = false
		channelMenuDiv.style.display = "none"
	}
	hideAllDialogs() {
		// this.hideChannels()
		this.hideMidiInputDialog()
		this.hideSettings()
		this.hideLoadedSongsDiv()
		this.hideTracks()
		this.hideLoadedSongsDiv()
	}

	getMainVolumeSlider() {
		if (!this.mainVolumeSlider) {
			this.mainVolumeSlider = DomHelper.createSliderWithLabel(
				"volumeMain",
				"Master Volume",
				this.player.volume,
				0,
				100,
				ev => {
					if (this.player.volume == 0 && parseInt(ev.target.value) != 0) {
						DomHelper.replaceGlyph(
							this.getMuteButton(),
							"volume-off",
							"volume-up"
						)
						//this.getMuteButton().firstChild.className = this.muteButton.firstChild.className.replace('volume-off', 'volume-up')
					}
					this.player.volume = parseInt(ev.target.value)
					if (this.player.volume <= 0) {
						DomHelper.replaceGlyph(
							this.getMuteButton(),
							"volume-up",
							"volume-off"
						)
					} else if (this.getMuteButton().innerHTML == "Unmute") {
						DomHelper.replaceGlyph(
							this.getMuteButton(),
							"volume-off",
							"volume-up"
						)
					}
				}
			)
		}
		return this.mainVolumeSlider
	}
	getMuteButton() {
		if (!this.muteButton) {
			this.muteButton = DomHelper.createGlyphiconButton(
				"mute",
				"volume-up",
				ev => {
					if (this.player.muted) {
						this.player.muted = false
						if (!isNaN(this.player.mutedAtVolume)) {
							if (this.player.mutedAtVolume == 0) {
								this.player.mutedAtVolume = 100
							}
							this.getMainVolumeSlider().slider.value = this.player.mutedAtVolume
							this.player.volume = this.player.mutedAtVolume
						}
						DomHelper.replaceGlyph(this.muteButton, "volume-off", "volume-up")
					} else {
						this.player.mutedAtVolume = this.player.volume
						this.player.muted = true
						this.player.volume = 0
						this.getMainVolumeSlider().slider.value = 0
						DomHelper.replaceGlyph(this.muteButton, "volume-up", "volume-off")
					}
				}
			)
		}
		return this.muteButton
	}
	getPlayButton() {
		if (!this.playButton) {
			this.playButton = DomHelper.createGlyphiconButton(
				"play",
				"play",
				this.clickPlay.bind(this)
			)
			DomHelper.addClassToElement("btn-lg", this.playButton)
		}
		return this.playButton
	}
	clickPlay(ev) {
		if (!this.player.playing) {
			if (this.player.startPlay()) {
				DomHelper.addClassToElement("selected", this.playButton)
			}
		} else {
			this.player.resume()
			DomHelper.addClassToElement("selected", this.playButton)
			DomHelper.removeClass("selected", this.getPauseButton())
		}
	}
	getPauseButton() {
		if (!this.pauseButton) {
			this.pauseButton = DomHelper.createGlyphiconButton(
				"pause",
				"pause",
				this.clickPause.bind(this)
			)
			DomHelper.addClassToElement("btn-lg", this.pauseButton)
		}
		return this.pauseButton
	}
	clickPause(ev) {
		this.player.pause()
		DomHelper.removeClass("selected", this.getPlayButton())
		if (this.player.playing) {
			DomHelper.addClassToElement("selected", this.pauseButton)
		}
	}
	getStopButton() {
		if (!this.stopButton) {
			this.stopButton = DomHelper.createGlyphiconButton("stop", "stop", ev => {
				this.player.stop()
				DomHelper.removeClass("selected", this.getPlayButton())
				DomHelper.removeClass("selected", this.getPauseButton())
			})

			DomHelper.addClassToElement("btn-lg", this.stopButton)
		}
		return this.stopButton
	}
	resetTrackMenuDiv() {
		this.getTrackMenuDiv().innerHTML = ""
		Object.keys(this.player.tracks).forEach(track => {
			this.createTrackDiv(track)
		})
		// Pickr wants a querySelector not an element :/
		Object.keys(this.player.tracks).forEach(track => {
			this.initColorPickers(track, "white")
			this.initColorPickers(track, "black")
		})
	}
	newSongCallback() {
		this.resetTrackMenuDiv()

		if (!this.player.song.div) {
			this.createSongDiv(this.player.song)
		}
	}
	initColorPickers(track, keyColor) {
		const colorPicker = Pickr.create({
			el: "#colorPicker" + track,
			theme: "nano",
			components: {
				hue: true,
				preview: true,
				opacity: true,
				interaction: {
					input: true
				}
			}
		})
		let containterButton = document.querySelector(
			"#" + keyColor + "TrackDivColorPicker" + track
		)
		let glyph = document.querySelector(
			"#" + keyColor + "TrackDivColorPicker" + track + " .glyphicon"
		)
		let pickerButton = document.querySelector(
			"#" + keyColor + "TrackDivColorPicker" + track + " .pcr-button"
		)

		containterButton.onclick = ev =>
			ev.target != pickerButton ? pickerButton.click() : null
		colorPicker.on("init", () => {
			colorPicker.setColor(this.player.tracks[track].color[keyColor])
			glyph.style.color = this.player.tracks[track].color[keyColor]
			colorPicker.on("change", color => {
				let colorString = color.toRGBA().toString()
				glyph.style.color = colorString
				this.player.tracks[track].color[keyColor] = colorString
			})
		})
	}
	getMidiInputDialog() {
		if (!this.midiInputDialog) {
			this.midiInputDialog = DomHelper.createDivWithIdAndClass(
				"midiInputDialog",
				"centeredMenuDiv"
			)
			this.hideDiv(this.midiInputDialog)
			document.body.appendChild(this.midiInputDialog)

			let text = DomHelper.createDivWithClass(
				"centeredBigText",
				{ marginTop: "25px" },
				{ innerHTML: "Choose Midi device:" }
			)
			this.midiInputDialog.appendChild(text)

			this.inputDevicesDiv = DomHelper.createDivWithClass("container")
			this.midiInputDialog.appendChild(this.inputDevicesDiv)
		}
		let devices = this.midiInputHandler.getAvailableDevices()
		if (devices.length == 0) {
			this.inputDevicesDiv.innerHTML = "No MIDI-devices found."
		} else {
			this.inputDevicesDiv.innerHTML = ""
			devices.forEach(device => {
				this.inputDevicesDiv.appendChild(this.createDeviceDiv(device))
			})
		}

		this.midiInputDialog.style.marginTop =
			this.getNavBar().clientHeight + 25 + "px"
		return this.midiInputDialog
	}
	createDeviceDiv(device) {
		let deviceDiv = DomHelper.createTextButton(
			"midiDeviceDiv" + device.id,
			device.name,
			() => {
				if (deviceDiv.classList.contains("selected")) {
					DomHelper.removeClass("selected", deviceDiv)
					this.midiInputHandler.clearInput(device)
				} else {
					DomHelper.addClassToElement("selected", deviceDiv)
					this.midiInputHandler.addInput(device)
				}
			}
		)
		if (this.midiInputHandler.isInputActive(device)) {
			DomHelper.addClassToElement("selected", deviceDiv)
		}

		return deviceDiv
	}
	getTrackMenuDiv() {
		if (!this.trackMenuDiv) {
			this.trackMenuDiv = DomHelper.createDivWithIdAndClass(
				"trackContainerDiv",
				"innerMenuDiv"
			)
			this.hideDiv(this.trackMenuDiv)
			document.body.appendChild(this.trackMenuDiv)
		}
		return this.trackMenuDiv
	}

	createTrackDiv(track) {
		const trackObj = this.player.tracks[track]
		let volumeSlider,
			muteButton,
			hideButton,
			trackName,
			requireToPlayAlongButton

		let trackDiv = DomHelper.createDivWithIdAndClass(
			"trackDiv" + track,
			"innerMenuContDiv"
		)

		//Name
		trackName = DomHelper.createDivWithIdAndClass(
			"trackName" + track,
			"trackName"
		)
		trackName.innerHTML = trackObj.name || "Track " + track

		let btnGrp = DomHelper.createButtonGroup(false)

		//Track Volume
		volumeSlider = DomHelper.createSliderWithLabel(
			"volume" + track,
			"Volume",
			trackObj.volume,
			0,
			100,
			ev => {
				if (trackObj.volume == 0 && parseInt(ev.target.value) > 0) {
					DomHelper.replaceGlyph(muteButton, "volume-off", "volume-up")
				}
				trackObj.volume = parseInt(ev.target.value)
				if (trackObj.volume <= 0) {
					DomHelper.replaceGlyph(muteButton, "volume-up", "volume-off")
				}
			}
		)

		//Hide Track
		hideButton = DomHelper.createGlyphiconButton(
			"hide" + track,
			"eye-open",
			ev => {
				if (trackObj.draw) {
					DomHelper.replaceGlyph(hideButton, "eye-open", "eye-close")
					trackObj.draw = false
				} else {
					DomHelper.replaceGlyph(hideButton, "eye-close", "eye-open")
					trackObj.draw = true
				}
			}
		)

		//Mute Track
		muteButton = DomHelper.createGlyphiconButton(
			"mute" + track,
			"volume-up",
			() => {
				if (trackObj.volume == 0) {
					let volume = trackObj.volumeAtMute || 127
					trackObj.volume = volume
					volumeSlider.slider.value = volume
					DomHelper.replaceGlyph(muteButton, "volume-off", "volume-up")
					trackObj.volumeAtMute = 0
				} else {
					trackObj.volumeAtMute = trackObj.volume
					trackObj.volume = 0
					volumeSlider.slider.value = 0
					DomHelper.replaceGlyph(muteButton, "volume-up", "volume-off")
				}
			}
		)

		//Require Track to play along
		requireToPlayAlongButton = DomHelper.createGlyphiconTextButton(
			"require" + track,
			"minus-sign",
			"Play along",
			() => {
				if (!trackObj.requiredToPlay) {
					if (!this.midiInputHandler.isAnyInputSet()) {
						this.addNotification(
							"You have to choose a Midi Input Device to play along."
						)
						this.highlightElement(this.getMidiInputButton())
						return
					}
					DomHelper.replaceGlyph(
						requireToPlayAlongButton,
						"minus-sign",
						"plus-sign"
					)
					trackObj.requiredToPlay = true
				} else {
					trackObj.requiredToPlay = false
					DomHelper.replaceGlyph(
						requireToPlayAlongButton,
						"plus-sign",
						"minus-sign"
					)
				}
			}
		)
		let clearDiv = DomHelper.createElement("p", { clear: "both" })

		let colorPickerWhite = DomHelper.createGlyphiconTextButton(
			"whiteTrackDivColorPicker" + track,
			"tint",
			"White"
		)

		let whiteColorPickerEl = DomHelper.createDivWithId("colorPicker" + track)
		colorPickerWhite.appendChild(whiteColorPickerEl)

		let colorPickerBlack = DomHelper.createGlyphiconTextButton(
			"blackTrackDivColorPicker" + track,
			"tint",
			"Black"
		)

		let blackColorPickerEl = DomHelper.createDivWithId("colorPicker" + track)
		colorPickerBlack.appendChild(blackColorPickerEl)

		DomHelper.appendChildren(btnGrp, [
			hideButton,
			muteButton,
			requireToPlayAlongButton,
			colorPickerWhite,
			colorPickerBlack
		])

		DomHelper.appendChildren(trackDiv, [
			trackName,
			DomHelper.getDivider(),
			volumeSlider.container,
			btnGrp
		])

		this.getTrackMenuDiv().appendChild(trackDiv)
	}
	addNotification(message) {
		let notifEl = DomHelper.createDivWithClass("notification")
		notifEl.innerHTML = message
		document.body.appendChild(notifEl)
		window.setTimeout(() => document.body.removeChild(notifEl), 1500)
	}
	highlightElement(element) {
		element.classList.add("highlighted")
		window.setTimeout(() => {
			element.classList.remove("highlighted")
		}, 1500)
	}
}
