#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ESP32Servo.h>

int digitalPin = 36; // KY-037 digital interface
int analogPin = 39;  // KY-037 analog interface
const unsigned char REDLEDPIN = 14;
const unsigned char GREENLEDPIN = 12;
const unsigned char SERVOPIN = 21;
int digitalVal; // digital readings
int analogVal;  // analog readings
bool isLocked = false;

Servo myservo; // create servo object to control a servo
int pos = 0;   // variable to store the servo position

// iphone credentials
const char *ssid = WIFI_SSID;
const char *password = WIFI_PASSWORD;

// WebSocket server settings
const char *websockets_server = WEBSOCKET_SERVER;
const uint16_t websockets_port = 8080;
const char *websockets_path = "/ws";

WebSocketsClient webSocket;

// Function prototypes
void webSocketEvent(WStype_t type, uint8_t *payload, size_t length);
void connectToWiFi();

void setup()
{
  Serial.begin(115200);
  pinMode(digitalPin, INPUT);
  pinMode(analogPin, INPUT);
  pinMode(REDLEDPIN, OUTPUT);
  pinMode(GREENLEDPIN, OUTPUT);
  pinMode(SERVOPIN, OUTPUT);

  // setup servo: Allow allocation of all timers
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  myservo.setPeriodHertz(50);           // standard 50 hz servo
  myservo.attach(SERVOPIN, 1000, 2000); // attaches the servo on pin 18 to the servo object

  delay(10);

  connectToWiFi();

  // WebSocket event handler
  webSocket.onEvent(webSocketEvent);

  // Initiate WebSocket connection
  webSocket.begin(websockets_server, websockets_port, websockets_path);

  // Optional: Enable debug messages
  webSocket.enableHeartbeat(30000, 10000, 2);

  digitalWrite(REDLEDPIN, LOW);
  digitalWrite(GREENLEDPIN, HIGH);
}

void loop()
{
  webSocket.loop();

  // Example: Send "increment" every 10 seconds
  static unsigned long lastSendTime = 0;
  unsigned long currentTime = millis();

  // Read the digital inteface
  digitalVal = digitalRead(digitalPin);

  if (digitalVal == HIGH)
  {
    // Serial.println("digital High");
    Serial.println("Sending: increment");
    webSocket.sendTXT("increment");

    // Print analog value to serial
    // analogVal = analogRead(analogPin);
    // Serial.println(analogVal);
    delay(100);
  }

  if (isLocked)
  {
    // Serial.println("Locked");
    digitalWrite(REDLEDPIN, HIGH);
    digitalWrite(GREENLEDPIN, LOW);
    myservo.write(180);
    delay(15);
  }
  else
  {
    // Serial.println("Unlocked");
    digitalWrite(REDLEDPIN, LOW);
    digitalWrite(GREENLEDPIN, HIGH);
    myservo.write(0);
    delay(15);
  }
}

// Function to handle WebSocket events
void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
  switch (type)
  {
  case WStype_DISCONNECTED:
    Serial.println("WebSocket Disconnected");
    break;
  case WStype_CONNECTED:
    Serial.println("WebSocket Connected");
    // Send a message upon connection
    webSocket.sendTXT("get");
    break;
  case WStype_TEXT:
    Serial.printf("Received: %s\n", payload);
    if (strcmp((char *)payload, "doorsLocked") == 0)
    {
      isLocked = true;
    }
    else if (strcmp((char *)payload, "doorsUnlocked") == 0)
    {
      isLocked = false;
    }
    break;
  case WStype_ERROR:
    Serial.println("WebSocket Error");
    break;
  case WStype_PONG:
  case WStype_PING:
  case WStype_BIN:
    break;
  }
}

// Function to connect to Wi-Fi
void connectToWiFi()
{
  Serial.printf("Connecting to %s ", ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println(" CONNECTED");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}