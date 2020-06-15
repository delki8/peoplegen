# peoplegen
a graphql api to generate random basic info of a person running at http://peoplegen.herokuapp.com/graphql

## try it
open your browser's devtools and type the following 
```javascript
const newPerson = clb => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.open('POST', 'https://peoplegen.herokuapp.com/graphql');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = () => clb(xhr.response.data.person);
  const query = `{
                    person { 
                      name 
                      email 
                      cpf
                      credits 
                    }
                  }`;
  xhr.send(JSON.stringify({ query }));
};

newPerson(person => console.log(person));
```

_it may take a few seconds to print the person for the first time because we're 
currently running on a free heroku instance, and it takes a while to start up_
