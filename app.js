"use strict";

/* ===== 문제 데이터 =====
   question 안의 [[...]] 는 밑줄 강조할 관용표현입니다.
   answer 는 0부터 시작하는 정답 보기 위치입니다. (0 = ①) */
const QUESTIONS = [
  {
    question: "\"우리 삼촌은 [[발이 넓어서]] 어디를 가나 아는 사람이 있어.\" 밑줄 친 표현의 뜻은?",
    choices: ["발 크기가 크다", "걸음이 빠르다", "아는 사람이 많다", "멀리 걸어 다닌다"],
    answer: 2,
    explanation: "사귄 사람이 많아 활동하는 범위가 넓다는 뜻이에요."
  },
  {
    question: "\"민수는 [[귀가 얇아서]] 친구 말에 금방 넘어가.\" 밑줄 친 표현의 뜻은?",
    choices: ["남의 말을 쉽게 믿는다", "소리를 잘 듣는다", "귀가 작다", "말을 잘 안 듣는다"],
    answer: 0,
    explanation: "남의 말에 쉽게 흔들리는 성격을 말해요."
  },
  {
    question: "\"시험 기간이라 [[눈코 뜰 새 없이]] 바쁘다.\" 밑줄 친 표현의 뜻은?",
    choices: ["눈이 아파서 쉬지 못한다", "아주 바빠 쉴 틈이 없다", "잠을 못 잔다", "코가 막혀서 힘들다"],
    answer: 1,
    explanation: "눈과 코를 뜰 시간도 없을 만큼 매우 바쁘다는 뜻이에요."
  },
  {
    question: "\"지수는 [[입이 무거워서]] 비밀을 맡겨도 안심이야.\" 밑줄 친 표현의 뜻은?",
    choices: ["말이 많다", "밥을 천천히 먹는다", "말이 느리다", "말이 적고 비밀을 잘 지킨다"],
    answer: 3,
    explanation: "말수가 적고 들은 이야기를 함부로 옮기지 않는다는 뜻이에요."
  },
  {
    question: "\"이번 시험에서 [[미역국을 먹었다]].\" 밑줄 친 표현의 뜻은?",
    choices: ["시험에서 떨어졌다", "시험을 잘 봤다", "생일을 맞았다", "국을 먹고 힘을 냈다"],
    answer: 0,
    explanation: "미역이 미끄러워서 시험에 '미끄러진다'고 빗댄 표현이에요."
  }
];

const POINTS_PER_QUESTION = 100 / QUESTIONS.length;
const NUMS = ["①", "②", "③", "④"];

/* ===== 상태 ===== */
let current = 0;
let answers = new Array(QUESTIONS.length).fill(null);

/* ===== 요소 ===== */
const $ = (id) => document.getElementById(id);
const screens = {
  start: $("screen-start"),
  quiz: $("screen-quiz"),
  result: $("screen-result")
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo(0, 0);
}

/* [[...]] 표시를 안전하게(textContent) DOM으로 변환 */
function renderRichText(target, text) {
  target.textContent = "";
  text.split(/(\[\[.*?\]\])/).forEach((part) => {
    if (!part) return;
    if (part.startsWith("[[") && part.endsWith("]]")) {
      const u = document.createElement("u");
      u.textContent = part.slice(2, -2);
      target.appendChild(u);
    } else {
      target.appendChild(document.createTextNode(part));
    }
  });
}

/* ===== 문제 화면 ===== */
function renderQuestion() {
  const q = QUESTIONS[current];
  const total = QUESTIONS.length;

  $("progress-label").textContent = `${current + 1} / ${total}`;
  $("progress-fill").style.width = `${((current + 1) / total) * 100}%`;
  document.querySelector(".progress-bar").setAttribute("aria-valuenow", String(current + 1));

  renderRichText($("question-text"), q.question);

  const list = $("choices");
  list.textContent = "";
  q.choices.forEach((text, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice" + (answers[current] === i ? " selected" : "");
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(answers[current] === i));

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = NUMS[i];
    const label = document.createElement("span");
    label.textContent = text;

    btn.append(num, label);
    btn.addEventListener("click", () => selectChoice(i));
    li.appendChild(btn);
    list.appendChild(li);
  });

  const isLast = current === total - 1;
  const answered = answers[current] !== null;
  $("btn-prev").disabled = current === 0;
  $("btn-next").hidden = isLast;
  $("btn-submit").hidden = !isLast;
  $("btn-next").disabled = !answered;
  $("btn-submit").disabled = !answered;
}

