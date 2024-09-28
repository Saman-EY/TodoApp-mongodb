import { RiMastodonLine } from "react-icons/ri";
import { BiRightArrow, BiLeftArrow } from "react-icons/bi";
import { IoIosDoneAll } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
import { useState } from "react";

function Tasks({ data, next, back, fetchTodos, finish }) {
  const [editInput, setEditInput] = useState({});
  const [value, setValue] = useState("");
  const [processing, setProcessing] = useState(false);

  const changeStatus = async (id, status) => {
    const res = await fetch("/api/todos", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.status === "success") fetchTodos();
  };

  const deleteTodo = async (id) => {
    const res = await fetch("/api/todos", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    console.log(data);
    if (data.status === "success") fetchTodos();
  };

  const toggleEditInput = (id) => {
    setEditInput((prevState) => ({
      [id]: !prevState[id],
    }));
  };

  const editTodoTitle = async (id, status) => {
    setProcessing(true);
    console.log(id, status);
    const res = await fetch("/api/todos", {
      method: "PATCH",
      body: JSON.stringify({ id, status, title: value }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setProcessing(false);
    if (data.status === "success") fetchTodos();

    setEditInput((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));

    console.log(data);
  };

  return (
    <div className="tasks">
      {data?.map((i) => (
        <div key={i._id} className="tasks__card">
          <span className={i.status}></span>
          <RiMastodonLine color="#e1e6ff" />
          <h4>{i.title}</h4>
          {editInput[i._id] ? (
            <div className="edit-todo-div">
              <input
                type="text"
                placeholder="edit your todo"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />

              {!processing ? (
                <button onClick={() => editTodoTitle(i._id, i.status)}>
                  save
                </button>
              ) : (
                <button
                  style={{ opacity: ".5", pointerEvents: "none" }}
                  onClick={() => editTodoTitle(i._id, i.status)}
                >
                  processing...
                </button>
              )}
            </div>
          ) : null}

          <div>
            {back ? (
              <button
                className="button-back"
                onClick={() => changeStatus(i._id, back)}
              >
                <BiLeftArrow />
                Back
              </button>
            ) : null}
            {next ? (
              <button
                className="button-next"
                onClick={() => changeStatus(i._id, next)}
              >
                Next
                <BiRightArrow />
              </button>
            ) : null}
            {finish ? (
              <button onClick={() => deleteTodo(i._id)} className="button-next">
                Finish
                <IoIosDoneAll size={20} />
              </button>
            ) : null}
          </div>

          <span onClick={() => toggleEditInput(i._id)} className="edit-btn">
            <FaRegEdit color="white" />
          </span>
        </div>
      ))}
    </div>
  );
}

export default Tasks;
