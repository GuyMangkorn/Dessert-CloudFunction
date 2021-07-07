const { nthRoot, sqrt, e, add } = require('mathjs');
const functions = require('firebase-functions');
const axios = require('axios')
const admin = require('firebase-admin');
const { questionsFeedback, questionsRegister, questionStock } = require('./constant/questions');
const { checkConnection, getDistanceOpposite, calculatePercent, isEmpty, compareQuestion } = require('./utils/helper');
const { ruleBlacklist } = require('./utils/blacklist_rules');
admin.initializeApp();


const db = admin.database();

// SECTION Guy Functions


// NOTE closeAccount 

exports.closeAccount = functions.https.onCall(async (data, context) => {
  const userId = data.uid;
  // const userId = data.uid
  const ref = db.ref("Users");
  ref.child(userId).remove();
  const result = await admin.database().ref('/Users').once('value').then(snap => {
    snap.forEach((snapChild) => {
      const key = snapChild.key
      if (snapChild.child("connection").child("yep").hasChild(userId)) {
        ref.child(key).child("connection").child("yep").child(userId).remove();
      }
      if (snapChild.child("connection").child("nope").hasChild(userId)) {
        ref.child(key).child("connection").child("nope").child(userId).remove();
      }
      if (snapChild.child("connection").child("matches").hasChild(userId)) {
        ref.child(key).child("connection").child("nope").child(userId).remove();
      }
      if (snapChild.child("connection").child("chatna").hasChild(userId)) {
        ref.child(key).child("connection").child("chatna").child(userId).remove();
      }
      if (snapChild.child("see_profile").hasChild(userId)) {
        ref.child(key).child("see_profile").child(userId).remove();
      }
    })
    return { message: 'Success' }
  }).catch(e => {
    return {
      error: e
    }
  })
  return {
    result
  }
})

// NOTE adminRole

exports.adminRole = functions.https.onCall((data, context) => {
  return admin.auth().getUserByEmail(data.email).then(user => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    })
  }).then(() => {
    return {
      message: `Success! ${data.email} has been made an admin`
    }
  }).catch(err => {
    return err;
  });
});


// NOTE resetUsers

exports.resetUsers = functions.https.onRequest((req, res) => {
  const ref1 = db.ref().child('/Users/')
  return ref1.remove()
    .then(() => {
      res.send('Users removed')
      return true
    }).catch((error => {
      res.send(error)
    }))
})


// NOTE getUnreadChat

exports.getUnreadChat = functions.https.onCall((data, context) => {
  const uid = context.auth.uid;
  let listChatID = [];
  let listData = [];
  let result = [];
  let sum = 0;
  return admin.database().ref('/').once('value').then(snap => {
    if (snap.child("Users").child(uid).hasChild("connection"))
      if (snap.child("Users").child(uid).child("connection").hasChild("matches")) {
        snap.child("Users").child(uid).child("connection").child("matches").forEach((userSnapshot) => {
          const chatID = snap.child("Users").child(uid).child("connection").child("matches").child(userSnapshot.key).child("ChatId").val();
          listChatID.push(chatID);
        });
        for (let i = 0; i < listChatID.length; i++) {
          snap.child("Chat").child(listChatID[i]).forEach((chatSnapshot) => {
            const data = snap.child("Chat").child(listChatID[i]).child(chatSnapshot.key).val();
            listData.push(data);
          });
        }
        result = listData.filter((element) => {
          return element.read === 'Unread';
        });
        for (let j = 0; j < result.length; j++) {
          if (result[j]['createByUser'].toString() !== uid.toString()) {
            sum = sum + 1;
          }
        }
      }
    return { resultSum: sum };
  });
});

// NOTE getPercentageMatching

