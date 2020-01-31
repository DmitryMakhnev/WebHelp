// eslint-disable-next-line import/no-extraneous-dependencies
const handler = require('serve-handler');
const http = require('http');

const PORT = 3002;
const MIN_RESPONSE_DELAY = 65;
const MAX_RESPONSE_DELAY = 600;

function getRandomIntInInterval(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const server = http.createServer(
  (request, response) => new Promise(
    (resolve) => setTimeout(
      resolve,
      getRandomIntInInterval(MIN_RESPONSE_DELAY, MAX_RESPONSE_DELAY),
    ),
  ).then(
    () => handler(
      request,
      response,
      {
        public: './stub-server/public',
      },
    ),
  ),
);

server.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});
