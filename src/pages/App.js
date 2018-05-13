import React, { Component } from 'react';
import logo from '../svg/logo.svg';
import Incomplete from '../svg/Incomplete.svg';
import Completed from '../svg/Completed.svg';
import Locked from '../svg/Locked.svg';
import Group from '../svg/Group.svg';
import '../css/App.css';
import data from '../data/data.json';

// Displays the group and checks for isCollapsed
class Groups extends Component {

  render() {
    const groups = this.props.groups;
    const groupMap = this.props.groupMap;
    const taskIdMap = this.props.taskIdMap;

    return (
      <div>
        {groups.map(function (list, index) {
          return (
            <li key={list.group} style={{listStyleType :'none'}}>
              <span onClick={this.props.onClickedGroup.bind(this, list.group)}>
                <div className="App-items" style= {{paddingTop:10, paddingBottom:14, cursor: 'pointer'}} >
                    <img src={Group} alt="Group" style= {{marginLeft:10, marginTop:10}} width="10" height="10"/>
                    <div>
                      <div id = "TaskName">{list.group}</div>
                      <p className = "locked"  style={{margin:0, fontWeight: 'normal', fontSize:12, marginLeft:'2.7em'}}> {list.completedTask} OF {list.totalTask} TASKS COMPLETE </p> 
                    </div>
                </div>
              </span>
              {!groupMap[list.group] ? null : groupMap[list.group].isCollapsed ? 
              <Tasks 
              groupMap = {groupMap}
              onClickedListItem = {this.props.onClickedListItem.bind(this)}
              taskIdMap = {taskIdMap}
              taskCompletePrint = {this.props.taskCompletePrint}
              taskIncompletePrint = {this.props.taskIncompletePrint}
              taskLockedPrint = {this.props.taskLockedPrint}
              groupName = {list.group}/> : null }
            </li>
            );
          }, this)
        }
      </div>
    );
  }
}

// called when the collpased is false to display the task and check the status of the task and prints it accordingly
class Tasks extends Component {

  // Printing the task as completed on the screen
  taskCompletePrint(task) {
    return(
      <div className="App-items">
        <img src={Completed} alt="Completed" />
        <div className = "completed" id = "TaskName"> {task.task} </div>
      </div>
    );
  }

  // Printing the task as incomplete on the screen
  taskIncompletePrint(task) {
    return (
      <div className="App-items"  style={{cursor:'pointer'}}>
        <img src={Incomplete} alt="Incomplete" />
        <div id = "TaskName"> {task.task} </div>
      </div>
    );
  }

  // Printing the task as locked on the screen
  taskLockedPrint(task) {
    return(
      <div className="App-items">
        <img src={Locked} alt="Locked" />
        <div className = "locked" id = "TaskName"> {task.task} </div>
      </div>
    );
  }

  render() {
    const groupMap = this.props.groupMap;

    return (
      <div>
        {groupMap[this.props.groupName].map(function (list, index) {
          return (
            <span key= {list.id} onClick={this.props.onClickedListItem.bind(this,list.group, list.id)}>
              <div>
                  {this.props.taskIdMap[list.id].status === "complete" ? this.taskCompletePrint(list) : null}
                  {this.props.taskIdMap[list.id].status === "incomplete" ? this.taskIncompletePrint(list) : null}
                  {this.props.taskIdMap[list.id].status === "locked" ? this.taskLockedPrint(list) : null}
              </div>
            </span>

            );
          }, this)
        }
      </div>
    );
  }
}

// Main app component
class App extends Component {

  constructor() {
    super();
    this.state = {
      taskIdMap : new Map(),
      groupMap : new Map(),
      displayGroup : [],
    };

    this.onClickedGroup = this.onClickedGroup.bind(this);
    this.onClickedListItem = this.onClickedListItem.bind(this);
  }