exports.getPercentageMatching = functions.https.onCall((data, context) => {
  var uid = context.auth.uid;
  var listQAuid = [];
  var listQAother = [];
  var percentUid;
  var percentOther;
  var result_list = [];
  var result = 0;
  var dictionary;
  var sumUID = 0;
  var sumOter = 0;
  var maxUID = 0;
  var maxOtherID = 0;
  return admin.database().ref('/Users/').once('value').then(snap => {
    if (snap.child(uid).hasChild("Questions")) {
      snap.child(uid).child('Questions').forEach((snapid) => {
        var dd = snap.child(uid).child('Questions').child(snapid.key).val();
        listQAuid.push(dd);
      });
      snap.forEach((userSnapshot) => {
        if (userSnapshot.hasChild("Questions") && userSnapshot.key !== uid) {
          //console.log("value",userSnapshot.key);
          for (var i = 0; i < listQAuid.length; i++) {
            var other = snap.child(userSnapshot.key).child('Questions').child(listQAuid[i]['id']).val();
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
          var object = { uid: userSnapshot.key, result: number_result };
          result_list.push(object);
          listQAother = [];
          sumUID = 0;
          sumOter = 0;
          maxUID = 0;
          maxOtherID = 0;
        }
      });
      if (result_list.length > 0) {
        dictionary = Object.assign({}, ...result_list.map((x) => ({ [x.uid]: x.result })));
        return { dictionary };
      } else {
        dictionary = { "data": 0 };
        return { dictionary };
      }
    } else {
      dictionary = { "data": 0 };
      console.log("dictionary", "null");
      return { dictionary };
    }
  });
});

// NOTE getQuestions

exports.addQuestions = functions.https.onCall((data, context) => {
  var listQuestion = [];
  var listQuestionFinal;
  var allQuestion;
  var listQuestionAlready = [];
  return admin.database().ref('/').once('value').then(snap => {
    if (data.type === "RegisterQuestion") {
      allQuestion = snap.child("QuestionRegister").child(data.language).val();
      return { questions: allQuestion }
    } else {
      var uid = context.auth.uid;
      snap.child('Users').child(uid).child('Questions').forEach((answerQuestion) => {
        listQuestionAlready.push(answerQuestion.key);
      });
      snap.child("Question").child(data.language).forEach((questionSnapshot) => {
        if (!listQuestionAlready.includes(questionSnapshot.key)) {
          const key = questionSnapshot.key;
          const obj = snap.child('Question').child(data.language).child(key).val();
          const object = { id: questionSnapshot.key, result: obj };
          listQuestion.push(object);
        }
      });
      listQuestionFinal = Object.assign({}, ...listQuestion.map((x) => ({ [x.id]: x.result })));
      console.log("size_Question", listQuestion.length.toString());
      if (listQuestion.length > 0) {
        return { questions: listQuestionFinal }
      } else {
        listQuestionFinal = { "id": 0 }
        return { questions: listQuestionFinal }
      }
    }
  });
});

// NOTE addRandomUsers


const fetchData = () => {
  return new Promise((resolve, reject) => {
    axios.get('https://randomuser.me/api/?results=50').then((response) => {
      return resolve(response.data.results)
    }).catch(e => {
      return reject(e)
    })
  })
}


exports.addRandomUsers = functions.https.onRequest(async (request, response) => {
  try {
    const questionId = ["-McjjpPQkPETdWc4IR2D", "-McjjpPTrKk0gVfBnjle", "-McjjpPUMzbjl8oGVkAb", "-McjjpPUMzbjl8oGVkAc", "-McjjpPV5GS0xirzNRzb",
      "-McjjpPV5GS0xirzNRzc", "-McjjpPV5GS0xirzNRzd", "-McjjpPV5GS0xirzNRze", "-McjjpPWF86Gx759iHYN", "-McjjpPWF86Gx759iHYO",];
    const weight = [1, 10, 100, 150, 250];
    const result = await fetchData();
    result.forEach((item, index) => {
      const uid = item.login.username
      db.ref(`Users/${uid}`).set({
        'Age': item.dob.age > 60 ? 45 : (item.dob.age - 10) < 23 ? 23 : (item.dob.age - 10),
        'birth': 909100800000,
        'date': new Date().getTime(),
        'name': (item.name.first || "Mark") + " " + (item.name.last || "Johnson"),
        'sex': item.gender === 'female' ? "Female" : "Male",
        "Distance": "Untitled",
        "MaxAdmob": 10,
        "MaxChat": 20,
        "MaxLike": 20,
        "MaxStar": 5,
        "OppositeUserAgeMax": 70,
        "OppositeUserAgeMin": 18,
        "OppositeUserSex": "All",
        "Vip": 0,
        "status": 0
      })
      db.ref(`Users/${uid}/ProfileImage/profileImageUrl0`).set(
        item.picture.large ? item.picture.large
          : item.picture.medium ? item.picture.medium
            : (item.picture.thumbnail || "https://firebasestorage.googleapis.com/v0/b/tinder-3ac12.appspot.com/o/profileImages%2F0xTNIc6LZHTG0Y68x1fMGpdvrRj2%2FprofileImageUrl0?alt=media&token=3b5a6d1a-c2c7-41ee-ad71-62329b26e6ca")
      );
      db.ref(`Users/${uid}/Location/X`).set(13.82617597002536);
      db.ref(`Users/${uid}/Location/Y`).set(100.5141126550734);
      for (var j = 0; j < questionId.length; j++) {
        db.ref(`Users/${uid}/Questions/` + questionId[j]).set({
          "id": questionId[j],
          "question": Math.floor(Math.random() * 2),
          "weight": weight[Math.floor(Math.random() * 5)]
        });
      }
      console.log('result ===>', `success : ${index}`);
    })
    response.send(200);
    // eslint-disable-next-line no-catch-shadow
  } catch (e) {
    console.log(e.message);
  }
});

// NOTE addQuestionFeedback

exports.addQuestionFeedback = functions.https.onRequest((request, response) => {
  const refFeedbackTh = db.ref('QuestionFeedback/th');
  const refFeedbackEn = db.ref('QuestionFeedback/en');
  questionsFeedback.forEach((item) => {
    const keyId = refFeedbackTh.push().key;
    let objTh = {};
    let objEn = {};
    objTh['0'] = item.choiceTh_1;
    objTh['1'] = item.choiceTh_2;
    objTh['2'] = item.choiceTh_3;
    refFeedbackTh.child(keyId).set({
      'question': item.questionTh,
      'choice': objTh
    })
    objEn['0'] = item.choiceEn_1;
    objEn['1'] = item.choiceEn_2;
    objEn['2'] = item.choiceEn_3;
    refFeedbackEn.child(keyId).set({
      'question': item.questionEn,
      'choice': objEn
    })
  })
  response.status(200).send({ questionsFeedback })
});

// NOTE addQuestionRegister

exports.addQuestionRegister = functions.https.onRequest((request, response) => {
  const refRegsiterTh = db.ref('QuestionRegister/th');
  const refRegisterEn = db.ref('QuestionRegister/en');
  questionsRegister.forEach((item) => {
    const keyId = refRegsiterTh.push().key;
    refRegsiterTh.child(keyId).set({
      'question': item.questionTh,
      0: item.choiceTh_1,
      1: item.choiceTh_2
    })
    refRegisterEn.child(keyId).set({
      'question': item.questionEn,
      0: item.choiceEn_1,
      1: item.choiceEn_2
    })
  })
  response.status(200).send({ questionsRegister })
})


// NOTE addQuestionStock

exports.addQuestionProgrammatically = functions.https.onRequest((request, response) => {
  const refQuestionTh = db.ref('Question/th');
  const refQuestionEn = db.ref('Question/en');
  try {
    questionStock.forEach((item) => {
      const keyId = refQuestionTh.push().key;
      refQuestionTh.child(keyId).set({
        'question': item.questionTh,
        0: item.choiceTh_1,
        1: item.choiceTh_2
      })
      refQuestionEn.child(keyId).set({
        'question': item.questionEn,
        0: item.choiceEn_1,
        1: item.choiceEn_2
      })
    })
    // eslint-disable-next-line no-catch-shadow
  } catch (e) { response.status(401).send({ error: e.toString() }) }
  response.status(200).send({ questionStock })
});


// NOTE sendnotificationChat

exports.sendnotificationChat = functions.database.ref('/Chat/{chatId}/{messageId}').onCreate((Change, context) => {
  var receiverId = context.params.chatId;
  var messageId = context.params.messageId;
  var ref = db.ref('/Chat/' + receiverId + '/' + messageId);
  ref.once("value", (snapshot) => {
    var createBy = snapshot.child('createByUser').val();
    var text = snapshot.child('text').val();
    var time = snapshot.child('time').val();
    /*var text2;
    switch(text){
      case "audio"+createBy :  console.log("sendAudio", "sendAudioComplelte");text2 = text;break;
      case "photo"+createBy :  console.log("sendPhoto", "sendPhotoComplelte");text2 = text;break;
      default :
      text2 = text;
      console.log("sendPhoto", "it's normal text");
    }*/

    console.log("CreateByUser: ", createBy);
    var ref2 = db.ref('/Users/' + createBy + '/connection/matches');

    ref2.orderByChild('ChatId').equalTo(receiverId).on("child_added", (snapshot, prevChildKey) => {

      //console.log("MatchId_Fetch : ",snapshot.key);
      var ref3 = db.ref('/Users/' + snapshot.key);
      ref3.once("value", (snapshot) => {
        var token = snapshot.child('token').val();
        console.log("token : ", token);
        return admin.database().ref('/Users/' + createBy).once('value').then(snap => {

          var url = snap.child("ProfileImage").child("profileImageUrl0").val();
          var name = snap.child('name').val();
          const payload = {
            data: {
              data_type: "direct_message",
              title: "New Message from " + createBy,
              createBy: createBy,
              message: text,
              time: time,
              url: url,
              name_user: name,
              message_id: messageId
            },
            notification: {
              title: "ข้อความใหม่",
              body: text
            }

          };

          //var token = snap.child('token').val();
          console.log("Token: ", token)
          return admin.messaging().sendToDevice(token, payload);
        });

      });
    });
  });
});

// NOTE sendnotificationMatch

exports.sendnotificationMatch = functions.database.ref('/Users/{userId}/connection/matches/{matchId}').onCreate((Change, context) => {
  const matchID = context.params.matchId;
  const userID = context.params.userId;
  console.log("MatchID_MatchNotification: ", matchID)
  console.log("UserID_MatchNotification:: ", userID)
  const ref = db.ref('/Users/' + userID);
  ref.once("value", (snapshot) => {
    const token = snapshot.child('token').val();
    if (snapshot.child('status').val() !== 1) {
      return admin.database().ref('/Users/' + matchID).once('value').then(snap => {
        const name = snap.child('name').val();
        const payload = {
          data: {
            data_type: "direct_matching",
            title: "Match ID" + matchID,
            name_user: name,
          }
        };
        console.log("Name_MatchNotification: ", name)
        console.log("Token: ", token)
        return admin.messaging().sendToDevice(token, payload);
      });
    }
  });
});

// !SECTION


// SECTION Mai Functions
const ref = db.ref("Users");

function calculateAge(DOB) { // birthday is a date
  var today = new Date();
  var birthDate = new Date(DOB);
  var age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  var m = today.getUTCMonth() - birthDate.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
    age = age - 1;
  }

  return age;
}

