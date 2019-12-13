class UI {
    constructor(player) {
        this.player = player
        player.newSongCallbacks.push(this.newSongCallback.bind(this))
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
    createControlMenu() {
        if (!this.controlContainer) {
            this.controlContainer = DomHelper.createElement('nav', {}, {
                className: 'navbar'
            })

            document.body.appendChild(this.controlContainer)
        }

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
        let topGroups = DomHelper.createDivWithClass('row')
        topGroupsContainer.appendChild(topGroups)

        let fileGrp = DomHelper.createButtonGroup(true)
        let songSpeedGrp = DomHelper.createButtonGroup(true)
        let songControlGrp = DomHelper.createButtonGroup(false)
        let settingsGrp = DomHelper.createButtonGroup(false)
        let volumeGrp = DomHelper.createButtonGroup(true)
        let settingsGrpRight = DomHelper.createButtonGroup(true)
        let trackGrp = DomHelper.createButtonGroup(true)

        DomHelper.addClassToElements('align-middle', [fileGrp, songSpeedGrp, songControlGrp, trackGrp])

        DomHelper.appendChildren(fileGrp, [loadSongButton, loadedSongsButton])
        DomHelper.appendChildren(songSpeedGrp, [speedControl])
        DomHelper.appendChildren(songControlGrp, [stopButton, pauseButton, playButton])
        DomHelper.appendChildren(volumeGrp, [mainVolumeSlider, muteButton])
        DomHelper.appendChildren(trackGrp, [tracksButton, channelsButton])
        DomHelper.appendChildren(settingsGrpRight, [  fullscreenButton, settingsButton])

        let topGrps = [fileGrp, songSpeedGrp, songControlGrp, trackGrp, volumeGrp, settingsGrpRight]
        DomHelper.appendChildren(topGroups, topGrps)

        this.controlContainer.appendChild(topGroupsContainer)



    }
    getSettingsButton() {
        if (!this.settingsButton) {
            this.settingsButton = DomHelper.createGlyphiconButton('settingsButton','cog', () => {
                //TODO open Settings.
            })
        }
        return this.settingsButton
    }
    getFullscreenButton() {
        if (!this.fullscreenButton) {
            this.fullscreenButton = DomHelper.createGlyphiconButton('fullscreenButton','fullscreen',() => {
                document.body.requestFullscreen()
            })
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
                    this.loadedSongsShown = false
                    this.getLoadedSongsDiv().style.display="none"
                } else {
                    this.loadedSongsShown = true
                    this.getLoadedSongsDiv().style.display="block"
                }
            })
        }
        return this.loadedSongsButton
    }
    getLoadedSongsDiv() {
        if (!this.loadedSongsDiv) {
            this.loadedSongsDiv = DomHelper.createDivWithClass('col-xs-3 btn-group btn-group-vertical')
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
        song.div = DomHelper.createGlyphiconTextButton('song'+song.fileName,'',song.fileName,()=>{
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
                this.player.loadSong(song[song.length - 1], fileName);
            }.bind(this);
            reader.readAsDataURL(f);
        }
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
                let newVal = Math.max(1,Math.min(1000,parseInt(ev.target.value)))
                if (!isNaN(newVal)) {
                    ev.target.value = newVal + "%"
                    this.player.playbackSpeed = newVal / 100
                }
            },{
                float: 'none',
                textAlign: 'center'
            },{
                value: Math.floor(this.player.playbackSpeed * 100) + '%',
                className: 'col-xs-12 forcedThinButton',
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
                    this.tracksShown=false
                    trackMenuDiv.style.display = "none"
                } else {
                    this.tracksShown=true
                    trackMenuDiv.style.display = "block"
                }
            })
            DomHelper.addClassToElement('floatSpanLeft', this.tracksButton)

        }
        return this.tracksButton
    }
    getChannelsButton() {
        if (!this.channelsButton) {
            this.channelsButton = DomHelper.createGlyphiconTextButton('channels', 'align-justify', 'Channels', (ev) => {

            })
            DomHelper.addClassToElement('floatSpanLeft', this.channelsButton)

        }
        return this.channelsButton
    }
    getMainVolumeSlider() {
        if (!this.mainVolumeSlider) {
            this.mainVolumeSlider = DomHelper.createSliderWithLabel('volumeMain', 'Master Volume', this.player.volume, 0, 100, (ev) => {
                if (this.player.volume == 0 && parseInt(ev.target.value) != 0) {
                    this.getMuteButton().firstChild.className = this.muteButton.firstChild.className.replace('volume-off', 'volume-up')
                }
                this.player.volume = parseInt(ev.target.value)
                if (this.player.volume <= 0) {
                    this.getMuteButton().firstChild.className = this.muteButton.firstChild.className.replace('volume-up', 'volume-off')
                } else if (this.getMuteButton().innerHTML == "Unmute") {
                    this.getMuteButton().firstChild.className = this.muteButton.firstChild.className.replace('volume-off', 'volume-up')
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
                    this.muteButton.firstChild.className = this.muteButton.firstChild.className.replace('volume-off', 'volume-up')

                } else {
                    this.player.mutedAtVolume = this.player.volume
                    this.player.muted = true
                    this.player.volume = 0
                    this.getMainVolumeSlider().slider.value = 0
                    this.muteButton.firstChild.className = this.muteButton.firstChild.className.replace('volume-up', 'volume-off')
                }
            })

        }
        return this.muteButton
    }
    getPlayButton() {
        if (!this.playButton) {
            this.playButton = DomHelper.createGlyphiconButton('play', 'play', (ev) => {
                if (!this.player.playing) {
                    this.player.startPlay()
                } else {
                    this.player.resume()
                }
            })
            DomHelper.addClassToElement('btn-lg', this.playButton)


        }
        return this.playButton
    }
    getPauseButton() {
        if (!this.pauseButton) {
            this.pauseButton = DomHelper.createGlyphiconButton('pause', 'pause', (ev) => {
                this.player.pause()
            })

            DomHelper.addClassToElement('btn-lg', this.pauseButton)
        }
        return this.pauseButton
    }
    getStopButton() {
        if (!this.stopButton) {
            this.stopButton = DomHelper.createGlyphiconButton('stop', 'stop', (ev) => {
                this.player.stop()
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
            this.initColorPickers(track,'white')
            this.initColorPickers(track,'black')
        })
    }
    newSongCallback() {
        this.resetTrackMenuDiv()
        
        if (!this.player.song.div) {
            this.createSongDiv(this.player.song)
        }
    }
    initColorPickers(track,keyColor) {
        const colorPicker = Pickr.create({
            el: '#colorPicker' + track,
            theme: 'nano',
            components: {
                hue:true,
                preview: true,
                opacity: true,
                interaction: {
                    input: true,
                }
            },
        });
        let pickerButton = document.querySelector('#'+keyColor+'TrackDivColorPicker' + track + ' .pcr-button')

        colorPicker.on('init', () => {
            colorPicker.setColor(this.player.tracks[track].color[keyColor])
            colorPicker.on('change', color => {
                let colorString = color.toRGBA().toString()
                pickerButton.style.color = colorString
                this.player.tracks[track].color[keyColor] = colorString
            })
        }) 
    }
    getTrackMenuDiv() {

        if (!this.trackMenuDiv) {
            this.trackMenuDiv = DomHelper.createDivWithId('trackContainerDiv')
            document.body.appendChild(this.trackMenuDiv)
        }
        return this.trackMenuDiv


    }
    createTrackDiv(track) {
        const trackObj = this.player.tracks[track]
        let volumeSlider, muteButton, hideButton, trackName

        let trackDiv =  DomHelper.createDivWithIdAndClass('trackDiv'+track,'trackDiv')

        //Name
        trackName = DomHelper.createDivWithIdAndClass('trackName' + track, 'trackName')
        trackName.innerHTML = trackObj.name || "Track " + track

        //Track Volume
        volumeSlider = DomHelper.createSliderWithLabel('volume' + track, 'Volume', trackObj.volume, 0, 100, (ev) => {
            if (trackObj.volume == 0 && parseInt(ev.target.value) > 0) {
                DomHelper.replaceGlyph(muteButton.firstChild, 'volume-off', 'volume-up')
            }
            trackObj.volume = parseInt(ev.target.value)
            if (trackObj.volume <= 0) {
                DomHelper.replaceGlyph(muteButton.firstChild, 'volume-up', 'volume-off')
            }
        })

        //Hide Track
        hideButton = DomHelper.createGlyphiconButton('hide' + track, 'eye-open', (ev) => {
            if (trackObj.draw) {
                DomHelper.replaceGlyph(hideButton.firstChild, 'eye-open', 'eye-close')
                trackObj.draw = false
            } else {
                DomHelper.replaceGlyph(hideButton.firstChild, 'eye-close', 'eye-open')
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
                    DomHelper.replaceGlyph(muteButton.firstChild, 'volume-off', 'volume-up')
                    trackObj.volumeAtMute = 0;
                } else {
                    trackObj.volumeAtMute = trackObj.volume
                    trackObj.volume = 0
                    volumeSlider.slider.value = 0
                    DomHelper.replaceGlyph(muteButton.firstChild, 'volume-up', 'volume-off')
                }
            })
            let clearDiv = DomHelper.createElement('p',{clear:'both'})

            let colorPickerWhite = DomHelper.createDivWithIdAndClass('whiteTrackDivColorPicker' + track, 'btn')
            colorPickerWhite.innerHTML = 'White'
            let whiteColorPickerEl = DomHelper.createDivWithId('colorPicker' + track)
            colorPickerWhite.appendChild(whiteColorPickerEl)

            let colorPickerBlack = DomHelper.createDivWithIdAndClass('blackTrackDivColorPicker' + track , 'btn')
            colorPickerBlack.innerHTML = 'Black'
            let blackColorPickerEl = DomHelper.createDivWithId('colorPicker' + track )
            colorPickerBlack.appendChild(blackColorPickerEl)





        trackDiv.appendChild(trackName)
        trackDiv.appendChild(DomHelper.getDivider())
        trackDiv.appendChild(volumeSlider.container)
        trackDiv.appendChild(hideButton)
        trackDiv.appendChild(muteButton)
        // trackDiv.appendChild(clearDiv)
        trackDiv.appendChild(colorPickerWhite)
        trackDiv.appendChild(colorPickerBlack)
        this.getTrackMenuDiv().appendChild(trackDiv)
    }
}