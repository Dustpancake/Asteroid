from flask import Flask
from flask_restful import Api

from asteroid.main.asteroid_api import api_bp
from asteroid.main.file_fetcher import fetcher_bp
from asteroid.main.asteroid_api.common.__database import mongo

def init(CONFIG_FILE):
    print("\n* CONFIG_FILE = {}\n".format(CONFIG_FILE))

    app = Flask(__name__, static_folder='asteroid/static', static_url_path='')
    app.config.from_object(CONFIG_FILE)

    if app.config['SERVE_FILES']:
        print("SERVING FILES")
        app.register_blueprint(fetcher_bp)

    app.register_blueprint(api_bp)
    mongo.init_app(app)
    return app