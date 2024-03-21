//  Getting references to the important DOM elements.
const taskFormEl = $('#task-form');
const taskTitleInputEl = $('#task-title-input');
const taskDueDateInputEl = $('#task-due-date-input');
const taskDescInputEl = $('#task-desc');
const addTaskModalEl = $('#formModal');

// Function that retrieves the task from local storage and returns task list. If no tasks in local storage then returns empty list.
function readTasksFromStorage() {

    let taskList = JSON.parse(localStorage.getItem("tasks"));

    if (!taskList) {
        taskList = [];
    }

    return taskList;

}

//  Function that saves the list/array of tasks to the local storage.
function saveTasksToStorage(taskList) {

    // The task array is stringified to save in local storage.
    localStorage.setItem('tasks', JSON.stringify(taskList));

}

// Function generates an unique identity by calling Web API `crypto` and returns the ID.
function generateTaskId() {

    //Crypto api invoked to generate a unique id/primary key to assign to the new task card to identify them uniquely 
    return crypto.randomUUID();

}

// Function creates a bootstrap component 'task card' dynamically and returns the task card.
// Function has an event listener created for the delete button on task card.
function createTaskCard(task) {

    // Dynamically building the task card using the bootstrap component card.
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


    // Block to assign the styling color on the task card based on task due date. 
    if (task.taskduedate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.taskduedate, 'DD/MM/YYYY');

        // If the task is due today, card will be yellow and if the task is overdue, card will be red.
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

// Function to render/display the task list in respective card lanes based on the status of the cards and make task cards draggable.
// This function inturn calls functions readTasksFromStorage() and createTaskCard(task)
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

    //  Loop through tasks and create task cards for each status : Function call to create the bootstrap task cards
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
           
            // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');

            
            // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });


}

// Function to handle adding a new task from the modal form.
// This function inturn calls functions readTasksFromStorage(),saveTasksToStorage(tasks), renderTaskList()

function handleAddTask(event) {

    event.preventDefault();

    //Read user input from the form
    const taskTitle = taskTitleInputEl.val().trim();
    const taskDueDate = taskDueDateInputEl.val();
    const taskDescription = taskDescInputEl.val().trim();

    // The task title and task due date are mandatory for adding the tasks.
    if (taskTitle != "" && taskDueDate != "") {

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
        addTaskModalEl.modal('hide'); // Hide the modal  

    } else {

        //if mandatory files are not provided the form cannot be submitted and invalid fields displayed.
        event.stopPropagation();
        taskFormEl.addClass('was-validated');

    }

}

// Function deletes the task card 
// This function also calls functions readTasksFromStorage(),saveTasksToStorage(taskList)

function handleDeleteTask(event) {

    //Retrieve the task id of the card from the attribute added during card creation to delete
    const taskIdToDelete = $(this).attr('task-unique-id');

    const taskList = readTasksFromStorage();

    for (let index = 0; index < taskList.length; index++) {

        const task = taskList[index];
        if (task.taskid == taskIdToDelete) {
            taskList.splice(index, 1);
        }

    }

    saveTasksToStorage(taskList);

    renderTaskList();

}

// Function to handle dropping a task into a new status lane
// This function also calls other functions readTasksFromStorage(), renderTaskList(),saveTasksToStorage(taskList)
function handleDrop(event, ui) {

    // Get the task id of the card to be dropped
    const taskIdDropped = ui.draggable[0].getAttribute('task-unique-id');

    //  Get the id of the lane that the card was dropped into
    const newStatus = event.target.id;

    const taskList = readTasksFromStorage();

    for (let index = 0; index < taskList.length; index++) {
        const task = taskList[index];
        if (task.taskid === taskIdDropped) {
            task.status = newStatus;
        }
    }

    //save the updated tasks in local storage.
    saveTasksToStorage(taskList);

    //display the tasks based on the new status lane
    renderTaskList();

}

// When the page loads, render the task list, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

    //To display all the tasks on the page lane based on status
    renderTaskList();

    //datepicker initialization (jQueryUI)
    $('#task-due-date-input').datepicker({
        changeMonth: true,
        changeYear: true,
    });

    // Make the lanes droppable (jQueryUI)
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });

});

// Add event listener to the form element, listen for a submit event, and call the 'handleAddTask' function
taskFormEl.on('submit', handleAddTask);

//Add event listener to the form element, listen for a click event from the delete button , and call the 'handleDeleteTask' function
taskFormEl.on('click', '.btn-delete-project', handleDeleteTask);