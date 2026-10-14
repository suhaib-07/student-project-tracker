// In-memory project list.
// Projects will reset when the page is refreshed.
const projects = [];

// Find the existing form elements.
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#project-name');
const statusInput = document.querySelector('#project-status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

// Render all projects in the list.
function renderProjects() {
  // Clear the displayed list to prevent duplicate items.
  projectList.replaceChildren();

  // Display every project currently in the array.
  projects.forEach((project) => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('span');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ` — ${project.status}`;

    listItem.append(projectName, projectStatus);
    projectList.appendChild(listItem);
  });

  // Update the empty state if that element exists.
  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

// Handle the form submission.
form.addEventListener('submit', (event) => {
  // Stop the browser's default form submission.
  event.preventDefault();

  // Read the current values entered by the user.
  const name = nameInput.value.trim();
  const status = statusInput.value;

  // Reject a name that is empty or contains only whitespace.
  if (!name) {
    nameInput.focus();
    return;
  }

  // Create and add a new project.
  const project = {
    id: crypto.randomUUID(),
    name: name,
    status: status
  };

  projects.push(project);

  // Update the visible project list.
  renderProjects();

  // Clear the name field for the next project.
  form.reset();
  nameInput.focus();
});

// Show the initial empty list.
renderProjects();