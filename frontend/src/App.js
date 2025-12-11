import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [view, setView] = useState(token ? 'tasks' : 'login');
  const [tasks, setTasks] = useState([]);

  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [taskForm, setTaskForm] = useState({
    titulo: '',
    descripcion: '',
  });

  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const handleAuthChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTaskChange = (e) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value,
    });
  };

  const register = async () => {
    try {
      const res = await api.post('/api/register', authForm);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setView('tasks');
    } catch (error) {
      console.error(error);
      alert('Error al registrarse');
    }
  };

  const login = async () => {
    try {
      const res = await api.post('/api/login', {
        email: authForm.email,
        password: authForm.password,
      });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setView('tasks');
    } catch (error) {
      console.error(error);
      alert('Error al iniciar sesión');
    }
  };

  const loadTasks = async () => {
    try {
      const res = await api.get('/api/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar tareas');
    }
  };

  const createTask = async () => {
    if (!taskForm.titulo) {
      alert('El título es obligatorio');
      return;
    }
    try {
      const res = await api.post('/api/tasks', taskForm);
      setTasks([...tasks, res.data]);
      setTaskForm({ titulo: '', descripcion: '' });
    } catch (error) {
      console.error(error);
      alert('Error al crear tarea');
    }
  };

  const toggleTask = async (task) => {
    try {
      const res = await api.put(`/api/tasks/${task.id}`, {
        completado: !task.completado,
      });
      setTasks(tasks.map(t => (t.id === task.id ? res.data : t)));
    } catch (error) {
      console.error(error);
      alert('Error al actualizar tarea');
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
      alert('Error al eliminar tarea');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setTasks([]);
    setView('login');
  };

  useEffect(() => {
    if (token && view === 'tasks') {
      loadTasks();
    }
  }, [token, view]);

  return (
    <div className="App">
      <h1>CloudEduHub – Frontend React</h1>

      {view === 'login' && (
        <div className="card">
          <h2>{authForm.name ? 'Registro' : 'Inicio de sesión'}</h2>

          {authForm.name && (
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              value={authForm.name}
              onChange={handleAuthChange}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={authForm.email}
            onChange={handleAuthChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={authForm.password}
            onChange={handleAuthChange}
          />

          {authForm.name && (
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirmar contraseña"
              value={authForm.password_confirmation}
              onChange={handleAuthChange}
            />
          )}

          <div className="buttons">
            <button onClick={authForm.name ? register : login}>
              {authForm.name ? 'Registrarse' : 'Iniciar sesión'}
            </button>

            <button
              onClick={() =>
                setAuthForm(
                  authForm.name
                    ? { ...authForm, name: '' }
                    : { ...authForm, name: 'Nuevo Usuario' }
                )
              }
            >
              {authForm.name ? 'Cambiar a Login' : 'Cambiar a Registro'}
            </button>
          </div>
        </div>
      )}

      {view === 'tasks' && (
        <div className="card">
          <div className="header-row">
            <h2>Mis tareas</h2>
            <button onClick={logout}>Cerrar sesión</button>
          </div>

          <div className="new-task">
            <input
              type="text"
              name="titulo"
              placeholder="Título de la tarea"
              value={taskForm.titulo}
              onChange={handleTaskChange}
            />
            <input
              type="text"
              name="descripcion"
              placeholder="Descripción (opcional)"
              value={taskForm.descripcion}
              onChange={handleTaskChange}
            />
            <button onClick={createTask}>+ Agregar</button>
          </div>

          <ul className="task-list">
            {tasks.map(task => (
              <li
                key={task.id}
                className={task.completado ? 'task completed' : 'task'}
              >
                <div>
                  <strong>{task.titulo}</strong>
                  <p>{task.descripcion}</p>
                </div>
                <div className="task-actions">
                  <button onClick={() => toggleTask(task)}>
                    {task.completado ? 'Desmarcar' : 'Completar'}
                  </button>
                  <button onClick={() => deleteTask(task.id)}>Eliminar</button>
                </div>
              </li>
            ))}
            {tasks.length === 0 && <p>No hay tareas aún.</p>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;