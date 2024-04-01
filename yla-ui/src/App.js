import { BsPlus, BsArrowLeftShort, BsSearch, BsChevronDown, BsReverseLayoutTextSidebarReverse, BsPerson, BsTrash, BsPlayFill, BsStopFill } from 'react-icons/bs';
import { GiGymBag } from "react-icons/gi";
import { AiOutlineBarChart, AiOutlineSetting, AiOutlineLogout } from "react-icons/ai";
import { RiDashboardFill } from "react-icons/ri";
import { useState } from "react";


const App = () => {
    const [open, setOpen] = useState(true);
    const [submenuOpen, setsubmenuOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
  
    const addTask = () => {
      setTasks([...tasks, { id: Date.now(), link: '' }]);
    };
  
    const updateTask = (id, link) => {
      setTasks(tasks.map(task => task.id === id ? { ...task, link } : task));
    };
  
    const startTask = async (id) => {
      const task = tasks.find(task => task.id === id);
      if (task) {
        setTasks(tasks.map(t => 
          t.id === id ? { ...t, status: 'Starting...' } : t
        ));
        try {
          const response = await fetch("http://localhost:8080/api/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ link: task.link }),
          });
          
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Network response was not ok");
          }
          setSuccessMessage(`Task ${id} started: ${data.message}`);
          setTasks(tasks.map(t => 
            t.id === id ? { ...t, status: 'In Progress' } : t
          ));

          setTimeout(() => {
            setTasks(tasks.map(t => 
              t.id === id ? { ...t, status: 'Completed' } : t
            ));
          }, 20000); // Replace with real event handling
        } catch (error) {
          setError(`Task ${id} error: ${error.message}`);
        }
      }
    };

    const stopTask = async (id) => {
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        setTasks(tasks.map(t => 
          t.id === id ? { ...t, status: 'Stopping...' } : t
        ));
    
        try {
          const response = await fetch("http://localhost:8080/api/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
    
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Network response was not ok");
          }
    
          setSuccessMessage(`Task ${id} stopped: ${data.message}`);
          setTasks(tasks.map(t => 
            t.id === id ? { ...t, status: 'Paused' } : t
          ));
        } catch (error) {
          setError(`Task ${id} error: ${error.message}`);
          setTasks(tasks.map(t => 
            t.id === id ? { ...t, status: 'Error Stopping' } : t
          ));
        }
      }
    };
    
  
    const deleteTask = (id) => {
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
    };

  const Menus = [
    { title: "Dashboard" },
    { title: "Tasks", icon: <BsReverseLayoutTextSidebarReverse /> },
    { title: "Proxies", icon: <AiOutlineBarChart /> },
    { title: "Profile", icon: <BsPerson /> },
    { title: "Settings", icon: <AiOutlineSetting /> },
    { title: "Logout", icon: <AiOutlineLogout /> },
  ];
  

  return (
    <div className="flex bg-gray-900 min-h-screen">
      <div className={`bg-dark-purple h-screen p-5 pt-8 ${open ?
        "w-72" : "w-20"} duration-300 relative`}>

        <BsArrowLeftShort className={`bg-white text-dark-purple 
        text-3xl rounded-full absolute -right-3 top-9 border 
        border-dark-purple cursor-pointer ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)} />

        <GiGymBag className={`bg-amber-300 text-4xl rounded cursor-pointer block float-left mr-2 duration-500 ${open && "rotate-[360deg]"}`} />

        <h1 className={`text-white origin-left  font-medium text-2xl duration-300 ${!open && "scale-0"}`}>YLA Bot</h1>

        <div className={`flex items-center rounded-md bg-light-white mt-6 ${!open ? "px-2.5 mt-0.5" : "px-4 mt-6"} py-2`}>
          <BsSearch className={`text-white text-lg block float-left cursor-pointer ${open && "mr-2"}`} />

          <input type={"search"} placeholder="Search" className={`text-base bg-transparent w-full text-white focus:outline-none ${!open && "hidden"}`}></input>
        </div>

        <ul className="pt-2">
          {Menus.map((menu, index) => (
            <>
              <li key={index} className={`text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 hover:bg-light-white rounded-md ${menu.spacing ? "mt-9" : "mt-2"}`}>
                <span className="text-2xl block float-left">
                  {menu.icon ? menu.icon : <RiDashboardFill />}
                </span>
                <span className={`text-base font-medium flex-1 duration-200 ${!open && "hidden"}`}>
                  {menu.title}
                </span>
                {menu.submenu && open && (
                  <BsChevronDown className={`${submenuOpen && "rotate-180"}`} onClick={() => setsubmenuOpen(!submenuOpen)} />
                )}
              </li>
              {menu.submenu && submenuOpen && open && (
                <ul>
                  {menu.submenuItems.map((submenuitem, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-center gap-x-4 cursor-pointer p-2 px-5 hover:bg-light-white rounded-md">
                      {submenuitem.title}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ))}
        </ul>
      </div>
      {/* Main content */}
      <div className="flex-1 p-10">
        <h1 className="text-4xl text-white font-semibold mb-8">Tasks</h1>
        <button onClick={addTask} className="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <BsPlus />
          <span>Create Task</span>
        </button>
        <div className="overflow-x-auto rounded-md ">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xl text-blue-500 uppercase bg-gray-700 rounded">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Link</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="text-xl text-white bg-gray-800 border-b border-gray-700">
                  <td className="px-6 py-4">{task.id}</td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={task.link}
                      onChange={(e) => updateTask(task.id, e.target.value)}
                      className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none"
                    />
                  </td>
                  <td className="px-6 py-4">{task.status}</td>
                  <td className="px-6 py-4 flex gap-4">
                    <button onClick={() => startTask(task.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                      <BsPlayFill />
                    </button>
                    <button onClick={() => stopTask(task.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">
                      <BsStopFill />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                      <BsTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <div className="text-red-400 bg-red-800 p-3 rounded mt-4">{error}</div>}
        {successMessage && <div className="text-green-400 bg-green-800 p-3 rounded mt-4">{successMessage}</div>}
      </div>
    </div>
  )
}

export default App;
