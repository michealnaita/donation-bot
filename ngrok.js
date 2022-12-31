const ngrok = require('ngrok');
const nodemon = require('nodemon');

(async () => {
  try {
    const url = await ngrok.connect({
      proto: 'http',
      addr: '8080',
    });
    nodemon('./app/src/app.ts')
      .on('crash', () => {
        console.error('Nodemon process crashed');
        ngrok.kill();
        process.exit(1);
      })
      .on('start', () => {
        console.log('Nodemon: App has started');
        console.log('External url: %s', url);
      })
      .on('quit', () => {
        console.log('Closing nodemon process...');
        process.exit(0);
      });
  } catch (err) {
    console.error('Error initializing ngrok: ', err);
    process.exitCode = 1;
  }
})();