function calculateTime(time) {
  var today = new Date();
  var birthDate = new Date(time);
  var Difference_In_Time = today.getTime() - birthDate.getTime();
  var Difference_In_Days = parseInt(Difference_In_Time / (1000 * 3600 * 24));
  if (Difference_In_Days > 0) {
    return "d" + (Difference_In_Days);
  }
  else if (today.getHours() - birthDate.getHours() !== 0) {
    var h = today.getHours() - birthDate.getHours();
    if (h < 0)
      h = h + 24;
    return "h" + (h);
  }
  else if (today.getMinutes() - birthDate.getMinutes() !== 0) {
    return "m" + (today.getMinutes() - birthDate.getMinutes());
  }
  else return "00";
}


// ANCHOR getPercnetforopposite

const getPercentList = (data, dataUser, currentItem, currentUid) => {
  let result = dataUser.map((item) => {
    const distance_other = getDistanceOpposite(data.x_user, data.y_user, item["Location"]["X"], item["Location"]["Y"])
    const str = calculateTime(parseFloat(item["date"]));
    const t = str.substring(0, 1);
    const s = str.substring(1);
    const { percent, resultQA } = calculatePercent(item, currentItem)
    if (t === "d" && s <= 14) {
      if (isEmpty(item["star_s"]) && Object.prototype.hasOwnProperty.call(item["star_s"], currentUid)) {
        item.starS = 1
      } else item.starS = 0
      item.percent = percent
      item.typeTime = t;
      item.distance_other = distance_other
      item.time = s;
      // item.equalQuestion = resultQA
    }
    else {
      if (isEmpty(item["star_s"]) && Object.prototype.hasOwnProperty.call(item["star_s"], currentUid)) {
        item.starS = 1
      } else item.starS = 0
      item.percent = percent
      item.typeTime = t;
      item.time = s;
      item.distance_other = distance_other
      // item.equalQuestion = resultQA
    }
    return item
  })
  return result
}


