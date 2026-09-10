/**
 * Root Entry Point for Deployment Services (Render, Railway, Heroku, etc.)
 * Resolves default deployment start commands (e.g. `node index.js`) by delegating to server/server.js
 */
require('./server/server.js');
