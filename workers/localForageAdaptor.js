'use strict'

{
    // Error messages that trigger a switch to the in-memory store fallback, by regex to avoid relying on case or punctuation.
    // NOTE: Edge with all cookies blocked doesn't seem to throw any errors - presumably it has its own in-memory fallback or clears storage automatically.
    const CRITICAL_ERRORS = [
        /no available storage method found/i,
        /an attempt was made to break through the security policy of the user agent/i,
        /the user denied permission to access the database/i,                               // Chrome with cookies blocked
        /a mutation operation was attempted on a database that did not allow mutations/i,   // Firefox with "never remember history"
        /idbfactory\.open\(\) called in an invalid security context/i                       // Safari with "Block all cookies" enabled
    ];

    const memoryStorage = new WeakMap();
    let isInMemory = false;

	// Default in-memory storage to enabled if indexedDB is not defined. This has come up in crash reports for Edge 18.
	// It's not clear under which circumstances this happens (the browser's own 'Block cookies' setting does not remove indexedDB),
	// but perhaps there is some browser extension or more obscure Windows setting that removes it.
	if (typeof indexedDB === "undefined")
	{
		isInMemory = true;
		console.warn("Unable to use local storage because indexedDB is not defined");
	}

    function NOT_IMPLEMENTED(name)
    {
        throw new Error(`"${name}" is not implemented`);
    }

    function DISALLOW_CALLBACK(fn)
    {
        if (typeof fn === "function")
            throw new Error(`localforage callback API is not implemented; please use the promise API instead`);
    }

    function StructuredClone(value)
    {
        /* HACK (iain)
         * see issue on structured clone https://github.com/whatwg/html/issues/793
         * I'm unsure if spawning message channel objects like this
         * has any long term effects, but this seems to be the suggested
         * workaround. If it proves to be problematic then we can leverage
         * the serialization tech from my FreezeDry library
         */
        if (typeof value === "object")
        {
            return new Promise(resolve => {
                const {port1, port2} = new MessageChannel();
                port2.onmessage = ev => resolve(ev.data);
                port1.postMessage(value);
            });
        }
        else
        {
            // Short-circuit to clone primitives without a MessageChannel round trip
            return Promise.resolve(value);
        }
    }

    class ForageAdaptor {
        constructor (inst) {
            this._inst = inst; 
            memoryStorage.set(this, new Map())
        }

        // Switch to using an in-memory store if the error message matches a list of error messages known to be fatal
        _MaybeSwitchToMemoryFallback(err)
        {
            if (isInMemory)
                return;     // already using fallback
            
            for (const regex of CRITICAL_ERRORS)
            {
                if (regex.test(err.message))
                {
                    console.error("Unable to use local storage, reverting to in-memory store: ", err, err.message);
                    isInMemory = true;
                    break;
                }
            }
        }
        
        async _getItemFallback(name)
        {
            const value = memoryStorage.get(this).get(name);
            const ret = await StructuredClone(value);

            // As with getItem(), convert undefined to null
            return (typeof ret === "undefined" ? null : ret);
        }

        async _setItemFallback(name, value)
        {
            value = await StructuredClone(value);
            memoryStorage.get(this).set(name, value);
        }

        _removeItemFallback(name)
        {
            memoryStorage.get(this).delete(name);
        }

        _clearFallback()
        {
            memoryStorage.get(this).clear();
        }

        _keysFallback()
        {
            return Array.from(memoryStorage.get(this).keys());
        }

        IsUsingFallback()
        {
            return isInMemory;
        }

        async getItem(key, successCallback)
        {
            DISALLOW_CALLBACK(successCallback);

            if (isInMemory)
                return await this._getItemFallback(key);

            let result;
            try {
                result = await this._inst.get(key);
            }
            catch (err)
            {
                // Read failed - maybe switch to in-memory fallback if known fatal error
                this._MaybeSwitchToMemoryFallback(err);

                // If fallback happened, return from in-memory store
                if (isInMemory)
                {
                    return await this._getItemFallback(key);
                }
                // An error occurred reading from storage, but it did not cause a switch to the in-memory store.
                // This should not normally happen - if anything goes wrong with the database then the kvStorage
                // retry mechanism ought to resolve it. To avoid callers having to handle rare failures in reading
                // items, simply return null as if the item does not exist, but log the error for diagnostics.
                else
                {
                    console.error(`Error reading '${key}' from storage, returning null: `, err);
                    return null;
                }
            }

            // As localforage does, convert an undefined result to null.
            return (typeof result === "undefined" ? null : result);
        }

        async setItem(name, value, successCallback)
        {
            DISALLOW_CALLBACK(successCallback);

            // As localforage does, convert undefined to null.
            if (typeof value === "undefined")
                value = null;

            if (isInMemory)
            {
                await this._setItemFallback(name, value);
                return;
            }

            try {
                await this._inst.set(name, value);
            }
            catch (err)
            {
                // Write failed - maybe switch to in-memory fallback if known fatal error
                this._MaybeSwitchToMemoryFallback(err);

                // If fallback happened, write to in-memory store
                if (isInMemory)
                {
                    await this._setItemFallback(name, value);
                }
                // Otherwise allow the exception to propagate to the caller. The caller must handle possible exceptions,
                // since there are common types of errors thrown setting items, notably for when the storage quota is exceeded.
                else
                {
                    throw err;
                }
            }
        }

        async removeItem(name, successCallback)
        {
            DISALLOW_CALLBACK(successCallback);

            if (isInMemory)
            {
                this._removeItemFallback(name);
                return;
            }

            try {
                await this._inst.delete(name);
            }
            catch (err)
            {
                this._MaybeSwitchToMemoryFallback(err);

                // Treat as similar to the getItem case (i.e. non-fatal errors are just logged) since removing items shouldn't normally fail
                if (isInMemory)
                {
                    this._removeItemFallback(name);
                }
                else
                {
                    console.error(`Error removing '${key}' from storage: `, err);
                }
            }
        }

        async clear(successCallback)
        {
            DISALLOW_CALLBACK(successCallback);

            if (isInMemory)
            {
                this._clearFallback();
                return;
            }

            try {
                await this._inst.clear();
            }
            catch (err)
            {
                this._MaybeSwitchToMemoryFallback(err);

                // Treat as similar to the removeItem case
                if (isInMemory)
                    this._clearFallback();
                else
                    console.error(`Error clearing storage: `, err);
            }
        }

        async keys(successCallback)
        {
            DISALLOW_CALLBACK(successCallback);

            if (isInMemory)
                return this._keysFallback();

            let result = [];
            try {
                result = await this._inst.keys();
            }
            catch (err)
            {
                this._MaybeSwitchToMemoryFallback(err);

                if (isInMemory)
                {
                    return this._keysFallback();
                }
                // if a non-fatal error occurs calling keys(), log the error and fall back to returning an empty array
                else
                {
                    console.error(`Error getting storage keys: `, err);
                }
            }

            return result;
        }

        ready(successCallback)
        {
            DISALLOW_CALLBACK(successCallback);

            if (isInMemory)
                return Promise.resolve(true);       // in-memory store always ready
            else
                return this._inst.ready();
        }

        createInstance(options)
        {
            if (typeof options !== "object")
                throw new TypeError("invalid options object");

            const name = options["name"];

            if (typeof name !== "string")
                throw new TypeError("invalid store name");

            const inst = new KVStorageContainer(name);
            return new ForageAdaptor(inst);
        }

        ////////////////////////////////////////////////////////
        // Unimplemented API call stubs
        length(successCallback)
        {
            NOT_IMPLEMENTED("localforage.length()");
        }
        key(index, successCallback)
        {
            NOT_IMPLEMENTED("localforage.key()");
        }
        iterate(iteratorCallback, successCallback)
        {
            NOT_IMPLEMENTED("localforage.iterate()");
        }
        setDriver(driverName)
        {
            NOT_IMPLEMENTED("localforage.setDriver()");
        }
        config(options)
        {
            NOT_IMPLEMENTED("localforage.config()");
        }
        defineDriver(customDriver)
        {
            NOT_IMPLEMENTED("localforage.defineDriver()");
        }
        driver()
        {
            NOT_IMPLEMENTED("localforage.driver()");
        }
        supports(driverName)
        {
            NOT_IMPLEMENTED("localforage.supports()");
        }
        dropInstance()
        {  
            NOT_IMPLEMENTED("localforage.dropInstance()");
        }
    };

    self.localforage = new ForageAdaptor(new KVStorageContainer("localforage"));
}

