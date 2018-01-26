const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const request = require('request-promise');
const htmlSoup = require('html-soup');
const cors = require('cors');

const people = [];

// construct a schema, using graphql schema language
const schema = buildSchema(`
  type Person {
    name: String
    email: String
  }

  type Query {
    person: Person
  }
`);

class Person {
  constructor() {
    this.loadName();
  }

  loadName() {
    const self = this;
    request('http://www.behindthename.com/random/random.php?number=2&gender=m&surname=&all=yes')
      .then(function (htmlString) {
        self.processName(htmlString, self);
        self.loadEmail();
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  processName(html, person) {
    const dom = htmlSoup.parse(html);
    let randName = '';
    htmlSoup.select(dom, 'span.heavyhuge > a.plain').forEach(
      (aa) => {
        randName += aa.child.text;
        randName += ' ';
      }
    );
    person.name = randName.substring(0, randName.length -1);
  }

  loadEmail() {
    this.email = this.name.replace(' ', '').toLowerCase() + '@fakemail.com'
  }
}

// the root provides a resolver function for each API endpoint
const root = {
  person: () => {
    loadNewPerson(2);
    return people.shift();
  },
};

loadNewPerson = (number) => {
  while(people.length < number) {
    people.push(new Person());
  }
}

loadNewPerson(2);
const app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen('8080');
console.log('running a graphql api server at localhost:4000/graphql');