// NOTE getUserCard

exports.getUserCard = functions.https.onCall(async (data, context) => {
  let parse_obj3 = [];
  const snap = await db.ref("Users").once("value")
  const blacklist = await db.ref("BlackList").once("value")
  const blacklistData = blacklist.val() || {}
  const mainData = snap.val();
  const rearrageData = Object.keys(mainData).map((key) => {
    mainData[key].key = key
    return mainData[key]
  })
  // TODO don't forgot to change uid
  const currentUid = context.auth.uid;
  // const currentUid = data.uid
  const currentItem = rearrageData.find((item) => item.key === currentUid)
  if (data.sex === 'All') {
    const filterList = rearrageData.filter((item) => {
      return item.key !== currentUid &&
        !Object.prototype.hasOwnProperty.call(blacklistData, item.key) &&
        item.Age >= data.min &&
        item.Age <= data.max &&
        checkConnection(item, currentUid) &&
        !Object.prototype.hasOwnProperty.call(item, 'off_card')
    })
    parse_obj3 = getPercentList(data, filterList, currentItem, currentUid)
  } else {
    const filterList = rearrageData.filter((item) => {
      return item.key !== currentUid &&
        !Object.prototype.hasOwnProperty.call(blacklistData, item.key) &&
        item.Age >= data.min &&
        item.Age <= data.max &&
        checkConnection(item, currentUid) &&
        item.sex === data.sex &&
        !Object.prototype.hasOwnProperty.call(item, 'off_card')
    })
    parse_obj3 = getPercentList(data, filterList, currentItem, currentUid)
  }
  parse_obj3.sort((a, b) => {
    // if (a.Vip !== b.Vip) return (a.Vip < b.Vip) ? 1 : -1;
    if (a.starS !== b.starS) return (a.starS < b.starS) ? 1 : -1;
    return (a.percent > b.percent) ? -1 : 1;
  });
  let o = parse_obj3.slice(data.prelimit, data.limit);
  return { o };
});


