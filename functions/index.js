const { nthRoot, sqrt, e, add } = require('mathjs');
const functions = require('firebase-functions');
const { Change } = require('firebase-functions');
const axios = require('axios')
const moment = require('moment')
const admin = require('firebase-admin');
admin.initializeApp();


const db = admin.database();

// SECTION Guy Functions


// NOTE closeAccount 

exports.closeAccount = functions.https.onCall(async (data, context) => {
  const userId = context.auth.uid;
  // const userId = data.uid
  const ref = db.ref("Users");
  const res = await admin.database().ref('/Users').once('value').then(snap => {
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
    res: res
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

// NOTE addQuestions

exports.addQuestions = functions.https.onCall((data, context) => {
  var listQuestion = [];
  var listQuestionFinal;
  var allQuestion;
  var listQuestionAlready = [];
  console.log("Language", data.language);
  return admin.database().ref('/').once('value').then(snap => {
    if (data.type === "RegisterQuestion") {
      console.log("question", "if");
      allQuestion = snap.child(data.type).child(data.language).val();
      return { questions: allQuestion }
    } else {
      var uid = context.auth.uid;
      console.log("question", "else");
      snap.child('Users').child(uid).child('Questions').forEach((answerQuestion) => {
        listQuestionAlready.push(answerQuestion.key);
      });
      console.log("questionlistQuestionAlready", listQuestionAlready.toString())
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
    const questionId = ["-MbG2uBL_SF74crhz4gi", "-MbG2uBN1lyRazcdiGpO", "-MbG2uBN1lyRazcdiGpP", "-MbG2uBOQdeFOC1U_ZyV", "-MbG2uBPzIBZnS1YstKg",
      "-MbG2uBPzIBZnS1YstKh", "-MbG2uBQGy2Y91GV8QAE", "-MbG2uBQGy2Y91GV8QAF", "-MbG2uBRC2C6TmlBt9mk", "-MbG2uBRC2C6TmlBt9ml",
      "-MbG2uBS8Ir0mqMmldku", "-MbG2uBTJYJscSa_XcVu", "-MbG2uBTJYJscSa_XcVv", "-MbG2uBUWGoswpgDi0SW", "-MbG2uBUWGoswpgDi0SX"];
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
  } catch (e) {
    console.log(e);
  }
});

// NOTE addQuestionProgrammatically

exports.addQuestionProgrammatically = functions.https.onRequest((request, response) => {
  const refQA = db.ref('Question/th');
  const refQAEnglish = db.ref('Question/en');
  const refStartth = db.ref('RegisterQuestion/th');
  const refStartthEnglish = db.ref('RegisterQuestion/en');
  let pushId = refQA.push();
  let pushIdEN = pushId.key;
  pushId.set({
    "question": "เชื่อเรื่องการรักเดียวใจเดียวหรือไม่",
    0: "เชื่อ",
    1: "ไม่เชื่อ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you believe in monogamy or not?",
    0: "Yes",
    1: "No"
  });

  ///////////////////////////////////////

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณอยากจะเดทกับคนที่มีเชื้อชาติเหมือนคุณเองหรือไม่",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you like to date someone of your own race?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณอยากจะเดทกับคนที่มีเชื้อชาติเหมือนคุณเองหรือไม่",
    0: "ใช่",
    1: "ไม่ใช่"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Would you like to date someone of your own race?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "ความสัมพันธ์แบบเปิดสำคัญกับคุณหรือไม่?",
    0: "สำคัญ",
    1: "ไม่สำคัญ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Is an open relationship important to you?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "ความสัมพันธ์แบบเปิดสำคัญกับคุณหรือไม่?",
    0: "สำคัญ",
    1: "ไม่สำคัญ"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Is an open relationship important to you?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเปิดใจทางเพศหรือไม่",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you date a transgender person?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณเปิดใจทางเพศหรือไม่",
    0: "ใช่",
    1: "ไม่ใช่"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Would you date a transgender person?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเล่นแอปพลิเคชันเราเพื่อหาคนคุยหรือคู่เดท",
    0: "คนคุย",
    1: "คู่เดท"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "You used our application to find someone to chat or date?",
    0: "Chat",
    1: "Date"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณเล่นแอปพลิเคชันเราเพื่อหาคนคุยหรือคู่เดท",
    0: "คนคุย",
    1: "คู่เดท"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "You used our application to find someone to chat or date?",
    0: "Chat",
    1: "Date"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณอยากมีรักแท้ตลอดไปหรือความสัมพันธ์สนุกสนาน",
    0: "รักแท้",
    1: "สนุกสนาน"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you like to have a true love forever or a fun relationship?",
    0: "True love",
    1: "Fun relationship"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณอยากมีรักแท้ตลอดไปหรือความสัมพันธ์สนุกสนาน",
    0: "รักแท้",
    1: "สนุกสนาน"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Would you like to have a true love forever or a fun relationship?",
    0: "True love",
    1: "Fun relationship"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะเดทกับคนเงียบๆ หรือไม่",
    0: "ใช่",
    1: "ไม่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Could you date someone who was really quiet?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณคิดจะเดทกับคนเงียบๆ หรือไม่",
    0: "ใช่",
    1: "ไม่"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Could you date someone who was really quiet?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คำไหนอธิบายคุณได้ดีที่สุด?",
    0: "สันโดษ",
    1: "สัตว์สังคม"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Which word describes you better?",
    0: "Private",
    1: "Social"
  });

  refStartth.child(pushIdEN).set({
    "question": "คำไหนอธิบายคุณได้ดีที่สุด?",
    0: "สันโดษ",
    1: "สัตว์สังคม"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Which word describes you better?",
    0: "Private",
    1: "Social"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเลือกจะออกเดทกับคนสูบบุหรี่รึไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you go out with a smoker?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณเลือกจะออกเดทกับคนสูบบุหรี่รึไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Would you go out with a smoker?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "การออกความเห็นว่าเห็นด้วยหรือไม่เห็นด้วยสำคัญหรือไม่?",
    0: "สำคัญ",
    1: "ไม่สำคัญ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "How important is it to be able to 'agree to disagree'?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "การออกความเห็นว่าเห็นด้วยหรือไม่เห็นด้วยสำคัญหรือไม่?",
    0: "สำคัญ",
    1: "ไม่สำคัญ"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "How important is it to be able to 'agree to disagree'?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "เป็นไปได้ไหมที่จะรักคนที่คุณเคยไม่ชอบ?",
    0: "เป็นไปไม่ได้",
    1: "เป็นไปได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Is it possible to love someone you don't even like?",
    0: "Yes",
    1: "No"
  });


  refStartth.child(pushIdEN).set({
    "question": "เป็นไปได้ไหมที่จะรักคนที่คุณเคยไม่ชอบ?",
    0: "เป็นไปไม่ได้",
    1: "เป็นไปได้"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Is it possible to love someone you don't even like?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเป็นชอบไปที่บาร์ร้านกาแฟหรือร้านอาหารหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are you a regular at any bar, coffee shop or restaurant?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณเป็นชอบไปที่บาร์ร้านกาแฟหรือร้านอาหารหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Are you a regular at any bar, coffee shop or restaurant?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณสามารถเดทกับคนที่มีลูกแล้วหรือไม่?",
    0: "ได้",
    1: "ไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Could you date someone who already has children from a previous relationship?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณสามารถเดทกับคนที่มีลูกแล้วหรือไม่?",
    0: "ได้",
    1: "ไม่ได้"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Could you date someone who already has children from a previous relationship?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเชื่อไหมว่าผู้ชายต้องเป็นหัวหน้าครอบครัว?",
    0: "เชื่อว่าอย่างนั้น",
    1: "ไม่เชื่อ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you believe that men should be the heads of their households?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณเชื่อไหมว่าผู้ชายต้องเป็นหัวหน้าครอบครัว?",
    0: "เชื่อว่าอย่างนั้น",
    1: "ไม่เชื่อ"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Do you believe that men should be the heads of their households?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณสามารถเดทกับคนที่ต้องการเวลาอยู่คนเดียว(ชอบเก็บตัว)ได้หรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Could you date someone who needs a great deal of alone time?",
    0: "Yes",
    1: "No"
  });

  refStartth.child(pushIdEN).set({
    "question": "คุณสามารถเดทกับคนที่ต้องการเวลาอยู่คนเดียว(ชอบเก็บตัว)ได้หรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Could you date someone who needs a great deal of alone time?",
    0: "Yes",
    1: "No"
  })

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "ข้อใดมักมาก่อนสำหรับคุณ?",
    0: "ทำงาน",
    1: "เล่น"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Which typically comes first for you?",
    0: "Work",
    1: "Play"
  });

  refStartth.child(pushIdEN).set({
    "question": "ข้อใดมักมาก่อนสำหรับคุณ?",
    0: "ทำงาน",
    1: "เล่น"
  })
  refStartthEnglish.child(pushIdEN).set({
    "question": "Which typically comes first for you?",
    0: "Work",
    1: "Play"
  })

  ////////////////////////////////////////




  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณจะเลิกคบกับใครสักคนเพราะข่าวลือไม่ดีของเราหรือไม่",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you ever stop dating someone based on a rumor you heard about them?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "หากคุณอยากเริ่มมีความสัมพันธ์แบบจริงจังกับคนที่คุยอยู่จะมีปัญหาหรือไม่หากเขายังใช้งานแอปพลิเคชันของเราอยู่",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "If you were in a serious relationship, would you mind if your significant other maintained an active profile on Dessert?",
    0: "Yes,I would mind this",
    1: "No,This would not bother me"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะคบกับคนที่ไม่ชอบเด็กไหม",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider dating someone who dislikes children?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณจะเป็นอะไรหรือไม่ที่จะพบตัวจริงกับคนที่เจอกันในแอปพลิเคชันของเรา",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "What would you be like to meet the real people you meet in our app?",
    0: "Yes",
    1: "No"
  });

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณมีปัญหากับเรื่องตลกที่เหยียดคนอื่นหรือไม่",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you have a problem with racist jokes?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณรู้สึกอย่างไรถ้าไม่ทำอะไรทั้งวัน",
    0: "ดี",
    1: "ไม่ดี"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "How do you feel if you don't do anything all day?",
    0: "Good",
    1: "Bad"
  });

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณมีปัญหากับคนที่แบ่งแยกเชื้อชาติหรือไม่",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you have a problem with racist people?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณชอบออกกำลังกายไหม",
    0: "ชอบ",
    1: "ไม่ชอบ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you like to exercise?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "การเลิกกับใครสักคนผ่านทางโทรศัพท์หรืออีเมลล์เป็นเรื่องปกติหรือไม่",
    0: "ปกติ",
    1: "ไม่ปกติ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Is it normal to breaking up with someone over the phone or email?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดหรือไม่ว่าความสัมพันธ์เชื้อชาติและความฉลาดมีผลต่อความสัมพันธ์หรือไม่",
    0: "มีผล",
    1: "ไม่มีผล"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you think relationship, race, and intelligence can affect relationships?",
    0: "Yes",
    1: "No"
  });

  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณมีปัญหากับการคุยหรือมีความสัมพันธ์กับคนที่อายุมากกว่าคุณเป็นสองเท่า",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you have a problem talking or having relationships with someone who is twice as old as you?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดอย่างไรกับคนที่ทำให้คนอื่นเป็นตัวตลก",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "What do you think of people who make fun of other people, knowing that it probably upset them?",
    0: "No comments",
    1: "Bad things"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดอย่างไรกับคนอ้วน",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "What do you think about fat people?",
    0: "Have a problem",
    1: "No problem"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดอย่างไรกับการมีความสัมพันธ์คนที่กินยาต้านอาการซึมเศร้า",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Could you date someone who used anti-depressants?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คนอ้วนยังเซ็กซี่ได้หรือไม่",
    0: "ได้",
    1: "ไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Can overweight people still be sexy?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณมีปัญหากับการมีความสัมพันธ์กับคนที่มีปืนไว้ในบ้านหรือไม่",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you date someone who kept a gun in the house?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณระมัดระวังการใช้เงิน",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are you careful with your money?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณรู้สึกรำคาญคนที่มีตรรกะในการพูดมาก ๆหรือไม่",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are you annoyed by people who are super logical?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณชอบแมวหรือไม่",
    0: "ชอบ",
    1: "ไม่ชอบ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you like cats?",
    0: "Yes,absolutely",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณชอบหมาหรือไม่",
    0: "ชอบ",
    1: "ไม่ชอบ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you like dogs?",
    0: "Yes,absolutely",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณมีปัญหากับคนเลี้ยง Exotic pets หรือไม่",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you mind about Exotic pets?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คิดอย่างไรกับผู้ใหญ่ที่ยังดูการ์ตุน",
    0: "ไม่แปลก",
    1: "แปลก"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Watching cartoons as an adult is...?",
    0: "Pathetic",
    1: "I don't care either way / Not sure"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดว่าเงินซื้อความสุขได้หรือไม่",
    0: "ได้",
    1: "ไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you think money can buy happiness?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณชอบที่จะเถียงหรือไม่",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you like to argue?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณตรวจสอบข้อมูลทางโภชนาการสำหรับอาหารที่คุณซื้อในร้านค้าเป็นประจำหรือไม่",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you always examine the nutritional information for the food you buy in stores?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณรู้สึกอยากจะแก้ไขคนที่พูดอะไรโง่ ๆ หรือไม่",
    0: "อยาก",
    1: "ไม่อยาก"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you feel the urge to correct people who say stupid things?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "เพื่อนสนิทของคุณบางคนพบหรือรู้จักทางออนไลน์หรือไม่",
    0: "อยาก",
    1: "ไม่อยาก"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are some of your best friends people you met or know online?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณอ่านข่าวเกือบทุกวันหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you read the news most days?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "แฟชั่นมีความสำคัญกับคุณหรือไม่?",
    0: "มี",
    1: "ไม่มี"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Does fashion matter to you?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะคบกับคนที่ไม่กินผักหรือเปล่า?",
    0: "คิด",
    1: "ไม่คิด"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider dating someone who generally does not eat vegetables?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณล้อเลียนศาสนาไหม?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you mock religion?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "การเมืองน่าสนใจไหม?",
    0: "น่าสนใจ",
    1: "ไม่น่าสนใจ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are politics interesting?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณมีอาการนอนไม่หลับหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are you an insomniac?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเชื่อเรื่องสิ่งเร้นลับหรือไม่?",
    0: "เชื่อ",
    1: "ไม่เชื่อ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you believe in the mystery?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณสามารถเดทกับคนที่มีความคิดเห็นทางการเมืองที่ตรงข้ามกับคุณได้หรือไม่?",
    0: "ได้",
    1: "ไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Could you date someone who has strong political opinions that are the exact opposite of yours?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "หากถูกถามคุณจะแบ่งปันรหัสผ่านของบัญชีอีเมลของคุณกับคนสำคัญหรือไม่?",
    0: "ได้",
    1: "ไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "If asked, would you share the password to your email account with a significant other?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดว่าคนส่วนใหญ่ดูเหงาหงอยไหม?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you think most people are lonely?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดว่าผู้ชายที่กำลังนั่งลงควรยืนขึ้นเมื่อผู้หญิงมาที่โต๊ะหรือเข้ามาหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you think men who are sitting down should stand up when a woman comes to the table/enters the room?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะออกเดทกับคนที่ใช้เวลาส่วนใหญ่ในสถานบริการสุขภาพจิตหรือไม่?",
    0: "เป็นปัญหา",
    1: "ไม่เป็นปัญหา"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider dating someone who has spent considerable time in a mental health facility?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณฉีดโคโลญจน์หรือน้ำหอมเป็นประจำหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you usually wear cologne or perfume?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณจะให้หมอทำแท้งหรือไม่หากทารกพิการทางสมอง?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you terminate a pregnancy if the baby was going to be mentally disabled?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "การเผาธงชาติของประเทศควรผิดกฎหมายหรือไม่?",
    0: "ควร",
    1: "ไม่ควร"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Should burning your country's flag be illegal?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะออกเดทกับมังสวิรัติหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider dating a vegetarian or vegan?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเชื่อในชีวิตหลังความตาย / ชีวิตหลังความตาย / การฟื้นคืนชีพหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you believe in an afterlife/life after death/resurrection?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณดูดีกว่าคนส่วนใหญ่หรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are you better looking than most people?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "เหตุผลสนับสนุนโทษประหารชีวิต แต่คัดค้านการทำแท้งไม่สอดคล้องกันหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Is it logically inconsistent to support the death penalty but oppose abortion?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณถมน้ำลายลงพื้นในที่สาธารณะหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you ever spit on the ground, in public?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณรู้สึกลำบากใจในการรู้สึกมีความสุขเมื่อคนรอบตัวคุณเศร้าหรือเสียใจหรือไม่?",
    0: "ลำบากใจ",
    1: "ไม่ลำบากใจ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you have a hard time feeling happy when people around you are sad or upset?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "เลือกสิ่งที่โรแมนติดสำหรับคุณ",
    0: "จูบที่ปารีส",
    1: "จูบในเต็นท์ท่ามกลางธรรมชาติ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Choose the better romantic activity",
    0: "Kissing in Paris",
    1: "Kissing in a tent, in the woods"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณชอบ Rap / Hip-Hop เป็นประจำหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you enjoy Rap/Hip-Hop?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณชอบทำสวนหรือไม่?",
    0: "ชอบ",
    1: "ไม่ชอบ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you enjoy gardening?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณกังวลเกี่ยวกับสิ่งที่คุณไม่สามารถควบคุมได้หรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you often find yourself worrying about things that you have no control over?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะออกเดทกับใครสักคนที่มีแฟนเป็นตัวเป็นตนอยู่แล้วหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider dating someone who is already involved in an open or polyamorous relationship?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณจำชื่อเพื่อนบ้านที่สนิทที่สุดสองคนได้ไหม?",
    0: "จำได้",
    1: "จำไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Can you name your two closest neighbours?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณมักที่จะสนทนากับคนแปลกหน้าเป็นเวลานานหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are you likely to make long, friendly conversation with strangers?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณมีทีมกีฬาโปรดที่คุณชอบติดตามหรือไม่?",
    0: "มี",
    1: "ไม่มี"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you have a favorite sports team that you really like to follow?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณรู้สึกว่าตัวเองยังเจ็บปวดจากสิ่งที่เกิดขึ้นกับคุณเมื่อนานมาแล้วหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you feel like you're still hurting from something that happened to you a long time ago?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเขียนนิยายไหม?",
    0: "เขียน",
    1: "ไม่เขียน"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you write poetry?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเชื่อเรื่องผีไหม?",
    0: "เชื่อ",
    1: "ไม่เชื่อ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you believe in ghosts?",
    0: "believe",
    1: "Not believe"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "ชีวิตคนบางคนมีค่ามากกว่าชีวิตอื่นหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are some human lives worth more than others?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดอยากจะมีความสัมพันธ์แบบเปิดหรือไม่?",
    0: "อยาก",
    1: "ไม่อยาก"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider having an open relationship?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณชอบดูหนังอนิเมะ (แอนิเมชั่นญี่ปุ่น) หรือไม่?",
    0: "ชอบ",
    1: "ไม่ชอบ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Are you really into Anime (Japanese Animation) movies?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเคยตะโกนใส่ทีวีขณะดูกีฬาหรือไม่?",
    0: "เคย",
    1: "ไม่เคย"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Have you ever yelled at the TV while watching sports?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "ถ้าคุณเห็นแฟนคุณจีบคนอื่นต่อหน้าคุณจะโกรธหรือไม่?",
    0: "โกรธ",
    1: "ไม่โกรธ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you get upset if your girlfriend/boyfriend flirted in front of you?",
    0: "Yes,I'm upset",
    1: "Nope"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะออกเดทกับคนที่อยู่ระหว่างการหย่าร้างหรือไม่?",
    0: "ได้",
    1: "ไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider dating someone who is in the process of getting divorced?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเคยตามใครสักคนเพื่อขอโทษในสิ่งที่คุณทำเมื่อหลายปีก่อนหรือไม่?",
    0: "เคย",
    1: "ไม่เคย"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Have you ever tracked someone down just to apologize for something that you did years before?",
    0: "Yes,I have",
    1: "Nope"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณสามารถวิ่งเป็นไมล์โดยไม่หยุดได้หรือไม่?",
    0: "ได้",
    1: "ไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Can you run a mile without stopping?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะออกเดทกับพวกเจ้าหน้าที่บังคับใช้กฎหมายหรือไม่?",
    0: "คิด",
    1: "ไม่คิด"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider dating a law enforcement officer?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดว่าคุณมี six sense หรือไม่?",
    0: "มี",
    1: "ไม่มี"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you think you have ESP at all?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณจำเป็นต้องนอนกับใครสักคนก่อนที่จะแต่งงานกับเขาหรือไม่?",
    0: "จำเป็น",
    1: "ไม่จำเป็น"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you need to sleep with someone before you considered marrying them?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะนอนกับใครสักคนในเดทแรกไหม?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider sleeping with someone on the first date?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณจะปล่อยให้ลูกหลานของคุณที่อายุต่ำกว่า 13 ปีดูภาพยนตร์โดยมีภาพโป๊เปลือยหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you let your children under 13 watch movies with full nudity?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเคยเขียนอะไรบางอย่างบนผนังห้องน้ำสาธารณะหรือไม่?",
    0: "เคย",
    1: "ไม่เคย"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Have you ever written something on the wall of a public toilet?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณจะส่งของขวัญที่คุณไม่ชอบกลับไปให้คนที่ส่งให้คุณไหม?",
    0: "ส่งคืน",
    1: "ไม่จำเป็น"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Have you ever regifted a gift you didn't like?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณต้องการเวลาอยู่คนเดียวเพื่อชาร์จพลังหลังจากสถานการณ์ตึงเครียดทางสังคมหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you need alone time to re-charge after social situations?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณสามารถตกหลุมรักคนที่คุณคุยด้วยทางออนไลน์ได้หรือไม่?",
    0: "ได้",
    1: "ไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Could you fall in love with someone you have only talked to online?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณชอบไปพิพิธภัณฑ์หรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you like to go to museums?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณชอบดื่มกาแฟเป็นประจำไหม?",
    0: "ดื่ม",
    1: "ไม่ดื่ม"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you like coffee?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณคิดจะออกเดทกับคนที่หยาบคายบนโลกออนไลน์โดยไม่เปิดเผยตัวหรือไม่?",
    0: "คิด",
    1: "ไม่คิด"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Would you consider dating someone who is anonymously rude to people online?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเป็นคนไม่มีอารมณ์ขันใช่หรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you have a dark and morbid sense of humor?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "ความมึนเมาเป็นข้อแก้ตัวที่ยอมรับได้สำหรับการทำตัวงี่เง่าไหม?",
    0: "ได้",
    1: "ไม่ได้"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Is intoxication ever an acceptable excuse for acting stupid?",
    0: "Yes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณใช้เจลทำความสะอาดมือประจำหรือไม่?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Do you always use hand sanitizer?",
    0: "ํYes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "คุณเคยหยุดพักระหว่างทำงานเพื่อผ่อนคลายกับตัวเองบ้างไหม?",
    0: "ใช่",
    1: "ไม่ใช่"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "Have you ever taken a break while at work to play with yourself?",
    0: "ํYes",
    1: "No"
  });
  pushId = refQA.push();
  pushIdEN = pushId.key;
  pushId.set({
    "question": "การอยู่กับครอบครัวในช่วงวันหยุดสำคัญแค่ไหน?",
    0: "สำคัญ",
    1: "ไม่สำคัญ"
  });
  refQAEnglish.child(pushIdEN).set({
    "question": "How important to you is being with family during holidays?",
    0: "ํYes",
    1: "No"
  });
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
console.log(calculateTime(1598428015326));
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

