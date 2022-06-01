// create variable to hold db connection
let db;
const request = indexedDB.open('budget_tracker', 1);
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};
// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    if (navigator.onLine) {
        uploadTransaction();
    }
};
  
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["new_transactioin"], "readwrite");
    const transObjectStore = transaction.ObjectStore("new_transaction");
    transObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(["new_transaction"], "readwrite");
    const transObjectStore = transaction.ObjectStore("new_transaction");
    const getAll = transObjectStore.getAll();
    getAll,onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
            .then((response) => response.json())
            .then((serverResponse) => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(["new_transaction"], "readwrite");
                const transObjectStore = transaction.ObjectStore("new_transaction");
                transObjectStore.clear();
                alert("Your saved transactions have been submitted.");
            })
            .catch((err) => {
                console.log(err);
            })   
        }
    };
}

window.addEventListener("online", uploadTransaction);