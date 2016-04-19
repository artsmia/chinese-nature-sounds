import React from 'react'
import { StyleResolverMixin, BrowserStateMixin } from 'radium'

// const prefix = 'crickets'
const prefix = 'marchetti'
var content = require(`json!../${prefix}/content.json`)

const App = React.createClass({
  render() {
    const things = content.things.filter(t => !t.hide)
    const showLogo = content.branded

    return <div>
      {things.map((c, i) => <Cricket key={i} cricket={c} play={this.play} soundboard={content.soundboard} />)}
      <footer>
        <h3>{content.title}</h3>
        {content.description && <div>{content.description}</div>}
        <span>Tap on an image to listen to the related sound.</span>
      </footer>
      <audio ref="masterAudio" />
      {showLogo && <div className="branded"></div>}
    </div>
  },

  previouslyPlayedComponents: [],

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
    var _styles = {
      states: [
        {playing: {fontWeight: 'bold'}}
      ]
    }
    var styles = this.buildStyles(_styles, {playing: this.state.playing})

    return <div className='cns_box' style={styles} onClick={this.togglePlay}>
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
