import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, ProgressBar } from "react-bootstrap";
import socket from "./socket.js";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [messages, setMessages] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [yesCount, setYesCount] = React.useState(0);
  const [maybeCount, setMaybeCount] = React.useState(0);
  const [noCount, setNoCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  const messageRef = React.useRef([]);

  React.useEffect(() => {
    socket.on("connection");

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendVote = (userChoice) => {
    socket.emit("vote", userChoice);
  };

  React.useEffect(() => {
    socket.on("receiveVote", (userChoice) => {
      setTotalCount(totalCount + 1);
      if (userChoice === "yes") {
        setYesCount(yesCount + 1);
      }
      if (userChoice === "no") {
        setNoCount(noCount + 1);
      }
      if (userChoice === "maybe") {
        setMaybeCount(maybeCount + 1);
      }
    });
    return () => socket.off("receiveVote");
  }, [totalCount, maybeCount, yesCount, noCount]);

  React.useEffect(() => {
    const name = prompt("What is your name?");
    setUser(name);
  }, []);

  React.useEffect(() => {
    socket.on("message", ({ user, message }) => {
      const id = uuidv4();
      messageRef.current = [
        ...messageRef.current,
        {
          user,
          message,
          id,
        },
      ];
      setMessages(messageRef.current);
    });
  }, []);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const message = e.target.chat.value;
    socket.emit("sendMessage", {
      user,
      message,
    });
    const form = document.getElementById("chatform");
    form.reset();
  };

  const renderMessages = (messages, user) => {
    return messages.map((e) => <Message key={e.id} user={user} obj={e} />);
  };

  return (
    <div className="App">
      <form onSubmit={handleChatSubmit} id="chatform">
        <input name="chat" placeholder="chat" autoFocus="true" />
        <input type="submit" value="chat" />
      </form>
      <Container>
        <h2> U Good?</h2>
        <Button variant="success" onClick={(e) => sendVote("yes")}>
          Yes
        </Button>
        <Button variant="warning" onClick={(e) => sendVote("maybe")}>
          maybe
        </Button>
        <Button variant="danger" onClick={(e) => sendVote("no")}>
          not
        </Button>
        <ProgressBar>
          <ProgressBar
            animated
            key={1}
            variant="success"
            now={(yesCount * 100) / totalCount}
          />
          <ProgressBar
            animated
            key={2}
            variant="warning"
            now={(maybeCount * 100) / totalCount}
          />
          <ProgressBar
            animated
            key={3}
            variant="danger"
            now={(noCount * 100) / totalCount}
          />
        </ProgressBar>
      </Container>
      {renderMessages(messages, user)}
    </div>
  );
}

const Message = ({ obj, user }) => {
  console.log(obj.user, user);
  return (
    <p>
      <span
        className={obj.user === user ? "red" : "black"}
        style={{ fontWeight: "bold" }}
      >
        {obj.user}
      </span>
      : {obj.message}
    </p>
  );
};
export default App;
