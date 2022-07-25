const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');


const app = express();
const PORT = process.env.PORT || 3001;

async function startApolloServer() {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });
  await server.start();

  server.applyMiddleware({ app });

  app.use((req, res) => {
    res.status(200);
    res.send('Hello!');
    res.end();
  });

}

// These middleware functions let Incoming requests be recognized as a string or json object
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*',(req,res)=>
res.sendFile(path.join(__dirname, 'client/build/index.html')));

// Once our server is open lets log the port it is running on
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  })
});

// Function call to start the Apollo server
startApolloServer(typeDefs, resolvers);