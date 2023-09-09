const NodeCache = require('node-cache');

const cache = new NodeCache();

module.exports = duration => (req, res, next) => {
    //check if the request method is "GET", return next if not 
    if (req.method != 'GET') {
        if (req.method == 'POST' || req.method == 'PUT' || req.method == 'PATCH' || req.method == 'DELETE') {
            console.log("Flushing cache due to change in database");
            cache.flushAll()
        }
        return next();
    }

    const userID = req.headers.jwt.userId;

    //generate the cache key with the original URL and the user ID
    const key = userID + '_' + req.originalUrl;

    //check if key exists in cache
    const cachedResponse = cache.get(key);

    //if there is cached data available, send it as the response
    if (cachedResponse) {
        //console.log(`Cached data for ${key}`);
        res.status(200).json(cachedResponse);
    }
    else {
        // if there is no cached data, modify send method to cache the data
        //console.log(`No cached data for ${key}`)
        res.originalJson = res.json
        res.json = body => {
            res.originalJson(body);
            cache.set(key, body, duration);
        };
        next();
    }
}