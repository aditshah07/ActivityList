import React, { Component } from 'react';
import Tasks from '../../components/tasks';
import Group from '../../svg/Group.svg';

import './styles.css';

// Displays the group and checks for isCollapsed
class Groups extends Component {
  render() {
    const groups = this.props.groups;
    const groupMap = this.props.groupMap;
    const taskIdMap = this.props.taskIdMap;

    return (
      <div>
        {groups.map(list => (
          <li className="group list-style-none" key={list.group}>
            <div className="items group-logo" onClick={() => { this.props.onClickedGroup(list.group) }}>
              <img src={Group} className="group-img" width="10" height="10" alt="group" />
              <div>
                <div className="task-name">{list.group}</div>
                <p className="locked group-locked"> {list.completedTask} OF {list.totalTask} TASKS COMPLETE </p> 
              </div>
            </div>
            {!groupMap[list.group] ? null : groupMap[list.group].isCollapsed ?
              <Tasks 
                groupMap={groupMap}
                onClickedTask={this.props.onClickedTask}
                taskIdMap={taskIdMap}
                taskCompletePrint={this.props.taskCompletePrint}
                taskIncompletePrint={this.props.taskIncompletePrint}
                taskLockedPrint={this.props.taskLockedPrint}
                groupName={list.group}/>
                : null}
          </li>
        ))}
      </div>
    );
  }
}

export default Groups;