// NOTE getUser

function getUser(data, parse_obj3, dataSnapshot, currentUid) {
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
    var str = calculateTime(parseFloat(dataSnapshot.child("date").val()));
    var t = str.substring(0, 1);
    var s = str.substring(1);
    if (t === "d") {
      if (s <= 14) {
        if (dataSnapshot.child("star_s").hasChild(currentUid)) {
          parse_obj2.starS = 1;
          console.log(dataSnapshot.key);
        } else parse_obj2.starS = 0;

        parse_obj2.typeTime = t;
        parse_obj2.time = s;
        parse_obj2.distance_other = distance_other;
        parse_obj2.key = dataSnapshot.key;
        parse_obj3.push(parse_obj2)
      }
    }
    else {
      if (dataSnapshot.child("star_s").hasChild(currentUid)) {
        parse_obj2.starS = 1;
        console.log(dataSnapshot.key);
      } else parse_obj2.starS = 0;
      parse_obj2.typeTime = t;
      parse_obj2.time = s;
      parse_obj2.distance_other = distance_other;
      parse_obj2.key = dataSnapshot.key;
      parse_obj3.push(parse_obj2)
    }

  }
}

// NOTE getUser2

function getUser2(data, parse_obj, dataSnapshot) {
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
          parse_obj2.typeTime = t;
          parse_obj2.time = s;
          parse_obj2.distance_other = distance_other;
          parse_obj2.key = dataSnapshot.key;
          parse_obj.push(parse_obj2)
        }
      }
      else {
        parse_obj2.typeTime = t;
        parse_obj2.time = s;
        parse_obj2.distance_other = distance_other;
        parse_obj2.key = dataSnapshot.key;
        parse_obj.push(parse_obj2)
      }

    }

  }
}

