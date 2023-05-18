type Constructor<T> = new (...args: any[]) => T;

class Container {
    private layers: Map<string, Constructor<any>> = new Map();

    register<T>(key: string, type: Constructor<T>) {
        this.layers.set(key, type);
    }

    resolve<T>(key: string): T {
        const targetType = this.layers.get(key);
        if (!targetType) {
            throw new Error(`Service not found: ${key}`);
        }
        const dependencies = Reflect.getMetadata('design:paramtypes', targetType) || [];
        const instances = dependencies.map((dependency: Constructor<any>) => this.resolve(dependency.name));
        return new targetType(...instances);
    }
}

export const container = new Container();

export function Injectable() {
    return function (target: Constructor<any>) {
        container.register(target.name, target);
    };
}
