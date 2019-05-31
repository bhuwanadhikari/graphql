const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./Models/Event");

const app = express();

//bodyParser middleware
app.use(bodyParser.json());

//database
const db = require("./config/keys").mongoURI;
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to database");
  })
  .catch(err => {
    console.log("Error Occure", err);
  });

app.get("/", (req, res) => {
  res.send("Hello rod");
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            Date: String!
        }    

        type RootQuery {
            events:[Event!]!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(events => {
            return events;
          })
          .catch(err => {
            console.log(err);
          });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: args.eventInput.price,
          date: new Date(args.eventInput.date)
        });
        return event
          .save()
          .then(event => {
            console.log(event);
            return event;
          })
          .catch(err => {
            console.log(err);
            throw err; //graphql returns error
          });
      }
    },
    graphiql: true
  })
);

app.listen(3000, () => {
  console.log("App listening in port 3000");
});
