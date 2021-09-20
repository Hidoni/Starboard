import { Model, ModelCtor, Sequelize } from 'sequelize/types';

export interface DatabaseModelInitializer {
    (sequelize: Sequelize): ModelCtor<Model<any, any>>;
}

export interface DatabaseModel {
    initializer: DatabaseModelInitializer;
}
