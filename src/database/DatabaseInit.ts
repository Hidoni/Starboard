import glob from 'glob';
import path from 'path';
import { Sequelize } from 'sequelize';
import { DatabaseModel } from '../interfaces/DatabaseModel';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'starboard.sqlite',
});

try {
    glob.sync(path.join(__dirname, 'models/**/*.js')).forEach(
        (file: string) => {
            const model: DatabaseModel = require(file);
            model.initializer(sequelize);
        }
    );
} catch (error) {
    console.error(`Failed to fetch models: ${error}`);
}

sequelize.sync();
