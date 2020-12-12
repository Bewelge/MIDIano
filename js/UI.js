import { DomHelper } from "./DomHelper.js"

/**
 * Contains all initiation, appending and manipulation of DOM-elements.
 * Callback-bindings for some events are created in  the constructor
 */
export class UI {
	constructor(player, render, isMobile) {
		this.settings = {
			showParticles: true,
			showHitKeys: true,
			showPianoKeys: true,
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
		this.notifySettingsChanged = () => {
			render.updateSettings(this.settings)
			player.updateSettings(this.settings)
		}

		this.resize()

		this.createControlMenu()
	}

	/**
	 * Sets all dimensions dependent on window size
	 */
	resize() {
		this.width = Math.floor(window.innerWidth)
		this.height = Math.floor(window.innerHeight)
		this.menuHeight = 200
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

		this.getNavBar().appendChild(minimizeButton)
		this.getNavBar().appendChild(topGroupsContainer)
	}
	getZoomDiv() {
		//todo
	}
	mouseMoved() {
		this.getMinimizeButton().style.transition = "none"
		this.getMinimizeButton().style.opacity = 1
		if (!this.fadingOutMinimizeButton) {
			this.fadingOutMinimizeButton = true
			window.setTimeout(() => {
				this.getMinimizeButton().style.transition = "1s all ease-out"
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
						this.getNavBar().style.top =
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
						this.getNavBar().style.top = "0px"
						// this.minimizeButton.style.bottom = "0px"
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
		this.minimizeButton.style.bottom =
			-24 - this.minimizeButton.clientHeight + "px"
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
	hideSettings() {
		DomHelper.removeClass("selected", this.getSettingsButton())
		this.settingsShown = false
		this.getSettingsDiv().style.display = "none"
	}
	showSettings() {
		if (this.settingsShown) {
			this.hideSettings()
		}
		if (this.tracksShown) {
			this.hideTracks()
		}
		DomHelper.addClassToElement("selected", this.getSettingsButton())
		this.settingsShown = true
		this.getSettingsDiv().style.display = "block"
	}
	getSettingsDiv() {
		if (!this.settingsDiv) {
			this.settingsDiv = DomHelper.createDivWithIdAndClass(
				"settingsDiv",
				"innerMenuDiv"
			)
			this.settingsDiv.style.display = "none"
			this.getSettingsContent().forEach(element =>
				this.settingsDiv.appendChild(element)
			)
			document.body.appendChild(this.settingsDiv)
		}
		this.settingsDiv.style.marginTop = this.getNavBar().clientHeight + 25 + "px"
		return this.settingsDiv
	}
	getSettingsContent() {
		let settingsDivs = []

		let showParticlesCheckbox = DomHelper.createCheckbox(
			"Show Particles",
			ev => {
				this.settings.showParticles = ev.target.checked
				this.notifySettingsChanged()
			},
			this.settings.showParticles
		)

		settingsDivs.push(showParticlesCheckbox)

		let showHitKeysCheckbox = DomHelper.createCheckbox(
			"Hit Key Effect",
			ev => {
				this.settings.showHitKeys = ev.target.checked
				this.notifySettingsChanged()
			},
			this.settings.showHitKeys
		)
		settingsDivs.push(showHitKeysCheckbox)

		let showPianoKeysCheckbox = DomHelper.createCheckbox(
			"Show Notes on Piano",
			ev => {
				this.settings.showPianoKeys = ev.target.checked
				this.notifySettingsChanged()
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
				this.notifySettingsChanged()
			}
		)
		settingsDivs.push(renderOffsetSlider.container)

		let showNoteDebugInfo = DomHelper.createCheckbox(
			"Show Note Debug Info",
			ev => {
				this.settings.showNoteDebugInfo = ev.target.checked
				this.notifySettingsChanged()
			},
			this.settings.showNoteDebugInfo
		)
		settingsDivs.push(showNoteDebugInfo)

		settingsDivs.forEach(div => div.classList.add("innerMenuContDiv"))

		return settingsDivs
	}
	notifySettingsChanged() {}
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
						DomHelper.removeClass("selected", this.loadedSongsButton)
						this.loadedSongsShown = false
						this.getLoadedSongsDiv().style.display = "none"
					} else {
						DomHelper.addClassToElement("selected", this.loadedSongsButton)
						this.loadedSongsShown = true
						this.getLoadedSongsDiv().style.display = "block"
					}
				}
			)
		}
		return this.loadedSongsButton
	}
	getLoadedSongsDiv() {
		if (!this.loadedSongsDiv) {
			this.loadedSongsDiv = DomHelper.createDivWithClass(
				"btn-group btn-group-vertical"
			)
			this.loadedSongsDiv.style.display = "none"
			document.body.appendChild(this.loadedSongsDiv)
		}
		this.player.loadedSongs.forEach(song => {
			if (!song.div) {
				this.createSongDiv(song)
			}
		})
		this.loadedSongsDiv.style.marginTop =
			this.getNavBar().clientHeight + 25 + "px"
		return this.loadedSongsDiv
	}
	createSongDiv(song) {
		song.div = DomHelper.createGlyphiconTextButton(
			"song" + song.fileName,
			"",
			song.fileName,
			() => {
				this.player.setSong(song)
			}
		)
		song.div.style.float = "left"
		this.getLoadedSongsDiv().appendChild(song.div)
	}
	handleFileSelect(evt) {
		var files = evt.target.files
		for (var i = 0, f; (f = files[i]); i++) {
			let reader = new FileReader()
			let fileName = f.name
			reader.onload = function (theFile) {
				this.player.loadSong(
					reader.result,
					fileName,
					this.setLoadMessage.bind(this)
				)
			}.bind(this)
			reader.readAsDataURL(f)
		}
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
		this.getTrackMenuDiv().style.display = "none"
	}

	showTracks() {
		this.hideAllDialogs()
		DomHelper.addClassToElement("selected", this.tracksButton)
		this.tracksShown = true
		this.getTrackMenuDiv().style.display = "block"
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
		this.getMidiInputDialog().style.display = "none"
	}

	showMidiInputDialog() {
		this.hideAllDialogs()
		DomHelper.addClassToElement("selected", this.midiInputButton)
		this.midiInputDialogShown = true

		this.getMidiInputDialog().style.display = "block"
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
		this.hideTracks()
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
			this.midiInputDialog.style.display = "none"
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
		console.log(devices)
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
					console.log(device)
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
			this.trackMenuDiv.style.display = "none"
			document.body.appendChild(this.trackMenuDiv)
		}
		this.trackMenuDiv.style.marginTop =
			this.getNavBar().clientHeight + 25 + "px"
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
}
