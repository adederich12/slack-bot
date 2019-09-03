import slackConfig from '../config/slack-config.json';
import wordMatch from './emoji-match.json';
import timeUtils from './time-util';

export default {
  getAuthToken: () => slackConfig.bot_token,

  hasMessageTrigger(message) {
    let result = false;

    if (message) {
      const words = message.split(" ");
      
      if (words.length > 0) {
        words.forEach(function(word) {
          const formatted = word.toLowerCase().replace(/\W/g, '');
          
          for (var prop in wordMatch) {
            if (wordMatch[prop].includes(formatted)) {
              if (!result) {
                result = [prop];
              } else if (!result.includes(prop)) {
                result.push(prop);
              }
            }
          }
        });
      }
    }

    return result;
  },

  hasSpecialTrigger(message) {
    let result = false;

    if (message) {
      const words = message.split(" ");
      
      if (words.length > 0) {
        words.forEach(function(word) {
          const formatted = word.replace(/\W/g, '');
          if (formatted.includes('CLOWN')) { // need to change this around so i could get the special words from a config or something
            result = 'clowns';
          }
        });
      }
    }

    return result;
  },

  buildImagePost(terms, url) {
    return {
      "text": "I thought this image was pretty neat. What do you guys think?",
      "attachments": [{
        "text": terms,
        "color": "#2eb886",
        "image_url": url,
      }]
    }
  },

  buildScriptConfirm(script) {
    return {
          "text": "Here is your exciting, 100% grammatically correct script:",
          "attachments": [
              {
                  "text": script,
                  "fallback": "You are unable to choose a script.",
                  "callback_id": "script_send",
                  "color": "#3AA3E3",
                  "attachment_type": "default",
                  "delete_original": true,
                  "actions": [
                      {
                          "name": "post",
                          "text": "Post",
                          "type": "button",
                          "value": script
                      },
                      {
                          "name": "new",
                          "text": "Next",
                          "type": "button",
                          "value": "next"
                      },
                      {
                          "name": "cancel",
                          "style": "danger",
                          "text": "Cancel",
                          "type": "button",
                          "value": "cancel"
                      }
                  ]
              }
          ]
      };
  },

  // dispatches a message to slack
  async dispatchMessage(webClient, payload = null, channel = null) {
    const chatChannel = (!channel) ? slackConfig.channel : channel;
    const chatText = (!payload) ? 'Check this out' : payload;
    
    await webClient.chat.postMessage({
      channel: chatChannel, 
      text: chatText,
    })
    .catch(err => console.error(err));
  },

  // dispatches a message to slack
  async deleteMessage(webClient, ts, channel = null) {
    const chatChannel = (!channel) ? slackConfig.channel : channel;
    
    await webClient.chat.delete({
      channel: chatChannel,
      ts: ts,
    })
    .catch(err => console.error(err));
  },

  // adds a reaction to the timestamped message in the designated channel
  async addReaction(webClient, reaction, channel, timestamp) {
    await webClient.reactions.add({
      name: reaction,
      channel: channel, 
      timestamp: timestamp,
    })
    .catch(err => console.error(err));
  }
};
