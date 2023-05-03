import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import 'dotenv/config';
import cors from 'cors';

const app = express();
app.use(helmet());
app.use(express.json());

const corsOptions = {
    origin: '*',
    credentials: true,
};
app.use(cors(corsOptions));

type Constructor<T> = new (...args: any[]) => T;

class Container {
    private services: Map<string, Constructor<any>> = new Map();

    register<T>(key: string, type: Constructor<T>) {
        this.services.set(key, type);
    }

    resolve<T>(key: string): T {
        const targetType = this.services.get(key);
        if (!targetType) {
            throw new Error(`Service not found: ${key}`);
        }
        const dependencies = Reflect.getMetadata('design:paramtypes', targetType) || [];
        const instances = dependencies.map((dependency: Constructor<any>) => this.resolve(dependency.name));
        return new targetType(...instances);
    }
}

function Injectable() {
    return function (target: Constructor<any>) {
        container.register(target.name, target);
    };
}

function Route(method: string, path: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata('route', { method, path }, target, propertyKey);
    };
}

function registerRoutes(app: express.Application, controller: any) {
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

@Injectable()
class UserRepository {
    // ...
}

@Injectable()
class UserService {
    constructor(private readonly userRepository: UserRepository) {}
    // ...
}

@Injectable()
class UserController {
    constructor(private readonly userService: UserService) {}

    @Route('get', '/users')
    getUsers(req: Request, res: Response, next: NextFunction) {
        const users = [{ id: 1, name: 'John Doe' }];
        res.json(users);
    }

    @Route('get', '/user/data')
    getUserData(req: Request, res: Response, next: NextFunction) {
        const userData = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
        res.json(userData);
    }
}

const container = new Container();
const userController = container.resolve<UserController>(UserController.name);
registerRoutes(app, userController);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server listening on port ${port}`);
});
