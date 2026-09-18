import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Protección de Cabeceras HTTP contra ataques comunes (XSS, Clickjacking, MIME Sniffing)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Adecuado para APIs puras REST
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Compresión HTTP para optimizar ancho de banda y velocidad ante alta concurrencia
  const compressionFn = typeof compression === 'function' ? compression : (compression as any).default;
  if (typeof compressionFn === 'function') {
    app.use(compressionFn());
  }

  // 3. CORS seguro
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 4. Validación estricta contra inyección de payloads y Mass Assignment
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Descarta campos no permitidos
      forbidNonWhitelisted: true, // Lanza error 400 si envían campos sospechosos no declarados
      transform: true, // Transforma strings a tipos primitivos declarados
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5. Filtro global seguro para proteger fuga de datos internos (Prisma / SQL)
  app.useGlobalFilters(new HttpExceptionFilter());

  // 6. Cierre ordenado de recursos y conexiones de base de datos
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`API TidyDesk corriendo seguramente en el puerto ${port}`);
}

bootstrap();
