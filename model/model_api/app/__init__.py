from flask import Flask
from .routes import init_routes

app = Flask(__name__)

# 调用 init_routes 来初始化路由
init_routes(app)
