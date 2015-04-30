import React from 'react'
import { StyleResolverMixin, BrowserStateMixin } from 'radium'
import crickets from 'json!./cricket-content.json'

const App = React.createClass({
  render() {
    crickets.splice(7, 2) // missing image or audio
    crickets.splice(9, 1)

    return (
      <div>
        {crickets.map((c, i) => <Cricket key={i} cricket={c} />)}
      </div>
    )
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
      <div className='cns_image_wrap'><img src={`./images/${caption}.jpg`} /></div>
      <div className='cns_description_wrap'><div><p>{caption}</p></div></div>
      <audio src={`./audio/${caption}.mp3`} loop ref="audio" />
    </div>
  },

  togglePlay() {
    var audio = this.refs.audio.getDOMNode()
    this.setState({playing: !this.state.playing})
    this.state.playing ? audio.pause() : audio.play()
  },
})

module.exports = App
