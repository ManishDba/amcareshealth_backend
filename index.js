// Root entry point for deployment compatibility
// This file allows platforms like Render/Heroku to find the app entry point 
// if they default to looking for index.js in the root directory.

require('./src/index.js');
