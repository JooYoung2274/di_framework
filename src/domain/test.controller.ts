import { Injectable } from '../decorators/di.decorator';
import { Route } from '../decorators/route.decorator';
import { UserService } from './test.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Route('get', '/users')
    async getUsers(req: Request, res: Response, next: NextFunction) {
        const result = await this.userService.getUsers();
        const users = [{ id: 1, name: result }];
        res.json(users);
    }

    @Route('get', '/user/data')
    getUserData(req: Request, res: Response, next: NextFunction) {
        const userData = { id: 1, name: 'kim' };
        res.json(userData);
    }

    @Route('get', '/')
    getRoot(req: Request, res: Response, next: NextFunction) {
        const data = { message: ' hello world' };
        res.json(data);
    }
}
