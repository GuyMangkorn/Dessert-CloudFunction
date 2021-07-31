const { Question } = require('../models/question');

// NOTE Question feedback

const questionsFeedback = [
  new Question(
    'คุณพบคู่ที่ใช่หรือไม่', 'Have you found your lover in ours application?',
    { c1: 'บ่อยครั้ง', c2: 'มีบ้าง', c3: 'ไม่พบใครที่ตรงใจเลย' },
    { c1: 'Always found.', c2: 'Sometimes.', c3: 'Never' }
  ),
  new Question(
    'ระบบคัดกรองผู้ใช้ของแอปพลิเคชันเราใช้ได้ดีหรือไม่', 'Is Application filter is work well?',
    { c1: 'ใช่ ใช้ได้ดี', c2: 'ไม่ค่อยเสถียร', c3: 'ไม่ดีเลย' },
    { c1: 'Yes, working well.', c2: 'Sometimes badly', c3: 'Nope, suck!.' }),
  new Question(
    'แอปพลิเคชันของเรามีอาการกระตุกหรือช้าหรือไม่', 'Ours application had a problem likes laging and slowly?',
    { c1: 'มีบ้าง', c2: 'ตลอดเวลา', c3: 'ไม่เลย' },
    { c1: 'Sometimes.', c2: 'Always.', c3: 'Never ever.' }),
  new Question(
    'แอปพลิเคชันเราเข้าใจได้ง่ายและใช้งานง่ายหรือไม่', 'Ours application easy to play?',
    { c1: 'ใช่', c2: 'ใช้เวลานิดหน่อย', c3: 'ไม่ เข้าใจยากมาก' },
    { c1: 'Yes.', c2: 'Sometimes to learn.', c3: 'No, so hard.' })
]

// NOTE Question register

