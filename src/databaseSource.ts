import { DataSource } from 'typeorm';

const datasource = new DataSource({
  type: 'mariadb',
  logging: true,
  subscribers: [],
  replication: {
    master: {
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'rootpassword',
      database: 'exampledb',
    },
    slaves: [
      {
        host: 'localhost',
        port: 3307,
        username: 'root',
        password: 'rootpassword',
        database: 'exampledb',
      },
    ],
  },
});
export default datasource;
