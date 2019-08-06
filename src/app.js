import React from 'react'

// crickets, marchetti, soundscapes, haunted-mia, …
// const playlist = process.env.playlist || 'haunted-mia'
// var content = require(`json!../${playlist}/content.json`) // <-- this line absolutely kills webpack, why?
const playlist = 'haunted-mia'
var content = require(`json!../haunted-mia/content.json`)
const prefix = process.env.NODE_ENV == 'production' ? '' : `../${playlist}/`

const App = React.createClass({
  render() {
    const things = content.things.filter(t => !t.hide)
    const showLogo = content.branded
    const description = content.description && content.description
      .split(/\n+/)
      .map(p => `<p>${p}</p>`)
      .join('\n')

    return <div>
      <header>
        <h3>{content.title}</h3>
        {description && <div dangerouslySetInnerHTML={{__html: description}}></div>}
      </header>
      {things.map((c, i) =>
        <Cricket
          index={i}
          key={i}
          cricket={c}
          play={this.play}
          audioProgress={this.state ? this.state.audioProgress : 0}
          soundboard={content.soundboard} />)}
      <audio ref="masterAudio" />
      {showLogo && <div className="branded"></div>}
    </div>
  },

  previouslyPlayedComponents: [],

  componentDidMount() {
    var audioNode = this.refs.masterAudio.getDOMNode()
    audioNode.addEventListener('ended', () => {
      this.previouslyPlayedComponents && this.previouslyPlayedComponents.map(c => c.stopPlaying())
    })
    audioNode.addEventListener('timeupdate', () => {
      var {currentTime, duration} = audioNode
      this.setState({audioProgress: 100*(currentTime/duration)})
    })
  },

  play(src, callback, subcomponent, {title, image}) {
    this.previouslyPlayedComponents.map(c => c.stopPlaying())

    var audio = this.refs.masterAudio.getDOMNode()
    var {playing} = this.state || {}

    if(audio.src == src) {
      this.state.playing ? audio.pause() : audio.play()
      playing = !this.state.playing
    } else {
      audio.src = src
      audio.title = title
      audio.poster = image
      audio.play()
      playing = true
    }

    callback(playing)
    this.setState({playing: playing})
    this.previouslyPlayedComponents[subcomponent] || this.previouslyPlayedComponents.push(subcomponent)
  },
})

const Cricket = React.createClass({
  getInitialState() {
    return {playing: false}
  },

  render() {
    const caption = this.props.cricket.Caption
    const file = this.props.cricket.file
    const name = this.props.index+1 + " – " + caption
    var classes = [
      'cns_box',
      this.state.playing ? 'playing' : 'paused',
    ].join(' ')

    var {audioProgress} = this.props
    var progressBarStyle = {
      width: `${audioProgress}%`,
      height: 1,
      display: 'block',
      backgroundColor: 'blue',
    }

    return <div className={classes} onClick={this.togglePlay} style={{cursor: 'pointer'}}>
      {this.state.playing && <span style={progressBarStyle} />}
      <div className='cns_image_wrap'><img src={`${prefix}images/${file || caption}.jpg`} /></div>
      <div className='cns_description_wrap'><div><p>{name}</p></div></div>
      <audio
        src={`${prefix}audio/${file || caption}.mp3`}
        loop={this.props.soundboard}
        title={caption}
        poster={`${prefix}images/${caption}.jpg`}
        webkitPlaysinline=""
        xWebkitAirplay=""
        ref="audio" />
    </div>
  },

  togglePlay() {
    const {soundboard} = this.props
    const caption = this.props.cricket.Caption
    var audio = this.refs.audio.getDOMNode()
    if(soundboard) {
      this.setState({playing: !this.state.playing})
      this.state.playing ? audio.pause() : audio.play()
    } else {
      // send audio src to master player
      this.props.play(
        audio.src,
        (playing) => this.setState({playing}),
        this,
        {title: caption, image: `${prefix}images/${caption}.jpg`}
      )
    }
  },

  stopPlaying() {
    this.setState({playing: false})
  },
})

module.exports = App