function selectChoice(i) {
  answers[current] = i;
  renderQuestion();
  // 다시 그린 뒤 선택한 보기에 포커스 유지 (키보드 사용자 배려)
  const chosen = $("choices").querySelectorAll(".choice")[i];
  if (chosen) chosen.focus();
}

/* ===== 결과 화면 ===== */
function messageFor(score) {
  if (score === 100) return "완벽해요! 관용표현 박사님이에요! 🏆";
  if (score >= 80) return "대단해요! 거의 다 맞혔어요! 👏";
  if (score >= 60) return "잘했어요! 조금만 더 힘내요! 😊";
  if (score >= 40) return "괜찮아요! 틀린 문제를 확인해 봐요. 💪";
  return "아직 낯설죠? 해설을 읽고 다시 도전해 봐요! 🌱";
}

function showResult() {
  const correctCount = QUESTIONS.filter((q, i) => answers[i] === q.answer).length;
  const score = Math.round(correctCount * POINTS_PER_QUESTION);

  $("score").textContent = String(score);
  $("result-msg").textContent = messageFor(score);
  $("result-count").textContent = `${QUESTIONS.length}문제 중 ${correctCount}문제 정답`;

  // O/X 요약
  const summary = $("summary");
  summary.textContent = "";
  QUESTIONS.forEach((q, i) => {
    const ok = answers[i] === q.answer;
    const li = document.createElement("li");
    li.className = ok ? "ok" : "bad";
    li.textContent = `${i + 1}번 ${ok ? "⭕ 정답" : "❌ 오답"}`;
    summary.appendChild(li);
  });

  // 틀린 문제 카드
  const wrongList = $("wrong-list");
  wrongList.textContent = "";
  let wrongCount = 0;
  QUESTIONS.forEach((q, i) => {
    if (answers[i] === q.answer) return;
    wrongCount++;

    const li = document.createElement("li");
    li.className = "wrong-item";

    const qEl = document.createElement("p");
    qEl.className = "q";
    renderRichText(qEl, `${i + 1}번. ${q.question}`);

    const mine = document.createElement("p");
    mine.className = "row mine";
    mine.textContent = `❌ 내가 고른 답: ${NUMS[answers[i]]} ${q.choices[answers[i]]}`;

    const right = document.createElement("p");
    right.className = "row right";
    right.textContent = `⭕ 정답: ${NUMS[q.answer]} ${q.choices[q.answer]}`;

    const exp = document.createElement("p");
    exp.className = "exp";
    exp.textContent = `💡 ${q.explanation}`;

    li.append(qEl, mine, right, exp);
    wrongList.appendChild(li);
  });

  $("wrong-section").hidden = wrongCount === 0;
  $("perfect-msg").hidden = wrongCount !== 0;

  showScreen("result");
}

/* ===== 이벤트 ===== */
function reset() {
  current = 0;
  answers = new Array(QUESTIONS.length).fill(null);
}

$("btn-start").addEventListener("click", () => {
  reset();
  renderQuestion();
  showScreen("quiz");
});

$("btn-prev").addEventListener("click", () => {
  if (current > 0) { current--; renderQuestion(); }
});

$("btn-next").addEventListener("click", () => {
  if (answers[current] !== null && current < QUESTIONS.length - 1) {
    current++;
    renderQuestion();
  }
});

$("btn-submit").addEventListener("click", () => {
  if (answers.every((a) => a !== null)) showResult();
});

$("btn-retry").addEventListener("click", () => {
  reset();
  showScreen("start");
});
