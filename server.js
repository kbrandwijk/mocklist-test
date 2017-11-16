const express = require("express");
const bodyParser = require("body-parser");
const { expressPlayground } = require("graphql-playground-middleware");
const { Qewl } = require("qewl");
const {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  MockList
} = require("graphql-tools");

async function run() {
  const app = express();

  const qewl = new Qewl();

  const typeDefs = `
    type Book {
      title: String
      number: Int
    }

    type Query {
        
        books: [Book]
    }`

  const mySchema = makeExecutableSchema({ typeDefs });

  addMockFunctionsToSchema({
    schema: mySchema,
    mocks: {
      Query: () => ({
        books: () => new MockList([2, 6])
      })
    }
  });

  qewl.schema({ schema: mySchema });

  qewl.router.use("Query.books", async (event, next) => {
    // Do something before
    const result = await next();
    // Do something after
    console.log(result)
    return result;
  });

  app.use("/graphql", bodyParser.json(), await qewl.middleware());
  app.use("/playground", expressPlayground({ endpoint: "/graphql" }));

  app.listen(3000, () =>
    console.log(
      "Server running. Open http://localhost:3000/playground to run queries."
    )
  );
}

run().catch(console.error.bind(console));
