// Open (or create) the TodoListDB database
const dbName = "TodoListDB";
let db;

// Open the IndexedDB connection and handle database setup and upgrades
let request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;

  // Create the "TodoList" object store with "id" as the primary key
  let objectStore = db.createObjectStore("TodoList", { keyPath: "id" });
  objectStore.createIndex("task", "task", { unique: false });
  objectStore.createIndex("status", "status", { unique: false });
  objectStore.createIndex("dueDate", "dueDate", { unique: false });

  // Create the "TodoListCompleted" object store for completed tasks
  let completedStore = db.createObjectStore("TodoListCompleted", { keyPath: "id" });
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log("Database opened successfully");

  // Call the function to populate the database
  populateDatabase();
};

request.onerror = function(event) {
  console.error("Database error: ", event.target.error);
};

// Step 1: Populate the database with 100,000 entries
function populateDatabase() {
  let transaction = db.transaction("TodoList", "readwrite");
  let objectStore = transaction.objectStore("TodoList");

  for (let i = 1; i <= 100000; i++) {
    let status = i <= 1000 ? "completed" : "in progress"; // Set first 1000 to completed
    let task = "Task #" + i;
    let dueDate = new Date(2024, 8, Math.floor(Math.random() * 30) + 1); // Random date in Sept 2024

    objectStore.add({
      id: i,
      task: task,
      status: status,
      dueDate: dueDate.toISOString().split('T')[0] // Store date as YYYY-MM-DD
    });
  }

  transaction.oncomplete = function() {
    console.log("Database populated successfully");
  };

  transaction.onerror = function(event) {
    console.error("Database transaction error: ", event.target.error);
  };
}

// Step 2: Measure time to read all completed tasks
function measureReadTime() {
  let transaction = db.transaction("TodoList", "readonly");
  let objectStore = transaction.objectStore("TodoList");

  let start = performance.now();
  let completedTasks = [];

  let index = objectStore.index("status");
  let request = index.openCursor("completed");

  request.onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      completedTasks.push(cursor.value);
      cursor.continue();
    } else {
      let end = performance.now();
      console.log(`Time to read completed tasks: ${end - start} ms`);
    }
  };

  request.onerror = function(event) {
    console.error("Read error: ", event.target.error);
  };
}

// Step 3: Measure time to read all completed tasks with a read-only flag
function measureReadTimeWithReadonlyFlag() {
  let transaction = db.transaction("TodoList", "readonly");
  let objectStore = transaction.objectStore("TodoList");

  let start = performance.now();
  let completedTasks = [];

  let index = objectStore.index("status");
  let request = index.openCursor("completed");

  request.onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      completedTasks.push(cursor.value);
      cursor.continue();
    } else {
      let end = performance.now();
      console.log(`Time to read completed tasks with read-only flag: ${end - start} ms`);
    }
  };

  request.onerror = function(event) {
    console.error("Read error: ", event.target.error);
  };
}

// Step 4: Create index on the "status" field and measure read time again
function createIndexAndMeasureReadTime() {
  let transaction = db.transaction("TodoList", "readonly");
  let objectStore = transaction.objectStore("TodoList");

  let start = performance.now();
  let completedTasks = [];

  let index = objectStore.index("status");
  let request = index.openCursor("completed");

  request.onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      completedTasks.push(cursor.value);
      cursor.continue();
    } else {
      let end = performance.now();
      console.log(`Time to read completed tasks using index: ${end - start} ms`);
    }
  };

  request.onerror = function(event) {
    console.error("Read error: ", event.target.error);
  };
}

// Step 5: Copy all completed tasks to "TodoListCompleted"
function copyCompletedTasks() {
  let transaction = db.transaction(["TodoList", "TodoListCompleted"], "readwrite");
  let todoListStore = transaction.objectStore("TodoList");
  let completedStore = transaction.objectStore("TodoListCompleted");

  let request = todoListStore.index("status").openCursor("completed");

  request.onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      completedStore.add(cursor.value);
      cursor.continue();
    } else {
      console.log("All completed tasks copied to TodoListCompleted");
    }
  };

  request.onerror = function(event) {
    console.error("Error copying completed tasks: ", event.target.error);
  };
}

// Step 6: Measure time to read all tasks from "TodoListCompleted"
function measureReadTimeFromCompletedStore() {
  let transaction = db.transaction("TodoListCompleted", "readonly");
  let objectStore = transaction.objectStore("TodoListCompleted");

  let start = performance.now();
  let completedTasks = [];

  let request = objectStore.openCursor();

  request.onsuccess = function(event) {
    let cursor = event.target.result;
    if (cursor) {
      completedTasks.push(cursor.value);
      cursor.continue();
    } else {
      let end = performance.now();
      console.log(`Time to read all tasks from TodoListCompleted: ${end - start} ms`);
    }
  };

  request.onerror = function(event) {
    console.error("Read error from TodoListCompleted: ", event.target.error);
  };
}

// After populating the database, call the following functions to perform each step as required
// measureReadTime();
// measureReadTimeWithReadonlyFlag();
// createIndexAndMeasureReadTime();
// copyCompletedTasks();
// measureReadTimeFromCompletedStore();
