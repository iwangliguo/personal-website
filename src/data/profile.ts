export interface ProfileData {
  name: string;
  title: string;
  institution: string;
  institutionAddress: string;
  email: string;
  bio: string;
  workExperience: Array<{
    degree: string;
    field: string;
    institution: string;
    year: string;
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    year: string;
  }>;
  researchInterests: string[];
  skills: string[];
  publications: Array<{
    id: number;
    title: string;
    authors: string;
    venue: string;
    year: string;
    link?: string;
    pdf?: string;
  }>;
  projects: Array<{
    id: number;
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  socialLinks: {
    github?: string;
    googleScholar?: string;
    csdn?: string;
    twitter?: string;
  };
}

export const profileData: ProfileData = {
  name: '欢迎来到hins的小破站',
  title: '夏虫语冰',
  institution: '苏州供电公司',
  institutionAddress: '苏州市姑苏区三香路458号',
  email: '3108741604@qq.com',
  bio: '我喜欢民谣、流行音乐。研究兴趣包括电力系统、电机控制、计算机系统。',
  workExperience: [
    {
      degree: '电气试验员',
      field: '变电一次技术与电气试验',
      institution: '苏州供电公司',
      year: '2023 - 至今'
    }
  ],
  education: [
    {
      degree: '硕士',
      field: '电力电子与电气传动',
      institution: '上海交通大学',
      year: '2020 - 2023'
    },
    {
      degree: '本科',
      field: '电气工程及其自动化',
      institution: '上海交通大学',
      year: '2016 - 2020'
    },
    {
      degree: '高中',
      field: '',
      institution: '湖南省浏阳市田家炳实验中学',
      year: '2013 - 2016'
    }
  ],
  researchInterests: [
    '电力系统',
    '计算机系统',
    '电机控制',
    '嵌入式系统'
  ],
  skills: [
    'Python',
    'C/C++',
    'MATLAB/Simulink',
    'ARM/GNU',
    'MarkDown',
    'LaTeX'
  ],
  publications: [
    {
      id: 1,
      title: '无位置传感器控制下的永磁同步电机电阻在线辨识',
      authors: '王利国，高强',
      venue: 'ACL 2024',
      year: '电机控制与应用',
      link: 'https://www.motor-abc.cn/djykzyy/article/abstract/20221003',
      pdf: 'https://www.motor-abc.cn/djykzyy/article/pdf/20221003'
    }
    
  ],
  projects: [
    {
      id: 1,
      title: '纸张计数显示装置',
      description: '2019-利用两块平行极板测量并显示极板间的纸张数量。',
      technologies: ['C', 'NE555', 'Altium Deisigner'],
      link: '#'
      
    },
    {
      id: 2,
      title: '低压输入车载逆变电源',
      description: '2020-开发了一个基于串联谐振推挽变换器与全桥逆变器的车载逆变电源。',
      technologies: ['C', 'Altium Designer', 'MATLAB/Simulink'],
      link: '#'
    },
    {
      id: 3,
      title: 'AutoDryRunPlatform',
      description: '2021-Apple HWTE为某款Apple Watch设计的一个自动化测试平台。',
      technologies: ['Python', 'SQLite', 'Git'],
      link: '#'
    },
    {
      id: 4,
      title: '无线传输芯片吞吐量检测工具',
      description: '2022-华为ICT设计的芯片吞吐量检测工具数据可视化。',
      technologies: ['Python', 'FPGA'],
      link: '#'
    },
    {
      id: 5,
      title: '电梯门机无位置传感器控制',
      description: '2022-上海三菱电梯门机无位置传感器控制算法设计与现场验证。',
      technologies: ['C', 'MATLAB/Simulink'],
      link: '#'
    }
  ],
  socialLinks: {
    github: 'https://github.com/iwangliguo',
    googleScholar: 'https://scholar.google.com/citations?hl=zh-CN&user=s9i3NqkAAAAJ',
    csdn: 'https://blog.csdn.net/qq_40078307?type=blog'
  }
};
