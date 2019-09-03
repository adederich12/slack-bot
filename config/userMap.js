const users = [
  {
    self: {
      name: 'Alex',
    },
    slack: {
      userID: '#######',
      email: 'adederich13@gmail.com',
    },
    odds: {
      good: 1000,
      bad: 25,
    },
  },
];

exports.UserMap = {
  lookupUserByEmail: (email) => {
    email = `${email}`.toLowerCase();
    let user = users.filter(entry => entry.slack.email.toLowerCase() === email);
    return (user.length <= 0) ? null : user[0];
  },
  lookupUserBySlackID: (id) => {
    let user = users.filter(entry => entry.slack.userID === id);
    return (user.length <= 0) ? null : user[0];
  },
  lookupUserByName: (name) => {
    let user = users.filter(entry => entry.self.name === name);
    return (user.length <= 0) ? null : user[0];
  },
};
