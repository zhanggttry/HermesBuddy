# HermesBuddy

> Desktop AI Agent Management Platform based on Hermes Agent

HermesBuddy 是一个基于 [Hermes Agent](https://hermes-agent.org/) 的桌面智能体管理软件，提供多实例管理、多任务调度、会话监控等一站式管理能力。

## 功能特性 (v1)

- **多实例管理** — 注册、监控、管理多个 Hermes Agent 实例
- **多任务管理** — 创建、分配、追踪任务到不同实例
- **实例代理** — 通过代理 API 访问实例的会话、配置、日志、定时任务等
- **健康检查** — 一键检测实例在线状态和版本信息
- **仪表盘** — 实例和任务概览统计

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14+ (App Router) + React 19 + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| 后端 | Next.js API Routes + Prisma ORM v7 |
| 数据库 | SQLite (via better-sqlite3) |
| 状态管理 | SWR |
| 测试 | Jest + React Testing Library |
| 部署 | Docker + Docker Compose |

## 快速开始

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/zhanggttry/HermesBuddy.git
cd HermesBuddy

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env

# 4. 初始化数据库
npx prisma migrate dev

# 5. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### Docker 部署

```bash
# 使用 Docker Compose 一键部署
docker-compose up -d

# 访问
open http://localhost:3000
```

## 项目结构

```
src/
├── app/
│   ├── page.tsx                    # 仪表盘首页
│   ├── instances/                  # 实例管理页面
│   │   ├── page.tsx                # 实例列表
│   │   ├── new/page.tsx            # 添加实例
│   │   └── [id]/                   # 实例详情
│   │       ├── page.tsx            # 概览/编辑
│   │       ├── sessions/page.tsx   # 会话列表
│   │       ├── config/page.tsx     # 配置管理
│   │       ├── logs/page.tsx       # 日志查看
│   │       └── cron/page.tsx       # 定时任务
│   ├── tasks/                      # 任务管理页面
│   │   ├── page.tsx                # 任务列表
│   │   ├── new/page.tsx            # 创建任务
│   │   └── [id]/page.tsx           # 任务详情
│   └── api/                        # API 路由
│       ├── instances/              # 实例 CRUD + 代理
│       └── tasks/                  # 任务 CRUD
├── components/                     # React 组件
│   ├── ui/                         # shadcn/ui 组件
│   ├── layout/                     # 布局组件
│   ├── instances/                  # 实例相关组件
│   └── tasks/                      # 任务相关组件
├── lib/                            # 工具库
│   ├── db.ts                       # Prisma 客户端
│   ├── hermes-client.ts            # Hermes API 客户端
│   ├── hermes-types.ts             # Hermes API 类型
│   └── utils.ts                    # 通用工具
└── types/                          # 类型定义
```

## API 接口

### 本地 CRUD

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | /api/instances | 获取所有实例 |
| POST | /api/instances | 创建实例 |
| GET | /api/instances/:id | 获取实例详情 |
| PUT | /api/instances/:id | 更新实例 |
| DELETE | /api/instances/:id | 删除实例 |
| PATCH | /api/instances/:id | 健康检查 |
| GET | /api/tasks | 获取所有任务 |
| POST | /api/tasks | 创建任务 |
| GET | /api/tasks/:id | 获取任务详情 |
| PUT | /api/tasks/:id | 更新任务 |
| DELETE | /api/tasks/:id | 删除任务 |

### Hermes 代理 API

所有 Hermes Agent REST API 端点均可通过 `/api/instances/:id/proxy/*` 代理访问。

## 开发

```bash
# 运行测试
npm test

# 代码检查
npm run lint

# 数据库管理
npx prisma studio   # 可视化管理
npx prisma migrate dev  # 运行迁移
```

## License

MIT
