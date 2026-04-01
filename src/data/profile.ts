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
  name: 'hins wang',
  title: '基层牛马',
  institution: '苏州 苏州供电公司',
  institutionAddress: '苏州市姑苏区三香路458号',
  email: '3108741604@qq.com',
  bio: '我是一名电力系统从业者。我的研究兴趣包括电力系统、电机控制，计算机系统。',
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
      degree: '学士',
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
    'C++/C',
    'MATLAB/Simulink',
    'ARM/GNU',
    'MarkDown',
    'LaTeX'
  ],
  publications: [
    {
      id: 1,
      title: '基于深度学习的自然语言处理研究',
      authors: '张三，李四，王五',
      venue: 'ACL 2024',
      year: '2024',
      link: 'https://aclanthology.org/',
      pdf: '#'
    },
    {
      id: 2,
      title: '一种新的计算机视觉算法及其应用',
      authors: '张三，赵六',
      venue: 'CVPR 2023',
      year: '2023',
      link: 'https://cvpr.thecvf.com/',
      pdf: '#'
    },
    {
      id: 3,
      title: '高效机器学习模型优化方法',
      authors: '张三，孙七，周八',
      venue: 'NeurIPS 2022',
      year: '2022',
      link: 'https://neurips.cc/',
      pdf: '#'
    },
    {
      id: 4,
      title: '电力系统暂态稳定性分析新方法',
      authors: '张三，钱九',
      venue: 'IEEE Transactions on Power Systems 2024',
      year: '2024',
      link: 'https://ieeexplore.ieee.org/',
      pdf: '#'
    },
    {
      id: 5,
      title: '基于机器学习的负荷预测技术',
      authors: '张三，李十',
      venue: 'Applied Energy 2023',
      year: '2023',
      link: 'https://www.sciencedirect.com/',
      pdf: '#'
    },
    {
      id: 6,
      title: '分布式能源接入对电网的影响研究',
      authors: '张三，孙十一，赵十二',
      venue: 'Renewable Energy 2023',
      year: '2023',
      link: 'https://www.sciencedirect.com/',
      pdf: '#'
    },
    {
      id: 7,
      title: '变压器故障诊断的智能化方法',
      authors: '张三，钱十三',
      venue: 'Electric Power Systems Research 2022',
      year: '2022',
      link: 'https://www.sciencedirect.com/',
      pdf: '#'
    },
    {
      id: 8,
      title: '电机控制策略优化研究',
      authors: '张三，李十四',
      venue: 'IEEE Transactions on Industrial Electronics 2024',
      year: '2024',
      link: 'https://ieeexplore.ieee.org/',
      pdf: '#'
    },
    {
      id: 9,
      title: '嵌入式系统在电力监测中的应用',
      authors: '张三，王十五',
      venue: 'Measurement 2023',
      year: '2023',
      link: 'https://www.sciencedirect.com/',
      pdf: '#'
    },
    {
      id: 10,
      title: '基于 IoT 的智能变电站监控系统',
      authors: '张三，赵十六，钱十七',
      venue: 'IEEE Internet of Things Journal 2023',
      year: '2023',
      link: 'https://ieeexplore.ieee.org/',
      pdf: '#'
    },
    {
      id: 11,
      title: '高压直流输电保护技术研究',
      authors: '张三，孙十八',
      venue: 'Electric Power Components and Systems 2022',
      year: '2022',
      link: 'https://www.tandfonline.com/',
      pdf: '#'
    },
    {
      id: 12,
      title: '配电网自动化关键技术综述',
      authors: '张三，李十九，周二十',
      venue: 'Renewable and Sustainable Energy Reviews 2024',
      year: '2024',
      link: 'https://www.sciencedirect.com/',
      pdf: '#'
    }
  ],
  projects: [
    {
      id: 1,
      title: '智能对话系统',
      description: '开发了一个基于大语言模型的智能对话系统，支持多轮对话和上下文理解。',
      technologies: ['Python', 'PyTorch', 'Transformers'],
      link: '#'
    },
    {
      id: 2,
      title: '图像识别平台',
      description: '构建了一个端到端的图像识别平台，实现了多种经典的卷积神经网络模型。',
      technologies: ['Python', 'TensorFlow', 'React'],
      link: '#'
    },
    {
      id: 3,
      title: '学术论文管理工具',
      description: '设计并实现了一个学术论文管理和阅读工具，支持文献分类和笔记功能。',
      technologies: ['TypeScript', 'React', 'Node.js'],
      link: '#'
    },
    {
      id: 4,
      title: '变电站设备状态监测系统',
      description: '实时监测变电站一次设备的运行状态，提供故障预警和健康管理功能。',
      technologies: ['Python', 'IoT', 'Vue.js'],
      link: '#'
    },
    {
      id: 5,
      title: '电力负荷预测系统',
      description: '基于机器学习算法的短期和中期电力负荷预测，支持多维度数据分析。',
      technologies: ['Python', 'Scikit-learn', 'Django'],
      link: '#'
    },
    {
      id: 6,
      title: '电机驱动控制器开发',
      description: '基于 ARM 的高性能电机驱动器，支持 FOC 控制和多种电机类型。',
      technologies: ['C', 'ARM', 'MATLAB'],
      link: '#'
    },
    {
      id: 7,
      title: '分布式光伏监控平台',
      description: '分布式光伏电站的远程监控和运维管理平台，支持数据可视化和报表生成。',
      technologies: ['Java', 'Spring Boot', 'Angular'],
      link: '#'
    },
    {
      id: 8,
      title: '电能质量分析仪器',
      description: '便携式电能质量分析仪，支持谐波、闪变、电压暂降等多种参数测量。',
      technologies: ['C++', 'DSP', 'Qt'],
      link: '#'
    },
    {
      id: 9,
      title: '继电保护整定计算软件',
      description: '电力系统继电保护定值整定计算工具，支持多种保护类型和网络拓扑。',
      technologies: ['C#', '.NET', 'WPF'],
      link: '#'
    },
    {
      id: 10,
      title: '微电网能量管理系统',
      description: '微电网的能量管理和优化调度系统，支持源网荷储协同控制。',
      technologies: ['Python', 'Gurobi', 'Flask'],
      link: '#'
    },
    {
      id: 11,
      title: '电缆在线监测装置',
      description: '高压电缆局部放电在线监测装置，支持无线传输和云端数据分析。',
      technologies: ['C', 'FPGA', 'LoRa'],
      link: '#'
    },
    {
      id: 12,
      title: '电力市场交易辅助决策系统',
      description: '面向售电公司的电力市场交易辅助决策平台，支持价格预测和风险评估。',
      technologies: ['Python', 'XGBoost', 'Streamlit'],
      link: '#'
    }
  ],
  socialLinks: {
    github: 'https://github.com/iwangliguo',
    googleScholar: 'https://scholar.google.com/citations?user=yourid',
    csdn: 'https://blog.csdn.net/qq_40078307?type=blog'
  }
};
