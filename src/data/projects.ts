// 此文件由 scripts/generate-projects.cjs 自动生成
// 不要手动编辑此文件
// 请在 public/projects/ 目录下添加践迹文件夹，每个文件夹包含 Markdown 文件
// 
// Markdown 文件 frontmatter 格式：
// ---
// title: 践迹标题（必填）
// date: 2026-01-01（必填，格式：YYYY-MM-DD）
// isPublic: true（可选，默认 true）
// tags:（可选）
//   - 标签 1
// ---
// 注意：id 字段会自动分配，无需手动设置！

export interface ProjectEntry {
  id: number;
  title: string;
  date: string;
  content: string;
  isPublic: boolean;
  tags?: string[];
}

// 践迹数据
export const projects: ProjectEntry[] = [
  {
    "id": 1,
    "title": "数据可视化平台",
    "date": "2026-02-20T00:00:00.000Z",
    "content": "\n## 项目背景\n\n为了更好地分析电力负荷数据，我开发了一个交互式数据可视化平台。\n\n## 技术栈\n\n- **后端**：Python Flask\n- **前端**：React + ECharts\n- **数据库**：PostgreSQL\n- **缓存**：Redis\n\n## 核心功能\n\n### 1. 实时数据展示\n\n使用 WebSocket 实现数据的实时推送，前端 ECharts 图表自动刷新。\n\n### 2. 历史数据分析\n\n支持按日、周、月维度查看历史数据，提供对比分析功能。\n\n### 3. 异常告警\n\n当数据超过阈值时，系统自动发送邮件和短信告警。\n\n## 关键代码\n\n### 后端数据接口\n\n```python\nfrom flask import Flask, jsonify\nimport pandas as pd\n\napp = Flask(__name__)\n\n@app.route('/api/load_data')\ndef get_load_data():\n    df = pd.read_csv('load_data.csv')\n    return jsonify({\n        'timestamps': df['time'].tolist(),\n        'values': df['load'].tolist()\n    })\n\nif __name__ == '__main__':\n    app.run(debug=True)\n```\n\n### 前端图表组件\n\n```javascript\nimport ReactECharts from 'echarts-for-react';\n\nconst LoadChart = ({ data }) => {\n  const option = {\n    title: { text: '电力负荷曲线' },\n    xAxis: { type: 'category', data: data.timestamps },\n    yAxis: { type: 'value' },\n    series: [{\n      data: data.values,\n      type: 'line',\n      smooth: true\n    }]\n  };\n  \n  return <ReactECharts option={option} />;\n};\n```\n\n## 数据展示\n\n平台可以展示以下类型的图表：\n\n| 图表类型 | 用途 |\n|----------|------|\n| 折线图 | 趋势分析 |\n| 柱状图 | 对比分析 |\n| 热力图 | 负载分布 |\n| 饼图 | 占比展示 |\n\n## 项目亮点\n\n1. 使用 Redis 缓存热门数据，响应速度提升 80%\n2. 实现数据导出功能，支持 Excel 和 CSV 格式\n3. 响应式设计，支持移动端访问\n\n## 总结\n\n这个项目提升了我全栈开发的能力，也让我对数据可视化有了更深入的理解。\n",
    "isPublic": true,
    "tags": [
      "Python",
      "数据分析",
      "可视化"
    ]
  },
  {
    "id": 2,
    "title": "智能家居控制系统",
    "date": "2026-01-15T00:00:00.000Z",
    "content": "\n## 项目概述\n\n这是一个基于 ESP32 和 MQTT 协议的智能家居控制系统，可以实现对家中灯光、窗帘、温度等设备的远程控制。\n\n## 系统架构\n\n系统采用分层架构设计：\n\n- **感知层**：ESP32 控制器 + 各种传感器\n- **通信层**：MQTT 协议\n- **应用层**：Python 后端 + Web 控制界面\n\n## 硬件清单\n\n| 设备 | 数量 | 用途 |\n|------|------|------|\n| ESP32 开发板 | 3 | 主控制器 |\n| DHT22 温湿度传感器 | 2 | 环境监测 |\n| RGB LED 模块 | 4 | 灯光控制 |\n| 舵机 SG90 | 2 | 窗帘控制 |\n| 继电器模块 | 6 | 大功率设备控制 |\n\n## 核心代码\n\n### ESP32 端代码（Arduino）\n\n```cpp\n#include <WiFi.h>\n#include <PubSubClient.h>\n\nconst char* ssid = \"your_wifi\";\nconst char* password = \"your_password\";\nconst char* mqtt_server = \"192.168.1.100\";\n\nWiFiClient espClient;\nPubSubClient client(espClient);\n\nvoid callback(char* topic, byte* message, unsigned int length) {\n  String msg;\n  for(int i = 0; i < length; i++) {\n    msg += (char)message[i];\n  }\n  // 处理收到的指令\n  if(msg == \"ON\") {\n    digitalWrite(LED_PIN, HIGH);\n  } else if(msg == \"OFF\") {\n    digitalWrite(LED_PIN, LOW);\n  }\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  // 连接 WiFi 和 MQTT\n}\n```\n\n## 实现功能\n\n1. **灯光控制**：支持 RGB 调色、亮度调节\n2. **环境监测**：实时显示温湿度数据\n3. **窗帘控制**：支持定时开关\n4. **场景模式**：离家/回家/睡眠等预设场景\n\n## 项目展示\n\n系统包含一个响应式 Web 控制界面，可以在手机和电脑上使用。\n\n## 总结\n\n这个项目让我深入学习了嵌入式开发和物联网协议，是一次很好的实践经历。\n",
    "isPublic": true,
    "tags": [
      "IoT",
      "嵌入式",
      "Python"
    ]
  }
];

// 导出所有践迹
export const getAllProjects = (): ProjectEntry[] => {
  return projects;
};

// 获取公开的践迹
export const getPublicProjects = (): ProjectEntry[] => {
  return projects.filter(project => project.isPublic);
};

// 根据 ID 获取践迹
export const getProjectById = (id: number): ProjectEntry | undefined => {
  return projects.find(project => project.id === id);
};
