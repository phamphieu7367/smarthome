import logo from "./logo.svg";
import "./App.css";
import { ColorPicker, Switch } from "antd";
import { Col, InputNumber, Row, Slider, Space } from "antd";
import { createElement, useEffect, useMemo, useRef, useState } from "react";
import ReactAudioPlayer from "react-audio-player";
import AmThanh1 from "./media/canhbaochayno.mp3";
import Weather from "./component/Weather";
import io from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import addNotification from "react-push-notification";

const socket = io.connect("http://localhost:3001");

function App() {
  const [inputValue, setInputValue] = useState(1);
  const [inputValueLed, setInputValueLed] = useState(1);

  const [isTurnOnVoulum, setIsTurnOnVoulum] = useState(false);
  console.log("isTurnOnVoulum", isTurnOnVoulum);
  const [fanStatus, setFanStatus] = useState(false);
  const [ledStatus, setLedStatus] = useState(false);
  const [fireStatus, setFireStatus] = useState(false);
  const [gasStatus, setGasStatus] = useState(false);
  const [pumpStatus, setPumpStatus] = useState(false);
  const [room, setRoom] = useState("");

  // Messages States
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");

  const sendMessage = () => {
    socket.emit("send_message", message);
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log(data);
      // setMessageReceived(data);
    });
  }, [socket]);

  const [colorRgb, setColorRgb] = useState("rgb(0, 0, 0)");
  const [formatRgb, setFormatRgb] = useState("rgb");
  const rgbString = useMemo(
    () => (typeof colorRgb === "string" ? colorRgb : colorRgb.toRgbString()),
    [colorRgb]
  );
  useEffect(() => {
    const rgbArray = rgbString.match(/\d+/g);
    const resultString = rgbArray.join(", ");
    console.log(resultString);
    socket.emit("send_rgbChange", resultString.toString());
  }, [colorRgb]);

  useEffect(() => {
    socket.on("receive_fan", (data) => {
      console.log(data);
      if (data === "on") {
        setFanStatus(true);
      } else {
        setFanStatus(false);
      }
    });

    socket.on("receive_led", (data) => {
      console.log(data);
      if (data === "on") {
        setLedStatus(true);
      } else {
        setLedStatus(false);
      }
    });

    socket.on("receive_fanSpeed", (data) => {
      console.log(data);
      const finalData = (data - 30) / 22.5 + 1;
      setInputValue(finalData);
    });

    socket.on("receive_ledChange", (data) => {
      console.log(data);
      setInputValueLed(data);
    });

    socket.on("receive_fire", async (data) => {
      console.log(data);
      if (data === "on") {
        setFireStatus(true);
        setPumpStatus(true);
        setIsTurnOnVoulum(true);
        // toast.warning("Đang có cháy xảy ra");

        await addNotification({
          title: "Warning",
          subtitle: "Đang có cháy xảy ra",
          message: "Đang có cháy xảy ra",
          theme: "red",
          duration: 2000,
          vibrate: true,
        });
      } else {
        setFireStatus(false);
        setIsTurnOnVoulum(false);
      }
    });

    socket.on("receive_gas", async (data) => {
      console.log(data);
      if (data === "on") {
        setGasStatus(true);
        setIsTurnOnVoulum(true);
        await addNotification({
          title: "Warning",
          subtitle: "Đang rò rỉ khí gas",
          message: "Đang rò rỉ khí gas",
          theme: "red",
          duration: 5000,
          vibrate: true,
        });
      } else {
        setGasStatus(false);
        setIsTurnOnVoulum(false);
      }
    });
    socket.on("receive_pump", (data) => {
      console.log(data);
      if (data === "on") {
        setPumpStatus(true);
      } else {
        setPumpStatus(false);
      }
    });
  }, [socket]);

  const handleClickFan = () => {
    if (fanStatus) {
      console.log(fanStatus);
      socket.emit("send_fan", "off");
      setFanStatus(false);
    } else {
      socket.emit("send_fan", "on");
      setFanStatus(true);
    }
  };

  const handleClickLed = () => {
    if (ledStatus) {
      console.log(ledStatus);
      socket.emit("send_led", "off");
      setLedStatus(false);
    } else {
      socket.emit("send_led", "on");
      setLedStatus(true);
    }
  };

  const onChange = (newValue) => {
    const oldValue = 30 + (newValue - 1) * 22.5;
    console.log(oldValue);
    socket.emit("send_fanSpeed", oldValue.toString());
    setInputValue(newValue);
  };

  const onChangeLed = (newValue) => {
    socket.emit("send_ledChange", newValue.toString());
    setInputValueLed(newValue);
  };

  const handeClickPump = () => {
    if (pumpStatus) {
      console.log(pumpStatus);
      socket.emit("send_pump", "off");
      setPumpStatus(false);
    } else {
      socket.emit("send_pump", "on");
      setPumpStatus(true);
    }
  };

  return (
    <div className="App">
      <div className="form-data">
        <h3>Quạt</h3>
        <Switch onChange={handleClickFan} checked={fanStatus ? true : false} />
        <h3>Bóng đèn</h3>
        <Switch onChange={handleClickLed} checked={ledStatus ? true : false} />
        <h3>Điều chỉnh tốc độ quạt</h3>
        <Row>
          <Col span={12}>
            <Slider
              min={1}
              max={11}
              onChange={onChange}
              value={typeof inputValue === "number" ? inputValue : 0}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={1}
              max={11}
              style={{
                margin: "0 16px",
              }}
              value={inputValue}
              onChange={onChange}
            />
          </Col>
        </Row>
        <h3>Điều chỉnh độ sáng bóng đèn</h3>
        <Row>
          <Col span={12}>
            <Slider
              min={1}
              max={10}
              onChange={onChangeLed}
              value={typeof inputValueLed ? inputValueLed : 0}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={1}
              max={10}
              style={{
                margin: "0 16px",
              }}
              value={inputValueLed}
              onChange={onChangeLed}
            />
          </Col>
        </Row>
        <h3>Điều chỉnh màu bóng đèn</h3>
        <Space
          direction="vertical"
          size="middle"
          style={{
            display: "flex",
          }}
        >
          <Row align="middle">
            <Space>
              <Col>
                <ColorPicker
                  format={formatRgb}
                  value={colorRgb}
                  onChange={setColorRgb}
                  onFormatChange={setFormatRgb}
                />
              </Col>
              <Col>
                RGB: <span>{rgbString}</span>
              </Col>
            </Space>
          </Row>
        </Space>
      </div>
      <div className="form-data" style={{ width: "350px" }}>
        {fireStatus && gasStatus ? (
          <div>
            <div className="alert-icon">!</div>
            <h3 className="flash-text" style={{ color: "red" }}>
              Đang có cháy xảy ra và rò rỉ khí gas
            </h3>
            <ReactAudioPlayer src={AmThanh1} autoPlay={true} loop />
          </div>
        ) : fireStatus ? (
          <div>
            <div className="alert-icon">!</div>
            <h3 className="flash-text" style={{ color: "red" }}>
              Đang có cháy xảy ra
            </h3>
            <ReactAudioPlayer src={AmThanh1} autoPlay={true} loop />
          </div>
        ) : gasStatus ? (
          <div>
            <div className="alert-icon">!</div>
            <h3 className="flash-text" style={{ color: "red" }}>
              Đang có rò rỉ khí gas
            </h3>
            <ReactAudioPlayer src={AmThanh1} autoPlay={true} loop />
          </div>
        ) : (
          <div>
            <h2 style={{ color: "#467237" }}>Hệ thống bình thường</h2>
          </div>
        )}
        <h6>Điều chỉnh máy bơm</h6>
        <Switch onChange={handeClickPump} checked={pumpStatus ? true : false} />
      </div>
      <Weather />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* <div className="page">
        <button onClick={buttonClick} className="button">
          Hello world.
        </button>
      </div> */}
    </div>
  );
}

export default App;
