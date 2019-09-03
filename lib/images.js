import timeUtils from './time-util';

const ImageSearchAPIClient = require('azure-cognitiveservices-imagesearch');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

const apiKey = 'API_KEY';
const credentials = new CognitiveServicesCredentials(apiKey);
const imageSearchApiClient = new ImageSearchAPIClient(credentials);

export default {
  safeSearch() {
    // if we're outside work hours, turn safe search off - otherwise keep it safe
    return { safeSearch: timeUtils.duringWorkHours() ? "Moderate" : "Off" };
  },

  async fetchFirstImage(query) {
    return await imageSearchApiClient.imagesOperations.search(query, this.safeSearch());
  }
};
