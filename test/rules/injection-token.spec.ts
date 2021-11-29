import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { injectionToken } from '../../src/rules/injection-token';
import { getFixturesRootDir } from '../utils';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: getFixturesRootDir(),
    project: '../fixtures/tsconfig.json',
  },
});

ruleTester.run('injection-token', injectionToken, {
  valid: [
    {
      code: `interface IOrganizationsDatabase {}
              
             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(IOrganizationsDatabaseToken)
                 private database: IOrganizationsDatabase,
               ) {}
             
               run(context?: Context): Promise<Organization> {
                 return this.database.findAllByContext(
                   {
                     organizationId: '123',
                   },
                   context,
                 );
               }
             }`,
    }, {
      code: `class TestClass {}

             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject()
                 private database: TestClass,
               ) {}
             
               run(context?: Context): Promise<Organization> {
                 return this.database.findAllByContext(
                   {
                     organizationId: '123',
                   },
                   context,
                 );
               }
             }`,
    }, {
      code: `class OrganizationsRepository{}

             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(OrganizationsRepository)
                 private database: OrganizationsRepository,
               ) {}
             
               run(context?: Context): Promise<Organization> {
                 return this.database.findAllByContext(
                   {
                     organizationId: '123',
                   },
                   context,
                 );
               }
             }`,
    }, {
      code: `@provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(OrganizationsRepository)
                 private database: IRepository<Organization>,
               ) {}
             
               run(context?: Context): Promise<Organization> {
                 return this.database.findAllByContext(
                   {
                     organizationId: '123',
                   },
                   context,
                 );
               }
             }`,
    }, {
      code: `class Organization{}
             export interface IFactory<TModel> {
                create(data: Partial<TModel>): TModel;
                createMany(data: Partial<TModel>[]): TModel[];
              }
              
              @provide(IGetOrganizationToken)
              export class GetOrganizationQueryHandler
                implements IGetOrganization
              {
                constructor(
                @inject(OrganizationFactoryToken)
                 private factory: IFactory<Organization>,
                ) {}
              
                run(context?: Context): Promise<Organization> {
                  return this.factory.create({})
                }
              }`,
    },
  ],
  invalid: [
    {
      code: `@provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(IUsersDatabaseToken)
                 private database: IOrganizationsDatabase,
               ) {}
             
               run(context?: Context): Promise<Organization> {
                 return this.database.findAllByContext(
                   {
                     organizationId: '123',
                   },
                   context,
                 );
               }
             }`,
      errors: [{ messageId: 'incorrectInjectionToken' }],
    },
    {
      code: `@provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(IOrganizationsDatabaseToke)
                 private database: IOrganizationsDatabase,
               ) {}
             
               run(context?: Context): Promise<Organization> {
                 return this.database.findAllByContext(
                   {
                     organizationId: '123',
                   },
                   context,
                 );
               }
             }`,
      errors: [{ messageId: 'injectionTokenIncorrectName' }],
      options: [{ injectionTokenNameRegex: /^[A-Za-z]*Token$/ }],
    },
    {
      code: `class TestClass {}
              
             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(TestClass)
                 private database: TestClass,
               ) {}
             
               run(context?: Context): Promise<Organization> {
                 return this.database.findAllByContext(
                   {
                     organizationId: '123',
                   },
                   context,
                 );
               }
             }`,
      errors: [{ messageId: 'classInjection' }],
      options: [{ allowClassInjection: false }],
    },
  ],
});
