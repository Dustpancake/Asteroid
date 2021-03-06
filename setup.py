from setuptools import setup, find_packages
setup(
    name="asteroid",
    version="0.1.1",
    packages=find_packages(),
    install_requires=[
        "aniso8601==8.0.0",
        "click==7.1.1",
        "Flask==1.1.2",
        "Flask-PyMongo==2.3.0",
        "Flask-RESTful==0.3.8",
        "itsdangerous==1.1.0",
        "Jinja2==2.11.2",
        "MarkupSafe==1.1.1",
        "PyExifTool==0.1.1",
        "pymongo==3.4.0",
        "pytz==2019.3",
        "six==1.14.0",
        "Werkzeug==1.0.1",
        "pytest==5.4.1",
        "pytest-mongodb==2.2.0",
        "Flask-RESTful==0.3.8"
    ],
    author="Moontemple",
    description="Music Server for parties and social gatherings.",
    url="https://github.com/dustpancake/Asteroid"
)
