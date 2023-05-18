import { container } from '../decorators/di.decorator';

import express from 'express';
import { UserController } from '../domain/test.controller';

export function registerRoutes(app: express.Application, controller: any) {
    const prototype = Object.getPrototypeOf(controller);
    const propertyNames = Object.getOwnPropertyNames(prototype);
    for (const propertyName of propertyNames) {
        if (propertyName !== 'constructor') {
            const route = Reflect.getMetadata('route', prototype, propertyName);
            if (route) {
                (app as any)[route.method](route.path, prototype[propertyName].bind(controller));
            }
        }
    }
}

export const userController = container.resolve<UserController>(UserController.name);
