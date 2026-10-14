# Student Project Tracker

A hands-on web app development workshop project for tracking engineering and electronics projects. The app lets users add, view, edit, and delete projects, with records stored in a local SQLite database.

## Run locally

### Requirements

- Node.js 22.18 or later, but below version 23, for the workshop baseline
- Git
- Visual Studio Code
- PowerShell on Windows

### Installation and startup

Open the project folder in VS Code. Open a PowerShell terminal in the project root and run:

```powershell
npm.cmd ci
npm.cmd start
```

Open the app in your browser:

[http://localhost:3000](http://localhost:3000)

To stop the server, press `Ctrl+C` in the terminal running it.

If `npm.cmd ci` fails because there is no `package-lock.json`, check the supplied project files and workshop instructions before changing dependencies.

## How it works

The application follows this flow:

**Browser HTML/CSS/JavaScript → HTTP requests → Express API → SQLite database → JSON responses → updated page**

### Project files

- `public/index.html` — page structure, project form, and project list.
- `public/style.css` — visual styling and responsive layout.
- `public/script.js` — form handling, API requests, rendering, loading and saving feedback, error handling, and edit/delete interactions.
- `server.js` — starts the local web server.
- `app.js` — Express API routes, request validation, and HTTP responses.
- `database.js` — SQLite database operations.
- `data/projects.db` — local SQLite database file, created and used by the application.

The API is the source of truth for project records. Browser refreshes and server restarts should not erase saved records.

### Project statuses

The interface uses these status options:

- `Not Started`
- `In Progress`
- `Completed`

The API and database use `Planned` in place of `Not Started`. The frontend translates between these values.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check server health |
| GET | `/api/projects` | Retrieve projects |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

Project names must contain between 1 and 80 characters after trimming. Valid API statuses are `Planned`, `In Progress`, and `Completed`.

## Verification

Record only checks that you actually performed.

### Automated API test

- **Reported result:** Passed.
- **Test file:** `test/crud.test.js`.
- **Command:** `npm.cmd test`.

The supplied API test uses a temporary database and port `3198`. It tests server behavior, not browser interactions, and is intended to leave the normal `data/projects.db` unchanged.

### Browser acceptance tests

**Reported result: 9 of 9 checks completed.**

- Added two distinct disposable projects through the UI.
- Edited one project and verified that its ID remained unchanged in the API.
- Cancelled a deletion and verified that the project remained.
- Confirmed deletion and verified that the project disappeared from the UI and API.
- Refreshed the page and restarted the server; verified the expected retained and deleted records.
- Verified that blank and whitespace-only names were rejected.
- Stopped the server, observed the load error, restarted it, and retried loading.
- Tested keyboard navigation and visible focus.
- Tested the layout at a 390-pixel viewport width.

These results are recorded from the workshop verification performed by the learner; they have not been independently rerun while preparing this README.

## Workshop limitations

- This is a local teaching application, not a production-ready service.
- There is no sign-in or per-user authorization.
- Browsers accessing the same server share the same project collection.
- The SQLite database file and `node_modules` should not be uploaded to GitHub.
- Keep secrets and database credentials out of source code and documentation.
- Public deployment requires separate hosting, security, and database configuration.

## Learning objectives

This project demonstrates:

- Frontend-to-backend HTTP communication.
- Express route handling and input validation.
- SQLite persistence.
- Create, read, update, and delete (CRUD) operations.
- Loading, saving, empty, success, and error feedback.
- Automated API testing and manual browser acceptance testing.
