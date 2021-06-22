
class Question {
  constructor(questionTh, questionEn,
    { c1: choiceTh_1, c2: choiceTh_2, c3: choiceTh_3 = null },
    { c1: choiceEn_1, c2: choiceEn_2, c3: choiceEn_3 = null }) {
    this.questionTh = questionTh;
    this.questionEn = questionEn;
    this.choiceTh_1 = choiceTh_1;
    this.choiceTh_2 = choiceTh_2;
    this.choiceEn_1 = choiceEn_1;
    this.choiceEn_2 = choiceEn_2;
    this.choiceTh_3 = choiceTh_3;
    this.choiceEn_3 = choiceEn_3;
  }
}

module.exports = { Question }