// NOTE getUserCard

exports.getUserCard = functions.https.onCall((data, context) => {
  var parse_obj3 = [];
  return db.ref("Users").once("value", function (snapshot) {

    var currentUid = context.auth.uid;
    if (data.sex === "All") {
      snapshot.forEach(function (dataSnapshot) {
        if (dataSnapshot.key !== currentUid
          && dataSnapshot.child("Age").val() >= data.min
          && dataSnapshot.child("Age").val() <= data.max
          && !dataSnapshot.child("connection").child("matches").hasChild(currentUid)
          && !dataSnapshot.child("connection").child("yep").hasChild(currentUid)
          && !dataSnapshot.child("connection").child("nope").hasChild(currentUid)
          && dataSnapshot.child("ProfileImage").hasChild("profileImageUrl0")
          && !dataSnapshot.hasChild("off_card")
        ) {
          getUser(data, parse_obj3, dataSnapshot, currentUid);
        }
      });
    }
    else {

      snapshot.forEach(function (dataSnapshot) {
        if (dataSnapshot.key !== currentUid
          && dataSnapshot.child("sex").val() === data.sex
          && dataSnapshot.child("Age").val() >= data.min
          && dataSnapshot.child("Age").val() <= data.max
          && !dataSnapshot.hasChild("off_card")
          && !dataSnapshot.child("connection").child("matches").hasChild(currentUid)
          && !dataSnapshot.child("connection").child("yep").hasChild(currentUid)
          && !dataSnapshot.child("connection").child("nope").hasChild(currentUid)
          && dataSnapshot.child("ProfileImage").hasChild("profileImageUrl0")
        ) {
          getUser(data, parse_obj3, dataSnapshot, currentUid);

        }
      });
    }
  }).then(() => {
    parse_obj3.sort(function (a, b) {

      if (a.starS !== b.starS) return (a.starS < b.starS) ? 1 : -1;
      if (a.Vip !== b.Vip) return (a.Vip < b.Vip) ? 1 : -1;
      return (a.distance_other < b.distance_other) ? -1 : 1;

    });

    var o = parse_obj3.slice(data.prelimit, data.limit);
    return { o };
  });

});

