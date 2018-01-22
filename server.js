const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const request = require('request-promise');
const htmlSoup = require('html-soup');

const names = [];

// construct a schema, using graphql schema language
const schema = buildSchema(`
  type Query {
    peopleName: String
  }
`);

// the root provides a resolver function for each API endpoint
const root = {
  rollThreeDice: () => {
    return ['s', 'k', 3].map(_ => 1 + Math.floor(Math.random() * 6));
  },
  peopleName: () => {
    loadPeopleNames();
    return names.shift();
  },
};

loadPeopleNames = () => {
  request('http://www.behindthename.com/random/random.php?number=2&gender=m&surname=&all=yes')
    .then(function (htmlString) {
      processHTML(htmlString)
    })
    .catch(function (err) {
      console.log(err);
    });
}

processHTML = (html) => {
  const dom = htmlSoup.parse(html);
  let randName = '';
  htmlSoup.select(dom, 'span.heavyhuge > a.plain').forEach(
    (aa) => {
      randName += aa.child.text;
      randName += ' ';
    }
  );
  names.push(randName.substring(0, randName.length -1));
}

loadPeopleNames();
const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen('4000');
console.log('running a graphql api server at localhost:4000/graphql');
