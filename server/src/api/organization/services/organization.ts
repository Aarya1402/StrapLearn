/**
 * organization service — delegates to Strapi's core factory
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::organization.organization');
