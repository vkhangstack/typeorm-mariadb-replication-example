import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class ExecutionTimeSubscriber implements EntitySubscriberInterface {
  beforeInsert(event: InsertEvent<any>) {
    console.log('event', event);
    event.queryRunner.data = { startTime: Date.now() }; // Lưu thời gian bắt đầu
    console.log(`[Before Insert] Entity: ${event.entity}`);
    console.log('sax');
  }

  afterInsert(event: InsertEvent<any>) {
    const executionTime =
      Date.now() - (event.queryRunner.data.startTime || Date.now());
    console.log(`[After Insert] Execution Time: ${executionTime}ms`);

    if (executionTime > 1000) {
      console.warn(
        `[Slow Query Warning]: Insert operation took ${executionTime}ms`,
      );
    }
  }

  beforeUpdate(event: UpdateEvent<any>) {
    event.queryRunner.data = { startTime: Date.now() }; // Lưu thời gian bắt đầu
    console.log(`[Before Update] Entity: ${event.entity}`);
  }

  afterUpdate(event: UpdateEvent<any>) {
    const executionTime =
      Date.now() - (event.queryRunner.data.startTime || Date.now());
    console.log(`[After Update] Execution Time: ${executionTime}ms`);

    if (executionTime > 1000) {
      console.warn(
        `[Slow Query Warning]: Update operation took ${executionTime}ms`,
      );
    }
  }
}
