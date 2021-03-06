import pytest
import sys
import unittest.mock as mock
import functools
import json
import os

@pytest.fixture
def flaskclient(mongodb):

    @functools.lru_cache(None)
    def setup():
        # mock the database
        module = type(sys)('asteroid.main.asteroid_api.common.__database')
        module.mongo = mock.MagicMock()
        module.mongo.init_app = mock.MagicMock()
        module.mongo.db = mongodb
        sys.modules['asteroid.main.asteroid_api.common.__database'] = module

        from asteroid.main import init
        app = init("config.TestAPI")
        from asteroid.main.databasebuilder.SetupBuild import _config_database
        try: 
            _config_database(mongodb)
        except:
            pass
        return app

    app = setup()
    with app.test_client() as client:
        yield client

@pytest.fixture
def dbpath(pytestconfig):
    dirpath = pytestconfig.getoption('mongodb_fixture_dir') or pytestconfig.getini('mongodb_fixture_dir')
    if not os.path.isabs(dirpath):
        dirpath = pytestconfig.rootdir.join(dirpath).strpath
    yield dirpath

@functools.lru_cache(None)
def read_file(dirpath, name):
    with open(os.path.join(dirpath, name), 'r') as f:
        data = f.read()
    return json.loads(data)

@pytest.fixture
def user_model(dbpath):
    data = read_file(dbpath, 'users.json')
    def choice(field=None, value=None):
        if field == None:
            return data
        return [i for i in data if i[field] == value]
    yield choice

@pytest.fixture
def songs_model(dbpath):
    data = read_file(dbpath, 'songs.json')
    def choice(field=None, value=None):
        if field == None:
            return data
        return [i for i in data if i[field] == value]
    yield choice

@pytest.fixture
def queue_model(dbpath):
    data = read_file(dbpath, 'queue.json')
    def choice(field=None, value=None):
        if field == None:
            return data
        return [i for i in data if i[field] == value]
    yield choice