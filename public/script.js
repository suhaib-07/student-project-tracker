// Student Project Tracker
// Projects are stored in this browser's localStorage.
const STORAGE_KEY = 'workshop-projects-v1';

// Start with an empty collection until saved data is loaded.
let projects = [];

// Track which project is being edited.
// null means the form is in Add mode.
let editingId = null;

// Find the existing form elements.
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#project-name');
const statusInput = document.querySelector('#project-status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

// Find the existing submit button.
const submitButton = form.querySelector('button[type="submit"]');

// Reuse the existing message element to report errors.
const message = document.querySelector('#message');

// Create a Cancel edit button.
const cancelButton = document.createElement('button');
cancelButton.type = 'button';
cancelButton.textContent = 'Cancel edit';
cancelButton.hidden = true;
cancelButton.style.marginLeft = '8px';
submitButton.insertAdjacentElement('afterend', cancelButton);

// Display a message without interpreting it as HTML.
function showMessage(text) {
  if (message) {
    message.textContent = text;
  }
}

// Save the current collection.
// Return false if storage is unavailable or saving fails.
function saveProjects() {
  try {
    // stringify turns the array into text for storage.
    const savedText = JSON.stringify(projects);
    localStorage.setItem(STORAGE_KEY, savedText);
    showMessage('');
    return true;
  } catch (error) {
    showMessage(
      'Changes could not be saved to this browser. Your current changes may be lost if you refresh.'
    );
    console.error('Could not save projects to localStorage:', error);
    return false;
  }
}

// Load the saved collection when the page starts.
function loadProjects() {
  let savedText;

  try {
    savedText = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    showMessage(
      'Saved projects could not be read from this browser. Check browser storage permissions.'
    );
    console.error('Could not read projects from localStorage:', error);
    return;
  }

  // No saved value means this is a fresh collection.
  if (savedText === null) {
    projects = [];
    return;
  }

  let parsedData;

  try {
    // parse turns the stored text back into JavaScript data.
    parsedData = JSON.parse(savedText);
  } catch (error) {
    showMessage(
      'Saved project data is invalid and could not be loaded. It has not been overwritten. Do not add, edit or delete projects until the saved data is repaired or removed.'
    );
    console.error('Saved project data is not valid JSON:', error);
    return;
  }

  // Validate the collection and every record before accepting it.
  const validData =
    Array.isArray(parsedData) &&
    parsedData.every((project) =>
      project !== null &&
      typeof project === 'object' &&
      !Array.isArray(project) &&
      typeof project.id === 'string' &&
      project.id.length > 0 &&
      typeof project.name === 'string' &&
      project.name.trim().length > 0 &&
      typeof project.status === 'string' &&
      ['Not Started', 'In Progress', 'Completed'].includes(project.status)
    );

  if (!validData) {
    showMessage(
      'Saved project data has an unexpected format and could not be loaded. It has not been overwritten. Do not add, edit or delete projects until the saved data is repaired or removed.'
    );
    console.error('Saved project data failed validation.');
    return;
  }

  // Use the saved records only after validation succeeds.
  projects = parsedData;
}

// Enter Add mode and clear unsaved form changes.
function resetForm() {
  editingId = null;
  form.reset();
  submitButton.textContent = 'Add Project';
  cancelButton.hidden = true;
}

// Render every project in the list.
function renderProjects() {
  // Clear the displayed list before rebuilding it.
  projectList.replaceChildren();

  projects.forEach((project) => {
    const listItem = document.createElement('li');

    const projectName = document.createElement('span');
    projectName.textContent = project.name;

    const projectStatus = document.createElement('span');
    projectStatus.textContent = ` — ${project.status}`;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.style.marginLeft = '12px';

    // Select the project using its stable ID.
    editButton.addEventListener('click', () => {
      editingId = project.id;
      nameInput.value = project.name;
      statusInput.value = project.status;

      submitButton.textContent = 'Save changes';
      cancelButton.hidden = false;
      nameInput.focus();
      showMessage('');
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '8px';

    // Delete by stable ID, never by name or row position.
    deleteButton.addEventListener('click', () => {
      const projectToDelete = projects.find(
        (item) => item.id === project.id
      );

      if (!projectToDelete) {
        return;
      }

      const confirmed = window.confirm(
        `Delete "${projectToDelete.name}" (${projectToDelete.status})? This cannot be undone.`
      );

      // Cancelling must not change the array or saved data.
      if (!confirmed) {
        return;
      }

      const originalProjects = projects;
      projects = projects.filter(
        (item) => item.id !== projectToDelete.id
      );

      // If this was the project being edited, leave Edit mode.
      if (editingId === projectToDelete.id) {
        resetForm();
      }

      renderProjects();

      // Persist only after confirmed deletion.
      if (!saveProjects()) {
        // Keep the in-memory deletion, but clearly report that it
        // may not survive a refresh.
        return;
      }
    });

    listItem.append(
      projectName,
      projectStatus,
      editButton,
      deleteButton
    );

    projectList.appendChild(listItem);
  });

  // Update the optional empty-state element if present.
  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

// Do not modify saved records if loading failed because the
// stored data was malformed or inaccessible.
let storageReady = false;

function initializeStorage() {
  loadProjects();

  // Only allow mutations if storage is accessible and the stored
  // data is either absent or valid.
  try {
    const savedText = localStorage.getItem(STORAGE_KEY);

    if (savedText === null) {
      storageReady = true;
    } else {
      // A successful parse/validation is indicated by loadProjects
      // having completed without an invalid-data message.
      const parsedData = JSON.parse(savedText);
      storageReady =
        Array.isArray(parsedData) &&
        parsedData.every((project) =>
          project !== null &&
          typeof project === 'object' &&
          !Array.isArray(project) &&
          typeof project.id === 'string' &&
          project.id.length > 0 &&
          typeof project.name === 'string' &&
          project.name.trim().length > 0 &&
          typeof project.status === 'string' &&
          ['Not Started', 'In Progress', 'Completed'].includes(project.status)
        );
    }
  } catch (error) {
    storageReady = false;
  }
}

// Handle both Add and Save changes with one submit listener.
form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!storageReady) {
    showMessage(
      'Project changes are disabled because saved data could not be loaded safely. Repair or remove the invalid saved data, then refresh.'
    );
    return;
  }

  // Read the current values from the form.
  const name = nameInput.value.trim();
  const status = statusInput.value;

  // Reject an empty or whitespace-only name.
  if (!name) {
    showMessage('Please enter a project name.');
    nameInput.focus();
    return;
  }

  // Keep a copy so a failed save can restore the in-memory state.
  const previousProjects = projects.map((project) => ({ ...project }));

  if (editingId === null) {
    // Add mode: create a new project with a stable unique ID.
    projects.push({
      id: crypto.randomUUID(),
      name: name,
      status: status
    });
  } else {
    // Edit mode: update the selected record without changing its ID.
    const project = projects.find(
      (item) => item.id === editingId
    );

    if (!project) {
      showMessage(
        'The project being edited could not be found. The list has been refreshed.'
      );
      resetForm();
      renderProjects();
      return;
    }

    project.name = name;
    project.status = status;
  }

  // Save the successful Add or Edit.
  if (!saveProjects()) {
    // Restore the prior in-memory collection if saving fails.
    projects = previousProjects;
    renderProjects();
    return;
  }

  renderProjects();
  resetForm();
  nameInput.focus();
});

// Cancel edit without changing any saved project.
cancelButton.addEventListener('click', () => {
  resetForm();
  nameInput.focus();
  showMessage('');
});

// Load saved projects and display them on startup.
initializeStorage();
renderProjects();