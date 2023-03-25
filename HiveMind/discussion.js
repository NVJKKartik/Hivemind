// Define an array to store all the discussion topics
const discussionTopics = [];

// Define a function to create a new discussion topic
function createNewTopic(topic) {
  discussionTopics.push(topic);
}

// Define a function to display all the discussion topics on the page
function displayTopics() {
  // Get a reference to the container element for the topics
  const container = document.getElementById('topic-container');
  
  // Clear any existing topics from the container
  container.innerHTML = '';
  
  // Loop through the discussion topics and add them to the container
  for (let i = 0; i < discussionTopics.length; i++) {
    const topic = discussionTopics[i];
    const topicElement = createTopicElement(topic);
    container.appendChild(topicElement);
  }
}

// Define a function to create a new topic element
function createTopicElement(topic) {
  // Create a new div to contain the topic
  const div = document.createElement('div');
  
  // Add a class to the div for styling
  div.classList.add('topic');
  
  // Add the topic title to the div
  const titleElement = document.createElement('h3');
  titleElement.textContent = topic.title;
  div.appendChild(titleElement);
  
  // Add the topic description to the div
  const descriptionElement = document.createElement('p');
  descriptionElement.textContent = topic.description;
  div.appendChild(descriptionElement);
  
  // Add the topic author to the div
  const authorElement = document.createElement('p');
  authorElement.textContent = 'Posted by: ' + topic.author;
  div.appendChild(authorElement);
  
  // Return the div
  return div;
}

// Define an event listener for the form submission
const form = document.getElementById('new-topic-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  // Get the values of the form fields
  const title = document.getElementById('new-topic-title').value;
  const description = document.getElementById('new-topic-description').value;
  const author = document.getElementById('new-topic-author').value;
  
  // Create a new topic object
  const topic = {
    title: title,
    description: description,
    author: author
  };
  
  // Add the new topic to the discussion topics array
  createNewTopic(topic);
  
  // Display the updated list of topics on the page
  displayTopics();
  
  // Reset the form fields
  form.reset();
});
