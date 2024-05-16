const express = require('express');
const dbHandler = require('../db/handler');

const router = express.Router();

router.post('/get', async (req, res) => {
    const { userid } = req.body;
    const query = `
        SELECT 
            t.TodoID, 
            t.UserID, 
            t.Description, 
            t.DueDate, 
            t.Priority, 
            t.Status, 
            t.CreatedAt, 
            t.UpdatedAt
        FROM 
            TodoItem t
        LEFT JOIN 
            shared_todos st ON t.TodoID = st.todo_id
        WHERE 
            t.UserID = ${userid} OR st.user_id = ${userid}
    `;
    dbHandler.executeQuery(query, (err, results) => {
        if(err){
            res.status(500).send(err);
        }
        res.status(200).send(results);
    });
});

router.post('/add', async (req, res) => {
    const {description, priority, userId, dueDate} = req.body;
    dbHandler.executeQuery(`insert into todo.todoitem (Description, Priority, DueDate, UserID) values("${description}", "${priority}", "${dueDate}", ${userId})`, (err, results) => {
        if(err){
            res.status(500).send(err);
        }
        
        res.status(200).send({newId: results.insertId});
    });
})

router.post('/delete', async (req, res) => {
    const {todoId, userid} = req.body;
    dbHandler.executeQuery(`delete from todo.todoitem where TodoID = ${todoId}`, (err, results) => {
        if(err){
            res.status(500).send(err);
        }
        dbHandler.executeQuery(`delete from todo.shared_todos where todo_id = ${todoId}`, (shareErr, shareResults) => {
            if(shareErr){
                res.status(500).send(shareErr);
            }
            res.status(200).send();
        })
    });
})

router.post('/update', async (req, res) => {
    const {description, priority, userId, dueDate, todoId} = req.body;
    dbHandler.executeQuery(`update todo.todoitem set Description = "${description}", Priority = "${priority}", DueDate = "${dueDate}" where todoid = ${todoId} and userid = ${userId}`, (err, results) => {
        if(err){
            res.status(500).send(err);
        }
        res.status(200).send();
    });
})




module.exports = router;
