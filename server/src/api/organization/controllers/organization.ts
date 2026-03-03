/**
 * organization controller — delegates to Strapi's core factory
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::organization.organization');