//NOTE getUserList

exports.getUserList = functions.https.onCall((data, context) => {
  var parse_obj = [];
  return db.ref("Users").once("value", function (snapshot) {
    var currentUid = context.auth.uid;
    if (data.sex === "All") {
      console.log("1");
      snapshot.forEach(function (dataSnapshot) {
        if (dataSnapshot.key !== currentUid
          && dataSnapshot.child("Age").val() >= data.min
          && dataSnapshot.child("Age").val() <= data.max
          && !dataSnapshot.child("connection").child("matches").hasChild(currentUid)
          && dataSnapshot.child("ProfileImage").hasChild("profileImageUrl0")
          && !dataSnapshot.hasChild("off_list")
        ) {
          getUser2(data, parse_obj, dataSnapshot);

        }
      });
    }
    else {
      snapshot.forEach(function (dataSnapshot) {
        if (dataSnapshot.key !== currentUid
          && dataSnapshot.child("sex").val() === data.sex
          && dataSnapshot.child("Age").val() >= data.min
          && dataSnapshot.child("Age").val() <= data.max
          && !dataSnapshot.child("connection").child("matches").hasChild(currentUid)
          && dataSnapshot.child("ProfileImage").hasChild("profileImageUrl0")
          && !dataSnapshot.hasChild("off_list")
        ) {
          getUser2(data, parse_obj, dataSnapshot);

        }
      });
    }

  }).then(() => {
    parse_obj.sort(function (a, b) {
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
    db.ref("Users").on("child_added", function (snapshot) {
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
    console.log("ทำแล้ว");
    return false;
  });

//NOTE resetLike2

exports.resetLike2 = functions.pubsub.schedule('0 12 * * *')
  .timeZone('Asia/Bangkok')
  .onRun((context) => {
    db.ref("Users").on("child_added", function (snapshot) {
      db.ref('Users/' + snapshot.key + '/MaxLike').set(40);
      db.ref('Users/' + snapshot.key + '/MaxChat').set(20);
      db.ref('Users/' + snapshot.key + '/MaxAdmob').set(10);
      console.log(snapshot.key + "");
    });
    console.log("ทำแล้ว");
    return false;
  });

//NOTE report_listener

exports.report_listener = functions.database.ref('Users/{userId}/Report').onUpdate((Change, context) => {
  var Count = 0;
  var userId = context.params.userId;
  const ref = db.ref("Users");
  ref.child(userId).child("Report").on("child_added", function (snapshot) {
    Count = Count + parseInt(snapshot.val());
    console.log(Count);
    if (parseInt(snapshot.val()) >= 4) {
      console.log('Successfully deleted user');
      ref.child(userId).remove();
      db.ref("BlackList").child(userId).set(true)
      ref.on("child_added", function (snapshot) {
        if (snapshot.child("connection").child("yep").hasChild(userId)) {
          ref.child(snapshot.key).child("connection").child("yep").child(userId).remove();
        }
        if (snapshot.child("connection").child("nope").hasChild(userId)) {
          ref.child(snapshot.key).child("connection").child("nope").child(userId).remove();
        }
        if (snapshot.child("connection").child("matches").hasChild(userId)) {
          ref.child(snapshot.key).child("connection").child("matches").child(userId).remove();
        }
        if (snapshot.child("connection").child("chatna").hasChild(userId)) {
          ref.child(snapshot.key).child("connection").child("chatna").child(userId).remove();
        }
        if (snapshot.child("see_profile").hasChild(userId)) {
          ref.child(snapshot.key).child("see_profile").child(userId).remove();
        }
      });
    }
  });
});

// !SECTION


