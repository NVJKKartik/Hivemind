// select the form element
const quizForm = document.querySelector('#quiz-form');

// add event listener for form submission
quizForm.addEventListener('submit', function(event) {
  event.preventDefault(); // prevent the form from submitting
  
  let score = 0; // initialize score to zero
  
  // create an array of objects with the correct answers
  const answers = [
    { question: 'q1', answer: 'c' },
    { question: 'q2', answer: 'a' },
    { question: 'q3', answer: 'c' },
    { question: 'q4', answer: 'b' },
    { question: 'q5', answer: 'd' }
  ];
  
  // loop through each question and check the answer
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    const selected = document.querySelector(`input[name=${answer.question}]:checked`);
    if (selected && selected.value === answer.answer) {
      score += 1; // add 1 to score for each correct answer
    }
  }
  
  // display the score
  alert(`You scored ${score} out of 5`);
});
