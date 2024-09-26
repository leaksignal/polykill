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
import type { RiskItem } from './RiskItem';
import {
    RiskItemFromJSON,
    RiskItemFromJSONTyped,
    RiskItemToJSON,
} from './RiskItem';

/**
 * 
 * @export
 * @interface RiskAssessment200Response
 */
export interface RiskAssessment200Response {
    /**
     * 
     * @type {string}
     * @memberof RiskAssessment200Response
     */
    url?: string;
    /**
     * 
     * @type {Array<RiskItem>}
     * @memberof RiskAssessment200Response
     */
    scripts?: Array<RiskItem>;
    /**
     * 
     * @type {Array<RiskItem>}
     * @memberof RiskAssessment200Response
     */
    xhrs?: Array<RiskItem>;
    /**
     * 
     * @type {Array<RiskItem>}
     * @memberof RiskAssessment200Response
     */
    beacons?: Array<RiskItem>;
}

/**
 * Check if a given object implements the RiskAssessment200Response interface.
 */
export function instanceOfRiskAssessment200Response(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function RiskAssessment200ResponseFromJSON(json: any): RiskAssessment200Response {
    return RiskAssessment200ResponseFromJSONTyped(json, false);
}

export function RiskAssessment200ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): RiskAssessment200Response {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'url': !exists(json, 'url') ? undefined : json['url'],
        'scripts': !exists(json, 'scripts') ? undefined : ((json['scripts'] as Array<any>).map(RiskItemFromJSON)),
        'xhrs': !exists(json, 'xhrs') ? undefined : ((json['xhrs'] as Array<any>).map(RiskItemFromJSON)),
        'beacons': !exists(json, 'beacons') ? undefined : ((json['beacons'] as Array<any>).map(RiskItemFromJSON)),
    };
}

export function RiskAssessment200ResponseToJSON(value?: RiskAssessment200Response | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'url': value.url,
        'scripts': value.scripts === undefined ? undefined : ((value.scripts as Array<any>).map(RiskItemToJSON)),
        'xhrs': value.xhrs === undefined ? undefined : ((value.xhrs as Array<any>).map(RiskItemToJSON)),
        'beacons': value.beacons === undefined ? undefined : ((value.beacons as Array<any>).map(RiskItemToJSON)),
    };
}
