const express = require('express');
const graphqlHTTP = require('express-graphql');
const {
        GraphQLObjectType,
        GraphQLString,
        GraphQLSchema,
      } = require('graphql');
const request = require('request-promise');
const htmlSoup = require('html-soup');
const cors = require('cors');
const { CPF } = require('gerador-validador-cpf');

const people = [];

// defining the Person type
const personType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    cpf: { type: GraphQLString },
  }
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    person: {
      type: personType,
      resolve: function () {
        loadNewPerson(2);
        return people.shift();
      }
    }
  }
});

const schema = new GraphQLSchema({ query: queryType });

class Person {
  constructor() {
    this.loadName();
    this.cpf = CPF.generate();
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
  graphiql: true,
}));

const port = process.env.PORT || 8090
app.listen(port);
console.log('/graphql running on ' + port);
