import React, { useState, useEffect, useCallback } from "react";
import useWebSocket from "react-use-websocket";
import "./App.css";

const WS_URL = process.env.REACT_APP_WS_URL;

const App = () => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [countdown, setCountdown] = useState(10); // Initialize countdown to 10 seconds

  const { sendMessage, lastMessage } = useWebSocket(WS_URL, {
    onOpen: () => console.log("Connected to WebSocket server"),
    onError: (error) => console.error("WebSocket error:", error),
    shouldReconnect: (closeEvent) => true,
  });

  useEffect(() => {
    if (lastMessage) {
      console.log("Received message:", lastMessage.data);
    }
    if (lastMessage?.data === "counterExceeded") {
      setIsBroken(true);
      setIsPopupVisible(true);
    }
  }, [lastMessage]);

  const handleIncrementMessage = () => {
    sendMessage("increment");
  };

  const handleLockMessage = useCallback(() => {
    sendMessage("lock");
  }, [sendMessage]);

  const handleUnlockMessage = () => {
    sendMessage("unlock");
  };

  const handleLockAction = useCallback(() => {
    setIsPopupVisible(false);
    setIsLocked(true);
    handleLockMessage();
  }, [handleLockMessage]);

  const handleUnlockAction = () => {
    setIsLocked(false);
    setIsBroken(false);
    handleUnlockMessage();
  };

  useEffect(() => {
    let timerInterval;

    if (isPopupVisible) {
      setCountdown(10); // Reset countdown to 10 when popup is shown

      timerInterval = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount === 1) {
            // When countdown reaches 0, perform the lock action
            handleLockAction();
            clearInterval(timerInterval);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000); // Decrement every second
    }

    // Cleanup the interval when the component unmounts or popup is closed
    return () => clearInterval(timerInterval);
  }, [isPopupVisible, handleLockAction]);

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Concordia Security</h2>
        <nav>
          <ul>
            <li className="menu-item active">
              <i className="icon">📊</i>
              Dashboard
            </li>
          </ul>
        </nav>
        <button className="logout" onClick={handleIncrementMessage}>
          Log out
        </button>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <h1>Hall Building Lobby</h1>
          <div className="header-actions">
            <button className="icon-btn">🔔</button>
            <button className="icon-btn" onClick={handleUnlockAction}>
              ⚙️
            </button>
          </div>
        </header>

        {/* Floor plan section */}
        <div className="content">
          <div className="floor-plan">
            <img
              src="concordia-floor-plan.jpg"
              alt="Floor plan"
              className="floor-plan-image"
            />
          </div>
          <div className="right-content">
            {/* Window status */}
            <div className="status-panel">
              <h3>Windows Status</h3>
              <div className="status-controls"></div>
              <table className="status-table">
                <thead>
                  <tr>
                    <th>Window Position</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Window A</td>
                    <td>
                      {isBroken ? (
                        <span className="status broken">Broken</span>
                      ) : (
                        <span className="status safe">Safe</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Window B</td>
                    <td>
                      <span className="status safe">Safe</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Window C</td>
                    <td>
                      <span className="status safe">Safe</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Window D</td>
                    <td>
                      <span className="status safe">Safe</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="status-panel">
              <h3>Door Status</h3>
              <table className="status-table">
                <thead>
                  <tr>
                    <th>Door Position</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Door A</td>
                    <td>
                      {isLocked ? (
                        <span className="status broken">Locked</span>
                      ) : (
                        <span className="status safe">Unlocked</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Door B</td>
                    <td>
                      {isLocked ? (
                        <span className="status broken">Locked</span>
                      ) : (
                        <span className="status safe">Unlocked</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up */}
      {isPopupVisible && (
        <div className="popup">
          <div className="popup-content">
            <h2>ACTION REQUIRED</h2>
            <p>
              A window breakage has been detected. Do you approve the door lock?{" "}
              <br />
              If no response in {countdown} seconds, the doors will lock
              automatically.
            </p>
            <button className="popup-btn lock-btn" onClick={handleLockAction}>
              Lock
            </button>
            <button
              className="popup-btn cancel-btn"
              onClick={() => setIsPopupVisible(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
