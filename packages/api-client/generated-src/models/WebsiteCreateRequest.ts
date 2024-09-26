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
 * @interface WebsiteCreateRequest
 */
export interface WebsiteCreateRequest {
    /**
     * A fully formed URL (with http/s, etc)
     * @type {string}
     * @memberof WebsiteCreateRequest
     */
    url?: string;
}

/**
 * Check if a given object implements the WebsiteCreateRequest interface.
 */
export function instanceOfWebsiteCreateRequest(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function WebsiteCreateRequestFromJSON(json: any): WebsiteCreateRequest {
    return WebsiteCreateRequestFromJSONTyped(json, false);
}

export function WebsiteCreateRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): WebsiteCreateRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'url': !exists(json, 'url') ? undefined : json['url'],
    };
}

export function WebsiteCreateRequestToJSON(value?: WebsiteCreateRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'url': value.url,
    };
}
