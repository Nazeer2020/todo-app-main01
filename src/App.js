import { useEffect, useState, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import "./index.css";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// input component

function Input({ them, setInput, handleList, input }) {
  function handleInput(e) {
    const todo = e.target.value;
    setInput(todo);
  }

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      // Call your function here
      handleList(input);
    }
  };

  return (
    <input
      className={
        them === "light" ? "text-input_light text-input" : "text-input"
      }
      type="text"
      placeholder="Create a new todo.."
      value={input}
      onChange={(e) => handleInput(e)}
      onKeyDown={handleKeyPress}
    />
  );
}

// header compoenet

function Header({ themHandle, them }) {
  return (
    <div className="header">
      <h1>TODO</h1>
      {them === "light" ? (
        <img onClick={themHandle} src="assests/images/icon-moon.svg" alt="icon" />
      ) : (
        <img onClick={themHandle} src="assests/images/icon-sun.svg" alt="icon" />
      )}
    </div>
  );
}

// helper function for reodering the list

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// the list componenet

const Lists = ({
  them,
  list,
  completedItems,
  onDragEnd,
  handleSelection,
  setList,
  dragListStyle = {},
  ...props
}) => (
  <DragDropContext onDragEnd={onDragEnd}>
    <Droppable droppableId="droppable">
      {(provided, snapshot) => (
        <div
          className={them === "light" ? "list_light list" : "list"}
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            ...(snapshot.isDraggingOver ? dragListStyle : {}),
          }}
        >
          {list?.map((item, index) => (
            <Item
              them={them}
              handleSelection={handleSelection}
              key={item.id}
              id={item.id}
              index={index}
              item={item}
              {...props}
              underline={item.status === "completed" ? true : false}
            />
          ))}
          {provided.placeholder}
          <Summary them={them} list={list} setList={setList} />
        </div>
      )}
    </Droppable>
  </DragDropContext>
);

// the item component

const Item = ({
  them,
  index,
  item,
  children,
  handleSelection,
  id,
  underline,
  dragItemStyle = {},
}) => (
  <Draggable index={index} draggableId={item.id}>
    {(provided, snapshot) => (
      <div
        className="item"
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          // default item style
          padding: "8px 16px",
          // default drag style
          ...provided.draggableProps.style,

          // customized drag style
          ...(snapshot.isDragging ? dragItemStyle : {}),
        }}
      >
        <input
          type="checkbox"
          checked={underline ? true : false}
          onChange={() => {
            handleSelection(id);
          }}
          className="checkbox"
        />

        <li
          className={them === "light" ? "item_light" : ""}
          style={underline ? { textDecoration: "line-through" } : {}}
        >
          {children(item, provided.dragHandleProps)}
        </li>
      </div>
    )}
  </Draggable>
);

// the filter compoenent

function Filter({ them, newStyle, list, setList }) {
  const [prevData, setPrevData] = useState(null);

  function handleFilter(criteria) {
    setPrevData(list);
    const newItem = list.filter((item) => item.status === criteria);
    setList(newItem);
  }

  function handleReset() {
    setList(prevData);
  }

  return (
    <div
      style={newStyle}
      className={
        them === "light" ? "filter_light summary filter" : "summary filter"
      }
    >
      <p onClick={handleReset} style={{ cursor: "pointer" }}>
        All
      </p>
      <p
        onClick={() => handleFilter("not completed")}
        style={{ cursor: "pointer" }}
      >
        Active
      </p>
      <p
        onClick={() => handleFilter("completed")}
        style={{ cursor: "pointer" }}
      >
        Completed
      </p>
    </div>
  );
}

// the summary component

function Summary({ them, list, setList }) {
  const newStyle = {
    border: "none",
    minWidth: "45%",
    boxShadow: "none",
    justifyContent: "space-between",
    backgroundColor: `${them === "light" ? "#fff" : "hsl(235, 24%, 19%)"}`,
  };

  const filterList = (list) => {
    return list?.filter((item) => item.status === "not completed");
  };

  const completedItems = filterList(list);
  const isDesktop = useMediaQuery({ minWidth: 500 });
  function handleClearComplete() {
    const notCompleteItems = filterList(list);

    setList(notCompleteItems);
  }
  return (
    <div className={them === "light" ? "filter_light  summary " : "summary  "}>
      <p>
        {" "}
        {completedItems?.length > 0 ? completedItems.length : ""} items left
      </p>
      {isDesktop && (
        <Filter newStyle={newStyle} list={list} setList={setList} />
      )}
      <p onClick={handleClearComplete} style={{ cursor: "pointer" }}>
        Clear Completed
      </p>
    </div>
  );
}

// the footer compoenet

function Footer() {
  return <p className="footer">Drag and drop to reorder the list</p>;
}

// the App compoenet

function App() {
  const [them, setThem] = useState(localStorage.getItem("them"));
  const [input, setInput] = useState("");
  const [list, setList] = useState(function () {
    return JSON.parse(localStorage.getItem("list"));
  });

  const generateUniqueId = () => {
    const timestamp = Date.now().toString(36); // Convert timestamp to base36 string
    const random = Math.random().toString(36).substr(2, 5); // Generate random string
    return `${timestamp}-${random}`;
  };

  const isMobile = useMediaQuery({ maxWidth: 500 });

  function themHandle() {
    if (them === "light") {
      setThem("dark");
      localStorage.setItem("them", "dark");
    } else {
      setThem("light");
      localStorage.setItem("them", "light");
    }
  }

  useEffect(() => {
    localStorage.setItem("list", JSON.stringify(list));
  }, [list]);

  const handleDragEnd = ({ destination, source }) => {
    if (!destination) return;

    setList(reorder(list, source.index, destination.index));
  };

  function handleList(input) {
    const data = {
      id: generateUniqueId(),
      todo: input,
      status: "not completed",
    };
    setList((v) => {
      if (!v) {
        return [data];
      } else {
        return [...v, data];
      }
    });
    setInput("");
  }

  function handleSelection(id) {
    const selectedItem = list.find((item) => item.id === id);

    if (selectedItem) {
      const updatedList = list.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status:
              item.status === "not completed" ? "completed" : "not completed",
          };
        }
        return item;
      });

      setList(updatedList);
    }
  }

  return (
    <div className={them === "light" ? "App_light App" : "App"}>
      <div className="container">
        <Header themHandle={themHandle} them={them} />
        <Input
          them={them}
          setInput={setInput}
          handleList={handleList}
          input={input}
        />
        {/* <List them={them} /> */}
        <Lists
          them={them}
          list={list}
          handleSelection={handleSelection}
          onDragEnd={handleDragEnd}
          setList={setList}
          dragItemStyle={{
            background:
              them === "light" ? "hsl(0, 0%, 98%)" : "hsl(235, 21%, 11%)",
            borderRadius: "10px",
          }}
        >
          {(item) => <>{item.todo}</>}
        </Lists>

        {isMobile && <Filter them={them} setList={setList} list={list} />}
        <Footer />
      </div>
    </div>
  );
}

export default App;