  // When the components are loaded
  componentDidMount() {
    // Fetch Data from json file    
    const taskList = data;
    // map groups to its tasks
    let groupMap = new Map();
    // map task to status of it
    let taskIdMap = new Map();
    // to display the groups its used
    let displayGroup = [];

    // create groupMap and intial setup for taskIdMap
    taskList.forEach(function (task) {
      if (!groupMap[task.group]) {
        groupMap[task.group] = [task];
      } else {
        let taskArray = groupMap[task.group];
        taskArray.push(task);
        groupMap[task.group] = taskArray;
      }
      if (!task.completedAt)
        taskIdMap[task.id] = {id: task.id, status: "incomplete", dependentOn : [], dependentBy : [], completedAt: task.completedAt};
      else
        taskIdMap[task.id] = {id: task.id, status: "complete", dependentOn : [], dependentBy : [], completedAt: task.completedAt};
    });

    // Adding dependentBy to taskIdMap so when it gets complete it will change the status of the task dependent on it.
    taskList.forEach(function (task) {
      if (!task.completedAt) {
        let isIncomplete = true;
        task.dependencyIds.forEach( function(dependent){
          if (!taskIdMap[dependent] || taskIdMap[dependent].status !== "complete")
            isIncomplete = false;

          if (!taskIdMap[dependent] || taskIdMap[dependent].status !== "complete")
            taskIdMap[task.id].dependentOn.push(dependent);

          if (taskIdMap[dependent])
            taskIdMap[dependent].dependentBy.push(task.id);
        });

        taskIdMap[task.id].status = (!isIncomplete) ?  "locked" : "incomplete";
      }
    });

    // Creating displayGroup and field required for the group to display
    for(let group in groupMap) {
      let completedTask = 0;
      let groupName = "";

      (groupMap[group]).forEach(function(task) {

        task.completedAt ? ++completedTask : completedTask;
        groupName =  task.group;
      });
      displayGroup.push({group: groupName, completedTask: completedTask, totalTask: groupMap[group].length});
    }

    this.setState({
      taskIdMap : taskIdMap,
      groupMap : groupMap,
      displayGroup: displayGroup
    });
  }

  // When the group is clicked this function is called so to change isCollapsed field of groupMap
  onClickedGroup(group) {
    let isCollapsed = this.state.groupMap[group].isCollapsed 
    isCollapsed = (isCollapsed) ? false : true;
    let groupMap = this.state.groupMap;
    groupMap[group].isCollapsed = isCollapsed;
    this.setState({
      groupMap : groupMap
    })
  }

  // When task is clicked we check it's status is incomplete then we change the status to complete and update the dependentBy task otherwise do nothing 
  onClickedListItem(group, id) {

    const taskIdMap = this.state.taskIdMap;
    const displayGroup = this.state.displayGroup;

    if (taskIdMap[id].status === "incomplete") {
      taskIdMap[id].status = "complete";
      taskIdMap[id].completedAt = new Date();
      let result = displayGroup.find(groups => groups.group === group);
      let indexOfCompleted =  displayGroup.indexOf(result);
      ++displayGroup[indexOfCompleted].completedTask;

      this.state.taskIdMap[id].dependentBy.forEach(function(dependent) {
        if (taskIdMap[dependent] && taskIdMap[dependent].status === "locked") {
          let index = taskIdMap[dependent].dependentOn.indexOf(taskIdMap[id]);
          taskIdMap[dependent].dependentOn.splice(index, 1);

          if(!taskIdMap[dependent].dependentOn.length){
            taskIdMap[dependent].status = "incomplete";
          }
        }
      }, this);

      this.setState({
          taskIdMap:taskIdMap,
          displayGroup: displayGroup
      });
    }
  }

  // When all groups is clicked then all the groups are expanded
  allGroupClicked(){

    const groupMap = this.state.groupMap;
    for (let group in groupMap){
      (groupMap[group]).isCollapsed = true;
    }
    this.setState({
      groupMap:groupMap,
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome</h1>
        </header>
        
        <div className="App-body">

          <div className="App-content">
            <div className="App-taskGroup">
              <div className="App-taskGroupHeader">
                  <div> Things To Do </div>
              </div>
                {this.state.displayGroup ? 
                <Groups
                  groups = {this.state.displayGroup}
                  groupMap = {this.state.groupMap}
                  onClickedGroup = {this.onClickedGroup.bind(this)}
                  onClickedListItem = {this.onClickedListItem.bind(this)}
                  taskIdMap = {this.state.taskIdMap}/> : null}
            </div>
          </div>

          <div className="App-content">
            <div className="App-taskGroup">

              <div className="App-taskGroupHeader">
                <div> Task Group </div>
                  <div className =  "All-Group-link" onClick = {this.allGroupClicked.bind(this)}> ALL GROUPS </div>
              </div>

              <div className="App-items">
                <img src={Locked} alt="Locked" />
                <div className = "locked" id = "TaskName"> &nbsp; Locked Task </div>
              </div>

              <div className="App-items">
                <img src={Incomplete} alt="Incomplete" />
                <div id = "TaskName"> Incomplete Task </div>
              </div>

              <div className="App-items">
                <img src={Completed} alt="Completed" />
                <div className = "completed" id = "TaskName"> Completed Task </div>
              </div>

            </div>
          </div>
        </div> 
      </div>
    );
  }
}

export default App;
