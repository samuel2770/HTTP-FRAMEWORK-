const http = require('http');

class App {
    constructor() {
        this.routes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
    }

    // Register routes
    get(path, handler) { this.routes.GET[path] = handler; }
    post(path, handler) { this.routes.POST[path] = handler; }
    put(path, handler) { this.routes.PUT[path] = handler; }
    delete(path, handler) { this.routes.DELETE[path] = handler; }

    // Match exact routes or dynamic routes (e.g., /items/:id)
    matchRoute(method, url) {
        if (this.routes[method][url]) {
            return { handler: this.routes[method][url], params: {} };
        }

        for (let route in this.routes[method]) {
            if (route.includes(':')) {
                const routeParts = route.split('/');
                const urlParts = url.split('/');

                if (routeParts.length === urlParts.length) {
                    let match = true;
                    let params = {};
                    
                    for (let i = 0; i < routeParts.length; i++) {
                        if (routeParts[i].startsWith(':')) {
                            params[routeParts[i].substring(1)] = urlParts[i];
                        } else if (routeParts[i] !== urlParts[i]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) return { handler: this.routes[method][route], params };
                }
            }
        }
        return null;
    }

    // Extract JSON body from incoming requests
    parseBody(req) {
        return new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                if (body) {
                    try { resolve(JSON.parse(body)); } 
                    catch (e) { resolve({}); }
                } else {
                    resolve({});
                }
            });
        });
    }

    listen(port, callback) {
        const server = http.createServer(async (req, res) => {
            // Helper to send consistent JSON responses
            res.json = (statusCode, data) => {
                res.writeHead(statusCode, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
            };

            req.body = await this.parseBody(req);
            const urlPath = req.url.split('?')[0]; // Ignore query strings for now
            const matched = this.matchRoute(req.method, urlPath);

            if (matched) {
                req.params = matched.params;
                try {
                    await matched.handler(req, res);
                } catch (error) {
                    console.error(error);
                    res.json(500, { success: false, error: 'Internal Server Error' });
                }
            } else {
                res.json(404, { success: false, error: 'Route not found' });
            }
        });

        server.listen(port, callback);
    }
}

module.exports = App;