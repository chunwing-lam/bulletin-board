import React, { Component } from 'react'
import PropTypes from 'prop-types'
import FaPencil from 'react-icons/lib/fa/pencil'
import FaTrash from 'react-icons/lib/fa/trash'
import FaFoppyO from 'react-icons/lib/fa/floppy-o'
import { DragSource } from 'react-dnd'
import { ItemTypes } from './Constants'

/* Implements the drag source contract */
const noteSource = {
  beginDrag(props) {
    return {
      id: props.note.id,
      right: props.note.right,
      top: props.note.top
    }
  }
}

/* Specifies the props to inject into component */
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

const propTypes = {
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func.isRequired
}

class Note extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editing: false
    }
    this.edit = this.edit.bind(this)
    this.remove = this.remove.bind(this)
    this.renderForm = this.renderForm.bind(this)
    this.renderDisplay = this.renderDisplay.bind(this)
    this.save = this.save.bind(this)
  }

  componentWillMount() {
    this.style = {
      right: `${this.props.note.right}px`,
      top: `${this.props.note.top}px`,
      transform: `${this.props.note.transform}deg`
    }
  }

  componentDidUpdate() {
    var textArea
    if(this.state.editing) {
      textArea = this._newText
      textArea.focus()
      textArea.select()
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.note.note !== nextProps.note.note ||
      this.state !== nextState ||
      this.props.note.right !== nextProps.note.right ||
      this.props.note.top !== nextProps.note.top
    )
  }

  componentWillUpdate(nextProps) {
    this.style = {
      ...this.style,
      right: `${nextProps.note.right}px`,
      top: `${nextProps.note.top}px`
    }
  }

  edit() {
    this.setState({
      editing: true
    })
  }

  remove() {
    this.props.onRemove(this.props.index)
  }

  save(e) {
    e.preventDefault()
    this.props.onChange(this._newText.value, this.props.index)
    this.setState({
      editing: false
    })
  }

  renderForm(props) {
    return props.connectDragSource(
      <div className="note" style={this.style}>
        <form onSubmit={this.save}>
          <textarea ref={input => this._newText = input}
                    defaultValue={this.props.note.note}/>
          <button id="save"><FaFoppyO /></button>
        </form>
      </div>
    )
  }

  renderDisplay(props) {
    return props.connectDragSource(
      <div className="note" style={this.style}>
        <p>{this.props.note.note}</p>
        <span>
          <button onClick={this.edit} id="edit"><FaPencil /></button>
          <button onClick={this.remove} id="remove"><FaTrash /></button>
        </span>
      </div>
    )
  }

  render() {
    return this.state.editing? this.renderForm(this.props) : this.renderDisplay(this.props)
  }
}

Note.propTypes = propTypes

export default DragSource(ItemTypes.NOTE, noteSource, collect)(Note)
