const app = require('./app');
const env = require('./config/env');

app.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});