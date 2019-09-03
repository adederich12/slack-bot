import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';

/// ///////
import Slack from './consumers/slack';

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(404);
});

const API = app.get('/api', (req, res) => {
  res.send("Don't access the API directly");
});

API.use('/api/slack', Slack());

/// ///////

export default {
  start: () => {
    const port = process.env.PORT || 1337;
    const server = http.createServer(app);
    server.listen(port, () => {
      console.log(`Dan bot running on port ${port}`);
    });
  },
};
