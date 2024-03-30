import { BsArrowLeftShort, BsSearch, BsChevronDown, BsReverseLayoutTextSidebarReverse, BsPerson } from "react-icons/bs";
import { GiGymBag } from "react-icons/gi";
import { AiOutlineBarChart, AiOutlineSetting, AiOutlineLogout } from "react-icons/ai";
import { RiDashboardFill } from "react-icons/ri";
import { useState } from "react";


const App = () => {
  const [open, setOpen] = useState(true);
  const [submenuOpen, setsubmenuOpen] = useState(false);
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = {
      link: link,
    };

    setLink(formData.link);

    try {
      const response = await fetch("http://localhost:8080/api/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Network response was not ok");
      }
      setSuccessMessage(data.message);
      setError("");
      console.log(data);
    } catch (error) {
      setError(error.message);
      setSuccessMessage("");
      console.error("Error:", error);
    }

    event.target.reset();

  }

  const Menus = [
    { title: "Dashboard" },
    { title: "Tasks", icon: <BsReverseLayoutTextSidebarReverse />},
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
        <h1 className="text-4xl text-white font-semibold mb-8">Home Page</h1>
        <form onSubmit={handleSubmit} className="bg-gray-700 p-6 rounded-lg shadow-lg flex flex-col gap-4">
          <label htmlFor="productLink" className="block text-lg font-medium text-gray-300">Product Link</label>
          <input
            id="productLink"
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste your product link here"
            className="px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:border-green-500 transition duration-200"
          />
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200">
            Start Bot
          </button>
          {error && <div className="text-red-400 bg-red-800 p-3 rounded mt-2">{error}</div>}
          {successMessage && <div className="text-green-400 bg-green-800 p-3 rounded mt-2">{successMessage}</div>}
        </form>
      </div>
    </div>
  )
}

export default App;
