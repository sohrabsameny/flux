const { expect } = require('chai');
const config = require('config');
const { ObjectId } = require('mongodb');

const dbHelper = require('../../ZelBack/src/services/dbHelper');

const mongoUrl = `mongodb://${config.database.url}:${config.database.port}/`;

const testInsert = [{
  _id: ObjectId('5f99562a09aef91cd19fbb93'),
  name: 'App1',
  description: 'Test',
  owner: '1LZe3AUYQC4aT5YWLhgEcH1nLLdoKNBi9t',
}, {
  _id: ObjectId('5fa25bf73ba9312a4d83712d'),
  name: 'App1',
  description: 'Test',
  owner: '1LZe3AUYQC4aT5YWLhgEcH1nLLdoKNBi9u',
}, {
  _id: ObjectId('5fb48e724b82682e2bd22269'),
  name: 'App2',
  description: 'Test3',
  owner: '1LZe3AUYQC4aT5YWLhgEcH1nLLdoKNBi9w',
}, {
  _id: ObjectId('5fec239ec4ef4d416e70ac61'),
  name: 'App3',
  description: 'Test3',
  owner: '1LZe3AUYQC4aT5YWLhgEcH1nLLdoKNBi9x',
}];

describe('dbHelper tests', () => {
  describe('connectMongoDb tests', async () => {
    it('should default to config url when called without params', async () => {
      await dbHelper.initiateDB();

      const dbConnection = await dbHelper.connectMongoDb();

      expect(dbConnection.s.url).to.equal(mongoUrl);
    });
  });

  describe('databaseConnection tests', () => {
    beforeEach(async () => {
      await dbHelper.closeDbConnection();
    });
    it('should default to null if no connection was established', () => {
      expect(dbHelper.databaseConnection()).to.be.null;
    });

    it('should return a db connection if established', async () => {
      await dbHelper.initiateDB();

      const dbConnection = dbHelper.databaseConnection();

      expect(dbConnection).to.not.be.null;
      expect(dbConnection.s.url).to.equal(mongoUrl);
    });
  });

  describe('distinctDatabase tests', () => {
    let database;
    let collection;
    beforeEach(async () => {
      await dbHelper.initiateDB();
      const db = dbHelper.databaseConnection();
      database = db.db(config.database.local.database);
      collection = config.database.local.collections.loggedUsers;

      try {
        await database.collection(collection).drop();
      } catch (err) {
        console.log('Collection not found.');
      }

      await database.collection(collection).insertMany(testInsert);
    });

    it('should return proper distinct values from database without a filter', async () => {
      const expectedDistinctValues = ['Test', 'Test3'];

      const distinctResults = await dbHelper.distinctDatabase(database, collection, 'description');

      expect(distinctResults).to.eql(expectedDistinctValues);
    });

    it('should return proper distinct values from database with a filter', async () => {
      const expectedDistinctValues = ['Test'];
      const filter = { name: 'App1' };

      const distinctResults = await dbHelper.distinctDatabase(database, collection, 'description', filter);

      expect(distinctResults).to.eql(expectedDistinctValues);
    });

    it('should return no values when the field name is wrong', async () => {
      const distinctResults = await dbHelper.distinctDatabase(database, collection, 'test');

      expect(distinctResults).to.be.empty;
    });
  });

  describe('distinctDatabase tests', () => {
    let database;
    let collection;
    beforeEach(async () => {
      await dbHelper.initiateDB();
      const db = dbHelper.databaseConnection();
      database = db.db(config.database.appsglobal.database);
      collection = config.database.appsglobal.collections.appsInformation;

      try {
        await database.collection(collection).drop();
      } catch (err) {
        console.log('Collection not found.');
      }

      await database.collection(collection).insertMany(testInsert);
    });

    it('should return proper distinct values from database without a filter', async () => {
      const expectedDistinctValues = ['Test', 'Test3'];

      const distinctResults = await dbHelper.distinctDatabase(database, collection, 'description');

      expect(distinctResults).to.eql(expectedDistinctValues);
    });

    it('should return proper distinct values from database with a filter', async () => {
      const expectedDistinctValues = ['Test'];
      const filter = { name: 'App1' };

      const distinctResults = await dbHelper.distinctDatabase(database, collection, 'description', filter);

      expect(distinctResults).to.eql(expectedDistinctValues);
    });

    it('should return no values when the field name is wrong', async () => {
      const distinctResults = await dbHelper.distinctDatabase(database, collection, 'test');

      expect(distinctResults).to.be.empty;
    });
  });

  describe('findOneinDatabase tests', () => {
    let database;
    let collection;
    beforeEach(async () => {
      await dbHelper.initiateDB();
      const db = dbHelper.databaseConnection();
      database = db.db(config.database.appsglobal.database);
      collection = config.database.appsglobal.collections.appsInformation;

      try {
        await database.collection(collection).drop();
      } catch (err) {
        console.log('Collection not found.');
      }

      await database.collection(collection).insertMany(testInsert);
    });

    it('should return results based on the query without projection', async () => {
      const query = { name: 'App1' };
      const expectedResult = {
        _id: ObjectId('5f99562a09aef91cd19fbb93'),
        name: 'App1',
        description: 'Test',
        owner: '1LZe3AUYQC4aT5YWLhgEcH1nLLdoKNBi9t',
      };

      const findOneInDatabaseResult = await dbHelper.findOneInDatabase(database, collection, query);

      expect(findOneInDatabaseResult).to.eql(expectedResult);
    });

    it('should return results based on the query with projection', async () => {
      const query = { name: 'App1' };
      const queryProjection = {
        projection: {
          _id: 0,
          name: 1,
          owner: 1,
        },
      };
      const expectedResult = {
        name: 'App1',
        owner: '1LZe3AUYQC4aT5YWLhgEcH1nLLdoKNBi9t',
      };

      const findOneInDatabaseResult = await dbHelper.findOneInDatabase(database, collection, query, queryProjection);

      expect(findOneInDatabaseResult).to.eql(expectedResult);
    });

    it('should return empty if query yields no results', async () => {
      const query = { name: 'Test1234' };

      const findOneInDatabaseResult = await dbHelper.findOneInDatabase(database, collection, query);

      expect(findOneInDatabaseResult).to.be.null;
    });
  });

  describe('findOneAndUpdateInDatabase tests', () => {
    let database;
    let collection;
    beforeEach(async () => {
      await dbHelper.initiateDB();
      const db = dbHelper.databaseConnection();
      database = db.db(config.database.appsglobal.database);
      collection = config.database.appsglobal.collections.appsInformation;

      try {
        await database.collection(collection).drop();
      } catch (err) {
        console.log('Collection not found.');
      }

      await database.collection(collection).insertMany(testInsert);
    });

    it('should find and update the document based on query and updateExpression', async () => {
      const query = { _id: ObjectId('5f99562a09aef91cd19fbb93') };
      const updateExpression = { $set: { description: 'New Description', owner: '1SZe3AUYQC4aT5YWLhgEcH1nLLdoKNSi9a' } };
      const expectedResult = {
        _id: ObjectId('5f99562a09aef91cd19fbb93'),
        name: 'App1',
        description: 'New Description',
        owner: '1SZe3AUYQC4aT5YWLhgEcH1nLLdoKNSi9a',
      };

      const findOneAndUpdateInDatabaseResponse = await dbHelper.findOneAndUpdateInDatabase(database, collection, query, updateExpression);
      const findOneInDatabaseResult = await dbHelper.findOneInDatabase(database, collection, query);

      expect(findOneAndUpdateInDatabaseResponse.ok).to.eql(1);
      expect(findOneInDatabaseResult).to.eql(expectedResult);
    });

    it('should find and update the document and return the new document', async () => {
      const query = { _id: ObjectId('5f99562a09aef91cd19fbb93') };
      const updateExpression = { $set: { description: 'New Description', owner: '1SZe3AUYQC4aT5YWLhgEcH1nLLdoKNSi9a' } };
      const options = { returnDocument: 'after' };
      const expectedResult = {
        _id: ObjectId('5f99562a09aef91cd19fbb93'),
        name: 'App1',
        description: 'New Description',
        owner: '1SZe3AUYQC4aT5YWLhgEcH1nLLdoKNSi9a',
      };

      const findOneAndUpdateInDatabaseResponse = await dbHelper.findOneAndUpdateInDatabase(database, collection, query, updateExpression, options);

      expect(findOneAndUpdateInDatabaseResponse.ok).to.equal(1);
      expect(findOneAndUpdateInDatabaseResponse.value).to.eql(expectedResult);
    });

    it('should rturn null if object does not exist', async () => {
      const query = { _id: ObjectId('5f91562a011ef91cd19fbb93') };
      const updateExpression = { $set: { description: 'New Description', owner: '1SZe3AUYQC4aT5YWLhgEcH1nLLdoKNSi9a' } };

      const findOneAndUpdateInDatabaseResponse = await dbHelper.findOneAndUpdateInDatabase(database, collection, query, updateExpression);

      expect(findOneAndUpdateInDatabaseResponse.value).to.be.null;
      expect(findOneAndUpdateInDatabaseResponse.ok).to.equal(1);
    });
  });

  describe('insertOneToDatabase tests', () => {
    let database;
    let collection;
    beforeEach(async () => {
      await dbHelper.initiateDB();
      const db = dbHelper.databaseConnection();
      database = db.db(config.database.appsglobal.database);
      collection = config.database.appsglobal.collections.appsInformation;

      try {
        await database.collection(collection).drop();
      } catch (err) {
        console.log('Collection not found.');
      }

      await database.collection(collection).insertMany(testInsert);
    });

    it('should insert object into database if called properly', async () => {
      const documentToInsert = {
        _id: ObjectId('4f99562a09aef92cd1afbe93'),
        name: 'App5',
        description: 'Test3',
        owner: '1SZe3AUYQC4aT5Y0LhgEcH2nLLdoKNSi9e',
      };
      const query = { _id: ObjectId('4f99562a09aef92cd1afbe93') };

      const insertOneResponse = await dbHelper.insertOneToDatabase(database, collection, documentToInsert);
      const getOneFromDatabase = await dbHelper.findOneInDatabase(database, collection, query);

      expect(insertOneResponse.acknowledged).to.be.true;
      // eslint-disable-next-line no-underscore-dangle
      expect(insertOneResponse.insertedId).to.be.eql(documentToInsert._id);
      expect(getOneFromDatabase).to.eql(documentToInsert);
    });
  });
});
