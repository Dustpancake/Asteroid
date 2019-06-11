import pytest
import sys, os
from src.main.web.flaskserv import Database

@pytest.fixture(scope="module")
def temp_db(tmpdir_factory):
    fn = tmpdir_factory.mktemp("data").join("test.db")
    yield str(fn)

@pytest.fixture(scope="class")
def MDB_inst(request, tmpdir_factory):
	fn = str(tmpdir_factory.mktemp("data").join("test.db"))

	with Database.DBInstance(fn) as db:
		db.create_table("songs", 
				("name", "artist", "duration", "file_path", "meta_dat", "UNIQUE"),
				("text", "text", "real", "text", "text", "name, artist, file_path")
			)
	mdb = Database.MusicDB(fn)
	request.cls.mdb = mdb
	yield
	del mdb

@pytest.fixture(scope="class")
def UDB_inst(request, tmpdir_factory):
	fn = str(tmpdir_factory.mktemp("data").join("test.db"))

	with Database.DBInstance(fn) as db:
		db.create_table("users", 
				("id", "name", "hash_pw", "meta_dat", "UNIQUE"), 
				("long", "text", "long", "text", "id")
			)
	udb = Database.UserDB(fn)
	request.cls.udb = udb
	yield
	del udb


class TestDBInstance():

	def test_memory(self):
		db = Database.DBInstance(":memory:")

	def test_fail_file(self):
		with pytest.raises(Exception) as e:
			db = Database.DBInstance("goblindindi.txt")

	def test_table(self):
		db = Database.DBInstance(":memory:")
		db.create_table("test_table", 
				("c1", "c2", "c3"),
				("text", "text", "real")
			)

		out = db.get_column_info("test_table")
		desire = ('c1', 'c2', 'c3')
		for x, y in zip(out, desire):
			assert str(x) == str(y)

		with pytest.raises(Exception) as e:
			db.get_column_info("__dd_-dd-_--")

	def test_with(self):
		with Database.DBInstance(":memory:") as db:
			db.create_table("test_table", 
				("c1", "c2", "c3"),
				("text", "text", "real")
			)

	def test_insert_entire(self):
		with Database.DBInstance(":memory:") as db:
			db.create_table("test_table", 
				("c1", "c2", "c3"),
				("text", "text", "real")
			)
			db.insert_entire_row("test_table", {"c1":"test1", "c2":"test2", "c3":9})
			db.insert_entire_row("test_table", {"c1":"test1.1", "c2":"test2.1", "c3":9.1})
			out = db.select_columns("test_table", ("c1", "c3"))
		desire = (('test1', 9.0), ('test1.1', 9.1))
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)

	def test_persitance(self, temp_db):
		with Database.DBInstance(temp_db) as db:
			db.create_table("test_table", 
				("c1", "c2", "c3"),
				("text", "text", "real")
			)
		with Database.DBInstance(temp_db) as db:
			assert db.get_column_info("test_tabl") == ()
			assert db.get_column_info("test_table") != ()

	def test_unique(self):
		with Database.DBInstance(":memory:") as db:
			db.create_table("test_table", 
					("c1", "c2", "UNIQUE"),
					("text", "text", "c1")
				)

	def test_update(self):
		desire = (('test1', 'test3', 11.0), ('test1', 'test3', 11.0), ('test2', 'test2', 12.0))
		with Database.DBInstance(":memory:") as db:
			db.create_table("test_table", 
				("c1", "c2", "c3"),
				("text", "text", "real")
			)
			db.insert_entire_row("test_table", {"c1":"test1", "c2":"test2", "c3":9})
			db.insert_entire_row("test_table", {"c1":"test1", "c2":"test2", "c3":11})
			db.insert_entire_row("test_table", {"c1":"test2", "c2":"test2", "c3":12})
			db.update_generic("test_table", {"c2":"test3", "c3":11}, {"c1":"test1"})
			out = db.select_columns("test_table", ("c1", "c2", "c3"))
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)

	def test_fetch_rows(self):
		# this is so terrible written lmao
		desire1 = (('test1', 'test2', 9.0))
		desire2 = (('test1', 'test2', 9.0), ('test1', 'test2', 11.0))
		with Database.DBInstance(":memory:") as db:
			db.create_table("test_table", 
				("c1", "c2", "c3"),
				("text", "text", "real")
			)
			db.insert_entire_row("test_table", {"c1":"test1", "c2":"test2", "c3":9})
			db.insert_entire_row("test_table", {"c1":"test1", "c2":"test2", "c3":11})
			db.insert_entire_row("test_table", {"c1":"test2", "c2":"test2", "c3":12})
			out1 = db.select_rows("test_table", {"c3":9})
			out2 = db.select_rows("test_table", {"c1":"test1"})
		for x, y in zip(out1[0], desire1):
			assert str(x) == str(y)
		for i, j in zip(out2, desire2):
			for x, y in zip(i, j):
				assert str(x) == str(y)

	def test_delete(self):
		desire = [('test1', 'test2', 9.0)]
		with Database.DBInstance(":memory:") as db:
			db.create_table("test_table", 
				("c1", "c2", "c3"),
				("text", "text", "real")
			)
			db.insert_entire_row("test_table", {"c1":"test1", "c2":"test2", "c3":9})
			db.insert_entire_row("test_table", {"c1":"test1", "c2":"test2", "c3":11})
			db.delete_rows("test_table", ({"c3":11}))
			out = db.select_columns("test_table", "*")
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)

