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
import type { RiskAssessmentRequestScriptsInner } from './RiskAssessmentRequestScriptsInner';
import {
    RiskAssessmentRequestScriptsInnerFromJSON,
    RiskAssessmentRequestScriptsInnerFromJSONTyped,
    RiskAssessmentRequestScriptsInnerToJSON,
} from './RiskAssessmentRequestScriptsInner';

/**
 * 
 * @export
 * @interface RiskAssessmentRequest
 */
export interface RiskAssessmentRequest {
    /**
     * 
     * @type {string}
     * @memberof RiskAssessmentRequest
     */
    url?: string;
    /**
     * 
     * @type {Array<RiskAssessmentRequestScriptsInner>}
     * @memberof RiskAssessmentRequest
     */
    scripts?: Array<RiskAssessmentRequestScriptsInner>;
    /**
     * 
     * @type {Array<RiskAssessmentRequestScriptsInner>}
     * @memberof RiskAssessmentRequest
     */
    xhrs?: Array<RiskAssessmentRequestScriptsInner>;
    /**
     * 
     * @type {Array<RiskAssessmentRequestScriptsInner>}
     * @memberof RiskAssessmentRequest
     */
    beacons?: Array<RiskAssessmentRequestScriptsInner>;
}

/**
 * Check if a given object implements the RiskAssessmentRequest interface.
 */
export function instanceOfRiskAssessmentRequest(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function RiskAssessmentRequestFromJSON(json: any): RiskAssessmentRequest {
    return RiskAssessmentRequestFromJSONTyped(json, false);
}

export function RiskAssessmentRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): RiskAssessmentRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'url': !exists(json, 'url') ? undefined : json['url'],
        'scripts': !exists(json, 'scripts') ? undefined : ((json['scripts'] as Array<any>).map(RiskAssessmentRequestScriptsInnerFromJSON)),
        'xhrs': !exists(json, 'xhrs') ? undefined : ((json['xhrs'] as Array<any>).map(RiskAssessmentRequestScriptsInnerFromJSON)),
        'beacons': !exists(json, 'beacons') ? undefined : ((json['beacons'] as Array<any>).map(RiskAssessmentRequestScriptsInnerFromJSON)),
    };
}

export function RiskAssessmentRequestToJSON(value?: RiskAssessmentRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'url': value.url,
        'scripts': value.scripts === undefined ? undefined : ((value.scripts as Array<any>).map(RiskAssessmentRequestScriptsInnerToJSON)),
        'xhrs': value.xhrs === undefined ? undefined : ((value.xhrs as Array<any>).map(RiskAssessmentRequestScriptsInnerToJSON)),
        'beacons': value.beacons === undefined ? undefined : ((value.beacons as Array<any>).map(RiskAssessmentRequestScriptsInnerToJSON)),
    };
}
