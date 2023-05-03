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

const container = new Container();

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

// 여기서 Injectable 데코레이터를 통해서 Repository, Service, Controller가 순서대로 container에 등록된다.
// 중요한건 순서대로 등록됨.....
// Repository보다 Service가 먼저 등록되면 에러가 날텐데 이걸 어떻게 순서를 지키게하지?
// nestjs처럼 모듈을 만들어야하나
// 아니근데 typedi는 도대체 어떻게 그걸 처리한거지 @Service 데코레이터가 사실 그 의존성 순서도 찾아가는거였나..?
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
        const users = [{ id: 1, name: 'kim' }];
        res.json(users);
    }

    @Route('get', '/user/data')
    getUserData(req: Request, res: Response, next: NextFunction) {
        const userData = { id: 1, name: 'kim' };
        res.json(userData);
    }
}

const userController = container.resolve<UserController>(UserController.name);

registerRoutes(app, userController);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server listening on port ${port}`);
});