// NOTE get user equals

exports.getListQuestionEqual = functions.https.onCall(async (data, context) => {
  // TODO don't forgot to change uid
  const currentUid = context.auth.uid;
  // const currentUid = data.uid
  const questionRef = await db.ref(`Question/${data.locale}`).once("value")
  const questionRegiserRef = await db.ref(`QuestionRegister/${data.locale}`).once("value")
  const userRef = await db.ref("Users").once("value")
  const [valUsers, valQuestion, valQuestionRegister] = await Promise.all([userRef.val(), questionRef.val(), questionRegiserRef.val()])
  const allQuestion = Object.assign(valQuestion, valQuestionRegister)
  const resultUserList = Object.keys(valUsers).filter((key) => (key === currentUid || key === data.oppositeUid))
  const newList = resultUserList.map((key) => {
    valUsers[key].key = key
    return valUsers[key]
  })
  console.log(newList);
  const result = compareQuestion(newList, allQuestion)
  return { result }
})

// NOTE get percent 2 users

exports.getPercentTwoUsers = functions.https.onCall(async (data, context) => {
  // TODO don't forgot to change uid
  const currentUid = context.auth.uid;
  // const currentUid = data.uid;
  const userRef = await db.ref("Users").once("value")
  const userData = userRef.val();
  let result
  if (isEmpty(userData[data.oppositeUid]) && isEmpty(userData[currentUid])) {
    const { percent, resultQA } = calculatePercent(userData[data.oppositeUid], userData[currentUid])
    result = percent
  } else {
    result = 0
  }
  return { result }
})



// NOTE getUser

// function getUser(data, parse_obj3, dataSnapshot, currentUid) {
//   var lat1 = data.x_user;
//   var lat2 = dataSnapshot.child("Location").child("X").val();
//   var lon1 = data.y_user;
//   var lon2 = dataSnapshot.child("Location").child("Y").val();
//   var lonlon = (Math.PI / 180) * (lon2 - lon1);
//   var latlat = (Math.PI / 180) * (lat2 - lat1);
//   var lat1r = (Math.PI / 180) * (lat1);
//   var lat2r = (Math.PI / 180) * (lat2);
//   var R = 6371.0;
//   var a = Math.sin(latlat / 2) * Math.sin(latlat / 2) + Math.cos(lat1r) * Math.cos(lat2r) * Math.sin(lonlon / 2) * Math.sin(lonlon / 2);
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   var distance_other = R * c;
//   if (distance_other < data.distance) {
//     var parse_obj2 = {};
//     parse_obj2 = dataSnapshot.val();
//     var str = calculateTime(parseFloat(dataSnapshot.child("date").val()));
//     var t = str.substring(0, 1);
//     var s = str.substring(1);
//     if (t === "d") {
//       if (s <= 14) {
//         if (dataSnapshot.child("star_s").hasChild(currentUid)) {
//           parse_obj2.starS = 1;
//           console.log(dataSnapshot.key);
//         } else parse_obj2.starS = 0;

//         parse_obj2.typeTime = t;
//         parse_obj2.time = s;
//         parse_obj2.distance_other = distance_other;
//         parse_obj2.key = dataSnapshot.key;
//         parse_obj3.push(parse_obj2)
//       }
//     }
//     else {
//       if (dataSnapshot.child("star_s").hasChild(currentUid)) {
//         parse_obj2.starS = 1;
//         console.log(dataSnapshot.key);
//       } else parse_obj2.starS = 0;
//       parse_obj2.typeTime = t;
//       parse_obj2.time = s;
//       parse_obj2.distance_other = distance_other;
//       parse_obj2.key = dataSnapshot.key;
//       parse_obj3.push(parse_obj2)
//     }

