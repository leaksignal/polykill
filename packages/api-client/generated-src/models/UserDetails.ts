/* tslint:disable */
/* eslint-disable */
/**
 * LeakSignal LeakScanner
 * API for LeakSignal LeakScanner
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: max@leaksignal.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface UserDetails
 */
export interface UserDetails {
    /**
     * 
     * @type {number}
     * @memberof UserDetails
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof UserDetails
     */
    email?: string;
    /**
     * 
     * @type {string}
     * @memberof UserDetails
     */
    first_name?: string;
    /**
     * 
     * @type {string}
     * @memberof UserDetails
     */
    last_name?: string;
    /**
     * 
     * @type {string}
     * @memberof UserDetails
     */
    created_at?: string;
    /**
     * or null
     * @type {string}
     * @memberof UserDetails
     */
    paid_until?: string;
}

/**
 * Check if a given object implements the UserDetails interface.
 */
export function instanceOfUserDetails(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function UserDetailsFromJSON(json: any): UserDetails {
    return UserDetailsFromJSONTyped(json, false);
}

export function UserDetailsFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserDetails {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'email': !exists(json, 'email') ? undefined : json['email'],
        'first_name': !exists(json, 'first_name') ? undefined : json['first_name'],
        'last_name': !exists(json, 'last_name') ? undefined : json['last_name'],
        'created_at': !exists(json, 'created_at') ? undefined : json['created_at'],
        'paid_until': !exists(json, 'paid_until') ? undefined : json['paid_until'],
    };
}

export function UserDetailsToJSON(value?: UserDetails | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'email': value.email,
        'first_name': value.first_name,
        'last_name': value.last_name,
        'created_at': value.created_at,
        'paid_until': value.paid_until,
    };
}

