/* editor/branches/branches.js */
editor.once('load', function () {

    // Make ajax request
    var request = function (args, callback) {
        Ajax(args)
        .on('error', function (status, err) {
            if (callback) callback(err);
        })
        .on('load', function (status, data) {
            if (callback) callback(null, data);
        });
    };

    // Load project branches
    // args.limit: the limit
    // args.skip: the number of entries to skip
    // args.closed: If true only return closed branches
    editor.method('branches:list', function (args, callback) {
        var url = '{{url.api}}/projects/{{project.id}}/branches';
        var separator = '?';
        if (args.limit) {
            url += separator + 'limit=' + args.limit;
            separator = '&';
        }

        if (args.skip) {
            url += separator + 'skip=' + args.skip;
            separator = '&';
        }

        if (args.closed) {
            url += separator + 'closed=true';
        }

        if (args.favorite) {
          url += separator + 'favorite=true';
        }

        request({
            url: url,
            auth: true
        }, callback);
    });

    // Creates a branch
    editor.method('branches:create', function (data, callback) {
        request({
            url: '{{url.api}}/branches',
            method: 'POST',
            data: data,
            auth: true
        }, callback);
    });

    // Checks out a branch
    editor.method('branches:checkout', function (id, callback) {
        request({
            url: '{{url.api}}/branches/' + id + '/checkout',
            method: 'POST',
            auth: true
        }, callback);
    });

    // Close branch
    editor.method('branches:close', function (id, callback) {
        request({
            url: '{{url.api}}/branches/' + id + '/close',
            method: 'POST',
            auth: true
        }, callback);
    });

    // Open branch
    editor.method('branches:open', function (id, callback) {
        request({
            url: '{{url.api}}/branches/' + id + '/open',
            method: 'POST',
            auth: true
        }, callback);
    });

    // Start merging branches
    editor.method('branches:merge', function (sourceId, destinationId, callback) {
        request({
            url: '{{url.api}}/merge',
            method: 'POST',
            auth: true,
            data: {
                srcBranchId: sourceId,
                dstBranchId: destinationId
            }
        }, callback);
    });

    // Apply merge
    editor.method('branches:applyMerge', function (mergeId, finalize, callback) {
        request({
            url: '{{url.api}}/merge/' + mergeId + '/apply',
            method: 'POST',
            data: {
                finalize: finalize
            },
            auth: true
        }, callback);
    });

    // Get a merge object by merge id including all of its conflicts
    editor.method('branches:getMerge', function (mergeId, callback) {
        request({
            url: '{{url.api}}/merge/' + mergeId,
            method: 'GET',
            auth: true
        }, callback);
    });

    // Resolve multiple conflicts
    editor.method('branches:resolveConflicts', function (mergeId, conflictIds, resolveData, callback) {
        var data = {
            mergeId: mergeId,
            conflictIds: conflictIds
        };
        for (var key in resolveData) {
            data[key] = resolveData[key];
        }

        request({
            url: '{{url.api}}/conflicts/resolve',
            method: 'POST',
            data: data,
            auth: true
        }, callback);
    });

    // Force stops a merge which deletes the merge and all of its conflicts
    editor.method('branches:forceStopMerge', function (mergeId, callback) {
        request({
            url: '{{url.api}}/merge/' + mergeId,
            method: 'DELETE',
            auth: true
        }, callback);
    });

    // Gets the current checked out branch from the server
    editor.method('branches:getCurrentBranch', function (callback) {
        request({
            url: `/editor/project/${config.project.id}/branch`,
            auth: true
        }, callback);
    });

    // Gets the contents of a conflict file
    editor.method('conflicts:getUnresolvedFile', function (mergeId, conflictId, filename, callback) {
        request({
            url: '{{url.api}}/merge/' + mergeId + '/conflicts/' + conflictId + '/file/' + filename,
            method: 'GET',
            auth: true,
            notJson: true
        }, callback);
    });

    // Gets the contents of a resolved conflict file
    editor.method('conflicts:getResolvedFile', function (mergeId, conflictId, filename, callback) {
        request({
            url: '{{url.api}}/merge/' + mergeId + '/conflicts/' + conflictId + '/file/' + filename + '?resolved=true',
            method: 'GET',
            auth: true,
            notJson: true
        }, callback);
    });


    // Uploads the specified file to resolve a conflict
    editor.method('conflicts:uploadResolvedFile', function (conflictId, file, callback) {
        var formData = new FormData();
        formData.append('file', file);

        request({
            url: '{{url.api}}/conflicts/' + conflictId + '/file',
            method: 'PUT',
            data: formData,
            auth: true,
            ignoreContentType: true,
            headers: {
                Accept: 'application/json'
            }
        }, callback);
    });

});
