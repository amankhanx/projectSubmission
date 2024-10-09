// Open (or create) the "TodoListDB" database
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
  console.log("Object store and indexes created.");
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log("Database opened successfully");

  // Call the function to populate the database with 100,000 tasks
  populateDatabase();
};

request.onerror = function(event) {
  console.error("Database error: ", event.target.error);
};

// Function to populate the database with 100,000 entries
function populateDatabase() {
  let transaction = db.transaction("TodoList", "readwrite");
  let objectStore = transaction.objectStore("TodoList");

  for (let i = 1; i <= 100000; i++) {
    // Set first 1000 tasks to "completed" status, and the rest to "in progress"
    let status = i <= 1000 ? "completed" : "in progress"; 
    let task = `Task #${i}`;
    let dueDate = new Date(2024, 8, Math.floor(Math.random() * 30) + 1); // Random date in Sept 2024

    // Add task object to the store
    objectStore.add({
      id: i,
      task: task,
      status: status,
      dueDate: dueDate.toISOString().split('T')[0] // Store date as YYYY-MM-DD
    });
  }

  transaction.oncomplete = function() {
    console.log("Database populated successfully with 100,000 entries.");
  };

  transaction.onerror = function(event) {
    console.error("Database transaction error: ", event.target.error);
  };
}
