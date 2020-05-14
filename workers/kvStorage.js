"use strict";
{
    /*
        Key -> Value store inspired by KV Storage proposal
        Intended to be compatible with existing localforage databases
  


        IndexedDB usage 101

        As indexeddb is something we rarely use directly, I'm adding a little
        guide here to help us remember how it works. Will hopefully make maintenance
        a little easier.

        First thing to know is that pretty much everything is async, but
        predates promises. So most things return IDBRequest objects, these
        emit success and error events when the request is complete.
        
        Databases are opened/created by calling indexeddb.openDatabase with a
        name and optional version number. This will return a IDBRequest. If the
        version number is higher than the current DB then the request will emit a
        "versionchange" event. The "versionchange" event is the only place you
        can change the DB structure, so creating an IDBObjectStore has to
        be done here. If an older version is still open in another tab then it
        will emit a "blocked" event instead.

        Once you have a IDBDatabase all interaction with it is via transactions.
        IDBTransactions can be created in "readwrite" or "readonly" mode, and you
        must specify which objectstores you want to access ahead of time.
        Transactions are created syncronously but complete asyncronously, they
        do not derive from IDBRequest but instead emit "complete", "error" and
        "abort" events. Once the current macro task ends the transaction will
        close automatically, so do any async work BEFORE opening the transaction
        or use multiple transactions to avoid this common gotcha.
        
        IDBTransaction has the method "objectStore" which allows you to get a
        IDBObjectStore reference. It's pretty much the only method on the
        transaction object. Nearly every method you want is on IDBObjectStore
        and returns a IDBRequest. Most methods are fairly easy to use, do thing
        and result is the value of the request. Other methods return indexes or
        cursors, they are quite complicated so try and avoid them if you can.
    */

    const VERSION = 2;                          // matches localforage
    const STORE_NAME = "keyvaluepairs";         // matches localforage
    const DATABASE_PROMISE_MAP = new Map();     // name -> database promise

    // creates a promise representing a IDBRequest
    function asyncifyRequest (request)
    {
        return new Promise((res, rej) => {
            request.onsuccess = () => res(request.result);
            request.onerror = () => rej(request.error);
        });
    }

    // creates a promise representing a IDBTransaction
    function asyncifyTransaction (tx)
    {
        return new Promise((res, rej) => {
            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
            tx.onabort = () => rej(tx.error);
        });
    }

    function openReadOnlyTransaction (name, method)
    {
        return openTransaction(name, method);
    }

    function openWriteTransaction (name, method)
    {
        return openTransaction(name, method, true);
    }

    async function openTransaction (name, method,  write = false, allowRetry = true)
    {
        // get database connection for name (opens connection if required)
        const db = await lazyOpenDatabase(name);

        try
        {
            // attempt to create a transaction on the database
            const tx = db.transaction([ STORE_NAME ], write ? "readwrite" : "readonly");
            return method(tx);
        }
        catch (err)
        {
            // if the database connection is broken then creating the transaction
            // will fail with an InvalidStateError. In this situation we
            // ditch the connection, and retry creating the transaction
            if (allowRetry && err["name"] === "InvalidStateError")
            {
                DATABASE_PROMISE_MAP.delete(name); // release reference to database
                return openTransaction(name, method, write, false);
            }
            else
            {
                throw err;
            }
        }
    }

    // get a IDBDatabase for a name
    // this will trigger a database connection/creation if it is not already open
    function lazyOpenDatabase (name)
    {
        RequireString(name);

        let dbPromise = DATABASE_PROMISE_MAP.get(name);
        if (!(dbPromise instanceof Promise))
        {
            dbPromise = openDatabase(name);
            DATABASE_PROMISE_MAP.set(name, dbPromise);
            // if we fail to open the database then remove the promise from the map
            dbPromise.catch(err => DATABASE_PROMISE_MAP.delete(name));
        }
        return dbPromise;
    }

    // open a IDBDatabase for a name
    // this will create the database if it doesn't exist
    async function openDatabase (name)
    {
        RequireString(name);

        const openRequest = indexedDB.open(name, VERSION);

        openRequest.addEventListener("upgradeneeded", e => {
            try
            {
                // this shouldn't ever fail, but as this is outside the call chain 
                // it makes sense to wrap it to prevent unhandled rejected promises
                const db = e.target.result;
                db.createObjectStore(STORE_NAME);
            }
            catch (err)
            {
                console.error(`Failed to create objectstore for database ${name}`, err);
            }
        });

        return asyncifyRequest(openRequest);
    }

    function RequireString (x)
    {
        if (typeof x !== "string")
			throw new TypeError("expected string");
    }

    /*
    *  this is our publically exposed class
    *  it doesn't actually hold reference to the database - just its name
    * 
    *  creating the class doesn't open/create the database
    *  that is lazily done when a method is called
    */
    class KVStorageContainer
    {
        constructor (name)
        {
            RequireString(name);
            this.name = name;
        }
        async ready ()
        {
            await lazyOpenDatabase(this.name);
        }
        set (key, value)
        {
            RequireString(key);

            return openWriteTransaction(this.name, async tx =>
            {
                const request = tx.objectStore(STORE_NAME).put(value, key);
                const requestPromise = asyncifyRequest(request);
                const txPromise = asyncifyTransaction(tx);
                await Promise.all([txPromise, requestPromise]);
            });
        }
        get (key)
        {
            RequireString(key);

            return openReadOnlyTransaction(this.name, async tx =>
            {
                const request = tx.objectStore(STORE_NAME).get(key);
                const requestPromise = asyncifyRequest(request);
                const txPromise = asyncifyTransaction(tx);
                const [_, value] = await Promise.all([txPromise, requestPromise]);

                return value;
            });
        }
        delete (key)
        {
            RequireString(key);

            return openWriteTransaction(this.name, async tx =>
            {
                const request = tx.objectStore(STORE_NAME).delete(key);
                const requestPromise = asyncifyRequest(request);
                const txPromise = asyncifyTransaction(tx);
                await Promise.all([txPromise, requestPromise]);
            });
        }
        clear ()
        {
            return openWriteTransaction(this.name, async tx =>
            {
                const request = tx.objectStore(STORE_NAME).clear();
                const requestPromise = asyncifyRequest(request);
                const txPromise = asyncifyTransaction(tx);
                await Promise.all([txPromise, requestPromise]);
            });
        }
        keys ()
        {
            return openReadOnlyTransaction(this.name, async tx =>
            {
                const request = tx.objectStore(STORE_NAME).getAllKeys();
                const requestPromise = asyncifyRequest(request);
                const txPromise = asyncifyTransaction(tx);
                const [_, value] = await Promise.all([txPromise, requestPromise]);

                return value;
            });
        }
        values ()
        {
            return openReadOnlyTransaction(this.name, async tx =>
            {
                const request = tx.objectStore(STORE_NAME).getAll();
                const requestPromise = asyncifyRequest(request);
                const txPromise = asyncifyTransaction(tx);
                const [_, value] = await Promise.all([txPromise, requestPromise]);

                return value;
            });
        }
        entries ()
        {
            return openReadOnlyTransaction(this.name, async tx =>
            {
                const requestKeys = tx.objectStore(STORE_NAME).getAllKeys();
                const requestKeysPromise = asyncifyRequest(requestKeys);
                const requestValues = tx.objectStore(STORE_NAME).getAll();
                const requestValuesPromise = asyncifyRequest(requestValues);
                const txPromise = asyncifyTransaction(tx);
                const [_, keys, values] = await Promise.all([txPromise, requestKeysPromise, requestValuesPromise]);

                const l = Math.min(keys.length, values.length); // should be the same, but take no chances
                const entries = [];

                for (let i = 0; i < l; i++)
                {
                    entries.push([keys[i], values[i]]);
                }

                return entries;
            });
        }
    }

    self.KVStorageContainer = KVStorageContainer;
}