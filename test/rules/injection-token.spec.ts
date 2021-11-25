import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { rule } from '../../src/rules/injection-token';
import { getFixturesRootDir } from '../utils';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: getFixturesRootDir(),
    project: '../fixtures/tsconfig.json',
  },
});

ruleTester.run('injection-token', rule, {
  valid: [
    {
      code: `interface IOrganizationsDatabase {}
              
             @provide(IGetNonStartedOrganizationFeeChargesToken)
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

             @provide(IGetNonStartedOrganizationFeeChargesToken)
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
      code: `@provide(IGetNonStartedOrganizationFeeChargesToken)
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
    },
  ],
  invalid: [
    {
      code: `@provide(IGetNonStartedOrganizationFeeChargesToken)
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
      code: `@provide(IGetNonStartedOrganizationFeeChargesToken)
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
