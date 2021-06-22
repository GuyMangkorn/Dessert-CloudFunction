const { nthRoot, sqrt, e, add } = require('mathjs');

const checkConnection = (item, currentUid) => {
  if (!isEmpty(item["connection"])) {
    return true
  } else {
    return ((isEmpty(item["connection"]["matches"]) ? !Object.prototype.hasOwnProperty.call(item["connection"]["matches"], currentUid) : true) &&
      (isEmpty(item["connection"]["yep"]) ? !Object.prototype.hasOwnProperty.call(item["connection"]["yep"], currentUid) : true) &&
      (isEmpty(item["connection"]["nope"]) ? !Object.prototype.hasOwnProperty.call(item["connection"]["nope"], currentUid) : true))
  }
}

const calculatePercent = (itemOpposite, currentItem) => {
  let listQAuid = [];
  let listQAother = [];
  let percentUid;
  let percentOther;
  let result = 0;
  let sumUID = 0;
  let sumOter = 0;
  let maxUID = 0;
  let maxOtherID = 0;
  if (Object.prototype.hasOwnProperty.call(currentItem, 'Questions')) {
    Object.values(currentItem['Questions']).forEach((item) => {
      listQAuid.push(item);
    })
    if (Object.prototype.hasOwnProperty.call(itemOpposite, 'Questions')) {
      for (var i = 0; i < listQAuid.length; i++) {
        var other = itemOpposite['Questions'][listQAuid[i].id];
        if (other !== null) {
          listQAother.push(other);
        }
      }
      for (var j = 0; j < listQAother.length; j++) {
        maxOtherID = maxOtherID + listQAother[j]['weight'];
        maxUID = maxUID + listQAuid[j]['weight'];
        if (listQAother[j]['question'] === listQAuid[j]['question']) {
          sumUID = sumUID + listQAother[j]['weight'];
          sumOter = sumOter + listQAuid[j]['weight'];
        }
      }
      percentUid = (sumUID / maxOtherID) * 100;
      percentOther = (sumOter / maxUID) * 100;
      result = sqrt(percentUid * percentOther);
      if (isNaN(result)) {
        result = 0;
      } else {
        var number_result = Math.floor(result);
      }
      return number_result
    } else {
      return number_result
    }
  }
  return 0
}

const getDistanceOpposite = (x_user, y_user, x_opp, y_opp) => {
  let lonlon = (Math.PI / 180) * (y_opp - y_user);
  let latlat = (Math.PI / 180) * (x_opp - x_user);
  let lat1r = (Math.PI / 180) * (x_user);
  let lat2r = (Math.PI / 180) * (x_opp);
  let R = 6371.0;
  let a = Math.sin(latlat / 2) * Math.sin(latlat / 2) + Math.cos(lat1r) * Math.cos(lat2r) * Math.sin(lonlon / 2) * Math.sin(lonlon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distance_other = R * c;
  return distance_other
}

const isEmpty = (obj) => {
  if (obj === null || obj === undefined) {
    return false
  }
  const bool = Object.keys(obj).length
  return bool > 0 ? true : false
}


module.exports = { isEmpty, checkConnection, getDistanceOpposite, calculatePercent }