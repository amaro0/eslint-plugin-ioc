import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { rule } from '../../src/ioc-inject';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('ioc-inject', rule, {
  valid: [
    {
      code: `import { inject } from 'inversify';
             import { provide } from 'inversify-binding-decorators';
             import { Organization } from './models/Organization';
             import {
               IOrganizationsDatabase,
               IOrganizationsDatabaseToken,
             } from './ports/IOrganizationsDatabase';
             import {
               IGetOrganization,
               IGetOrganizationToken,
             } from './ports/IGetOrganization';
             import { Context } from '../../../common/types';
             
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
    },
  ],
  invalid: [
    {
      code: `import { inject } from 'inversify';
             import { provide } from 'inversify-binding-decorators';
             import { Organization } from './models/Organization';
             import {
               IOrganizationsDatabase,
               IOrganizationsDatabaseToken,
             } from './ports/IOrganizationsDatabase';
             import {
               IGetOrganization,
               IGetOrganizationToken,
             } from './ports/IGetOrganization';
             import { Context } from '../../../common/types';
             
             @provide(IGetNonStartedOrganizationFeeChargesToken)
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
      errors: [{ messageId: 'ioc-inject' }],
    },
  ],
});
