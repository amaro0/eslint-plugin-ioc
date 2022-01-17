import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { classInjection } from '../../src/rules/class-injection';
import { getFixturesRootDir } from '../utils';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: getFixturesRootDir(),
    project: '../fixtures/tsconfig.json',
  },
});

ruleTester.run('class-injection', classInjection, {
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
    },
  ],
  invalid: [
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
    },
  ],
});
