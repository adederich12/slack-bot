import slackConfig from '../config/slack-config.json';

export default {
  duringWorkHours() {
    const currentHour = new Date().getHours() - 4; // guess the server is in GMT
    return (currentHour >= slackConfig.work_hours.start_hour && currentHour <= slackConfig.work_hours.end_hour);
  },
};
