import { Injectable } from '../decorators/di.decorator';

@Injectable()
export class UserRepository {
    async getUsers() {
        return 'aaaaaa';
    }
    // ...
}