@pytest.mark.usefixtures('MDB_inst')
class TestMusicDB():

	def test_song_adding(self):
		self.mdb.add_song({"name":"You Too Must Die", "artist":"GOLD", "duration":333, "file_path":"", "meta_dat":""})
		with pytest.raises(Exception) as e:	# test to make sure unique condition holds
			self.mdb.add_song({"name":"You Too Must Die", "artist":"GOLD", "duration":333, "file_path":"", "meta_dat":""})
			self.mdb.add_song({"name":"You Too Must Die", "artist":"GOLD", "duration":124, "file_path":"", "meta_dat":""})
		self.mdb.add_song({"name":"Plastic Boogie", "artist":"King Gizzard and the Lizard Wizard", "duration":181, "file_path":"", "meta_dat":""})
		self.mdb.add_song({"name":"Fishing For Fishies", "artist":"King Gizzard and the Lizard Wizard", "duration":298, "file_path":"", "meta_dat":""})

	def test_song_fetch_all(self):
		desire = ((1, 'You Too Must Die', 'GOLD', 333.0, '', ''), (2, 'Plastic Boogie', 'King Gizzard and the Lizard Wizard', 181.0, '', ''), (3, 'Fishing For Fishies', 'King Gizzard and the Lizard Wizard', 298.0, '', ''))
		out = self.mdb.get_all_songs()
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)

	def test_get_by_rowid(self):
		out = self.mdb.get_by_rowid(0)
		desire = ('You Too Must Die', 'GOLD', 333.0, '', '')
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)

		out = self.mdb.get_by_rowid(801419)	# TODO fix this kind of thing

@pytest.mark.usefixtures('UDB_inst')
class TestUserDB():

	def test_user_adding(self):
		self.udb.add_user({"id":0, "name":"TestUser", "hash_pw":0, "meta_dat":""})
		with pytest.raises(Exception) as e:
			self.udb.add_user({"id":0, "name":"OtherTestUser", "hash_pw":0, "meta_dat":""})
		self.udb.add_user({"id":1, "name":"OtherTestUser", "hash_pw":0, "meta_dat":""})

	def test_user_fetch_all(self):
		desire = ((0, 'TestUser', ''), (1, 'OtherTestUser', ''))
		out = self.udb.get_all_users()
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)

	def test_get_column(self):
		desire = ((0,), (1,))
		out = self.udb.get_column("id")
		assert desire == out
		for x, y in zip(out, desire):
			assert str(x) == str(y)


