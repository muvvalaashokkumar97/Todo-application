const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(8080, () => {
      console.log(dbPath);
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const hasPriorityAndStatusProperties = (requestedQuery) => {
  return (
    requestedQuery.status !== undefined && requestedQuery.priority !== undefined
  );
};

const hasPriorityProperties = (requestedQuery) => {
  return;
  requestedQuery.priority !== undefined;
};

const hasStatusProperties = (requestedQuery) => {
  return;
  requestedQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodoQuery = `select * from todo where todo LIKE '%${search_q}%' and status = '${status}' and priority = '${priority}'`;
      break;
    case hasPriorityProperties(request.query):
      getTodoQuery = `select * from todo where todo LIKE '%${search_q}%' and priority = '${priority}'`;
      break;
    case hasStatusProperties(request.query):
      getTodoQuery = `select * from todo where todo LIKE '%${search_q}%' and status = '${status}'`;
      break;
    default:
      getTodoQuery = `select * from todo where todo LIKE '%${search_q}%'`;
      break;
  }
  data = await db.all(getTodoQuery);
  response.send(data);
});

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodo = `
  INSERT INTO
  todo (id,todo,priority, status)
  values (
        ${id},
       '${todo}',
      '${priority}',
      '${status}');`;
  await db.run(addTodo);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn;
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoRequest = `select * from todo where id = ${todoId}`;
  const previousTodo = await db.get(previousTodoRequest);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;
  const updateTodoDetails = `
  UPDATE todo
  set
  todo = '${todo}',
  priority ='${priority}',
  status ='${status}'
  where id = ${todoId}`;
  await db.run(updateTodoDetails);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const queryDetails = `
  delete from todo where id = ${todoId}`;
  await db.run(queryDetails);
  response.send("Todo Deleted");
});

module.exports = app;
