import React, { Component } from 'react';
import Incomplete from '../../svg/Incomplete.svg';
import Complete from '../../svg/Complete.svg';
import Locked from '../../svg/Locked.svg';

import './styles.css';

// called when the collpased is false to display the task 
// check the status of the task and prints it accordingly
class Tasks extends Component {

  renderTask = list => {
    const status = this.props.taskIdMap[list.id].status;
    let src;
    switch(status) {
      case "incomplete":
        src = Incomplete;
        break;
      case "complete":
        src = Complete;
        break;
      case "locked":
        src = Locked;
        break;
      default:
        src = "broken-image"
    }
    return (
      <div className={status === "incomplete" ? "items pointer-cursor" : "items"}>
        <img src={src} alt={status} />
        <div className={status === "complete" ? "task-name complete" : status === "locked" ? "locked-task" : "task-name"}> {list.task} </div>
      </div>
    );
  }

  render = () => ((
    <div>
      {this.props.groupMap[this.props.groupName].map(list => (
        <span key= {list.id} onClick={() => { this.props.onClickedTask(list.group, list.id) }}>
          {this.renderTask(list)}
        </span>
      ))}
    </div>
  ));
}

export default Tasks;
