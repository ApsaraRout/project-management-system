
import React, { useEffect, useState } from 'react';
import './index.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);


  const API = 'http://localhost:5000/api';

  useEffect(() => {
    fetchProjects(1);
  }, []);

  const fetchProjects = async (pageNumber = 1) => {
    const res = await fetch(
      `${API}/projects?page=${pageNumber}&limit=${limit}`
    );

    const data = await res.json();
    console.log("PAGE DATA:", data);
    setProjects(data.projects);
    setTotalPages(data.totalPages);
    setPage(data.page);

    if (data.projects.length > 0) {
      fetchTasks(data.projects[0].id);
    }
  };

  const fetchTasks = async (projectId) => {
    setLoading(true);

    const res = await fetch(
      `${API}/projects/${projectId}/tasks`
    );

    const data = await res.json();

    setTasks(data);

    setLoading(false);
  };

  const createProject = async () => {
    if (!projectName) return;

    await fetch(`${API}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        description: projectDescription,
      }),
    });

    setProjectName('');
    setProjectDescription('');

    fetchProjects();
  };

  const createTask = async () => {
    if (!taskTitle || projects.length === 0) return;

    await fetch(`${API}/projects/${projects[0].id}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
        status: 'TODO',
        priority: 'HIGH',
        dueDate: '2026-05-01'
      }),
    });

    setTaskTitle('');
    setTaskDescription('');

    fetchTasks(projects[0].id);
  };

  const updateStatus = async (task, newStatus) => {
    await fetch(`${API}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...task,
        status: newStatus,
      }),
    });

    fetchTasks(task.projectId);
  };

  const deleteTask = async (id, projectId) => {
    await fetch(`${API}/tasks/${id}`, {
      method: 'DELETE',
    });

    fetchTasks(projectId);
  };



  return (
    <div className="container">

      <div className="navbar">
        <div className="logo">
          PMS Dashboard
        </div>

        <div className="nav-links">
          <span>Projects</span>
          <span>Tasks</span>
          <span>Analytics</span>
        </div>
      </div>

      <h1>AI Project Management System</h1>

      <div className="analytics">
        <div className="card">
          <h2>{projects.length}</h2>
          <p>Total Projects</p>
        </div>

        <div className="card">
          <h2>{tasks.length}</h2>
          <p>Total Tasks</p>
        </div>

        <div className="card">
          <h2>
            {
              tasks.filter(
                (task) => task.status === 'DONE'
              ).length
            }
          </h2>

          <p>Completed Tasks</p>
        </div>
      </div>

      <div className="section">
        <h2>Create Project</h2>

        <input
          placeholder="Project Name"
          value={projectName}
          onChange={(e) =>
            setProjectName(e.target.value)
          }
        />

        <textarea
          placeholder="Project Description"
          value={projectDescription}
          onChange={(e) =>
            setProjectDescription(e.target.value)
          }
        />

        <button onClick={createProject}>
          Create Project
        </button>
      </div>

      <div className="section">
        <h2>Create Task</h2>

        <input
          placeholder="Task Title"
          value={taskTitle}
          onChange={(e) =>
            setTaskTitle(e.target.value)
          }
        />

        <textarea
          placeholder="Task Description"
          value={taskDescription}
          onChange={(e) =>
            setTaskDescription(e.target.value)
          }
        />

        <button onClick={createTask}>
          Add Task
        </button>
      </div>

      <div className="section">
        <h2>Projects</h2>

        {projects.map((project) => (
          <div
            key={project.id}
            className="project-card"
            onClick={() =>
              fetchTasks(project.id)
            }
          >
            <h3>{project.name}</h3>
            <p>{project.description}</p>
          </div>
        ))}

        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => fetchProjects(page - 1)}
          >
            ⬅ Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => fetchProjects(page + 1)}
          >
            Next ➡
          </button>
        </div>

      </div>

      <div className="section">
        <h2>Task Board</h2>

        <div className="filter-row">
          <input
            placeholder="Search Tasks..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>
        {loading && (
          <div className="loading">
            Loading Tasks...
          </div>
        )}

        {tasks.length === 0 && !loading && (
          <div className="empty-state">
            🚀 No Tasks Yet. Create One!
          </div>
        )}
        <div className="kanban-board">

          {/* TODO */}
          <div className="kanban-column">
            <h3>📝 TODO</h3>

            {tasks
              .filter(
                (task) =>
                  task.status === 'TODO' &&
                  task.title
                    .toLowerCase()
                    .includes(search.toLowerCase())
              )
              .map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                >
                  <h4>{task.title}</h4>

                  <p>{task.description}</p>

                  <div className="task-meta">
                    <span className={`priority ${task.priority}`}>
                      {task.priority}
                    </span>

                    {task.dueDate && (
                      <span className="due-date">
                        📅 {task.dueDate}
                      </span>
                    )}
                  </div>

                  <div className="button-row">
                    <button
                      onClick={() =>
                        updateStatus(
                          task,
                          'IN_PROGRESS'
                        )
                      }
                    >
                      Start
                    </button>

                    <button
                      onClick={() =>
                        deleteTask(
                          task.id,
                          task.projectId
                        )
                      }
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        const newTitle = prompt(
                          'Edit Task Title',
                          task.title
                        );

                        if (!newTitle) return;

                        updateStatus({
                          ...task,
                          title: newTitle
                        }, task.status);
                      }}
                    >
                      Edit
                    </button>

                  </div>
                </div>
              ))}
          </div>

          {/* IN PROGRESS */}
          <div className="kanban-column">
            <h3>⚡ IN PROGRESS</h3>

            {tasks
              .filter(
                (task) =>
                  task.status === 'IN_PROGRESS' &&
                  task.title
                    .toLowerCase()
                    .includes(search.toLowerCase())
              )
              .map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                >
                  <h4>{task.title}</h4>

                  <p>{task.description}</p>

                  <div className="button-row">
                    <button
                      onClick={() =>
                        updateStatus(task, 'DONE')
                      }
                    >
                      Complete
                    </button>

                    <button
                      onClick={() =>
                        deleteTask(
                          task.id,
                          task.projectId
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* DONE */}
          <div className="kanban-column">
            <h3>✅ DONE</h3>

            {tasks
              .filter(
                (task) =>
                  task.status === 'DONE' &&
                  task.title
                    .toLowerCase()
                    .includes(search.toLowerCase())
              )
              .map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                >
                  <h4>{task.title}</h4>

                  <p>{task.description}</p>

                  <div className="button-row">
                    <button
                      onClick={() =>
                        updateStatus(task, 'TODO')
                      }
                    >
                      Reopen
                    </button>

                    <button
                      onClick={() =>
                        deleteTask(
                          task.id,
                          task.projectId
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>

        </div>
      </div>

    </div >
  );
}
export default App;