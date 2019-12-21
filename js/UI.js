class UI {
    constructor(player) {
        this.player = player

        document.documentElement.style.setProperty('--buttonBackground', 'url(' + this.getButtonPattern().toDataURL() + ')')
        document.documentElement.style.setProperty('--navBackground', 'url(' + this.getNavBackgroundPattern().toDataURL() + ')')

        //add callbacks to the player
        player.newSongCallbacks.push(this.newSongCallback.bind(this))
        player.onloadStartCallbacks.push(this.startLoad.bind(this))
        player.onloadStopCallbacks.push(this.stopLoad.bind(this))

        this.resize()

        this.createControlMenu()


        window.addEventListener("keydown", this.keyDown.bind(this))
    }
    keyDown(e) {
        if (e.code == "Space") {
            e.preventDefault();
            if (!this.player.paused) {
                this.clickPause(e)
            } else {
                this.clickPlay(e)

            }
        } else if (e.code == "ArrowUp") {
            this.player.playbackSpeed += 0.05
            this.getSpeedDisplayField().value = Math.floor(this.player.playbackSpeed * 100) + "%"
        } else if (e.code == "ArrowDown") {
            this.player.playbackSpeed -= 0.05
            this.getSpeedDisplayField().value = Math.floor(this.player.playbackSpeed * 100) + "%"
        } else if (e.code == "ArrowLeft") {
            this.player.setTime(player.getTime() - 5)
        } else if (e.code == "ArrowRight") {
            this.player.setTime(player.getTime() + 5)
        }
    }
    /**
    * Sets all dimensions dependent on window size
    */
    resize() {
        this.width = Math.floor(window.innerWidth)
        this.height = Math.floor(window.innerHeight)
        this.menuHeight = 200
    }
    createControlMenu() {


        let loadSongButton = this.getLoadSongButton()
        let loadedSongsButton = this.getLoadedSongsButton()

        let speedControl = this.getSpeedDiv()

        let playButton = this.getPlayButton()
        let pauseButton = this.getPauseButton()
        let stopButton = this.getStopButton()

        let mainVolumeSlider = this.getMainVolumeSlider().container
        let muteButton = this.getMuteButton()

        let tracksButton = this.getTracksButton()
        let channelsButton = this.getChannelsButton()

        let fullscreenButton = this.getFullscreenButton()
        let settingsButton = this.getSettingsButton()


        let topGroupsContainer = DomHelper.createDivWithClass('container')

        let fileGrp = DomHelper.createButtonGroup(true)
        let songSpeedGrp = DomHelper.createButtonGroup(true)
        let songControlGrp = DomHelper.createButtonGroup(false)
        let volumeGrp = DomHelper.createButtonGroup(true)
        let settingsGrpRight = DomHelper.createButtonGroup(true)
        let trackGrp = DomHelper.createButtonGroup(true)

        DomHelper.addClassToElements('align-middle', [fileGrp, songSpeedGrp, songControlGrp, trackGrp])

        DomHelper.appendChildren(fileGrp, [loadSongButton, loadedSongsButton])
        DomHelper.appendChildren(songSpeedGrp, [speedControl])
        DomHelper.appendChildren(songControlGrp, [stopButton, pauseButton, playButton])
        DomHelper.appendChildren(volumeGrp, [mainVolumeSlider, muteButton])
        DomHelper.appendChildren(trackGrp, [tracksButton, channelsButton])
        DomHelper.appendChildren(settingsGrpRight, [fullscreenButton, settingsButton])

        let leftTop = DomHelper.createElementWithClass('topContainer')
        let middleTop = DomHelper.createElementWithClass('topContainer')
        let rightTop = DomHelper.createElementWithClass('topContainer')

        DomHelper.appendChildren(leftTop, [fileGrp, songSpeedGrp])
        DomHelper.appendChildren(middleTop, [songControlGrp])
        DomHelper.appendChildren(rightTop, [volumeGrp, trackGrp, settingsGrpRight])

        let topGrps = [fileGrp, songSpeedGrp, songControlGrp, trackGrp, volumeGrp, settingsGrpRight]
        DomHelper.appendChildren(topGroupsContainer, [leftTop, middleTop, rightTop])

        this.getNavBar().appendChild(topGroupsContainer)



    }
    getNavBar() {
        if (!this.navBar) {
            this.navBar = DomHelper.createElement('nav', {
                // backgroundImage: 'url(' + this.getNavBackgroundPattern().toDataURL() + ')'
            }, {
                className: 'navbar'
            })

            document.body.appendChild(this.navBar)
        }
        return this.navBar

    }
    getSettingsButton() {
        if (!this.settingsButton) {
            this.settingsButton = DomHelper.createGlyphiconButton('settingsButton', 'cog', () => {
                //TODO open Settings.
            })
        }
        return this.settingsButton
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
            this.fullscreenButton = DomHelper.createGlyphiconButton('fullscreenButton', 'fullscreen', clickFullscreen.bind(this))
            let fullscreenSwitch = () => this.fullscreen = !this.fullscreen
            document.body.onfullscreenchange = fullscreenSwitch.bind(this)
        }
        return this.fullscreenButton
    }
    getLoadSongButton() {
        if (!this.loadSongButton) {
            this.loadSongButton = DomHelper.createFileInput('Upload Midi', this.handleFileSelect.bind(this))
            DomHelper.addClassToElement('floatSpanLeft', this.loadSongButton)
        }
        return this.loadSongButton
    }
    getLoadedSongsButton() {
        if (!this.loadedSongsButton) {
            this.loadedSongsButton = DomHelper.createGlyphiconTextButton('mute', 'music', 'Loaded Songs', (ev) => {
                if (this.loadedSongsShown) {
                    DomHelper.removeClass('selected', this.loadedSongsButton)
                    this.loadedSongsShown = false
                    this.getLoadedSongsDiv().style.display = "none"
                } else {
                    DomHelper.addClassToElement('selected', this.loadedSongsButton)
                    this.loadedSongsShown = true
                    this.getLoadedSongsDiv().style.display = "block"
                }
            })
        }
        return this.loadedSongsButton
    }
    getLoadedSongsDiv() {
        if (!this.loadedSongsDiv) {
            this.loadedSongsDiv = DomHelper.createDivWithClass('btn-group btn-group-vertical')
            this.loadedSongsDiv.style.display = "none"
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
        song.div = DomHelper.createGlyphiconTextButton('song' + song.fileName, '', song.fileName, () => {
            this.player.setSong(song)
        })
        this.getLoadedSongsDiv().appendChild(song.div)
    }
    handleFileSelect(evt) {
        var files = evt.target.files;
        for (var i = 0, f; f = files[i]; i++) {
            let reader = new FileReader();
            let fileName = f.name
            reader.onload = function (theFile) {
                song.push(reader.result)
                this.player.loadSong(song[song.length - 1], fileName, this.setLoadMessage.bind(this));
            }.bind(this);
            reader.readAsDataURL(f);
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
        currentText += "."
        this.getLoadingText().innerHTML = currentText.replace("......", ".")
        if (this.loading) {
            window.requestAnimationFrame(this.loadAnimation.bind(this))
        }
    }
    setLoadMessage(msg) {
        this.getLoadingText().innerHTML = msg
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
            this.loadingDiv = DomHelper.createDivWithClass("fullscreen")

            let spinner = DomHelper.createSpinner()
            this.loadingDiv.appendChild(spinner)
            document.body.appendChild(this.loadingDiv)
        }
        return this.loadingDiv

    }
    getSpeedDiv() {
        if (!this.speedDiv) {
            this.speedDiv = DomHelper.createDivWithClass('btn-group btn-group-vertical')
            this.speedDiv.appendChild(this.getSpeedUpButton())
            this.speedDiv.appendChild(this.getSpeedDisplayField())
            this.speedDiv.appendChild(this.getSpeedDownButton())
        }
        return this.speedDiv
    }
    getSpeedUpButton() {
        if (!this.speedUpButton) {
            this.speedUpButton = DomHelper.createGlyphiconButton('speedUp', 'triangle-top', (ev) => {
                this.player.playbackSpeed += 0.05
                this.updateSpeed()
            })
            this.speedUpButton.className += ' btn-xs forcedThinButton'
        }
        return this.speedUpButton
    }
    updateSpeed() {
        this.getSpeedDisplayField().value = Math.floor(this.player.playbackSpeed * 100) + '%'
    }
    getSpeedDisplayField() {
        if (!this.speedDisplay) {
            this.speedDisplay = DomHelper.createTextInput((ev) => {
                let newVal = Math.max(1, Math.min(1000, parseInt(ev.target.value)))
                if (!isNaN(newVal)) {
                    ev.target.value = newVal + "%"
                    this.player.playbackSpeed = newVal / 100
                }
            }, {
                float: 'none',
                textAlign: 'center'
            }, {
                value: Math.floor(this.player.playbackSpeed * 100) + '%',
                className: 'forcedThinButton',
                type: 'text'
            })
        }
        return this.speedDisplay

    }
    getSpeedDownButton() {
        if (!this.speedDownButton) {
            this.speedDownButton = DomHelper.createGlyphiconButton('speedUp', 'triangle-bottom', (ev) => {
                this.player.playbackSpeed -= 0.05
                this.updateSpeed()
            })
            this.speedDownButton.className += ' btn-xs forcedThinButton'
        }
        return this.speedDownButton
    }
    getTracksButton() {
        if (!this.tracksButton) {
            let trackMenuDiv = this.getTrackMenuDiv()
            this.tracksButton = DomHelper.createGlyphiconTextButton('tracks', 'align-justify', 'Tracks', (ev) => {
                if (this.tracksShown) {
                    this.hideTracks(trackMenuDiv)
                } else {
                    this.showTracks(trackMenuDiv)
                }
            })
            DomHelper.addClassToElement('floatSpanLeft', this.tracksButton)

        }
        return this.tracksButton
    }
    hideTracks(trackMenuDiv) {
        DomHelper.removeClass('selected', this.tracksButton)
        this.tracksShown = false
        trackMenuDiv.style.display = "none"
    }

    showTracks(trackMenuDiv) {
        if (this.channelsShown) {
            this.hideChannels()
        }
        DomHelper.addClassToElement('selected', this.tracksButton)
        this.tracksShown = true
        trackMenuDiv.style.display = "block"
    }

    getChannelsButton() {
        if (!this.channelsButton) {
            let channelMenuDiv = this.getChannelMenuDiv()
            this.channelsButton = DomHelper.createGlyphiconTextButton('channels', 'align-justify', 'Channels', (ev) => {
                if (this.channelsShown) {
                    this.hideChannels(channelMenuDiv)
                } else {
                    this.showChannels(channelMenuDiv)
                }
            })
            DomHelper.addClassToElement('floatSpanLeft', this.channelsButton)

        }
        return this.channelsButton
    }
    getChannelMenuDiv() {
        if (!this.channelMenuDiv) {
            this.channelMenuDiv = DomHelper.createDivWithId('trackContainerDiv')
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
        DomHelper.addClassToElement('selected', this.tracksButton)
        this.channelsShown = true
        channelMenuDiv.style.display = "block"
    }

    hideChannels(channelMenuDiv) {
        DomHelper.removeClass('selected', this.tracksButton)
        this.channelsShown = false
        channelMenuDiv.style.display = "none"
    }

    getMainVolumeSlider() {
        if (!this.mainVolumeSlider) {
            this.mainVolumeSlider = DomHelper.createSliderWithLabel('volumeMain', 'Master Volume', this.player.volume, 0, 100, (ev) => {
                if (this.player.volume == 0 && parseInt(ev.target.value) != 0) {
                    DomHelper.replaceGlyph(this.getMuteButton(),'volume-off','volume-up')
                    //this.getMuteButton().firstChild.className = this.muteButton.firstChild.className.replace('volume-off', 'volume-up')
                }
                this.player.volume = parseInt(ev.target.value)
                if (this.player.volume <= 0) {
                    DomHelper.replaceGlyph(this.getMuteButton(),'volume-up','volume-off')
                } else if (this.getMuteButton().innerHTML == "Unmute") {
                    DomHelper.replaceGlyph(this.getMuteButton(),'volume-off','volume-up')
                }
            })

        }
        return this.mainVolumeSlider
    }
    getMuteButton() {
        if (!this.muteButton) {
            this.muteButton = DomHelper.createGlyphiconButton('mute', 'volume-up', (ev) => {
                if (this.player.muted) {
                    this.player.muted = false
                    if (!isNaN(this.player.mutedAtVolume)) {
                        if (this.player.mutedAtVolume == 0) {
                            this.player.mutedAtVolume = 100
                        }
                        this.getMainVolumeSlider().slider.value = this.player.mutedAtVolume
                        this.player.volume = this.player.mutedAtVolume
                    }
                    DomHelper.replaceGlyph(this.muteButton,'volume-off','volume-up')

                } else {
                    this.player.mutedAtVolume = this.player.volume
                    this.player.muted = true
                    this.player.volume = 0
                    this.getMainVolumeSlider().slider.value = 0
                    DomHelper.replaceGlyph(this.muteButton,'volume-up','volume-off')
                }
            })

        }
        return this.muteButton
    }
    getPlayButton() {
        if (!this.playButton) {
            this.playButton = DomHelper.createGlyphiconButton('play', 'play', this.clickPlay.bind(this))
            DomHelper.addClassToElement('btn-lg', this.playButton)
        }
        return this.playButton
    }
    clickPlay(ev) {
        if (!this.player.playing) {
            this.player.startPlay()
        } else {
            this.player.resume()
            DomHelper.removeClass('selected', this.getPauseButton())
        }
        DomHelper.addClassToElement('selected', this.playButton)

    }
    getPauseButton() {
        if (!this.pauseButton) {
            this.pauseButton = DomHelper.createGlyphiconButton('pause', 'pause', this.clickPause.bind(this))
            DomHelper.addClassToElement('btn-lg', this.pauseButton)
        }
        return this.pauseButton
    }
    clickPause(ev) {
        this.player.pause()
        DomHelper.removeClass('selected', this.getPlayButton())
        if (this.player.playing) {
            DomHelper.addClassToElement('selected', this.pauseButton)
        }
    }
    getStopButton() {
        if (!this.stopButton) {
            this.stopButton = DomHelper.createGlyphiconButton('stop', 'stop', (ev) => {
                this.player.stop()
                DomHelper.removeClass('selected', this.getPlayButton())
                DomHelper.removeClass('selected', this.getPauseButton())
            })

            DomHelper.addClassToElement('btn-lg', this.stopButton)
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
            this.initColorPickers(track, 'white')
            this.initColorPickers(track, 'black')
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
            el: '#colorPicker' + track,
            theme: 'nano',
            components: {
                hue: true,
                preview: true,
                opacity: true,
                interaction: {
                    input: true,
                }
            },
        });
        let containterButton = document.querySelector('#' + keyColor + 'TrackDivColorPicker' + track)
        let glyph = document.querySelector('#' + keyColor + 'TrackDivColorPicker' + track + ' .glyphicon')
        let pickerButton = document.querySelector('#' + keyColor + 'TrackDivColorPicker' + track + ' .pcr-button')

        containterButton.onclick = (ev) => ev.target != pickerButton ? pickerButton.click() : null
        colorPicker.on('init', () => {
            colorPicker.setColor(this.player.tracks[track].color[keyColor])
            glyph.style.color = this.player.tracks[track].color[keyColor]
            colorPicker.on('change', color => {
                let colorString = color.toRGBA().toString()
                glyph.style.color = colorString
                this.player.tracks[track].color[keyColor] = colorString
            })
        })
    }
    getTrackMenuDiv() {

        if (!this.trackMenuDiv) {
            this.trackMenuDiv = DomHelper.createDivWithId('trackContainerDiv')
            this.trackMenuDiv.style.display = "none"
            this.trackMenuDiv.style.top = this.getNavBar().style.height
            document.body.appendChild(this.trackMenuDiv)
        }
        return this.trackMenuDiv


    }
    createTrackDiv(track) {
        const trackObj = this.player.tracks[track]
        let volumeSlider, muteButton, hideButton, trackName

        let trackDiv = DomHelper.createDivWithIdAndClass('trackDiv' + track, 'trackDiv')

        //Name
        trackName = DomHelper.createDivWithIdAndClass('trackName' + track, 'trackName')
        trackName.innerHTML = trackObj.name || "Track " + track

        let btnGrp = DomHelper.createButtonGroup(false)

        //Track Volume
        volumeSlider = DomHelper.createSliderWithLabel('volume' + track, 'Volume', trackObj.volume, 0, 100, (ev) => {
            if (trackObj.volume == 0 && parseInt(ev.target.value) > 0) {
                DomHelper.replaceGlyph(muteButton, 'volume-off', 'volume-up')
            }
            trackObj.volume = parseInt(ev.target.value)
            if (trackObj.volume <= 0) {
                DomHelper.replaceGlyph(muteButton, 'volume-up', 'volume-off')
            }
        })

        //Hide Track
        hideButton = DomHelper.createGlyphiconButton('hide' + track, 'eye-open', (ev) => {
            if (trackObj.draw) {
                DomHelper.replaceGlyph(hideButton, 'eye-open', 'eye-close')
                trackObj.draw = false
            } else {
                DomHelper.replaceGlyph(hideButton, 'eye-close', 'eye-open')
                trackObj.draw = true
            }
        })

        //Mute Track
        muteButton = DomHelper.createGlyphiconButton('mute' + track, 'volume-up',
            () => {
                if (trackObj.volume == 0) {
                    let volume = trackObj.volumeAtMute || 127
                    trackObj.volume = volume
                    volumeSlider.slider.value = volume
                    DomHelper.replaceGlyph(muteButton, 'volume-off', 'volume-up')
                    trackObj.volumeAtMute = 0;
                } else {
                    trackObj.volumeAtMute = trackObj.volume
                    trackObj.volume = 0
                    volumeSlider.slider.value = 0
                    DomHelper.replaceGlyph(muteButton, 'volume-up', 'volume-off')
                }
            })
        let clearDiv = DomHelper.createElement('p', { clear: 'both' })

        let colorPickerWhite = DomHelper.createGlyphiconTextButton('whiteTrackDivColorPicker' + track, 'tint', 'White')

        let whiteColorPickerEl = DomHelper.createDivWithId('colorPicker' + track)
        colorPickerWhite.appendChild(whiteColorPickerEl)

        let colorPickerBlack = DomHelper.createGlyphiconTextButton('blackTrackDivColorPicker' + track, 'tint', 'Black')

        let blackColorPickerEl = DomHelper.createDivWithId('colorPicker' + track)
        colorPickerBlack.appendChild(blackColorPickerEl)



        DomHelper.appendChildren(btnGrp, [hideButton, muteButton, colorPickerWhite, colorPickerBlack])

        DomHelper.appendChildren(trackDiv, [trackName, DomHelper.getDivider(), volumeSlider.container, btnGrp])

        this.getTrackMenuDiv().appendChild(trackDiv)
    }

    getNavBackgroundPattern() {
        if (!this.backgroundPattern) {
            this.backgroundPattern = DomHelper.createCanvas(4, 4)
            let c = this.backgroundPattern.getContext("2d")

            // c.lineWidth = 1
            // for (let i = -11; i < 11; i++) {
            //     let rndCol = Math.floor(Math.random() * 255)
            //     c.strokeStyle = "rgba(" + rndCol + "," + rndCol + "," + rndCol + "," + 0.05 + ")"
            //     c.beginPath()
            //     c.moveTo(i, 0)
            //     c.lineTo(i + 10, 10)
            //     c.stroke()
            //     c.closePath()

            //     c.beginPath()
            //     c.moveTo(i + 10, 0)
            //     c.lineTo(i, 10)
            //     c.stroke()
            //     c.closePath()

            //     c.fillStyle = "rgba(255,255,255,1)"
            //     c.beginPath()
            //     c.arc(5, 5, 1, 0, Math.PI * 2, 0)
            //     c.fill()
            //     c.closePath()
            // }
            
            c.lineWidth = 1
            for (let i = -11; i < 11; i++) {
                let rndCol = Math.floor(Math.random() * 255)
                c.strokeStyle = "rgba(" + rndCol + "," + rndCol + "," + rndCol + "," + 0.05 + ")"
                c.beginPath()
                c.moveTo(i, 0)
                c.lineTo(i + 10, 10)
                c.stroke()
                c.closePath()

                c.beginPath()
                c.moveTo(i + 10, 0)
                c.lineTo(i, 10)
                c.stroke()
                c.closePath()

                c.fillStyle = "rgba(255,255,255,1)"
                c.beginPath()
                c.arc(5, 5, 1, 0, Math.PI * 2, 0)
                c.fill()
                c.closePath()
            }
            
        }
            return this.backgroundPattern
        }

        getButtonPattern() {
            if (!this.buttonPattern) {
                this.buttonPattern = DomHelper.createCanvas(200, 200)
                let c = this.buttonPattern.getContext("2d")

                for (let i = 0;i< 500;i++) {
                    c.lineWidth = 7 * Math.random()
                    let rndCol = 125 + Math.floor(Math.random() * 125)
                    let rndX = -50 + Math.random() * 100
                    let rndY = -50 + Math.random() * 100
                    let rndLngt = Math.random() * 200
                    c.strokeStyle = "rgba("+rndCol+","+rndCol+","+rndCol+","+Math.random()*0.4+")"
                    c.beginPath()
                    c.moveTo(rndX,rndY)
                    c.lineTo(rndX+rndLngt,rndY+rndLngt)
                    c.stroke()
                    c.closePath()
                }
                // for (let i = -11; i < 11; i++) {
                //     let rndCol = Math.floor(Math.random() * 255)
                //     c.strokeStyle = "rgba(" + rndCol + "," + rndCol + "," + rndCol + "," + 0.05 + ")"
                //     c.beginPath()
                //     c.moveTo(i, 0)
                //     c.lineTo(i + 10, 10)
                //     c.stroke()
                //     c.closePath()
    
                //     c.beginPath()
                //     c.moveTo(i + 10, 0)
                //     c.lineTo(i, 10)
                //     c.stroke()
                //     c.closePath()
    
                // }

            }
            return this.buttonPattern
        }
    }