const express = require("express");

const app = express();

app.use(express.json());

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const datefns = require("date-fns");

const format = require("date-fns/format");

const isValid = require("date-fns/isValid");

const toDate = require("date-fns/toDate");

let db = null;

let path = require("path");

let dbPath = path.join(__dirname, "todoApplication.db");

const initializingDbAndServer = async function () {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, function () {
      console.log("Server running at http://localhost:3002/");
    });
  } catch (err) {
    console.log("DB Error : err.message");
    process.exit(1);
  }
};

initializingDbAndServer();

const hasCategoryProperty = function (request) {
  return request.category !== undefined;
};

const hasPriorityProperty = function (request) {
  return request.priority !== undefined;
};

const hasStatusProperty = function (request) {
  return request.status !== undefined;
};

const hasDateProperty = function (request) {
  return request.date !== undefined;
};

const hasDueDateProperty = function (request) {
  return request.dueDate !== undefined;
};

const validateRequestQueries = async function (request, response, next) {
  const { search_q = "", category, priority, status, date } = request.query;
  switch (true) {
    case hasStatusProperty(request.query):
      const statusPossibleValArray = ["TO DO", "IN PROGRESS", "DONE"];
      const statusIsInArray = statusPossibleValArray.includes(status);
      if (statusIsInArray === true) {
        request.status = status;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasCategoryProperty(request.query):
      const categoryPossibleValArray = ["WORK", "HOME", "LEARNING"];
      const categoryIsInArray = categoryPossibleValArray.includes(category);
      if (categoryIsInArray === true) {
        request.category = category;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriorityProperty(request.query):
      const priorityPossibleValArray = ["HIGH", "MEDIUM", "LOW"];
      const priorityIsInArray = priorityPossibleValArray.includes(priority);
      if (priorityIsInArray === true) {
        request.priority = priority;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasDateProperty(request.query):
      const requestedDate = new Date(date);
      const isValidDate = await isValid(requestedDate);
      if (isValidDate === true) {
        const formattedDate = format(requestedDate, "yyyy-MM-dd");
        request.date = formattedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
  next();
};

const validateRequestBody = async function (request, response, next) {
  const {
    id = "",
    todo = "",
    category,
    priority,
    status,
    dueDate,
  } = request.body;
  switch (true) {
    case hasStatusProperty(request.body):
      const statusPossibleValArray = ["TO DO", "IN PROGRESS", "DONE"];
      const statusIsInArray = statusPossibleValArray.includes(status);
      if (statusIsInArray === true) {
        request.status = status;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasCategoryProperty(request.body):
      const categoryPossibleValArray = ["WORK", "HOME", "LEARNING"];
      const categoryIsInArray = categoryPossibleValArray.includes(category);
      if (categoryIsInArray === true) {
        request.category = category;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriorityProperty(request.body):
      const priorityPossibleValArray = [" HIGH", "MEDIUM", "LOW"];
      const priorityIsInArray = priorityPossibleValArray.includes(priority);
      if (priorityIsInArray === true) {
        request.priority = priority;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasDueDateProperty(request.body):
      const requestedDueDate = new Date(dueDate);
      const isValidDate = await isValid(requestedDueDate);
      if (isValidDate === true) {
        const formattedDueDate = format(requestedDueDate, "yyyy-MM-dd");
        request.dueDate = formattedDueDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
  next();
};

//API 1
app.get("/todos/", validateRequestQueries, async function (request, response) {
  const {
    status = "",
    category = "",
    priority = "",
    search_q = "",
  } = request.query;
  const getTodosQuery = `
    SELECT
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
    FROM
        todo
    WHERE
        todo LIKE '%${search_q}%' AND status LIKE '%${status}%'
        AND priority LIKE '%${priority}%' AND category LIKE '%${category}%'`;
  const allTodosArr = await db.all(getTodosQuery);
  response.send(allTodosArr);
});

//API 2
app.get(
  "/todos/:todoId/",
  validateRequestQueries,
  async function (request, response) {
    const { todoId } = request.params;
    const getATodoQuery = `
    SELECT
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
    FROM
        todo
    WHERE
        id LIKE '%${todoId}%'`;
    const searchedTodo = await db.get(getATodoQuery);
    response.send(searchedTodo);
  }
);

//API 3
app.get("/agenda/", validateRequestQueries, async function (request, response) {
  const { date } = request.query;
  console.log(date);
  const getTodosQuery = `
    SELECT
        id,
        todo,
        priority,
        status,
        category,
        due_date AS dueDate
    FROM
        todo
    WHERE
        due_date LIKE '%${date}%'`;
  const todosArr = await db.all(getTodosQuery);
  response.send(todosArr);
});

module.exports = app;
