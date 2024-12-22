import { Injectable } from '@nestjs/common';
import datasource from './databaseSource';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  private sleep(seconds: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds);
    });
  }

  async getUsers() {
    await datasource.initialize();
    const masterQueryRunner = datasource.createQueryRunner('master');

    const slaveQueryRunner = datasource.createQueryRunner('slave');
    try {
      const id = crypto.randomUUID();
      const newUser = await masterQueryRunner.query(
        `INSERT INTO users(id, name) VALUES (?,?)`,
        [id, crypto.randomUUID().replaceAll('-', '')],
      );
      console.log('newUser', newUser.affectedRows);

      await this.sleep(1000);

      const user = await slaveQueryRunner.query(
        'SELECT * FROM users where id = ?',
        [id],
      );
      return user;
    } catch (error) {
      console.log('error', error);
    } finally {
      await slaveQueryRunner.release();
      await datasource.destroy();
    }
  }
}
