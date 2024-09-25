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
import type { RiskItemAnalysisSummary } from './RiskItemAnalysisSummary';
import {
    RiskItemAnalysisSummaryFromJSON,
    RiskItemAnalysisSummaryFromJSONTyped,
    RiskItemAnalysisSummaryToJSON,
} from './RiskItemAnalysisSummary';

/**
 * 
 * @export
 * @interface RiskItem
 */
export interface RiskItem {
    /**
     * 
     * @type {string}
     * @memberof RiskItem
     */
    url?: string;
    /**
     * 
     * @type {RiskItemAnalysisSummary}
     * @memberof RiskItem
     */
    analysisSummary?: RiskItemAnalysisSummary;
}

/**
 * Check if a given object implements the RiskItem interface.
 */
export function instanceOfRiskItem(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function RiskItemFromJSON(json: any): RiskItem {
    return RiskItemFromJSONTyped(json, false);
}

export function RiskItemFromJSONTyped(json: any, ignoreDiscriminator: boolean): RiskItem {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'url': !exists(json, 'url') ? undefined : json['url'],
        'analysisSummary': !exists(json, 'analysisSummary') ? undefined : RiskItemAnalysisSummaryFromJSON(json['analysisSummary']),
    };
}

export function RiskItemToJSON(value?: RiskItem | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'url': value.url,
        'analysisSummary': RiskItemAnalysisSummaryToJSON(value.analysisSummary),
    };
}

