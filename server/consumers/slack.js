/* eslint-disable max-len */
import { WebClient } from '@slack/web-api';
import { Replacer } from '../../lib/replacer';
import express from 'express';
import asyncRoute from 'route-async';
import bodyParser from 'body-parser';
import slack from '../../lib/slack';
import bingImages from '../../lib/images';

import { UserMap } from '../../config/userMap';

export default () => {
  const router = express.Router();

  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: false }));

  const bot = {
    post: async (req, res) => {
      const body = req.body;
      const web = new WebClient(slack.getAuthToken());
      const replacer = new Replacer();

      if (body.type === 'url_verification') { // if this is endpoint verification return the challenge
        res.json({status: 200, challenge: body.challenge});
      } else if (body.type === 'event_callback') {
        // start by letting slack know we received the message and all is good
        res.status(200).end();

        let reactions = false;
        let search = '';
        const user = UserMap.lookupUserBySlackID(body.event.user);

        if (reactions = slack.hasMessageTrigger(body.event.text)) {
          reactions.forEach(function(reaction) {
            slack.addReaction(web, reaction, body.event.channel, body.event.ts);
          });
        }

        if (search = slack.hasSpecialTrigger(body.event.text)) {
        // if (false) {
          bingImages.fetchFirstImage(search)
          .then((result) => {
            if (result) {
              const randomImage = replacer.getRandom(result.value);
              slack.dispatchMessage(web, "Did someone say "+search+"??\n"+randomImage.thumbnailUrl);
            }
          })
          .catch((error) => {
            console.log(error);
          });
        }

        // should we insult someone?
        if (user && replacer.rollTheDice(user.odds.good)) {
          // console.log(replacer.getRandomPhrase(user.self.name));
          slack.dispatchMessage(web, replacer.getRandomPhrase(user.self.name));
        } else if (user && replacer.rollTheDice(user.odds.bad)) {
          // console.log(replacer.getRandomPhrase(user.self.name, "insult"));
          slack.dispatchMessage(web, replacer.getRandomPhrase(user.self.name, "insult"));
        } else if (user && replacer.rollTheDice(50)) {
          const searchTerm = replacer.getRandomThing();
          res.status(200).end();

          bingImages.fetchFirstImage(searchTerm)
          .then((result) => {
            if (result) {
              const randomImage = replacer.getRandom(result.value);
              const messageText = "I thought this image was pretty neat. What do you guys think?\n("+searchTerm+")\n"+randomImage.thumbnailUrl;
              slack.dispatchMessage(web, messageText);
            }
          })
          .catch((error) => {
            console.log(error);
          });
        }
      } else {
        if (body.command === '/random-script') {
          res.json(slack.buildScriptConfirm(replacer.getGeneratedScript()));
        } else if (body.command === '/random-image') {
          res.status(200).end();
          const user = UserMap.lookupUserBySlackID(body.user_id);
          const searchTerm = replacer.getRandomThing();

          bingImages.fetchFirstImage(searchTerm)
          .then((result) => {
            if (result) {
              const randomImage = replacer.getRandom(result.value);
              slack.dispatchMessage(web, user.self.name+" asked me to show you this "+searchTerm+": \n"+randomImage.thumbnailUrl);
            }
          })
          .catch((error) => {
            res.status(500).end();
            console.log(error);
          });
        } else {
          const payload = JSON.parse(body.payload);
          const buttonClick = payload.actions[0];
          switch (buttonClick.name) {
            case 'post':
              res.status(200).end();
              slack.dispatchMessage(web, buttonClick.value)
              .then(function() {
                slack.deleteMessage(web, payload.message_ts, payload.channel.id);
              });
              break;
            case 'new':
              res.json(slack.buildScriptConfirm(replacer.getGeneratedScript()));
              break;
            default:
              slack.deleteMessage(web, payload.message_ts, payload.channel.id);
              res.status(200).end();
          }
          res.status(200).end();
        }
      }
    },
  }

  router.post('/slack-bot', asyncRoute(bot.post));

  return router;
};
