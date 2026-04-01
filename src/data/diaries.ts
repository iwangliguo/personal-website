// 此文件由 scripts/generate-diaries.cjs 自动生成
// 不要手动编辑此文件
// 请在 public/diary/ 目录下添加日记文件夹，每个文件夹包含 Markdown 文件和媒体资源
// 
// Markdown 文件 frontmatter 格式：
// ---
// title: 日记标题（必填）
// date: 2023-07-01（必填，格式：YYYY-MM-DD）
// isPublic: true（可选，默认 true，false 表示私人日记不公开）
// coverImage: ./covers/封面图.jpg（可选）
// tags:（可选）
//   - 标签 1
//   - 标签 2
// images:（可选）
//   - ./images/图片 1.jpg
// videos:（可选）
// audios:（可选）
// ---
// 注意：id 字段会自动分配，无需手动设置！

export interface DiaryEntry {
  id: number;
  title: string;
  date: string;
  content: string;
  isPublic: boolean;
  coverImage?: string;
  images?: string[];
  videos?: string[];
  audios?: string[];
  tags?: string[];
}

// 日记数据
export const diaries: DiaryEntry[] = [
  {
    "id": 1,
    "title": "入职第一天",
    "date": "2023-08-03T00:00:00.000Z",
    "content": "\n今天是入职**苏州供电公司**的第一天。尚昊从上海给我送过来的，前一天晚上我开他的车差点自动巡航无法急停。\n\n## 上午\n\n公司的办公环境一般，同事们都很热情。上午办理了入职手续，领取了工牌和办公用品。\n\n> 工牌上的照片拍得挺拉胯的 😄\n\n下午参加了新员工培训，了解了公司的发展历程和主要业务。\n\n## 导师\n\n我的导师是**然哥**，他山东高考数学147，真是神人。\n\n希望能够在新的工作岗位上好好学习，快速成长！\n\n---\n\n*这是一篇具有里程碑意义的日记*\n",
    "isPublic": true,
    "coverImage": "/diary/2023-08-03-first-day/covers/photo1.jpg",
    "images": [
      "/diary/2023-08-03-first-day/images/photo1.jpg",
      "/diary/2023-08-03-first-day/images/photo2.jpg"
    ],
    "videos": [],
    "audios": [],
    "tags": [
      "工作",
      "新起点"
    ]
  },
  {
    "id": 2,
    "title": "开关高级工考试",
    "date": "2026-03-27T00:00:00.000Z",
    "content": "\n这是一篇**公开日记**，对外公开。\n\n## 日常\n\n上午考了大概40分钟，中午和然哥去西城永捷吃的中饭，吃的炒肉牛加鸡腿，超级饱。喝了一杯瑞幸抹茶，感觉一般，喝不惯。\n小豪可能要走了，有点伤心。\n\n## 工作\n\n考试蒙的几个题事后对起来都是蒙对了，运气还真行。\n\n保持对新技术的敏感度，想了很久的网站，趁着有空终于搭起来了。\n\n## 自勉\n\n> 路漫漫其修远兮，吾将上下而求索\n\n-- 屈原《离骚》\n",
    "isPublic": true,
    "coverImage": "/diary/2026-03-27-开关高级工考试/covers/photo1.jpg",
    "images": [
      "/diary/2026-03-27-开关高级工考试/images/photo1.jpg",
      "/diary/2026-03-27-开关高级工考试/images/photo2.jpg"
    ],
    "videos": [],
    "audios": [],
    "tags": [
      "日常",
      "考试"
    ]
  },
  {
    "id": 3,
    "title": "铁琴变加班",
    "date": "2026-03-28T00:00:00.000Z",
    "content": "\n这是一篇**公开日记**，对外公开。\n\n## 工作\n\n听说班里要来两个外协，然哥又跟我说要干店岸的副母线，有点慌。\n\n## 日常\n\n通义灵码给我提供的github同步把我给害惨了，github的移动端配置没有一个好的方案，不高兴搞了。使用阿里云盘好像也不太行，加班回来又搞到了21点，阿里云盘在终端里暂时无法访问，下下来到本地又不方便。最终还是向icloud投降了，直接在云盘里的修改可以同步到本地网站日记文件夹。\n\n## 自勉\n\n> 故国虽大，好战必亡；天下虽安，忘战必危。\n\n-- 春秋《司马法·仁本》\n\n",
    "isPublic": true,
    "coverImage": "/diary/2026-03-28-铁琴变加班/covers/photo1.jpg",
    "images": [
      "/diary/2026-03-28-铁琴变加班/images/photo1.jpg",
      "/diary/2026-03-28-铁琴变加班/images/photo2.jpg"
    ],
    "videos": [],
    "audios": [],
    "tags": [
      "日常",
      "工作"
    ]
  },
  {
    "id": 4,
    "title": "谢桥变拿票",
    "date": "2026-03-30T00:00:00.000Z",
    "content": "\n这是一篇**公开日记**，对外公开。\n\n## 工作\n\n早上看见了班里来报到的两个外协，看见是壮丁就放心了。去谢桥变拿的一条线路票，今天做完了开关小修和流变的小修流变是正立式的，不是很高，开关是西门子的3AP1FG共体，回路不好用，按继电器没啥反应，可惜没听明白。\n\n<img src=\"/diary/2026-03-30-谢桥变拿票/images/photo4.jpg\" alt=\"猴哥\" style=\"zoom:33%;\" />\n\n## 日常\n\n早上下雨🌧，冒雨淋过来的，成了一只落汤鸡，人为什么要上班啊。\n\n看到了一张挺有趣的图片，远看郁金香🌷，近看火腿肠。\n\n<img src=\"/diary/2026-03-30-谢桥变拿票/images/photo3.jpg\" alt=\"郁金香\" style=\"zoom:50%;\" />\n\n肚子可能是昨天吃了一些辣的，一早上都不舒服。中午去了黄河路8号吃的午饭，去的晚了，菜剩的不多，喝了一杯葡萄汁，蛮好喝的。\n\n<img src=\"/diary/2026-03-30-谢桥变拿票/images/photo5.png\" alt=\"存妹\" style=\"zoom: 25%;\" />\n\n有一说一，存妹还挺好看的。\n\n## 自勉\n\n> 奈何取之尽锱铢，用之如泥沙？\n\n-- 杜牧《阿房宫赋》\n\n",
    "isPublic": true,
    "coverImage": "/diary/2026-03-30-谢桥变拿票/covers/photo1.jpg",
    "images": [
      "/diary/2026-03-30-谢桥变拿票/images/photo1.jpg",
      "/diary/2026-03-30-谢桥变拿票/images/photo2.jpg"
    ],
    "videos": [],
    "audios": [],
    "tags": [
      "日常",
      "工作"
    ]
  }
];

// 导出所有日记
export const getAllDiaries = (): DiaryEntry[] => {
  return diaries;
};

// 获取公开的日记
export const getPublicDiaries = (): DiaryEntry[] => {
  return diaries.filter(diary => diary.isPublic);
};

// 根据 ID 获取日记
export const getDiaryById = (id: number): DiaryEntry | undefined => {
  return diaries.find(diary => diary.id === id);
};
