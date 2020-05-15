"use strict";

(function () {
	
	function OnRegisterSWError(e)
	{
		console.warn("Failed to register root service worker: ", e);
	};
	
	if (!navigator.serviceWorker)
		return;		// no SW support, ignore call
	
	try {
		navigator.serviceWorker.register("./root-sw.js", { scope: location.origin })
		.then(function (reg)
		{
			console.log("Registered root service worker on " + reg.scope);
		})
		.catch(OnRegisterSWError);
	}
	catch (e)
	{
		OnRegisterSWError(e);
	}
	
})();