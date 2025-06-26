import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { DysonService } from './dyson/dyson.service';

const getArgs = (args: string[]) =>
  process.argv.reduce((args, arg) => {
    // long arg
    if (arg.slice(0, 2) === "--") {
      const longArg = arg.split("=");
      const longArgFlag = longArg[0].slice(2);
      const longArgValue = longArg.length > 1 ? longArg[1] : true;
      args[longArgFlag] = longArgValue;
    }
    // flags
    else if (arg[0] === "-") {
      const flags = arg.slice(1).split("");
      flags.forEach((flag) => {
        args[flag] = true;
      });
    }
    return args;
  }, {});

async function bootstrap() {
  const SERVICE_NAME: string = 'Dyson';

  const start: number = Date.now();
  Logger.log('Creating an application context...', SERVICE_NAME);

  const app = await NestFactory.createApplicationContext(AppModule);

  Logger.log('Application context created', SERVICE_NAME);

  const args = getArgs(process.argv.slice(2));
  if(args['resource'] === undefined) {
    Logger.error('No resource specified. Use --resource=<resource_name>', SERVICE_NAME);
    process.exit(1);
  }

  const dysonService = app.get(DysonService);
  await dysonService.launch(args['resource']);

  const end: number = Date.now();
  Logger.log(`JSON ready (${end - start}ms)`, SERVICE_NAME);

  await app.close();
}

bootstrap();
