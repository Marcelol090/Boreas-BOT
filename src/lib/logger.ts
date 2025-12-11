import chalk from 'chalk';

class Logger {
    info(msg: string, context?: string) {
        if (process.env.NODE_ENV !== 'test') console.log(`${chalk.blue('[INFO]')} ${context ? `[${context}] ` : ''}${msg}`);
    }
    success(msg: string, context?: string) {
        if (process.env.NODE_ENV !== 'test') console.log(`${chalk.green('[SUCCESS]')} ${context ? `[${context}] ` : ''}${msg}`);
    }
    warn(msg: string, context?: string) {
        if (process.env.NODE_ENV !== 'test') console.warn(`${chalk.yellow('[WARN]')} ${context ? `[${context}] ` : ''}${msg}`);
    }
    error(msg: string, error?: any, context?: string) {
        if (process.env.NODE_ENV !== 'test') {
            console.error(`${chalk.red('[ERROR]')} ${context ? `[${context}] ` : ''}${msg}`);
            if (error) console.error(chalk.red(error));
        }
    }
}
export const logger = new Logger();