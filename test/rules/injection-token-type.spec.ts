import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { injectionTokenType } from '../../src/rules/injection-token-type';
import { getFixturesRootDir } from '../utils';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: getFixturesRootDir(),
    project: '../fixtures/tsconfig.json',
  },
});

ruleTester.run('injection-token-type', injectionTokenType, {
  valid: [
    {
      code: `interface IOrganizationsDatabase {}
             const token = Symbol.for('IOrganizationsDatabase');
             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(token)
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
    },
    {
      code: `interface IOrganizationsDatabase {}
             const token = 'IOrganizationsDatabase';
             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(token)
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
      options: [{ allowedTypes: ['string'] }],
    },
    {
      code: `interface IOrganizationsDatabase {}

             class TokenC{
              p!:string;
             }
             
             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(TokenC)
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
      options: [{ allowedTypes: ['object'] }],
    },
  ],
  invalid: [
    {
      code: `interface IOrganizationsDatabase {}
             const token = 'IOrganizationsDatabase';
             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(token)
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
      options: [{ allowedTypes: ['symbol'] }],
      errors: [{ messageId: 'notAllowedInjectionTokenType' }],
    },
    {
      code: `interface IOrganizationsDatabase {}
             const token = Symbol.for('IOrganizationsDatabase');
             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(token)
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
      options: [{ allowedTypes: ['string'] }],
      errors: [{ messageId: 'notAllowedInjectionTokenType' }],
    },
    {
      code: `interface IOrganizationsDatabase {}
             class TokenC{};
             @provide(IGetOrganizationToken)
             export class GetOrganizationQueryHandler
               implements IGetOrganization
             {
               constructor(
                 @inject(TokenC)
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
      options: [{ allowedTypes: ['symbol'] }],
      errors: [{ messageId: 'notAllowedInjectionTokenType' }],
    },
  ],
});
