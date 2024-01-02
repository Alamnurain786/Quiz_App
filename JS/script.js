// Variables to store the questions, current question index, score, and elements for rendering the quiz
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerId;

let nextBtn;
let answerBtn;
let questionElement;

window.onload = function () {
    // Get references to the DOM elements
    questionElement = document.getElementById("question");
    answerBtn = document.getElementById("answer-buttons");
    nextBtn = document.getElementById("next-btn");

    // Add event listeners for changing the category and handling the next button click
    document.getElementById('category').addEventListener('change', fetchQuestions);
    nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length) {
            handleNextBtn();
        } else {
            startQuiz();
        }
    });

    // Fetch the categories and questions when the page loads
    fetchCategories();
    fetchQuestions();
}

async function fetchQuestions() {
    try {
        // Get the selected category and make a request to the API for 10 multiple-choice questions
        const categoryElement = document.getElementById('category');
        const category = categoryElement.value;
        const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`);
        const data = await response.json();
        // console.log(data);

        // Check if there are any questions and process them
        if (data.results) {
            questions = data.results.map((question) => {
                const incorrect_answers = question.incorrect_answers || [];
                return {
                    question: question.question,
                    answers: [
                        ...incorrect_answers.map(answer => ({ text: answer, correct: false })),
                        { text: question.correct_answer, correct: true }
                    ]
                };
            });
            startQuiz();
        } else {
            console.error('No results in API response');
        }
    } catch (err) {
        console.error(err);
    }
}

// Start the quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextBtn.innerHTML = "Next";
    showQuestion();
}

// Display the current question
function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
        let button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerBtn.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
    startTimer();
}

function resetState() {
    nextBtn.style.display = "none";
    while (answerBtn.firstChild) {
        answerBtn.removeChild(answerBtn.firstChild);
    }
    document.getElementById('timer').style.color = '';
    clearInterval(timerId);
}

// Handle the user clicking an answer option
function selectAnswer(e) {
    let selectedBtn = e.target;
    let correct = selectedBtn.dataset.correct;
    if (correct) {
        selectedBtn.classList.add("correct")
        score++;
        updateScoreBoard();
    } else {
        selectedBtn.classList.add("incorrect")
    }
    Array.from(answerBtn.children).forEach(button => {
        if (button.dataset.correct) {
            button.classList.add("correct")
        }
        button.disabled = true;
    });
    nextBtn.style.display = "block";
    clearInterval(timerId);
}


// Handle the next button click
function handleNextBtn() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        resetState();
        questionElement.innerHTML = "Your Score is " + score + "/" + questions.length;
        nextBtn.innerHTML = "Play Again";
        nextBtn.style.display = "block";
    }
    updateProgressBar();
}

function startTimer() {
    let timeLeft = 30;
    document.getElementById('timer').textContent = `Time left: ${timeLeft}`;
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Time left: ${timeLeft}`;
        if (timeLeft <= 10) {
            document.getElementById('timer').style.color = 'red';
        }
        if (timeLeft <= 0) {
            clearInterval(timerId);
            handleNextBtn();
        }
    }, 1000);
}

// Fetch the categories from the API
// Implement your own logic here to fetch the categories and handle the category change event
async function fetchCategories() {
    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();
        const selectElement = document.getElementById('category');
        data.trivia_categories.forEach((category) => {
            const optionElement = document.createElement('option');
            optionElement.value = category.id;
            optionElement.textContent = category.name;
            selectElement.appendChild(optionElement);
        });
    } catch (err) {
        console.error(err);
    }
}

function updateScoreBoard() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Score: ${score}`;
}

function updateProgressBar() {
    const progressBar = document.getElementById('quiz-progress');
    progressBar.value = currentQuestionIndex + 1;
}