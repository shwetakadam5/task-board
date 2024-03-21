// ? Grab references to the important DOM elements.
const taskFormEl = $('#task-form');
const taskTitleInputEl = $('#task-title-input');
const taskDueDateInputEl = $('#task-due-date-input');
const taskDescInputEl = $('#task-desc');


// Reads task from local storage and returns array of task objects.
// If there are no tasks in localStorage, it initializes an empty array ([]) and returns it.
function readTasksFromStorage() {

    let taskList = JSON.parse(localStorage.getItem("tasks"));
    let nextId = JSON.parse(localStorage.getItem("nextId"));

    if (!taskList) {
        taskList = [];
    }

    return taskList;
}

//  Accepts an array of tasks, stringifys them, and saves them in localStorage.
function saveTasksToStorage(taskList) {
    localStorage.setItem('tasks', JSON.stringify(taskList));
}


// Function to return unique identity generated by calling Web API `crypto` to identify the task in the array
function generateTaskId() {
    return crypto.randomUUID()
}

// Todo: create a function to create a task card
function createTaskCard(task) {

    const taskCard = $('<div>')
    .addClass('card draggable my-3')
    .attr('task-unique-id', task.taskid);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.tasktitle);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.taskdesc);
  const cardDueDate = $('<p>').addClass('card-text').text(task.taskduedate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('task-unique-id', task.taskid);
  cardDeleteBtn.on('click', handleDeleteTask);


  if (task.taskduedate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.taskduedate, 'DD/MM/YYYY');

    // If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
//  Function call to read tasks list from local storage.
    const tasks = readTasksFromStorage();

  //  Empty existing tasks cards out of the lanes
  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();


  //  Loop through tasks and create task cards for each status : Function call to create the bootstrap task cardss.
  for (let task of tasks) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }

  //  Use JQuery UI to make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
    helper: function (e) {
      console.log(e.target);
      // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');

        console.log(original);
      // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });


}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {

    console.log("HI I AM IN HANDLEADDTASK");

    console.log(taskFormEl);

    event.preventDefault();
    //Read user input from the form
    const taskTitle = taskTitleInputEl.val().trim();
    const taskDueDate = taskDueDateInputEl.val();
    const taskDescription = taskDescInputEl.val().trim();

    // The task title and task due date are mandatory for adding the tasks.
if( taskTitle != ""  &&  taskDueDate != "" ){

    const taskDetail = {
        taskid: generateTaskId(),
        tasktitle: taskTitle,
        taskduedate: taskDueDate,
        taskdesc: taskDescription,
        status: 'to-do',
    };

    //Function call to read tasks from local storage and update the list
    const allTasks = readTasksFromStorage();
    allTasks.push(taskDetail);

    //Function call to add tasks to local storage
    saveTasksToStorage(allTasks);

    //Function call to create and display the tasks cards in the lanes.
    renderTaskList();


    // Clear the form inputs
    taskTitleInputEl.val('');
    taskDueDateInputEl.val('');
    taskDescInputEl.val('');


    taskFormEl.removeClass('was-validated');
    $('#formModal').modal('hide'); // Hide the modal  
    
}else{

    event.stopPropagation();
    console.log(taskFormEl);
    taskFormEl.addClass('was-validated');   
    
}


}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {

}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    //datepicker initialization
    $('#task-due-date-input').datepicker({
        changeMonth: true,
        changeYear: true,
    });
});

// Add event listener to the form element, listen for a submit event, and call the `handleAddTask` function
taskFormEl.on('submit', handleAddTask);
