---
title: 智能家居控制系统
date: 2026-01-15
isPublic: true
tags:
  - IoT
  - 嵌入式
  - Python
---

## 项目概述

这是一个基于 ESP32 和 MQTT 协议的智能家居控制系统，可以实现对家中灯光、窗帘、温度等设备的远程控制。

## 系统架构

系统采用分层架构设计：

- **感知层**：ESP32 控制器 + 各种传感器
- **通信层**：MQTT 协议
- **应用层**：Python 后端 + Web 控制界面

## 硬件清单

| 设备 | 数量 | 用途 |
|------|------|------|
| ESP32 开发板 | 3 | 主控制器 |
| DHT22 温湿度传感器 | 2 | 环境监测 |
| RGB LED 模块 | 4 | 灯光控制 |
| 舵机 SG90 | 2 | 窗帘控制 |
| 继电器模块 | 6 | 大功率设备控制 |

## 核心代码

### ESP32 端代码（Arduino）

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "your_wifi";
const char* password = "your_password";
const char* mqtt_server = "192.168.1.100";

WiFiClient espClient;
PubSubClient client(espClient);

void callback(char* topic, byte* message, unsigned int length) {
  String msg;
  for(int i = 0; i < length; i++) {
    msg += (char)message[i];
  }
  // 处理收到的指令
  if(msg == "ON") {
    digitalWrite(LED_PIN, HIGH);
  } else if(msg == "OFF") {
    digitalWrite(LED_PIN, LOW);
  }
}

void setup() {
  Serial.begin(115200);
  // 连接 WiFi 和 MQTT
}
```

## 实现功能

1. **灯光控制**：支持 RGB 调色、亮度调节
2. **环境监测**：实时显示温湿度数据
3. **窗帘控制**：支持定时开关
4. **场景模式**：离家/回家/睡眠等预设场景

## 项目展示

系统包含一个响应式 Web 控制界面，可以在手机和电脑上使用。

## 总结

这个项目让我深入学习了嵌入式开发和物联网协议，是一次很好的实践经历。