//   }
// }


// exports.getUserCard = functions.https.onCall((data, context) => {
//   var parse_obj3 = [];
//   return db.ref("Users").once("value", (snapshot) => {
//     var currentUid = context.auth.uid;
//     if (data.sex === "All") {
//       snapshot.forEach((dataSnapshot) => {
//         if (dataSnapshot.key !== currentUid
//           && dataSnapshot.child("Age").val() >= data.min
//           && dataSnapshot.child("Age").val() <= data.max
//           && !dataSnapshot.child("connection").child("matches").hasChild(currentUid)
//           && !dataSnapshot.child("connection").child("yep").hasChild(currentUid)
//           && !dataSnapshot.child("connection").child("nope").hasChild(currentUid)
//           && dataSnapshot.child("ProfileImage").hasChild("profileImageUrl0")
//           && !dataSnapshot.hasChild("off_card")
//         ) {
//           getUser(data, parse_obj3, dataSnapshot, currentUid);
//         }
//       });
//     }
//     else {
//       snapshot.forEach((dataSnapshot) => {
//         if (dataSnapshot.key !== currentUid
//           && dataSnapshot.child("sex").val() === data.sex
//           && dataSnapshot.child("Age").val() >= data.min
//           && dataSnapshot.child("Age").val() <= data.max
//           && !dataSnapshot.hasChild("off_card")
//           && !dataSnapshot.child("connection").child("matches").hasChild(currentUid)
//           && !dataSnapshot.child("connection").child("yep").hasChild(currentUid)
//           && !dataSnapshot.child("connection").child("nope").hasChild(currentUid)
//           && dataSnapshot.child("ProfileImage").hasChild("profileImageUrl0")
//         ) {
//           getUser(data, parse_obj3, dataSnapshot, currentUid);
//         }
//       });
//     }
//   }).then(() => {
//     parse_obj3.sort((a, b) => {
//       if (a.starS !== b.starS) return (a.starS < b.starS) ? 1 : -1;
//       if (a.Vip !== b.Vip) return (a.Vip < b.Vip) ? 1 : -1;
//       return (a.distance_other < b.distance_other) ? -1 : 1;
//     });
//     var o = parse_obj3.slice(data.prelimit, data.limit);
//     return { o };
//   });
// });


// NOTE getUser2

