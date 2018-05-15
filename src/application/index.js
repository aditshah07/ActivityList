import React, { Component } from 'react';
import Groups from '../components/groups';
import logo from '../svg/logo.svg';
import Incomplete from '../svg/Incomplete.svg';
import Complete from '../svg/Complete.svg';
import Locked from '../svg/Locked.svg';
import data from '../data/activity-data.json';

import './styles.css';

const createDataMap = taskList => {
  // map groups to its tasks
  const groupMap = new Map();
  // map task to status of it
  const taskIdMap = new Map();

  taskList.forEach(task => {
    groupMap[task.group] = groupMap[task.group] || [];
    groupMap[task.group].push(task);
    groupMap[task.group].isCollapsed = false;

    taskIdMap[task.id] = {
      id: task.id,
      status: !task.completedAt ? "incomplete" : "complete",
      dependentOn : [],
      dependentBy : [],
      completedAt: task.completedAt,
    };
  });

  return {
    groupMap,
    taskIdMap
  };
};

// Adding dependentOn and dependentBy to to avoid repetitive loops
const addTaskDependencies = (taskList, taskIdMap) => {
  taskList.forEach(task => {
    if (!task.completedAt) {
      let isLocked = false;
      task.dependencyIds.forEach(dependent => {
        // no dependency in response or dependent task is incomplete, lock it
        if (!taskIdMap[dependent] || !taskIdMap[dependent].completedAt)
          isLocked = true;

        if (!taskIdMap[dependent] || taskIdMap[dependent].status !== "complete")
            taskIdMap[task.id].dependentOn.push(dependent);

        // dependentBy
        if (taskIdMap[dependent])
          taskIdMap[dependent].dependentBy.push(task.id);
      });

      taskIdMap[task.id].status = isLocked ? "locked" : "incomplete";
    }
  });
};

// Creating displayGroup and field required for the group to display on screen
const createDisplayGroup = groupMap => {
  const displayGroup = [];
  for (let group in groupMap) {
    let completedTask = 0;
    let groupName = "";

    (groupMap[group]).forEach(function(task) {
      completedTask = task.completedAt ? ++completedTask : completedTask;
      groupName =  task.group;
    });
    displayGroup.push({
      group: groupName, 
      completedTask: completedTask, 
      totalTask: groupMap[group].length
    });
  }
  return displayGroup;
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
  }

  // When the components are loaded
  componentDidMount() {
    const taskList = data;

    // create groupMap and intial setup for taskIdMap
    const { groupMap, taskIdMap } = createDataMap(taskList);

    // Adding dependentBy to taskIdMap
    // when it gets complete it will change the status of the task dependent on it.
    addTaskDependencies(taskList, taskIdMap);

    const displayGroup = createDisplayGroup(groupMap);

    this.setState({
      taskIdMap,
      groupMap,
      displayGroup
    });
  }

  // When the group is clicked this function is called so to change isCollapsed field of groupMap
  onClickedGroup = group => {
    const isCollapsed = !this.state.groupMap[group].isCollapsed;
    const groupMap = this.state.groupMap;
    groupMap[group].isCollapsed = isCollapsed;

    this.setState({
      groupMap
    })
  }

  // When task is clicked we check it's status is incomplete.
  // Then we change the status to complete and update the dependentBy task, otherwise do nothing 
  onClickedListItem = (group, id) => {
    const taskIdMap = this.state.taskIdMap;
    const displayGroup = this.state.displayGroup;

    if (taskIdMap[id].status === "incomplete") {
      taskIdMap[id].status = "complete";
      taskIdMap[id].completedAt = new Date();

      // Update the number of completed tasks. Eg.: 2 OF 5 TASKS COMPLETE
      const result = displayGroup.find(groups => groups.group === group);
      const indexOfCompleted =  displayGroup.indexOf(result);
      ++displayGroup[indexOfCompleted].completedTask;

      // Find the locaked tasks which are now incomplete and can be completed
      // Unlock them
      this.state.taskIdMap[id].dependentBy.forEach(dependent => {
        if (taskIdMap[dependent] && taskIdMap[dependent].status === "locked") {
          const index = taskIdMap[dependent].dependentOn.indexOf(taskIdMap[id]);
          taskIdMap[dependent].dependentOn.splice(index, 1);

          if (!taskIdMap[dependent].dependentOn.length){
            taskIdMap[dependent].status = "incomplete";
          }
        }
      });

      this.setState({
        taskIdMap,
        displayGroup
      });
    }
  }

  // When all groups is clicked then all the groups are expanded
  allGroupClicked = () => {
    const groupMap = this.state.groupMap;
    for (let group in groupMap) {
      (groupMap[group]).isCollapsed = true;
    }
    console.log(groupMap);
    this.setState({
      groupMap
    });
  }

  render = () => ((
    <div className="app">
      <header className="header">
        <img src={logo} className="logo" alt="Logo" />
        <h1 className="title"> Welcome </h1>
      </header>
      
      <div className="body">
        {/* Things To Do */}
        <div className="content">
          <div className="task-group-header">
            <div> Things To Do </div>
          </div>
          {this.state.displayGroup ? 
            <Groups
              groups = {this.state.displayGroup}
              groupMap = {this.state.groupMap}
              onClickedGroup = {this.onClickedGroup}
              onClickedListItem = {this.onClickedListItem}
              taskIdMap = {this.state.taskIdMap}/> :
            null}
        </div>

        {/* Task Group */}
        <div className="content">
          <div className="task-group-header">
            <div> Task Group </div>
              <div className="all-group-link" onClick={this.allGroupClicked}> ALL GROUPS </div>
          </div>

          <div className="items">
            <img src={Locked} alt="Locked" />
            <div className = "locked-task"> Locked Task </div>
          </div>

          <div className="items">
            <img src={Incomplete} alt="Incomplete" />
            <div className="task-name"> Incomplete Task </div>
          </div>

          <div className="items">
            <img src={Complete} alt="Complete" />
            <div className = "task-name completed"> Completed Task </div>
          </div>
        </div>
      </div> 
    </div>
  ));
}

export default App;
