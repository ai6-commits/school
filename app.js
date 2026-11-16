"use strict";

/* ===== 문제 데이터 =====
   question 안의 [[...]] 는 밑줄 강조할 관용표현입니다.
   answer 는 0부터 시작하는 정답 보기 위치입니다. (0 = ①) */
const QUESTIONS = [
  {
    question: "\"우리 팀은 결승전에서 아쉽게 [[고배를 마셨다]].\" 밑줄 친 표현의 뜻은?",
    choices: ["큰 상을 받고 기뻐했다", "쓴 약을 먹고 병이 나았다", "쓰라린 패배나 실패를 겪었다", "축하 음료를 나누어 마셨다"],
    answer: 2,
    explanation: "'고배'는 쓴 술잔이라는 뜻으로, 쓰라린 패배나 실패를 맛본다는 의미로 쓰여요."
  },
  {
    question: "\"유리창을 깬 범인은 아무것도 모른다며 [[시치미를 뗐다]].\" 밑줄 친 표현의 뜻은?",
    choices: ["잘못을 솔직히 털어놓았다", "알면서도 모르는 척했다", "화가 나서 입을 다물었다", "거짓으로 눈물을 흘렸다"],
    answer: 1,
    explanation: "옛날에 매 주인을 밝히려고 매에 달던 이름표(시치미)를 떼고 자기 매인 척한 데서 나온 말이에요."
  },
  {
    question: "\"회의가 다 끝난 뒤에야 문제를 지적하는 건 [[뒷북을 치는]] 거야.\" 밑줄 친 표현의 뜻은?",
    choices: ["남의 일을 도와주는", "뒤에서 몰래 따라다니는", "북을 쳐서 응원하는", "일이 끝난 뒤에 뒤늦게 나서는"],
    answer: 3,
    explanation: "일이 이미 끝난 뒤에 뒤늦게 떠들거나 대책을 세우는 행동을 빗댄 말이에요."
  },
  {
    question: "\"할아버지는 평생 [[한 우물을 파서]] 최고의 도자기 장인이 되셨다.\" 밑줄 친 표현의 뜻은?",
    choices: ["한 가지 일에 집중해 꾸준히 했다", "여러 가지 일을 동시에 했다", "물이 필요해 땅을 깊이 팠다", "어려운 일이라 중간에 포기했다"],
    answer: 0,
    explanation: "이것저것 하지 않고 한 가지 일에만 힘을 쏟는다는 뜻이에요."
  },
  {
    question: "\"과거의 실수에 [[발목이 잡혀서]] 새로운 일을 시작하지 못했다.\" 밑줄 친 표현의 뜻은?",
    choices: ["발을 다쳐서 걷지 못해서", "달리기 시합에서 져서", "어떤 일에 얽매여 앞으로 나아가지 못해서", "걸음이 가벼워져서"],
    answer: 2,
    explanation: "어떤 일이나 약점에 붙들려 자유롭게 행동하지 못한다는 뜻이에요."
  },
  {
    question: "\"선생님은 우리 반의 협동심을 [[입에 침이 마르도록]] 칭찬하셨다.\" 밑줄 친 표현의 뜻은?",
    choices: ["같은 말을 여러 번 되풀이하며 열심히", "목이 말라서 물을 마셔 가며", "작은 소리로 조심스럽게", "마지못해 짧게"],
    answer: 0,
    explanation: "같은 말을 너무 많이 되풀이해서 입 안의 침이 마를 정도라는 뜻이에요. 주로 칭찬이나 당부를 거듭할 때 써요."
  },
  {
    question: "\"집안 형편이 어려워지자 가족 모두 [[허리띠를 졸라매고]] 저축했다.\" 밑줄 친 표현의 뜻은?",
    choices: ["옷이 커서 허리를 조였다", "새 옷을 사서 입었다", "운동을 열심히 했다", "아껴 쓰며 어려움을 견뎠다"],
    answer: 3,
    explanation: "배고픔을 참으려 허리띠를 조이던 모습에서 나온 말로, 아끼고 절약하며 어려움을 견딘다는 뜻이에요."
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
