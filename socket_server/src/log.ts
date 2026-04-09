import winston from 'winston';

const myLevels = {
  alert: 0,
  error: 1,
  warning: 2,
  notice: 3,
  info: 4,
  debug: 5,
};

winston.addColors({
  alert: 'redBG black bold',
  error: 'red',
  warning: 'yellow',
  notice: 'cyan',
  info: 'green',
  debug: 'gray',
});

export const logger = winston.createLogger({
  levels: myLevels,
  level: process.env.APP_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});
