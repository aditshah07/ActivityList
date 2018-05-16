import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';

import App from '../application/index';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('Check componentDidMount function', () => {
	const component = renderer.create(
    	<App />,
  	);

	//Check whether thare are 5 tasks in Purchases group
	expect(component.getInstance().state.groupMap['Purchases'].length).toBe(5)

	// Check whether thare are 0 completed task in Purchases group
	expect(component.getInstance().state.displayGroup[0].completedTask).toBe(0)

	//Check whether thare are 3 tasks in Build Airplane group
	expect(component.getInstance().state.groupMap['Build Airplane'].length).toBe(3)

	// Check whether thare are 0 completed task in Build Airplane group
	expect(component.getInstance().state.displayGroup[1].completedTask).toBe(0)

	// Check whether thare are first task in Purchases group is Go to the bank
	expect(component.getInstance().state.groupMap['Purchases'][0].task).toBe('Go to the bank')

	// Check whether task id 1 has 4 task dependent on it
	expect(component.getInstance().state.taskIdMap[1].dependentBy.length).toBe(4)

	// Check whether task id 1 is incomplete
	expect(component.getInstance().state.taskIdMap[1].status).toBe('incomplete')

	// Check whether task id 2 is locked
	expect(component.getInstance().state.taskIdMap[2].status).toBe('locked')

	// Check whether task id 6 is dependent on 4 task
	expect(component.getInstance().state.taskIdMap[6].dependentOn.length).toBe(4)

	// Check whether task id 11 is undefined
	expect(component.getInstance().state.taskIdMap[11]).toBe(undefined)

});

it('Check allGroupClicked', () => {
	const component = renderer.create(
    	<App />,
  	);

	expect(component.getInstance().state.groupMap['Purchases'].isCollapsed).toBe(false)

	expect(component.getInstance().state.groupMap['Build Airplane'].isCollapsed).toBe(false)

	// Run function allGroupClicked
	component.getInstance().allGroupClicked();

	expect(component.getInstance().state.groupMap['Purchases'].isCollapsed).toBe(true)

	expect(component.getInstance().state.groupMap['Build Airplane'].isCollapsed).toBe(true)


});

it('Check onClickedGroup', () => {
	const component = renderer.create(
    	<App />,
  	);

	expect(component.getInstance().state.groupMap['Purchases'].isCollapsed).toBe(false)

	expect(component.getInstance().state.groupMap['Build Airplane'].isCollapsed).toBe(false)

	// Run function onClickedGroup
  	component.getInstance().onClickedGroup('Purchases');

  	expect(component.getInstance().state.groupMap['Purchases'].isCollapsed).toBe(true)

  	expect(component.getInstance().state.groupMap['Build Airplane'].isCollapsed).toBe(false)

});

it('Check onClickedTask', () => {
	const component = renderer.create(
    	<App />,
  	);

	expect(component.getInstance().state.taskIdMap[1].status).toBe('incomplete')

	expect(component.getInstance().state.taskIdMap[2].status).toBe('locked')

	expect(component.getInstance().state.taskIdMap[3].status).toBe('locked')

	expect(component.getInstance().state.taskIdMap[4].status).toBe('locked')

	expect(component.getInstance().state.taskIdMap[5].status).toBe('locked')

	expect(component.getInstance().state.taskIdMap[6].status).toBe('locked')

	// Run function onClickedTask
	component.getInstance().onClickedTask('Purchases', 1)

	component.getInstance().onClickedTask('Purchases', 2)

	component.getInstance().onClickedTask('Purchases', 6)

	expect(component.getInstance().state.taskIdMap[1].status).toBe('complete')

	component.getInstance().onClickedTask('Purchases', 1)

	expect(component.getInstance().state.taskIdMap[1].status).toBe('complete')

	expect(component.getInstance().state.taskIdMap[2].status).toBe('complete')

	expect(component.getInstance().state.taskIdMap[3].status).toBe('incomplete')

	expect(component.getInstance().state.taskIdMap[4].status).toBe('incomplete')

	expect(component.getInstance().state.taskIdMap[5].status).toBe('incomplete')

	expect(component.getInstance().state.taskIdMap[6].status).toBe('locked')
});