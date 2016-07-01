import React from 'react'
import { StyleResolverMixin, BrowserStateMixin } from 'radium'

// const prefix = 'crickets'
// const prefix = 'marchetti'
const prefix = 'seeing-nature-soundscapes'
var content = require(`json!../${prefix}/content.json`)

const App = React.createClass({
  render() {
    const things = content.things.filter(t => !t.hide)
    const showLogo = content.branded

    return <div>
      <header>
        <h3>{content.title}</h3>
        {content.description && <div>{content.description}</div>}
      </header>
      {things.map((c, i) => <Cricket key={i} cricket={c} play={this.play} soundboard={content.soundboard} />)}
      <audio ref="masterAudio" />
      {showLogo && <div className="branded"></div>}
    </div>
  },

  previouslyPlayedComponents: [],

  componentDidMount() {
    this.refs.masterAudio.getDOMNode().addEventListener('ended', () => {
      this.previouslyPlayedComponents && this.previouslyPlayedComponents.map(c => c.stopPlaying())
    })
  },

  play(src, callback, subcomponent) {
    this.previouslyPlayedComponents.map(c => c.stopPlaying())

    var audio = this.refs.masterAudio.getDOMNode()
    var {playing} = this.state || {}

    if(audio.src == src) {
      this.state.playing ? audio.pause() : audio.play()
      playing = !this.state.playing
    } else {
      audio.src = src
      audio.play()
      playing = true
    }

    callback(playing)
    this.setState({playing: playing})
    this.previouslyPlayedComponents[subcomponent] || this.previouslyPlayedComponents.push(subcomponent)
  },
})

const Cricket = React.createClass({
  mixins: [StyleResolverMixin, BrowserStateMixin],

  getInitialState() {
    return {playing: false}
  },

  render() {
    const caption = this.props.cricket.Caption
    var classes = [
      'cns_box',
      this.state.playing ? 'playing' : 'paused',
    ].join(' ')

    return <div className={classes} onClick={this.togglePlay}>
      <div className='cns_image_wrap'><img src={`../${prefix}/images/${caption}.jpg`} /></div>
      <div className='cns_description_wrap'><div><p>{caption}</p></div></div>
      <audio src={`./${prefix}/audio/${caption}.mp3`} loop={this.props.soundboard} ref="audio" />
    </div>
  },

  togglePlay() {
    const {soundboard} = this.props
    var audio = this.refs.audio.getDOMNode()
    if(soundboard) {
      this.setState({playing: !this.state.playing})
      this.state.playing ? audio.pause() : audio.play()
    } else {
      // send audio src to master player
      this.props.play(audio.src, (playing) => this.setState({playing}), this)
    }
  },

  stopPlaying() {
    this.setState({playing: false})
  },
})

module.exports = App
