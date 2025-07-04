import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "@/app.module";
import { DysonService } from "@/script/dyson/dyson.service";
import { ConverterService } from "@/script/converter/converter.service"; // Import du converter

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
  const SERVICE_NAME = "Runner";

  Logger.log("Creating application context...", SERVICE_NAME);
  const app = await NestFactory.createApplicationContext(AppModule);
  Logger.log("Application context created", SERVICE_NAME);

  const args = getArgs(process.argv.slice(2));

  const resource = args["resource"];
  if (!resource) {
    Logger.error("No resource specified. Use --resource=<resource_name>", SERVICE_NAME);
    process.exit(1);
  }

  // Par défaut on lance Dyson, mais on peut spécifier --mode=converter
  const mode = args["mode"] || "dyson";

  if (mode === "dyson") {
    const dysonService = app.get(DysonService);
    Logger.log(`Starting Dyson service for resource "${resource}"...`, SERVICE_NAME);
    await dysonService.launch(resource);
  } else if (mode === "converter") {
    const converterService = app.get(ConverterService);
    Logger.log(`Starting Converter service for resource "${resource}"...`, SERVICE_NAME);
    await converterService.launch(resource);
  } else {
    Logger.error(`Unknown mode "${mode}". Supported modes: dyson, converter`, SERVICE_NAME);
    process.exit(1);
  }

  Logger.log(`Process for mode "${mode}" completed`, SERVICE_NAME);
  await app.close();
}

bootstrap();
