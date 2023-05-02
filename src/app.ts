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
    // origin: '*',
    credentials: true,
};
app.use(cors(corsOptions));

// 일단 여기다 작성
// DI 라이브러리 안쓰고 DI 기능 만들기

type Constructor<T> = new (...args: any[]) => T;
type Dependency<T> = T | Constructor<T>;
type Resolver<T> = (...args: any[]) => T;

interface Dependencies {
    [key: string]: Dependency<any>;
}

interface ServiceDescriptor<T> {
    dependencies: Dependencies;
    resolver: Resolver<T>;
}

interface ServiceCollection {
    [key: string]: ServiceDescriptor<any>;
}

class Container {
    private services: ServiceCollection = {};

    register<T>(key: string, resolver: Resolver<T>, dependencies: Dependencies = {}) {
        this.services[key] = { resolver, dependencies };
    }

    resolve<T>(key: string): T {
        const service = this.services[key];
        const dependencies = [];
        for (const dependencyKey in service.dependencies) {
            dependencies.push(this.resolve(dependencyKey));
        }
        return service.resolver(...dependencies);
    }
}

// UserRepository 클래스
class UserRepository {
    // ...
}

// UserService 클래스
class UserService {
    constructor(private readonly userRepository: UserRepository) {}
    // ...
}

// UserController 클래스
class UserController {
    constructor(private readonly userService: UserService) {}
    // ...
}

// 컨테이너 생성
const container = new Container();

// 의존성 등록
container.register(UserRepository.name, () => new UserRepository());
container.register(UserService.name, (userRepository: UserRepository) => new UserService(userRepository), {
    [UserRepository.name]: UserRepository,
});
container.register(UserController.name, (userService: UserService) => new UserController(userService), {
    [UserService.name]: UserService,
});

// 라우터 등록
const userController = container.resolve<UserController>(UserController.name);

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('hello world');
});

app.listen(process.env.PORT, () => {
    console.log(`server listening on port ${process.env.PORT} `);
});
