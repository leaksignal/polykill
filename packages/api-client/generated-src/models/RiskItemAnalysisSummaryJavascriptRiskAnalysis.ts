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
 * @interface RiskItemAnalysisSummaryJavascriptRiskAnalysis
 */
export interface RiskItemAnalysisSummaryJavascriptRiskAnalysis {
    /**
     * 
     * @type {string}
     * @memberof RiskItemAnalysisSummaryJavascriptRiskAnalysis
     */
    timestamp?: string;
    /**
     * 
     * @type {string}
     * @memberof RiskItemAnalysisSummaryJavascriptRiskAnalysis
     */
    status?: RiskItemAnalysisSummaryJavascriptRiskAnalysisStatusEnum;
}


/**
 * @export
 */
export const RiskItemAnalysisSummaryJavascriptRiskAnalysisStatusEnum = {
    Clear: 'CLEAR',
    ThreatTypeUnspecified: 'THREAT_TYPE_UNSPECIFIED',
    Malware: 'MALWARE',
    SocialEngineering: 'SOCIAL_ENGINEERING',
    UnwantedSoftware: 'UNWANTED_SOFTWARE',
    PotentiallyHarmfulApplication: 'POTENTIALLY_HARMFUL_APPLICATION',
    Danger: 'DANGER'
} as const;
export type RiskItemAnalysisSummaryJavascriptRiskAnalysisStatusEnum = typeof RiskItemAnalysisSummaryJavascriptRiskAnalysisStatusEnum[keyof typeof RiskItemAnalysisSummaryJavascriptRiskAnalysisStatusEnum];


/**
 * Check if a given object implements the RiskItemAnalysisSummaryJavascriptRiskAnalysis interface.
 */
export function instanceOfRiskItemAnalysisSummaryJavascriptRiskAnalysis(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function RiskItemAnalysisSummaryJavascriptRiskAnalysisFromJSON(json: any): RiskItemAnalysisSummaryJavascriptRiskAnalysis {
    return RiskItemAnalysisSummaryJavascriptRiskAnalysisFromJSONTyped(json, false);
}

export function RiskItemAnalysisSummaryJavascriptRiskAnalysisFromJSONTyped(json: any, ignoreDiscriminator: boolean): RiskItemAnalysisSummaryJavascriptRiskAnalysis {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'timestamp': !exists(json, 'timestamp') ? undefined : json['timestamp'],
        'status': !exists(json, 'status') ? undefined : json['status'],
    };
}

export function RiskItemAnalysisSummaryJavascriptRiskAnalysisToJSON(value?: RiskItemAnalysisSummaryJavascriptRiskAnalysis | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'timestamp': value.timestamp,
        'status': value.status,
    };
}

