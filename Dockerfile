# 春风康养：静态 H5 + Python 智伴代理（同端口）
FROM python:3.12-slim

WORKDIR /app

# 仅标准库；保留 requirements 便于平台检测
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV HOST=0.0.0.0
ENV PORT=8091
ENV PYTHONUNBUFFERED=1

EXPOSE 8091

CMD ["python", "scripts/llm_server.py"]
