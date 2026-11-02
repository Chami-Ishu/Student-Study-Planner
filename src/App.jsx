
import { useEffect, useState } from "react";
import "./App.css";

const initialSubjects = [
  { id: 1, name: "Web Development", color: "#9277e8" },
  { id: 2, name: "Database Systems", color: "#45a99a" },
  { id: 3, name: "Software Engineering", color: "#e69b64" },
];

const initialTasks = [
  {
    id: 1,
    title: "Complete React practical",
    subject: "Web Development",
    date: new Date().toISOString().slice(0, 10),
    priority: "High",
    completed: false,
  },
  {
    id: 2,
    title: "Revise SQL queries",
    subject: "Database Systems",
    date: new Date().toISOString().slice(0, 10),
    priority: "Medium",
    completed: true,
  },
];

const initialSchedule = [
  {
    id: 1,
    day: "Monday",
    subject: "Web Development",
    start: "09:00",
    end: "10:30",
  },
  {
    id: 2,
    day: "Wednesday",
    subject: "Database Systems",
    start: "13:00",
    end: "14:30",
  },
];

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [page, setPage] = useState("Dashboard");

  const [subjects, setSubjects] = useState(() =>
    readStorage("sm_subjects", initialSubjects)
  );

  const [tasks, setTasks] = useState(() =>
    readStorage("sm_tasks", initialTasks)
  );

  const [schedule, setSchedule] = useState(() =>
    readStorage("sm_schedule", initialSchedule)
  );

  const [subjectName, setSubjectName] = useState("");
  const [subjectColor, setSubjectColor] = useState("#9277e8");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");

  const [scheduleDay, setScheduleDay] = useState("Monday");
  const [scheduleSubject, setScheduleSubject] = useState("");
  const [scheduleStart, setScheduleStart] = useState("09:00");
  const [scheduleEnd, setScheduleEnd] = useState("10:00");

  const [filter, setFilter] = useState("All");
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const days = [
    "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday", "Sunday"
  ];

  useEffect(() => {
    localStorage.setItem("sm_subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("sm_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("sm_schedule", JSON.stringify(schedule));
  }, [schedule]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const progress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const today = new Date().toISOString().slice(0, 10);

  const todayTasks = tasks.filter(task => task.date === today);
  const upcomingTasks = tasks
    .filter(task => !task.completed && task.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const filteredTasks = tasks.filter(task => {
    if (filter === "Completed") return task.completed;
    if (filter === "Pending") return !task.completed;
    return true;
  });

  function addSubject(e) {
    e.preventDefault();

    if (!subjectName.trim()) return;

    if (editingSubject !== null) {
      const oldName = subjects.find(s => s.id === editingSubject)?.name;

      setSubjects(subjects.map(s =>
        s.id === editingSubject
          ? { ...s, name: subjectName.trim(), color: subjectColor }
          : s
      ));

      if (oldName) {
        setTasks(tasks.map(t =>
          t.subject === oldName
            ? { ...t, subject: subjectName.trim() }
            : t
        ));

        setSchedule(schedule.map(s =>
          s.subject === oldName
            ? { ...s, subject: subjectName.trim() }
            : s
        ));
      }

      setEditingSubject(null);
    } else {
      setSubjects([
        ...subjects,
        {
          id: Date.now(),
          name: subjectName.trim(),
          color: subjectColor,
        },
      ]);
    }

    setSubjectName("");
    setSubjectColor("#9277e8");
  }

  function editSubject(subject) {
    setSubjectName(subject.name);
    setSubjectColor(subject.color);
    setEditingSubject(subject.id);
  }

  function deleteSubject(id) {
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;

    const inUse = tasks.some(t => t.subject === subject.name) ||
      schedule.some(s => s.subject === subject.name);

    if (inUse) {
      alert("This subject is being used in tasks or timetable. Remove those records first.");
      return;
    }

    if (window.confirm("Delete this subject?")) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  }

  function addTask(e) {
    e.preventDefault();

    if (!taskTitle.trim() || !taskSubject || !taskDate) {
      alert("Please fill in all task details.");
      return;
    }

    if (editingTask !== null) {
      setTasks(tasks.map(t =>
        t.id === editingTask
          ? {
              ...t,
              title: taskTitle.trim(),
              subject: taskSubject,
              date: taskDate,
              priority: taskPriority,
            }
          : t
      ));
      setEditingTask(null);
    } else {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          title: taskTitle.trim(),
          subject: taskSubject,
          date: taskDate,
          priority: taskPriority,
          completed: false,
        },
      ]);
    }

    clearTaskForm();
  }

  function clearTaskForm() {
    setTaskTitle("");
    setTaskSubject("");
    setTaskDate("");
    setTaskPriority("Medium");
    setEditingTask(null);
  }

  function editTask(task) {
    setTaskTitle(task.title);
    setTaskSubject(task.subject);
    setTaskDate(task.date);
    setTaskPriority(task.priority);
    setEditingTask(task.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteTask(id) {
    if (window.confirm("Delete this task?")) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  }

  function toggleTask(id) {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }

  function addSchedule(e) {
    e.preventDefault();

    if (!scheduleSubject || scheduleStart >= scheduleEnd) {
      alert("Please select a subject and a valid time range.");
      return;
    }

    const conflict = schedule.some(s =>
      s.day === scheduleDay &&
      scheduleStart < s.end &&
      scheduleEnd > s.start
    );

    if (conflict) {
      alert("This time overlaps with another class.");
      return;
    }

    setSchedule([
      ...schedule,
      {
        id: Date.now(),
        day: scheduleDay,
        subject: scheduleSubject,
        start: scheduleStart,
        end: scheduleEnd,
      },
    ]);
  }

  function deleteSchedule(id) {
    if (window.confirm("Remove this timetable entry?")) {
      setSchedule(schedule.filter(s => s.id !== id));
    }
  }

  function subjectColorFor(name) {
    return subjects.find(s => s.name === name)?.color || "#9277e8";
  }

  function formatDate(date) {
    if (!date) return "";
    return new Date(date + "T00:00:00").toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric", year: "numeric" }
    );
  }

  function navigate(name) {
    setPage(name);
    setEditingTask(null);
    setEditingSubject(null);
    clearTaskForm();
    setSubjectName("");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✿</div>
          <div>
            <h2>StudyMate</h2>
            <span>STUDENT PLANNER</span>
          </div>
        </div>

        <p className="menu-label">MENU</p>

        <nav>
          {[
            ["Dashboard", "⌂"],
            ["Subjects", "▤"],
            ["Study Tasks", "✓"],
            ["Timetable", "▦"],
          ].map(([name, icon]) => (
            <button
              key={name}
              className={`nav-link ${page === name ? "active" : ""}`}
              onClick={() => navigate(name)}
            >
              <span>{icon}</span>
              {name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="study-note">
            <span>🌱</span>
            <h4>Keep growing!</h4>
            <p>Small steps every day lead to big results.</p>
          </div>
          <p className="sidebar-footer">Made for better learning ♡</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="top-date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <h1>{page}</h1>
          </div>
          <div className="profile">
            <div className="avatar">S</div>
            <div>
              <strong>Student</strong>
              <span>My Study Space</span>
            </div>
          </div>
        </header>

        {page === "Dashboard" && (
          <>
            <section className="welcome-banner">
              <div>
                <span className="welcome-tag">YOUR LEARNING JOURNEY</span>
                <h2>Make today count! ✨</h2>
                <p>Organize your studies, stay focused and achieve your goals.</p>
                <button className="banner-button" onClick={() => navigate("Study Tasks")}>
                  View My Tasks →
                </button>
              </div>
              <div className="banner-art">📚</div>
            </section>

            <section className="stats-grid">
              <StatCard icon="📚" label="Total Subjects" value={subjects.length} color="purple" />
              <StatCard icon="📝" label="Total Tasks" value={tasks.length} color="orange" />
              <StatCard icon="⏳" label="Pending Tasks" value={pendingTasks} color="blue" />
              <StatCard icon="✓" label="Completed" value={completedTasks} color="green" />
            </section>

            <section className="dashboard-grid">
              <div className="panel progress-panel">
                <div className="section-heading">
                  <div>
                    <h3>Study Progress</h3>
                    <p>Track your completed tasks</p>
                  </div>
                  <span className="soft-icon">◉</span>
                </div>

                <div className="progress-content">
                  <div
                    className="progress-circle"
                    style={{ "--progress": `${progress}%` }}
                  >
                    <div>
                      <strong>{progress}%</strong>
                      <span>Completed</span>
                    </div>
                  </div>
                  <div className="progress-details">
                    <p><span className="dot purple-dot"></span> Total tasks <strong>{tasks.length}</strong></p>
                    <p><span className="dot green-dot"></span> Completed <strong>{completedTasks}</strong></p>
                    <p><span className="dot orange-dot"></span> Pending <strong>{pendingTasks}</strong></p>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="section-heading">
                  <div>
                    <h3>Today's Tasks</h3>
                    <p>Your daily study goals</p>
                  </div>
                  <button className="text-button" onClick={() => navigate("Study Tasks")}>
                    See all →
                  </button>
                </div>

                {todayTasks.length === 0 ? (
                  <EmptyState text="No tasks scheduled for today." />
                ) : (
                  <div className="task-list">
                    {todayTasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        color={subjectColorFor(task.subject)}
                        onToggle={toggleTask}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="panel upcoming-panel">
              <div className="section-heading">
                <div>
                  <h3>Upcoming Deadlines</h3>
                  <p>Stay ahead of your study schedule</p>
                </div>
                <button className="text-button" onClick={() => navigate("Study Tasks")}>
                  Manage tasks →
                </button>
              </div>

              {upcomingTasks.length === 0 ? (
                <EmptyState text="You have no upcoming deadlines. Great job!" />
              ) : (
                <div className="upcoming-list">
                  {upcomingTasks.map(task => (
                    <div className="upcoming-item" key={task.id}>
                      <div className="deadline-icon">📅</div>
                      <div className="upcoming-info">
                        <strong>{task.title}</strong>
                        <span>{task.subject}</span>
                      </div>
                      <span className="deadline-date">{formatDate(task.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {page === "Subjects" && (
          <section className="panel page-panel">
            <div className="section-heading">
              <div>
                <h3>My Subjects</h3>
                <p>Organize the subjects you are learning</p>
              </div>
              <span className="count-badge">{subjects.length} Subjects</span>
            </div>

            <form className="form-card" onSubmit={addSubject}>
              <h3>{editingSubject ? "Edit Subject" : "Add New Subject"}</h3>
              <div className="form-row">
                <label className="field grow">
                  Subject Name
                  <input
                    value={subjectName}
                    onChange={e => setSubjectName(e.target.value)}
                    placeholder="e.g. Web Development"
                    required
                  />
                </label>
                <label className="field color-field">
                  Choose Color
                  <input
                    type="color"
                    value={subjectColor}
                    onChange={e => setSubjectColor(e.target.value)}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="primary-button" type="submit">
                  {editingSubject ? "Save Changes" : "+ Add Subject"}
                </button>
                {editingSubject && (
                  <button type="button" className="cancel-button"
                    onClick={() => {
                      setEditingSubject(null);
                      setSubjectName("");
                    }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="subject-grid">
              {subjects.map(subject => (
                <div className="subject-card" key={subject.id}>
                  <div className="subject-color" style={{ background: subject.color }}>📖</div>
                  <div className="subject-info">
                    <h4>{subject.name}</h4>
                    <span>{tasks.filter(t => t.subject === subject.name).length} study tasks</span>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => editSubject(subject)} title="Edit">✎</button>
                    <button className="delete-action" onClick={() => deleteSubject(subject.id)} title="Delete subject" aria-label={`Delete ${subject.name}`}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
            {subjects.length === 0 && <EmptyState text="Add your first subject to get started." />}
          </section>
        )}

        {page === "Study Tasks" && (
          <section className="panel page-panel">
            <div className="section-heading">
              <div>
                <h3>Study Tasks</h3>
                <p>Plan your work and complete your goals</p>
              </div>
              <span className="count-badge">{pendingTasks} Pending</span>
            </div>

            <form className="form-card" onSubmit={addTask}>
              <h3>{editingTask ? "Edit Study Task" : "Create a New Task"}</h3>
              <div className="form-grid">
                <label className="field full-field">
                  Task Title
                  <input
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    placeholder="e.g. Complete assignment"
                    required
                  />
                </label>
                <label className="field">
                  Subject
                  <select value={taskSubject} onChange={e => setTaskSubject(e.target.value)} required>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </label>
                <label className="field">
                  Deadline
                  <input type="date" value={taskDate}
                    onChange={e => setTaskDate(e.target.value)}
                    min={today} required />
                </label>
                <label className="field">
                  Priority
                  <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>
              </div>
              <div className="form-actions">
                <button className="primary-button" type="submit">
                  {editingTask ? "Save Changes" : "+ Add Task"}
                </button>
                {editingTask && (
                  <button className="cancel-button" type="button" onClick={clearTaskForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="task-toolbar">
              <h3>All Tasks ({tasks.length})</h3>
              <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option>All</option>
                <option>Pending</option>
                <option>Completed</option>
              </select>
            </div>

            {filteredTasks.length === 0 ? (
              <EmptyState text="No tasks found. Add a task to get started." />
            ) : (
              <div className="managed-task-list">
                {filteredTasks.map(task => (
                  <div className={`managed-task ${task.completed ? "task-done" : ""}`} key={task.id}>
                    <button className={`check-button ${task.completed ? "checked" : ""}`}
                      onClick={() => toggleTask(task.id)}>
                      {task.completed ? "✓" : ""}
                    </button>
                    <div className="managed-task-info">
                      <strong>{task.title}</strong>
                      <span>
                        <i style={{ background: subjectColorFor(task.subject) }}></i>
                        {task.subject} · {formatDate(task.date)}
                      </span>
                    </div>
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <div className="card-actions">
                      <button onClick={() => editTask(task)} title="Edit">✎</button>
                      <button className="delete-action" onClick={() => deleteTask(task.id)} title="Delete task" aria-label={`Delete ${task.title}`}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "Timetable" && (
          <section className="panel page-panel">
            <div className="section-heading">
              <div>
                <h3>Weekly Timetable</h3>
                <p>Plan your weekly study sessions</p>
              </div>
              <span className="count-badge">{schedule.length} Sessions</span>
            </div>

            <form className="form-card" onSubmit={addSchedule}>
              <h3>Add Study Session</h3>
              <div className="form-grid">
                <label className="field">
                  Day
                  <select value={scheduleDay} onChange={e => setScheduleDay(e.target.value)}>
                    {days.map(day => <option key={day}>{day}</option>)}
                  </select>
                </label>
                <label className="field">
                  Subject
                  <select value={scheduleSubject} onChange={e => setScheduleSubject(e.target.value)} required>
                    <option value="">Select subject</option>
                    {subjects.map(s => <option key={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="field">
                  Start Time
                  <input type="time" value={scheduleStart}
                    onChange={e => setScheduleStart(e.target.value)} required />
                </label>
                <label className="field">
                  End Time
                  <input type="time" value={scheduleEnd}
                    onChange={e => setScheduleEnd(e.target.value)} required />
                </label>
              </div>
              <button className="primary-button" type="submit">+ Add Session</button>
            </form>

            <div className="timetable">
              {days.map(day => {
                const entries = schedule
                  .filter(s => s.day === day)
                  .sort((a, b) => a.start.localeCompare(b.start));

                return (
                  <div className="day-row" key={day}>
                    <div className="day-name">{day}</div>
                    <div className="day-sessions">
                      {entries.length === 0 ? (
                        <span className="no-session">No study sessions planned</span>
                      ) : entries.map(entry => (
                        <div className="session-card" key={entry.id}
                          style={{ borderLeftColor: subjectColorFor(entry.subject) }}>
                          <div>
                            <strong>{entry.subject}</strong>
                            <span>{entry.start} – {entry.end}</span>
                          </div>
                          <button className="delete-action" onClick={() => deleteSchedule(entry.id)} title="Delete session" aria-label={`Delete ${entry.subject} session`}>🗑</button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <footer className="main-footer">
          <span>StudyMate © {new Date().getFullYear()}</span>
          <span>Stay focused. Keep learning. ♡</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <span>🌷</span>
      <p>{text}</p>
    </div>
  );
}

function TaskRow({ task, color, onToggle }) {
  return (
    <div className="task-row">
      <button
        className={`check-button ${task.completed ? "checked" : ""}`}
        onClick={() => onToggle(task.id)}
      >
        {task.completed ? "✓" : ""}
      </button>
      <div className="task-row-info">
        <strong className={task.completed ? "completed-text" : ""}>{task.title}</strong>
        <span><i style={{ background: color }}></i>{task.subject}</span>
      </div>
      <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
    </div>
  );
}

export default App;