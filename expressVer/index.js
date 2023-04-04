import express from 'express';
import http from 'http';

const app = express();
const server = http.Server(app);
const port = 3000;

import io from 'socket.io'(server);

server.get('/', (req, res) => res.send('Hello World!'));

server.listen(8080);
