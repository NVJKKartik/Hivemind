// get the topic form and button
const topicForm = document.getElementById('topic-form');
const startQuizBtn = topicForm.querySelector('button');

// add event listener for form submit
topicForm.addEventListener('submit', (event) => {
  event.preventDefault(); // prevent form from submitting
  const selectedTopic = topicForm.querySelector('input[name="topic"]:checked').value;
  window.location.href = `${selectedTopic}quiz.html`;
});

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

function myFunction(x) {
    x.classList.toggle("change");
}