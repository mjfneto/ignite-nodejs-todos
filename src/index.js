const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const user = users.find((u) => u.username == username);

  if (user)
    return response.status(400).json({ error: "Invalid username: taken" });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { todos } = user;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { title, deadline } = request.body;
    const { todo } = request;

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.json(todo);
  }
);

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;

// Middlewares

function checksExistsUserAccount(request, response, next) {
  const user = users.find(byMatchingProp("username")(request.headers)(isEqual));

  if (!user)
    return response.status(404).json({
      error: "Invalid username: not found",
    });

  request.user = user;

  next();
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const todo = user.todos.find(byMatchingProp("id")(request.params)(isEqual));

  if (!todo)
    return response.status(404).json({
      error: "Invalid task ID: not found",
    });

  request.todo = todo;

  next();
}

// Library

// Array callbacks
function byMatchingProp(property) {
  return function matchingPredicate(target) {
    return function predicateFunc(fn) {
      return function applyPredicate(item) {
        return fn(item[property], target[property]);
      };
    };
  };
}

function isEqual(a, b) {
  return a == b;
}

function isGreater(a, b) {
  return a > b;
}

function isLess(a, b) {
  return a < b;
}

function isGreaterOrEqual(a, b) {
  return a >= b;
}

function isLessOrEqual(a, b) {
  return a <= b;
}
