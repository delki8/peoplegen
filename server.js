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
const cnpj = require('@fnando/cnpj/commonjs');
const path = require('path');

const people = [];

// defining the Person type
const personType = new GraphQLObjectType({
  name: 'Person',
  fields: {
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    cpf: { type: GraphQLString },
    cnpj: { type: GraphQLString },
    credits: { type: GraphQLString },
  }
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    person: {
      type: personType,
      resolve: function () {
        loadNewPerson(5);
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
    this.cnpj = cnpj.generate(true);
    this.credits = 'written by delki8 using behindthename.com, github.com/tiagoporto/gerador-validador-cpf and github.com/fnando/cnpj';
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
    htmlSoup.select(dom, 'div.random-results > a.plain').forEach(
      (aa) => {
        randName += aa.child.text;
        randName += ' ';
      }
    );
    person.name = randName.substring(0, randName.length -1);
    person.name = person.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

loadNewPerson(5);

const app = express();
app.use(cors());
app.use(express.static('public'));
app.enable('trust proxy')
app.use((req, res, next) => {
  req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
})

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.use('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});


const port = process.env.PORT || 8090
app.listen(port);
console.log('/graphql running on ' + port);
