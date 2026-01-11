import { Sequelize, Options } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSequelizeConfig(): { sequelize: Sequelize; dialect: string } {
  const baseOptions: Partial<Options> = {
    logging: config.env === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  };

  if (config.database.dialect === 'sqlite') {
    // SQLite for development
    const dbPath = path.resolve(__dirname, '../../', config.database.storage);
    const dbDir = path.dirname(dbPath);
    
    // Ensure data directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    logger.info(`Using SQLite database at: ${dbPath}`);
    
    return {
      sequelize: new Sequelize({
        ...baseOptions,
        dialect: 'sqlite',
        storage: dbPath,
      } as Options),
      dialect: 'sqlite',
    };
  }

  // MySQL for production
  logger.info(`Using MySQL database at: ${config.database.host}:${config.database.port}/${config.database.name}`);
  
  return {
    sequelize: new Sequelize(
      config.database.name,
      config.database.user,
      config.database.password,
      {
        ...baseOptions,
        host: config.database.host,
        port: config.database.port,
        dialect: 'mysql',
        define: {
          ...baseOptions.define,
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
        },
        dialectOptions: {
          charset: 'utf8mb4',
        },
      } as Options
    ),
    dialect: 'mysql',
  };
}

const { sequelize, dialect } = getSequelizeConfig();

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info(`✅ Database connection established successfully (${dialect})`);
  } catch (error) {
    logger.error('❌ Unable to connect to database:', error);
    if (dialect === 'mysql') {
      logger.warn('⚠️  Make sure MySQL is running and the database exists.');
      logger.warn(`   Host: ${config.database.host}:${config.database.port}`);
      logger.warn(`   Database: ${config.database.name}`);
      logger.warn(`   User: ${config.database.user}`);
    }
    throw error;
  }
}

export function getDialect(): string {
  return dialect;
}

export async function syncDatabase(force = false): Promise<void> {
  try {
    await sequelize.sync({ force, alter: !force && config.env === 'development' });
    logger.info('✅ Database synchronized successfully');
  } catch (error) {
    logger.error('❌ Database sync failed:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
}

export { sequelize };