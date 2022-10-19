/* eslint-disable no-return-assign */

import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getTasks from '@salesforce/apex/listController.getTasks';
import insertTask from '@salesforce/apex/listController.insertTask';
import deleteTask from '@salesforce/apex/listController.deleteTask';

export default class TodoTask extends LightningElement {

   
    @track
    todoTasks = [];
    todoTasksResponse;
    processing = true;
    newTask = '';


    updateNewTask(event) {
        this.newTask = event.target.value;
    }

//imperative method

    addTask() {

  // * If the task name is empty, return
        if(this.newTask ==='') {
            return;
        }

        this.processing =  true;

    // * Insert the task in Salesforce
        insertTask({ subject: this.newTask })
        .then(result => {
            console.log(result);
            // * Push function - used to add element at the end of the array
            this.todoTasks.push({
                id: this.todoTasks[this.todoTasks.length - 1] ? this.todoTasks[this.todoTasks.length - 1].id + 1 : 0,
                name: this.newTask,
                recordId: result.Id
            });
            this.newTask = '';
            console.log(JSON.stringify(this.todoTasks));
        })
        .catch(error => console.log(error))
        .finally(() => this.processing = false);
        // * Set processing variable to false after receiving response from salesforce
    }

    deleteTask(event) {

        let idToDelete = event.target.name;
        let todoTasks = this.todoTasks;
        let todoTaskIndex;
        let recordIdToDelete;
//while deleting
        this.processing = true;

     
        for(let i=0; i<todoTasks.length; i++) {
            if(idToDelete === todoTasks[i].id) {
                todoTaskIndex = i;
            }
        }

        recordIdToDelete = todoTasks[todoTaskIndex].recordId;

//ok good to go

        deleteTask({ recordId: recordIdToDelete })
        .then(result => {
            console.log(result);
            if(result) {
              
                todoTasks.splice(todoTaskIndex, 1);
            } else {
                console.log('Unable to delete task');
            }
            console.log(JSON.stringify(this.todoTasks));
        })
        .catch(error => console.log(error))
        //set the processing end after delete task

        .finally(() => this.processing = false);
        
    }

    refreshTask() {
        // * Set processing variable to true
        this.processing = true;
        
        refreshApex(this.todoTasksResponse)
        .finally(() => this.processing = false);

        // * Set processing variable to false after receiving response from salesforce
    }

    
//wire method   
@wire(getTasks)
getTodoTasks(response) {
    this.todoTasksResponse = response;
    let data = response.data;
    let error = response.error;

    // * Set processing variable to false if response is received from salesforce
    if(data || error) {
        this.processing = false;
    }

    if(data) {
        console.log('data');
        console.log(data);
        this.todoTasks = [];
        data.forEach(task => {
            this.todoTasks.push({
                id: this.todoTasks.length + 1,
                name: task.Subject,
                recordId: task.Id
            });
        });
    } else if(error) {
        console.log('error');
        console.log(error);
   }
}


}