function getUser2(data, parse_obj, dataSnapshot, userSnapshot) {
  var lat1 = data.x_user;
  var lat2 = dataSnapshot.child("Location").child("X").val();
  var lon1 = data.y_user;
  var lon2 = dataSnapshot.child("Location").child("Y").val();
  var lonlon = (Math.PI / 180) * (lon2 - lon1);
  var latlat = (Math.PI / 180) * (lat2 - lat1);
  var lat1r = (Math.PI / 180) * (lat1);
  var lat2r = (Math.PI / 180) * (lat2);
  var R = 6371.0;
  var a = Math.sin(latlat / 2) * Math.sin(latlat / 2) + Math.cos(lat1r) * Math.cos(lat2r) * Math.sin(lonlon / 2) * Math.sin(lonlon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance_other = R * c;
  if (distance_other < data.distance) {
    var parse_obj2 = {};
    parse_obj2 = dataSnapshot.val();
    if (dataSnapshot.hasChild("date")) {
      var str = calculateTime(parseFloat(dataSnapshot.child("date").val()));
      var t = str.substring(0, 1);
      var s = str.substring(1);
      if (t === "d") {
        if (s <= 14) {
          const { percent, resultQA } = calculatePercent(parse_obj2, userSnapshot)
          parse_obj2.percent = percent;
          parse_obj2.typeTime = t;
          parse_obj2.time = s;
          parse_obj2.distance_other = distance_other;
          parse_obj2.key = dataSnapshot.key;
          parse_obj.push(parse_obj2)
        }
      }
      else {
        const { percent, resultQA } = calculatePercent(parse_obj2, userSnapshot)
        parse_obj2.percent = percent;
        parse_obj2.typeTime = t;
        parse_obj2.time = s;
        parse_obj2.distance_other = distance_other;
        parse_obj2.key = dataSnapshot.key;
        parse_obj.push(parse_obj2)
      }
    }
  }
}

//NOTE getUserList

exports.getUserList = functions.https.onCall((data, context) => {
  var parse_obj = [];
  return db.ref("/").once("value", async (snapshot) => {
    var currentUid = context.auth.uid;
    // const currentUid = data.uid
    const userData = snapshot.child(`Users/${currentUid}`).val();
    if (data.sex === "All") {
      snapshot.child('Users').forEach((dataSnapshot) => {
        if (dataSnapshot.key !== currentUid &&
          !snapshot.child('BlackList').hasChild(dataSnapshot.key)
          && dataSnapshot.child("Age").val() >= data.min
          && dataSnapshot.child("Age").val() <= data.max
          && !dataSnapshot.child("connection").child("matches").hasChild(currentUid)
          && dataSnapshot.child("ProfileImage").hasChild("profileImageUrl0")
          && !dataSnapshot.hasChild("off_list")
        ) {
          getUser2(data, parse_obj, dataSnapshot, userData);
        }
      });
    }
    else {
      snapshot.child('Users').forEach((dataSnapshot) => {
        if (dataSnapshot.key !== currentUid &&
          !snapshot.child('BlackList').hasChild(dataSnapshot.key)
          && dataSnapshot.child("sex").val() === data.sex
          && dataSnapshot.child("Age").val() >= data.min
          && dataSnapshot.child("Age").val() <= data.max
          && !dataSnapshot.child("connection").child("matches").hasChild(currentUid)
          && dataSnapshot.child("ProfileImage").hasChild("profileImageUrl0")
          && !dataSnapshot.hasChild("off_list")
        ) {
          getUser2(data, parse_obj, dataSnapshot, userData);
        }
      });
    }

  }).then(() => {
    parse_obj.sort((a, b) => {
      if (b.status !== a.status) return (b.status < a.status) ? -1 : 1;
      return (a.distance_other < b.distance_other) ? -1 : 1;
    });
    var o = parse_obj.slice(data.prelimit, data.limit);
    return { o };
  });
});

//NOTE addUser

exports.addUser = functions.https.onRequest((request, response) => {
  var i
  for (i = 0; i <= 200; i++) {
    var id = "test" + i
    db.ref("Users/" + id + "/name").set("test" + i);
    db.ref("Users/" + id + "/Vip").set(0);
    db.ref('Users/' + id + '/Age').set(Math.floor(Math.random() * 70) + 18);
    db.ref('Users/' + id + '/Distance').set("Untitled");
    db.ref('Users/' + id + '/OppositeUserAgeMax').set(70);
    db.ref('Users/' + id + '/OppositeUserAgeMin').set(18);
    db.ref('Users/' + id + '/OppositeUserSex').set("All");
    switch (Math.floor(Math.random() * 2)) {
      case 0: db.ref('Users/' + id + '/sex').set("Male");
        break;
      case 1: db.ref('Users/' + id + '/sex').set("Female");
        break;
    }
    switch (Math.floor(Math.random() * 3)) {
      case 0: db.ref('Users/' + id + '/ProfileImage/profileImageUrl0').set("https://firebasestorage.googleapis.com/v0/b/tinder-3ac12.appspot.com/o/profileImages%2FhloAcfQbgyND8v83ySCln2Kh4gB3%2FprofileImageUrl0?alt=media&token=fb2a0ddc-e936-462d-9d9f-1c65b2cfeca3");
        break;
      case 1: db.ref('Users/' + id + '/ProfileImage/profileImageUrl0').set("https://firebasestorage.googleapis.com/v0/b/tinder-3ac12.appspot.com/o/profileImages%2FhloAcfQbgyND8v83ySCln2Kh4gB3%2FprofileImageUrl1?alt=media&token=d8190401-9133-4c06-b3aa-a3f05628c5ca");
        break;
      case 2: db.ref('Users/' + id + '/ProfileImage/profileImageUrl0').set("https://firebasestorage.googleapis.com/v0/b/tinder-3ac12.appspot.com/o/profileImages%2FhloAcfQbgyND8v83ySCln2Kh4gB3%2FprofileImageUrl2?alt=media&token=77060af2-5c3a-4aa4-a21b-7a10837618d4");
        break;

    }

    db.ref('Users/' + id + '/date').set(1603442692408);
    db.ref('Users/' + id + '/status').set(0);
    db.ref('Users/' + id + '/Location/X').set(13.8103942);
    db.ref('Users/' + id + '/Location/Y').set(100.692658);
    db.ref('Users/' + id + '/MaxLike').set(40);
    db.ref('Users/' + id + '/MaxChat').set(20);
    db.ref('Users/' + id + '/MaxAdmob').set(10);
    db.ref('Users/' + id + '/MaxStar').set(3);
    db.ref('Users/' + id + '/birth').set(906854400000);
  }

});

//NOTE resetLike1

exports.resetLike1 = functions.pubsub.schedule('0 0 * * *')
  .timeZone('Asia/Bangkok')
  .onRun((context) => {
    db.ref("Users").on("child_added", (snapshot) => {
      db.ref('Users/' + snapshot.key + '/MaxLike').set(40);
      db.ref('Users/' + snapshot.key + '/MaxChat').set(20);
      db.ref('Users/' + snapshot.key + '/MaxStar').set(3);
      db.ref('Users/' + snapshot.key + '/MaxAdmob').set(10);
      db.ref('Users/' + snapshot.key + '/Report').set(null);
      db.ref('Users/' + snapshot.key + '/PutReportId').set(null);
      var age = snapshot.child("Age").val();
      var calculate = calculateAge(parseFloat(snapshot.child("birth").val()));
      if (age !== calculate)
        db.ref('Users/' + snapshot.key + '/Age').set(calculate);
    });
    return false;
  });

//NOTE resetLike2

exports.resetLike2 = functions.pubsub.schedule('0 12 * * *')
  .timeZone('Asia/Bangkok')
  .onRun((context) => {
    db.ref("Users").on("child_added", (snapshot) => {
      db.ref('Users/' + snapshot.key + '/MaxLike').set(40);
      db.ref('Users/' + snapshot.key + '/MaxChat').set(20);
      db.ref('Users/' + snapshot.key + '/MaxAdmob').set(10);
    });
    return false;
  });

// SECTION reset blackList

exports.resetBlackList = functions.pubsub.schedule('0 0 * * *')
  .timeZone('Asia/Bangkok')
  .onRun(async (context) => {
    const refBlackList = db.ref('/BlackList');
    const refReportStatus = db.ref('/BlackListStatus');
    const resultBlackList = await refBlackList.once('value');
    const resultStauts = await refReportStatus.once('value');
    const dataStatus = resultStauts.val() || {}
    const dataBlackList = resultBlackList.val() || {}
    if (isEmpty(dataBlackList)) {
      Object.keys(dataBlackList).forEach((key) => {
        if (ruleBlacklist(parseFloat(dataBlackList[key]), isEmpty(dataStatus) ? dataStatus[key] : 1)) {
          db.ref('/BlackList').child(key).remove();
          db.ref(`/Users/${key}`).child('Report').remove();
        }
      })
    }
  });

// exports.testBlackListRule = functions.https.onRequest(async (req, res) => {
//   const refBlackList = db.ref('/BlackList');
//   const refReportStatus = db.ref('/BlackListStatus');
//   const resultBlackList = await refBlackList.once('value');
//   const resultStauts = await refReportStatus.once('value');
//   const dataStatus = resultStauts.val() || {}
//   const dataBlackList = resultBlackList.val() || {}
//   if (isEmpty(dataBlackList)) {
//     Object.keys(dataBlackList).forEach((key) => {
//       console.log('keys', key);
//       if (ruleBlacklist(parseFloat(dataBlackList[key]), isEmpty(dataStatus) ? dataStatus[key] : 1)) {
//         db.ref('/BlackList').child(key).remove();
//         db.ref(`/Users/${key}`).child('Report').remove();
//       }
//     })
//   }
//   res.status(200).send({})
// })

// NOTE add status to questions

// !SECTION

//NOTE report_listener

exports.report_listener = functions.database.ref('Users/{userId}/Report').onUpdate(async (change, context) => {
  var userId = context.params.userId;
  const refReport = db.ref(`/Users/${userId}/Report`);
  const refReportStatus = db.ref('/BlackListStatus')
  const refBlackList = db.ref('/BlackList')
  const resultStauts = await refReportStatus.once('value')
  const result = await refReport.once('value')
  const resultBlackList = await refBlackList.once('value');
  const dataStatus = resultStauts.val() || {}
  const dataBlackList = resultBlackList.val() || {}
  const data = result.val() || {}
  const currentData = new Date().getTime()
  if (!isEmpty(dataStatus) || (isEmpty(dataStatus) && !Object.prototype.hasOwnProperty.call(dataBlackList, userId))) {
    if (isEmpty(dataStatus) && Object.prototype.hasOwnProperty.call(dataStatus, userId)) {
      const counter = parseInt(dataStatus[userId]) + 1
      Object.values(data).forEach((item) => {
        if (parseInt(item) > 4) {
          db.ref("BlackList").child(userId).set(currentData)
          db.ref('BlackListStatus').child(userId).set(counter)
        }
      })
    } else {
      Object.values(data).forEach((item) => {
        if (parseInt(item) > 4) {
          db.ref("BlackList").child(userId).set(currentData)
          db.ref('BlackListStatus').child(userId).set(1)
        }
      })
    }
  }
});
// !SECTION


