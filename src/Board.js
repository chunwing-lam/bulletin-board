import React, { Component } from 'react'
import Note from './Note'
import FaPlus from 'react-icons/lib/fa/plus'
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext, DropTarget } from 'react-dnd'
import { ItemTypes } from './Constants'

const boxTarget = {
  drop(props, monitor, component) {
		const item = monitor.getItem()
		const delta = monitor.getDifferenceFromInitialOffset()
		const right = Math.round(item.right - delta.x)
		const top = Math.round(item.top + delta.y)

    component.updatePosition(right, top, item.id);
	},
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  }
}

class Board extends Component {
  constructor(props) {
    super(props)
    this.state = {
      notes : []
    }
    this.eachNote = this.eachNote.bind(this)
    this.update = this.update.bind(this)
    this.remove = this.remove.bind(this)
    this.add = this.add.bind(this)
    this.nextId = this.nextId.bind(this)
  }

  componentWillMount() {
    var self = this
    if (this.props.count) {
      fetch(`https://baconipsum.com/api/?type=all-meat&sentences=${this.props.count}`)
        .then(response => response.json())
        .then(json => json[0]
                        .split('. ')
                        .forEach(sentence => self.add(sentence.substring(0, 25))))
    }
  }

  add(text) {
    this.setState(prevState => ({
      notes: [
        ...prevState.notes,
        {
          id: this.nextId(),
          note: text,
          right: this.randomBetween(0, window.innerWidth - 150),
          top: this.randomBetween(0, window.innerHeight - 150),
          transform: `rotate(${this.randomBetween(-25, 25)})`
        }
      ]
    }))
  }

  randomBetween(x, y) {
    return x + Math.ceil(Math.random() * (y-x))
  }

  nextId() {
    this.uniqueId = typeof this.uniqueId === 'undefined'? 0 : this.uniqueId + 1
    return this.uniqueId
  }

  update(newText, i) {
    this.setState(prevState => ({
      notes: prevState.notes.map(
        note => (note.id !== i)? note : {...note, note: newText}
      )
    }))
  }

  updatePosition(newRight, newTop, i) {
    this.setState(prevState => ({
      notes: prevState.notes.map(
        note => (note.id !== i)? note : {...note, right: newRight, top: newTop}
      )
    }))
  }

  remove(id) {
    this.setState(prevState => ({
      notes: prevState.notes.filter(note => note.id !== id)
    }))
  }

  eachNote(note, i) {
    return (
      <Note key={note.id} index={note.id} onChange={this.update} onRemove={this.remove}
            note={note}>
      </Note>
    )
  }
  render() {
    const { connectDropTarget } = this.props
    return connectDropTarget(
      <div className="board">
        {this.state.notes.map(this.eachNote)}
        <button onClick={this.add.bind(null, "New Note")}
                id="add">
                <FaPlus />
        </button>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(DropTarget(ItemTypes.NOTE, boxTarget, collect)(Board))
