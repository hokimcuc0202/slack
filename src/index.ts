import {config} from './config'
import {Common} from './common'
import { router } from './router';
import bodyParser from 'body-parser';

const { createEventAdapter } = require('@slack/events-api');
const express = require('express');
const slackEvents = createEventAdapter(config.slack.signInSecret);
const http = require('http');

const port = process.env.PORT || 3000;
const app = express();
const common = new Common();

app.use('/slack/events', slackEvents.expressMiddleware());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);
 
slackEvents.on('message', async (event: any)=> {
    console.log(event);
  if (event.text && event.text.includes('list')) {
    try {   
        await common.sendListProductMessage(event.channel)
    } catch (error) {
        console.log(error)
    }
  }
});

slackEvents.on('error', console.error);

http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});