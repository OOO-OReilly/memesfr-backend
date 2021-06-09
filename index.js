require("firebase/firestore");

//Test

var admin = require("firebase-admin");

var CronJob = require("cron").CronJob;

const FieldValue = admin.firestore.FieldValue;

var serviceAccount = require("./ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

//I want to be able to test the health of the server and make sure everything is running properly

//Run cron job every 30 minute to test
var tick = 0;

var job = new CronJob(
  "*/5 * * * * *",
  () => {
    tick++;
    console.log("Executing every 5 seconds. Tick: ", tick);
  },
  null,
  true,
  "America/Los_Angeles"
);
job.start();
executeCodeTimeInterval();

//Here I want to keep it running on a timer

function executeCodeTimeInterval() {
  referenceRecentPosts();
  referencePopularPosts();
}

async function referenceRecentPosts() {
  const memeReference = db.collection("memes");
  const recentReference = db.collection("recent").doc("recent_fifty");
  try {
    await db.runTransaction(async (t) => {
      var emptyArray = [];
      const items = await memeReference
        .orderBy("createdAt", "desc")
        .limit(50)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((documentSnapshot, key) => {
            emptyArray = [...emptyArray, documentSnapshot.data()];
          });
          //REMOVE THIS AFTER 50 POSTS!
          t.set(recentReference, {
            posts: emptyArray,
          });

          if (emptyArray.length == 50) {
            console.log(emptyArray);
            t.set(recentReference, {
              posts: emptyArray,
            });
          }
        });
      console.log(items);
    });
  } catch (e) {
    console.log("Transaction failure", e);
  }
}
async function referencePopularPosts() {
  const memeReference = db.collection("memes");
  const popularReference = db.collection("popular").doc("top_fifty");
  try {
    await db.runTransaction(async (t) => {
      var emptyArray = [];
      const items = await memeReference
        .orderBy("likes", "desc")
        .limit(50)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((documentSnapshot, key) => {
            emptyArray = [...emptyArray, documentSnapshot.data()];
          });
          //REMOVE THIS AFTER 50 POSTS!
          t.set(popularReference, {
            posts: emptyArray,
          });
          if (emptyArray.length == 50) {
            console.log(emptyArray);
            t.set(popularReference, {
              posts: emptyArray,
            });
          }
        });
      console.log(items);
    });
  } catch (e) {
    console.log("Transaction failure", e);
  }
}

// async function referencePopularPosts() {
//   var popularTwenty = db.collection("popular").doc("top_twenty");
//   await popularTwenty
//     .delete()
//     .then(() => {})
//     .catch((error) => {});
//   console.log("Successfully deleted");
//   setTimeout(chillForASeconds, 2000);

//   console.log("Searching...");
//   var memesRef = db.collection("memes");
//   await memesRef
//     .orderBy("likes", "desc")
//     .limit(20)
//     .get()
//     .then((querySnapshot) => {
//       querySnapshot.forEach((item) => {
//         popularTwenty
//           .set(
//             {
//               posts: FieldValue.arrayUnion(item.data()),
//             },
//             { merge: true }
//           )
//           .then((data) => {})
//           .catch((error) => {});
//       });
//     });
// }
