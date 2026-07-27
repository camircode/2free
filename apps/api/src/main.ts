import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { loadRuntimeConfig } from "@2free/application";

import { AppModule } from "./app.module.js";
import { createApiComposition, type ApiComposition } from "./composition.js";

export async function createApiApplication(
  composition: ApiComposition = createApiComposition(loadRuntimeConfig()),
) {
  await composition.prepare();
  const app = await NestFactory.create(AppModule.register(composition), { bodyParser: false });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();
  return app;
}

async function bootstrap(): Promise<void> {
  const config = loadRuntimeConfig();
  const app = await createApiApplication(createApiComposition(config));
  await app.listen(config.apiPort, config.apiHost);
  console.log(`2 Free API listening on http://${config.apiHost}:${config.apiPort}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "API startup failed");
    process.exitCode = 1;
  });
}
