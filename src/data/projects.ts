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
    "title": "三菱电梯门机无位置传感器控制",
    "date": "2022-08",
    "content": "\n## 项目概述\n\n上海三菱电梯门机无位置传感器控制算法设计与原型验证。\n\n## 系统架构\n\n\n\n## 硬件清单\n\n\n\n## 信号回路\n\n\n\n## 软件结构\n\n\n\n## 项目展示\n\n<video src=\"https://hins-1417576783.cos.ap-shanghai.myqcloud.com/project/VID_20211215_125134.mp4\" controls playsinline></video>\n\n在电梯上的试验因为环境不好，不想多待，就没心思记录下来（可能记录下来了也不知道放哪里了）。\n\n## 总结\n\n干完这些项目我基本清楚了高校与企业之间的横向合作大概是怎么回事，活基本是我干的，分钱的时候没我的份。",
    "isPublic": true,
    "tags": [
      "C/C++",
      "MATLAB/Simulink"
    ]
  },
  {
    "id": 2,
    "title": "无线传输芯片吞吐量检测工具",
    "date": "2022-07",
    "content": "\n## 项目概述\n\n华为ICT设计的芯片吞吐量检测工具数据可视化。\n\n## 系统架构\n\n\n\n## 硬件清单\n\n\n\n## 信号回路\n\n\n\n## 软件结构\n\n\n\n## 项目展示\n\n代码丢了，没法展示。\n\n## 总结\n\n* 我感觉华子其实还可以，很良心了，只是看见我的组长如此的疲惫，仿佛看到了自己的未来，还是跑路了。\n* 去了果子，不去华子感觉有点对不起TA，去见识一下就不遗憾了，毕竟是青春期憧憬过的地方。",
    "isPublic": true,
    "tags": [
      "Python",
      "FPGA"
    ]
  },
  {
    "id": 3,
    "title": "AutoDryRunPlatform",
    "date": "2021-04",
    "content": "\n## 项目概述\n\nApple HWTE为某款Apple Watch设计的一个自动化测试平台。\n\n## 系统架构\n\n![apple park](https://hins-1417576783.cos.ap-shanghai.myqcloud.com/project/20260408-152411-2021-04-overdryrun-apple-park.jpg)\n\n## 硬件清单\n\n\n\n## 信号回路\n\n![世纪大道出站口](https://hins-1417576783.cos.ap-shanghai.myqcloud.com/project/20260408-152152-2021-04-overdryrun-世纪大道出站口.jpg)\n\n## 软件结构\n\n\n\n## 项目展示\n\n那款Watch我自己都没戴过，没法展示。\n\n## 总结\n\n* 这个项目让我发现自己不适合待在外企，趁早跑路。\n* 苹果的企业文化管理确实还可以，让很多员工都相信自己跟苹果股价一样牛逼。",
    "isPublic": true,
    "tags": [
      "Python",
      "SQLite",
      "Git"
    ]
  },
  {
    "id": 4,
    "title": "低压输入车载逆变电源",
    "date": "2020-05",
    "content": "\n## 项目概述\n\n基于串联谐振推挽变换器与全桥逆变器的车载逆变电源。\n\n## 系统架构\n\n![image-20260408232525539](https://hins-1417576783.cos.ap-shanghai.myqcloud.com/project/20260408-152526-2020-05-车载逆变电源-image-20260408232525539.png)\n\n## 硬件清单\n\n![image-20260408214420982](https://hins-1417576783.cos.ap-shanghai.myqcloud.com/diary/20260408-134421-unknown-image-20260408214420982.png)\n\n## 信号回路\n\n![image-20260408214245536](https://hins-1417576783.cos.ap-shanghai.myqcloud.com/diary/20260408-134245-unknown-image-20260408214245536.png)\n\n## 软件结构\n\n![image-20260408214131887](https://hins-1417576783.cos.ap-shanghai.myqcloud.com/diary/20260408-134132-unknown-image-20260408214131887.png)\n\n\n## 项目展示\n\n估计已经成产品了。\n\n## 总结\n\n这个项目让我发现自己不适合搞硬件，趁早跑路。",
    "isPublic": true,
    "tags": [
      "C/C++",
      "Altium Designer",
      "MATLAB/Simulink"
    ]
  },
  {
    "id": 5,
    "title": "纸张计数显示装置",
    "date": "2019-08",
    "content": "\n## 项目概述\n\n利用两块平行极板测量并显示极板间的纸张数量。\n\n## 系统架构\n\n失传\n\n## 硬件清单\nTi C2000、555定时器\n\n## 核心代码\n\n非线性拟合与插值\n\n## 实现功能\n\n参考2019年全国大学生电子设计竞赛F题\n\n## 项目展示\n\n在系里展示。\n\n## 总结\n\n这个项目让我发现自己干完一件事情怎么什么都不记得，什么都没留下？？？\n",
    "isPublic": true,
    "tags": [
      "Altium Deisigner",
      "NE555",
      "C/C++"
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
