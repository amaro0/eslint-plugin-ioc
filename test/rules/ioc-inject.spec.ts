import { ESLintUtils } from '@typescript-eslint/experimental-utils';

import { rule } from '../../src/ioc-inject';
import { getFixturesRootDir } from '../utils';

const ruleTester = new ESLintUtils.RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: getFixturesRootDir(),
    project: '../fixtures/tsconfig.json',
  },
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
    }, {
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
                 @inject()
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
