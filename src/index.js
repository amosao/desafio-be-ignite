const { v4: uuidv4 } = require('uuid');
const express = require('express');
const cors = require('cors');

const app = express();
const users = [];

app.use(cors());
app.use(express.json());

function findByUsername(username) {
    return users.find(x => x.username == username);
}

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    user = findByUsername(username);

    if (user === undefined) {
        return response.status(400).send({
            error: "User not found."
        });
    }

    request.user = user;

    return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    userCheck = findByUsername(username);

    if (userCheck != undefined && userCheck != null) {
        return response.status(400).send({
            error: "Username already exists."
        })
    }

    newUser = {
        id: uuidv4(),
        name,
        username,
        todos: []
    }

    users.push(newUser);

    return response.status(201).send(newUser);
});

app.use(checksExistsUserAccount);

app.get('/todos', (request, response) => {
    return response.status(200).send(request.user.todos);
});

app.post('/todos', (request, response) => {
    const { title, deadline } = request.body;

    newTodo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }

    request.user.todos.push(newTodo);

    return response.status(201).send(newTodo);
});

app.put('/todos/:id', (request, response) => {
    const { id } = request.params;
    const { title, deadline } = request.body;

    let todo = request.user.todos.find(x => x.id === id);

    if(todo == null || todo == undefined) return response.status(404).send({error: "Todo not found."})

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(200).send(todo);
});

app.patch('/todos/:id/done', (request, response) => {
    const { id } = request.params;

    let todo = request.user.todos.find(x => x.id === id);

    if(!todo) return response.status(404).send({error: "Todo not found."})
    if(todo.done) return response.status(400).send({error: "Todo already done."})

    todo.done = true;

    return response.status(200).send(todo);
});

app.delete('/todos/:id', (request, response) => {
    const { id } = request.params;

    let todo = request.user.todos.find(x => x.id === id);

    if(!todo) return response.status(404).send({error: "Todo not found."});

    let todoIndex = request.user.todos.indexOf(todo);

    request.user.todos.splice(todoIndex, 1);

    return response.status(204).send();
});

module.exports = app;