const questionsRegister = [
  new Question(
    'คุณชอบที่จะเถียงหรือไม่?', "Do you like to argue?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดว่าเงินซื้อความสุขได้หรือไม่?', "Do you think money can buy happiness?",
    { c1: 'ได้', c2: 'ไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณระมัดระวังการใช้เงิน?', "Are you careful with your money?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณชอบแมวหรือไม่?', "Do you like cats?",
    { c1: 'ชอบ', c2: 'ไม่ชอบ' },
    { c1: 'Yes,absolutely', c2: 'No' }),
  new Question(
    'คุณชอบหมาหรือไม่?', "Do you like dogs?",
    { c1: 'ชอบ', c2: 'ไม่ชอบ' },
    { c1: 'Yes,absolutely', c2: 'No' }),
  new Question(
    'คุณคิดอยากจะมีความสัมพันธ์แบบเปิดหรือไม่?', "Would you consider having an open relationship?",
    { c1: 'อยาก', c2: 'ไม่อยาก' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเลือกจะออกเดทกับคนสูบบุหรี่รึไม่?', 'Would you go out with a smoker?',
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเชื่อไหมว่าผู้ชายต้องเป็นหัวหน้าครอบครัว?', "Do you believe that men should be the heads of their households?",
    { c1: 'เชื่อว่าอย่างนั้น', c2: 'ไม่เชื่อ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณอยากจะเดทกับคนที่มีเชื้อชาติเหมือนคุณเองหรือไม่?', 'Would you like to date someone of your own race?',
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณสามารถเดทกับคนที่มีลูกแล้วหรือไม่?', 'Could you date someone who already has children from a previous relationship?',
    { c1: 'ได้', c2: 'ไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
]

// NOTE Question stock

const questionStock = [
  new Question(
    'ความสัมพันธ์แบบเปิดสำคัญกับคุณหรือไม่?', 'Is an open relationship important to you?',
    { c1: 'สำคัญ', c2: 'ไม่สำคัญ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเปิดใจทางเพศหรือไม่?', 'Would you date a transgender person?',
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเล่นแอปพลิเคชันเราเพื่อหาคนคุยหรือคู่เดท?', 'You used our application to find someone to chat or date?',
    { c1: 'คนคุย', c2: 'คู่เดท' },
    { c1: 'Chat', c2: 'Date' }),
  new Question(
    'คุณอยากมีรักแท้ตลอดไปหรือความสัมพันธ์สนุกสนาน?', 'Would you like to have a true love forever or a fun relationship?',
    { c1: 'รักแท้', c2: 'สนุกสนาน' },
    { c1: 'True love', c2: 'Fun relationship' }),
  new Question(
    'คุณคิดจะเดทกับคนเงียบๆ หรือไม่?', 'Could you date someone who was really quiet?',
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คำไหนอธิบายคุณได้ดีที่สุด?', 'Which word describes you better?',
    { c1: 'สันโดษ', c2: 'เข้าสังคม' },
    { c1: 'Private', c2: 'Social' }),
  new Question(
    'คุณสามารถเดทกับคนที่ต้องการเวลาอยู่คนเดียว(ชอบเก็บตัว)ได้หรือไม่?', 'Could you date someone who needs a great deal of alone time?',
    { c1: 'ได้', c2: 'ไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'การออกความเห็นว่าเห็นด้วยหรือไม่เห็นด้วยสำคัญหรือไม่?', "How important is it to be able to 'agree to disagree'?",
    { c1: 'สำคัญ', c2: 'ไม่สำคัญ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'เป็นไปได้ไหมที่จะรักคนที่คุณเคยไม่ชอบ?', "Is it possible to love someone you don't even like?",
    { c1: 'เป็นไปไม่ได้', c2: 'เป็นไปได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'เชื่อเรื่องการรักเดียวใจเดียวหรือไม่?', "Do you believe in monogamy or not?",
    { c1: 'เป็นไปไม่ได้', c2: 'เป็นไปได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเป็นชอบไปที่บาร์ร้านกาแฟหรือร้านอาหารหรือไม่?', "Are you a regular at any bar, coffee shop or restaurant?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'ข้อใดมักมาก่อนสำหรับคุณ?', "Which typically comes first for you?",
    { c1: 'ทำงาน', c2: 'เล่น' },
    { c1: 'Work', c2: 'Chill' }),
  new Question(
    'คุณจะเลิกคบกับใครสักคนเพราะข่าวลือไม่ดีของเราหรือไม่?', "Would you ever stop dating someone based on a rumor you heard about them?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'หากคุณอยากเริ่มมีความสัมพันธ์แบบจริงจังกับคนที่คุยอยู่จะมีปัญหาหรือไม่หากเขายังใช้งานแอปพลิเคชันของเราอยู่?', "If you were in a serious relationship, would you mind if your significant other maintained an active profile on Dessert?",
    { c1: 'เป็นปัญหา', c2: 'ไม่เป็นปัญหา' },
    { c1: 'Yes,I would mind this', c2: 'No,This would not bother me' }),
  new Question(
    'คุณคิดจะคบกับคนที่ไม่ชอบเด็กไหม?', "Would you consider dating someone who dislikes children?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณจะเป็นอะไรหรือไม่ที่จะพบตัวจริงกับคนที่เจอกันในแอปพลิเคชันของเรา?', "What would you be like to meet the real people you meet in our app?",
    { c1: 'เป็นปัญหา', c2: 'ไม่เป็นปัญหา' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณมีปัญหากับเรื่องตลกที่เหยียดคนอื่นหรือไม่?', "Do you have a problem with racist jokes?",
    { c1: 'เป็นปัญหา', c2: 'ไม่เป็นปัญหา' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณรู้สึกอย่างไรถ้าไม่ทำอะไรทั้งวัน?', "How do you feel if you don't do anything all day?",
    { c1: 'ดี', c2: 'ไม่ดี' },
    { c1: 'Good', c2: 'Bad' }),
  new Question(
    'คุณมีปัญหากับคนที่แบ่งแยกเชื้อชาติหรือไม่?', "Do you have a problem with racist people?",
    { c1: 'เป็นปัญหา', c2: 'ไม่เป็นปัญหา' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณชอบออกกำลังกายไหม?', "Do you like to exercise?",
    { c1: 'ชอบ', c2: 'ไม่ชอบ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'การเลิกกับใครสักคนผ่านทางโทรศัพท์หรืออีเมลล์เป็นเรื่องปกติหรือไม่?', "Is it normal to breaking up with someone over the phone or email?",
    { c1: 'ปกติ', c2: 'ไม่ปกติ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดหรือไม่ว่าความสัมพันธ์เชื้อชาติและความฉลาดมีผลต่อความสัมพันธ์หรือไม่?', "Do you think relationship, race, and intelligence can affect relationships?",
    { c1: 'มีผล', c2: 'ไม่มีผล' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณจะคุยหรือมีความสัมพันธ์กับคนที่อายุมากกว่าคุณเป็น 20 ปี?', "Would you consider dating someone twenty years older than you if they were really interesting and looked really good?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดอย่างไรกับคนที่ทำให้คนอื่นเป็นตัวตลก?', "What do you think of people who make fun of other people, knowing that it probably upset them?",
    { c1: 'เป็นปัญหา', c2: 'ไม่เป็นปัญหา' },
    { c1: 'No comments', c2: 'Bad things' }),
  new Question(
    'คุณคิดอย่างไรกับคนอ้วน?', "What do you think about fat people?",
    { c1: 'เป็นปัญหา', c2: 'ไม่เป็นปัญหา' },
    { c1: 'Have a problem', c2: 'No problem' }),
  new Question(
    'คุณคิดอย่างไรกับการมีความสัมพันธ์คนที่กินยาต้านอาการซึมเศร้า?', "Could you date someone who used anti-depressants?",
    { c1: 'ชอบ', c2: 'ไม่ชอบ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คนอ้วนยังเซ็กซี่ได้หรือไม่?', "Can overweight people still be sexy?",
    { c1: 'ได้', c2: 'ไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณมีปัญหากับการมีความสัมพันธ์กับคนที่มีปืนไว้ในบ้านหรือไม่?', "Would you date someone who kept a gun in the house?",
    { c1: 'เป็นปัญหา', c2: 'ไม่เป็นปัญหา' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณรู้สึกรำคาญคนที่มีตรรกะในการพูดมาก ๆหรือไม่?', "Are you annoyed by people who are super logical?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณมีปัญหากับคนเลี้ยง Exotic pets หรือไม่?', "Would you mind about Exotic pets?",
    { c1: 'เป็นปัญหา', c2: 'ไม่เป็นปัญหา' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คิดอย่างไรกับผู้ใหญ่ที่ยังดูการ์ตูน?', "Watching cartoons as an adult is...?",
    { c1: 'แปลก', c2: 'ไม่แปลก' },
    { c1: 'Pathetic', c2: "I don't care either way / Not sure" }),
  new Question(
    'คุณตรวจสอบข้อมูลทางโภชนาการสำหรับอาหารที่คุณซื้อในร้านค้าเป็นประจำหรือไม่?', "Do you always examine the nutritional information for the food you buy in stores?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณรู้สึกอยากจะแก้ไขคนที่พูดอะไรโง่ ๆ หรือไม่?', "Do you feel the urge to correct people who say stupid things?",
    { c1: 'อยาก', c2: 'ไม่อยาก' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'เพื่อนสนิทของคุณบางคนพบหรือรู้จักทางออนไลน์หรือไม่?', "Are some of your best friends people you met or know online?",
    { c1: 'อยาก', c2: 'ไม่อยาก' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณอ่านข่าวเกือบทุกวันหรือไม่?', "Do you read the news most days?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'แฟชั่นมีความสำคัญกับคุณหรือไม่?', "Does fashion matter to you?",
    { c1: 'มี', c2: 'ไม่มี' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดจะคบกับคนที่ไม่กินผักหรือเปล่า?', "Would you consider dating someone who generally does not eat vegetables?",
    { c1: 'คิด', c2: 'ไม่คิด' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณล้อเลียนศาสนาไหม?', "Do you mock religion?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'การเมืองน่าสนใจไหม?', "Are politics interesting?",
    { c1: 'น่าสนใจ', c2: 'ไม่น่าสนใจ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณมีอาการนอนไม่หลับหรือไม่?', "Are you an insomniac?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเชื่อเรื่องสิ่งเร้นลับหรือไม่?', "Do you believe in the mystery?",
    { c1: 'เชื่อ', c2: 'ไม่เชื่อ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณสามารถเดทกับคนที่มีความคิดเห็นทางการเมืองที่ตรงข้ามกับคุณได้หรือไม่?', "Could you date someone who has strong political opinions that are the exact opposite of yours?",
    { c1: 'ได้', c2: 'ไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'หากถูกถามคุณจะแบ่งปันรหัสผ่านของบัญชีอีเมลของคุณกับคนสำคัญหรือไม่?', "If asked, would you share the password to your email account with a significant other?",
    { c1: 'ได้', c2: 'ไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดว่าคนส่วนใหญ่ดูเหงาหงอยไหม?', "Do you think most people are lonely?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดว่าผู้ชายที่กำลังนั่งลงควรยืนขึ้นเมื่อผู้หญิงมาที่โต๊ะหรือเข้ามาหรือไม่?', "Do you think men who are sitting down should stand up when a woman comes to the table/enters the room?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดจะออกเดทกับคนที่ใช้เวลาส่วนใหญ่ในสถานบริการสุขภาพจิตหรือไม่?', "Would you consider dating someone who has spent considerable time in a mental health facility?",
    { c1: 'เป็นปัญหา', c2: 'ไม่เป็นปัญหา' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณฉีดโคโลญจน์หรือน้ำหอมเป็นประจำหรือไม่?', "Do you usually wear cologne or perfume?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณจะให้หมอทำแท้งหรือไม่หากทารกพิการทางสมอง?', "Would you terminate a pregnancy if the baby was going to be mentally disabled?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'การเผาธงชาติของประเทศควรผิดกฎหมายหรือไม่?', "Should burning your country's flag be illegal?",
    { c1: 'ควร', c2: 'ไม่ควร' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดจะออกเดทกับมังสวิรัติหรือไม่?', "Would you consider dating a vegetarian or vegan?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเชื่อในชีวิตหลังความตาย / ชีวิตหลังความตาย / การฟื้นคืนชีพหรือไม่?', "Do you believe in an afterlife/life after death/resurrection?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณดูดีกว่าคนส่วนใหญ่หรือไม่?', "Are you better looking than most people?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'เหตุผลสนับสนุนโทษประหารชีวิต แต่คัดค้านการทำแท้งไม่สอดคล้องกันหรือไม่?', "Is it logically inconsistent to support the death penalty but oppose abortion?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณถมน้ำลายลงพื้นในที่สาธารณะหรือไม่?', "Do you ever spit on the ground, in public?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณรู้สึกลำบากใจในการรู้สึกมีความสุขเมื่อคนรอบตัวคุณเศร้าหรือเสียใจหรือไม่?', "Do you have a hard time feeling happy when people around you are sad or upset?",
    { c1: 'ลำบากใจ', c2: 'ไม่ลำบากใจ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'เลือกสิ่งที่โรแมนติดสำหรับคุณ?', "Choose the better romantic activity?",
    { c1: 'จูบที่ปารีส', c2: 'จูบในเต็นท์ท่ามกลางธรรมชาติ' },
    { c1: 'Kissing in Paris', c2: 'Kissing in a tent, in the woods' }),
  new Question(
    'คุณชอบฟัง Rap / Hip-Hop เป็นประจำหรือไม่?', "Do you enjoy Rap/Hip-Hop?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณชอบทำสวนหรือไม่?', "Do you enjoy gardening?",
    { c1: 'ชอบ', c2: 'ไม่ชอบ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณกังวลเกี่ยวกับสิ่งที่คุณไม่สามารถควบคุมได้หรือไม่?', "Do you often find yourself worrying about things that you have no control over?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดจะออกเดทกับใครสักคนที่มีแฟนเป็นตัวเป็นตนอยู่แล้วหรือไม่?', "Would you consider dating someone who is already involved in an open or polyamorous relationship?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณจำชื่อเพื่อนบ้านที่สนิทที่สุดสองคนได้ไหม?', "Can you name your two closest neighbours?",
    { c1: 'จำได้', c2: 'จำไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณมักที่จะสนทนากับคนแปลกหน้าเป็นเวลานานหรือไม่?', "Are you likely to make long, friendly conversation with strangers?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณมีทีมกีฬาโปรดที่คุณชอบติดตามหรือไม่?', "Do you have a favorite sports team that you really like to follow?",
    { c1: 'มี', c2: 'ไม่มี' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณรู้สึกว่าตัวเองยังเจ็บปวดจากสิ่งที่เกิดขึ้นกับคุณเมื่อนานมาแล้วหรือไม่?', "Do you feel like you're still hurting from something that happened to you a long time ago?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเขียนนิยายไหม?', "Do you write poetry?",
    { c1: 'เขียน', c2: 'ไม่เขียน' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเชื่อเรื่องผีไหม?', "Do you believe in ghosts?",
    { c1: 'เชื่อ', c2: 'ไม่เชื่อ' },
    { c1: 'believe', c2: 'Not believe' }),
  new Question(
    'ชีวิตคนบางคนมีค่ามากกว่าชีวิตอื่นหรือไม่?', "Are some human lives worth more than others?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณชอบดูหนังอนิเมะ (แอนิเมชั่นญี่ปุ่น) หรือไม่?', "Are you really into Anime (Japanese Animation) movies?",
    { c1: 'ชอบ', c2: 'ไม่ชอบ' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเคยตะโกนใส่ทีวีขณะดูกีฬาหรือไม่?', "Have you ever yelled at the TV while watching sports?",
    { c1: 'เคย', c2: 'ไม่เคย' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'ถ้าคุณเห็นแฟนคุณจีบคนอื่นต่อหน้าคุณจะโกรธหรือไม่?', "Would you get upset if your girlfriend/boyfriend flirted in front of you?",
    { c1: 'โกรธ', c2: 'ไม่โกรธ' },
    { c1: "Yes,I'm upset", c2: 'Nope' }),
  new Question(
    'คุณคิดจะออกเดทกับคนที่อยู่ระหว่างการหย่าร้างหรือไม่?', "Would you consider dating someone who is in the process of getting divorced?",
    { c1: 'ได้', c2: 'ไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเคยตามใครสักคนเพื่อขอโทษในสิ่งที่คุณทำเมื่อหลายปีก่อนหรือไม่?', "Have you ever tracked someone down just to apologize for something that you did years before?",
    { c1: 'เคย', c2: 'ไม่เคย' },
    { c1: 'Yes,I have', c2: 'Nope' }),
  new Question(
    'คุณสามารถวิ่งเป็นไมล์โดยไม่หยุดได้หรือไม่?', "Can you run a mile without stopping?",
    { c1: 'ได้', c2: 'ไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดจะออกเดทกับพวกเจ้าหน้าที่บังคับใช้กฎหมายหรือไม่?', "Would you consider dating a law enforcement officer?",
    { c1: 'คิด', c2: 'ไม่คิด' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดว่าคุณมี six sense หรือไม่?', "Do you think you have ESP at all?",
    { c1: 'มี', c2: 'ไม่มี' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณจำเป็นต้องนอนกับใครสักคนก่อนที่จะแต่งงานกับเขาหรือไม่?', "Would you need to sleep with someone before you considered marrying them?",
    { c1: 'จำเป็น', c2: 'ไม่จำเป็น' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดจะนอนกับใครสักคนในเดทแรกไหม?', "Would you consider sleeping with someone on the first date?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณจะปล่อยให้ลูกหลานของคุณที่อายุต่ำกว่า 13 ปีดูภาพยนตร์โดยมีภาพโป๊เปลือยหรือไม่?', "Would you let your children under 13 watch movies with full nudity?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเคยเขียนอะไรบางอย่างบนผนังห้องน้ำสาธารณะหรือไม่?', "Have you ever written something on the wall of a public toilet?",
    { c1: 'เคย', c2: 'ไม่เคย' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณจะส่งของขวัญที่คุณไม่ชอบกลับไปให้คนที่ส่งให้คุณไหม?', "Have you ever regifted a gift you didn't like?",
    { c1: 'ส่งคืน', c2: 'ไม่จำเป็น' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณต้องการเวลาอยู่คนเดียวเพื่อชาร์จพลังหลังจากสถานการณ์ตึงเครียดทางสังคมหรือไม่?', "Do you need alone time to re-charge after social situations?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณสามารถตกหลุมรักคนที่คุณคุยด้วยทางออนไลน์ได้หรือไม่?', "Could you fall in love with someone you have only talked to online?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณชอบไปพิพิธภัณฑ์หรือไม่?', "Do you like to go to museums?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณชอบดื่มกาแฟเป็นประจำไหม?', "Do you like coffee?",
    { c1: 'ดื่ม', c2: 'ไม่ดื่ม' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณคิดจะออกเดทกับคนที่หยาบคายบนโลกออนไลน์โดยไม่เปิดเผยตัวหรือไม่?', "Would you consider dating someone who is anonymously rude to people online?",
    { c1: 'คิด', c2: 'ไม่คิด' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเป็นคนไม่มีอารมณ์ขันใช่หรือไม่?', "Do you have a dark and morbid sense of humor?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'ความมึนเมาเป็นข้อแก้ตัวที่ยอมรับได้สำหรับการทำตัวงี่เง่าไหม?', "Is intoxication ever an acceptable excuse for acting stupid?",
    { c1: 'ได้', c2: 'ไม่ได้' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณใช้เจลทำความสะอาดมือประจำหรือไม่?', "Do you always use hand sanitizer?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'คุณเคยหยุดพักระหว่างทำงานเพื่อผ่อนคลายกับตัวเองบ้างไหม?', "Have you ever taken a break while at work to play with yourself?",
    { c1: 'ใช่', c2: 'ไม่ใช่' },
    { c1: 'Yes', c2: 'No' }),
  new Question(
    'การอยู่กับครอบครัวในช่วงวันหยุดสำคัญแค่ไหน?', "How important to you is being with family during holidays?",
    { c1: 'สำคัญ', c2: 'ไม่สำคัญ' },
    { c1: 'Yes', c2: 'No' }),
]

module.exports = { questionsFeedback, questionsRegister, questionStock }
