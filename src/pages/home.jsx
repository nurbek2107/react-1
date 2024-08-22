import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCollection } from "../hooks/useCollection";
import FormInput from "../components/FormInput";
import { Form, useActionData } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { collection, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import toast from "react-hot-toast";
import "./home.css";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const age = formData.get("age");
  const familyName = formData.get("familyName");
  const email = formData.get("email");
  const img = formData.get("img");

  return { title, age, familyName, email, img };
};

function Home() {
  const { user } = useSelector((state) => state.user);
  const { data: todos } = useCollection(
    "todos",
    ["uid", "==", user.uid],
    ["createAt"]
  );
  const isDarkMode = document.documentElement.classList.contains('dark'); 
  const userData = useActionData();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      const newDoc = {
        ...userData,
        uid: user.uid,
        createAt: serverTimestamp(),
      };
      addDoc(collection(db, "todos"), newDoc).then(() => {
        toast.success("Successfully Added");
      });
    }
  }, [userData, user.uid]);

  const deleteDocument = (id) => {
    deleteDoc(doc(db, "todos", id)).then(() => {
      toast.success("Deleted");
    });
  };

  const viewTodoDetails = (todo) => {
    navigate("/todo-detail", { state: { todo } });
  };

  const filteredTodos = todos?.filter((todo) => {
    const query = searchQuery.toLowerCase();
    return (
      todo.age.toLowerCase().includes(query) ||
      todo.familyName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="site-container">
      <div className="flex justify-between gap-10 mt-10">
        <div className="pt-10">
          <Form
            method="post"
            className="flex flex-col items-center gap-4 w-96 shadow-xl p-5"
          >
            <FormInput type="text" labelText="ID" name="age" />
            <FormInput type="text" labelText="Family Name" name="familyName" />
            <div className="w-full pl-3">
              <button
                type="submit"
                className="btn btn-active font-bold rounded mt-8 w-80"
              >
                Add
              </button>
            </div>
          </Form>
        </div>
        <div className="w-full">
          <div className="flex items-center gap-5 mt-14 justify-center">
            <label className="input input-bordered flex items-center gap-2 ">
              <input
                type="text"
                className="grow"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
          </div>

          <div className="overflow-auto h-[500px] mt-5">
            {filteredTodos &&
              filteredTodos.reverse().map((todo) => (
                <div
                  className="flex gap-4 items-center justify-between p-5 mt-4 shadow-xl cursor-pointer w-[100%]"
                  key={todo.id}
                >
                  <div className="flex gap-8">
                    <div tabIndex="0" role="button" className="avatar">
                      <div className="w-10 rounded-full">
                        <img
                          alt="User Avatar"
                          src={
                            todo.img ||
                            user.photoURL ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-gukc7EnLg2lXrV35IoDl3SrhFbupHeJhuw&s"
                          }
                        />
                      </div>
                    </div>
                    <p className="text-xl">
                      {todo.age || "ID:"}
                    </p>
                    <p className="text-xl">
                      {todo.familyName || "Full Name:"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(todo.id);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
