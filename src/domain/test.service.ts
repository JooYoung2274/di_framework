import { Injectable } from '../decorators/di.decorator';
import { UserRepository } from './test.repository';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}
    // ...
}
