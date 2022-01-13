# eslint-plugin-ioc

Minimal eslint typescript plugin that provides some basic linting around IoC. Should work with popular node IoC
packages(inversify, ts-syringe) and NestJs.

## Basic usage

```js
// .eslintrs.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['ioc'],
  rules: {
    'ioc/injection-token': 'error',
  },
};

```

## Rules

### injection-token

In ts inject decorator, due to poor reflection capabilities, has to have explicit injection token provided as a
parameter. Since there is no way of implementing type safe inject decorator, that approach is error-prone. This rule
aims to improve that(a little) by injection token name and type comparison. Ofc that won't work in some cases, but with
strict interface and token naming convention it can save few wtf's per line of code ;)

```ts
const IOrganizationsDatabaseToken = Symbol.for('IOrganizationsDatabase');

interface IOrganizationsDatabase {};

class GetOrganizationQueryHandler {
  constructor(
    // error
    @inject(IUsersDatabaseToken)
    private database: IOrganizationsDatabase,
  ) {
  }
}

const IUsersDatabaseToken = Symbol.for('IUsersDatabase');

interface IUsersDatabase {};

class GetUserQueryHandler {
  constructor(
    // correct
    @inject(IUsersDatabaseToken)
    private database: IUsersDatabase,
  ) {
  }
}
```

Additionally, if you want to enforce strict convention, you can disable injection by class or set injection token naming
guidelines.

`allowClassInjection` - set to false if injection by implementation(class) should be forbidden

```ts
class OrganizationsDatabase {};

class GetOrganizationQueryHandler
  implements IGetOrganization {
  constructor(
    // error
    @inject(OrganizationsDatabase)
    private database: OrganizationsDatabase,
  ) {
  }
}
```

`allowClassInjection` - set to `false` if injection by implementation(class) should be forbidden, default `true`

```ts
class OrganizationsDatabase {};

class GetOrganizationQueryHandler
  implements IGetOrganization {
  constructor(
    // error
    @inject(OrganizationsDatabase)
    private database: OrganizationsDatabase,
  ) {
  }
}
```

- `injectionTokenNameRegex` - set to some regexp to enforce strict naming patter of injection tokens
- `injectDecoratorRegex` - set to some regexp if you are using other naming for inject decorators than /^(i|I)nject$/

### injection-token-type

Lint injection token type

- `allowedTypes` - array of allowed types, can be: `['symbol', 'string', 'object']`
- `injectionTokenNameRegex` - set to some regexp to enforce strict naming patter of injection tokens
- `injectDecoratorRegex` - set to some regexp if you are using other naming for inject decorators than `/^(i|I)nject$/`

#### Complete usage

``` js
// .eslintrs.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['ioc'],
  rules: {
    'ioc/injection-token': [
      'error', {
        allowClassInjection: false,   
        injectDecoratorRegex: /^(i|I)nject$/,
        injectionTokenNameRegex: /^[A-z]*Token$/
      }
    ],
    'ioc/injection-token-type': [
      'error', {
        allowedTypes: ['symbol'],   
        injectDecoratorRegex: /^(i|I)nject$/
      }
    ],
  },
};
```
