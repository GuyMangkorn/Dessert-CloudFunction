//NOTE addUser

// exports.addUser = functions.https.onRequest((request, response) => {
//   var i
//   for (i = 0; i <= 200; i++) {
//     var id = "test" + i
//     db.ref("Users/" + id + "/name").set("test" + i);
//     db.ref("Users/" + id + "/Vip").set(0);
//     db.ref('Users/' + id + '/Age').set(Math.floor(Math.random() * 70) + 18);
//     db.ref('Users/' + id + '/Distance').set("Untitled");
//     db.ref('Users/' + id + '/OppositeUserAgeMax').set(70);
//     db.ref('Users/' + id + '/OppositeUserAgeMin').set(18);
//     db.ref('Users/' + id + '/OppositeUserSex').set("All");
//     switch (Math.floor(Math.random() * 2)) {
//       case 0: db.ref('Users/' + id + '/sex').set("Male");
//         break;
//       case 1: db.ref('Users/' + id + '/sex').set("Female");
//         break;
//     }
//     switch (Math.floor(Math.random() * 3)) {
//       case 0: db.ref('Users/' + id + '/ProfileImage/profileImageUrl0').set("https://firebasestorage.googleapis.com/v0/b/tinder-3ac12.appspot.com/o/profileImages%2FhloAcfQbgyND8v83ySCln2Kh4gB3%2FprofileImageUrl0?alt=media&token=fb2a0ddc-e936-462d-9d9f-1c65b2cfeca3");
//         break;
//       case 1: db.ref('Users/' + id + '/ProfileImage/profileImageUrl0').set("https://firebasestorage.googleapis.com/v0/b/tinder-3ac12.appspot.com/o/profileImages%2FhloAcfQbgyND8v83ySCln2Kh4gB3%2FprofileImageUrl1?alt=media&token=d8190401-9133-4c06-b3aa-a3f05628c5ca");
//         break;
//       case 2: db.ref('Users/' + id + '/ProfileImage/profileImageUrl0').set("https://firebasestorage.googleapis.com/v0/b/tinder-3ac12.appspot.com/o/profileImages%2FhloAcfQbgyND8v83ySCln2Kh4gB3%2FprofileImageUrl2?alt=media&token=77060af2-5c3a-4aa4-a21b-7a10837618d4");
//         break;

//     }

//     db.ref('Users/' + id + '/date').set(1603442692408);
//     db.ref('Users/' + id + '/status').set(0);
//     db.ref('Users/' + id + '/Location/X').set(13.8103942);
//     db.ref('Users/' + id + '/Location/Y').set(100.692658);
//     db.ref('Users/' + id + '/MaxLike').set(40);
//     db.ref('Users/' + id + '/MaxChat').set(20);
//     db.ref('Users/' + id + '/MaxAdmob').set(10);
//     db.ref('Users/' + id + '/MaxStar').set(3);
//     db.ref('Users/' + id + '/birth').set(906854400000);
//   }

// });
