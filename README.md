# 🚀 Code-Judge

### Automated Code Evaluation Platform

![Build](https://img.shields.io/github/actions/workflow/status/MONISH-cloud/CODE_JUDGE/main.yml?label=Build\&style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge\&logo=docker)
![Kubernetes](https://img.shields.io/badge/K8s-Orchestrated-326CE5?style=for-the-badge\&logo=kubernetes)

---

## 📌 Overview

**Code-Judge** is a scalable, secure, and high-performance platform designed for **automated evaluation of programming submissions** in:

* 🎓 Academic Labs
* 🧪 University Exams
* 🏆 Coding Competitions

It uses a **microservices architecture** and **Docker-based sandboxing** to ensure:

* ✅ Consistent execution
* 🔒 Secure isolation
* ⚡ Real-time evaluation

---

## ✨ Features

### ⚙️ Core Capabilities

* Automated code grading using hidden test cases
* Real-time execution with instant feedback
* Multi-language support (C, Python)
* Leaderboards and analytics

### 🔐 Security

* Sandboxed execution (Docker containers)
* No root access
* Network isolation
* Resource limits (CPU, RAM, Time)

### 💻 Developer Experience

* Monaco-based browser IDE
* Submission history tracking
* Clean UI for problem solving

### 🚀 DevOps Ready

* CI/CD using GitHub Actions
* Kubernetes deployment support
* Microservices architecture

---

## 🏗️ Architecture

```
                ┌───────────────┐
                │   Frontend    │
                │ React / Vue   │
                └──────┬────────┘
                       │
                ┌──────▼────────┐
                │  API Gateway  │
                └──────┬────────┘
     ┌──────────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼
┌──────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│  Auth    │ │  Problem   │ │ Execution  │ │ Leaderboard│
│ Service  │ │ Service    │ │  Engine    │ │  Service   │
└──────────┘ └────────────┘ └────────────┘ └────────────┘
                                │
                                ▼
                         ┌────────────┐
                         │  Docker    │
                         │ Sandbox    │
                         └────────────┘
```

---

## 💻 Tech Stack

| Layer         | Technology             |
| ------------- | ---------------------- |
| Frontend      | React / Vue            |
| Backend       | Node.js (Express) / Go |
| Database      | PostgreSQL, MongoDB    |
| Containers    | Docker                 |
| Orchestration | Kubernetes             |
| Messaging     | RabbitMQ / gRPC        |
| CI/CD         | GitHub Actions         |

---

## 🛠️ Installation

### 📌 Prerequisites

* Linux (Ubuntu 20.04 recommended)
* Docker Engine (v20.10+)
* Node.js / Go
* 4GB RAM minimum (8GB recommended)

---


### ⚙️ Environment Variables

Create a `.env` file:

```
JWT_SECRET=your_secret_key
POSTGRES_URI=your_postgres_connection
MONGO_URI=your_mongodb_connection
```

---

### ▶️ Run with Docker

```bash
docker-compose up --build
```

---

### ☸️ Kubernetes Deployment

```bash
kubectl apply -f k8s/
```

---

## 👥 User Roles

### 👨‍💻 Developers

* Solve problems
* Submit code
* Track rankings

### 🛠 Admins

* Manage problems
* Upload test cases
* View analytics

### ⚙️ DevOps

* Maintain uptime
* Scale services
* Ensure security

---

## 🛡️ Security Model

* 🔒 Non-root execution
* 🌐 No internet access in containers
* ⏱ Execution time limits
* 💾 Memory constraints
* ♻️ Ephemeral containers

---

## 📊 Workflow

1. User submits code
2. API Gateway forwards request
3. Execution Engine creates container
4. Code is compiled & executed
5. Output is matched with test cases
6. Result is returned instantly

---

## 🧪 Supported Languages

| Language | Compiler |
| -------- | -------- |
| C        | GCC      |
| Python   | Python 3 |

---

## 📝 Roadmap

* [ ] Plagiarism Detection (MOSS / AI-based)
* [ ] Add Java, C++, JavaScript
* [ ] University SSO Integration
* [ ] AI Code Feedback System

---

## 📷 Screenshots (Add Yours)

```
/assets/editor.png
/assets/leaderboard.png
/assets/submission.png
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Commit changes
4. Push and create PR

---

## 📄 License

This project is licensed under the **MIT License**

---

## 👨‍💻 Team

**DEVGRU**
RV University

---

## ⭐ Support

If you like this project:

* Star ⭐ the repo
* Share with others
* Contribute 🚀

---
