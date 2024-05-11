# 使用官方 Python 运行时作为父镜像
FROM python:3.9-slim

# 将工作目录设置为 /app
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    pkg-config \
    libhdf5-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制 requirements.txt 到容器中并安装 Python 依赖
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 将当前项目的文件复制到容器的 /app 目录中
COPY . /app

# 将端口 5000 开放给容器外部世界
EXPOSE 5000

# 定义环境变量
ENV NAME World
ENV FLASK_APP=run.py

# 指定容器启动时运行的命令
CMD ["flask", "run", "--host=0.0.0.0"]



