const moment = require('moment');

// NOTE List date to ban User
const rulesBan = {
  // ครั้งแรกแบน 3 วัน
  "1": 3,
  // ครั้งสองแบน 7 วัน
  "2": 7,
  // ครั้งสามแบน 15 วัน
  "3": 15,
  // ครั้งสี่แบน 30 วัน
  "4": 30,
  // ครั้งห้าแบนถาวร
  "5": -1
}


const ruleBlacklist = (timeStamp, counter) => {
  const valueUnBanned = rulesBan[counter] || 3
  if ((valueUnBanned === moment().diff(timeStamp, 'days')) && valueUnBanned !== -1) {
    return true
  }
  return false;
}

module.exports = { ruleBlacklist }