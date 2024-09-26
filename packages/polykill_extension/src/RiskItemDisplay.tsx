import React, { Children, ComponentProps, HTMLAttributes } from 'react';

import {
	RiskItem,
	RiskItemAnalysisSummaryBlockListAnalysis,
	RiskItemAnalysisSummaryJavascriptRiskAnalysis,
	RiskItemAnalysisSummaryScriptBodyAnalysis
} from 'polykill-leakscanner-api-client';

function JavascriptRiskAnalysis({
	analysis
}: {
	analysis: RiskItemAnalysisSummaryJavascriptRiskAnalysis;
}) {
	const props = {
		href: analysis.status
			? 'https://developers.google.com/safe-browsing'
			: 'https://openai.com/chatgpt',
		style: { color: analysis.status === 'CLEAR' ? 'green' : 'red' },
		target: '_blank'
	};
	return <a {...props}>{analysis.status}</a>;
}

function BlockListAnalysis({
	analysis
}: {
	analysis: RiskItemAnalysisSummaryBlockListAnalysis;
}) {
	const props = {
		href: 'https://easylist.to/',
		style: { color: analysis.status === 'CLEAR' ? 'green' : 'red' },
		target: '_blank'
	};
	return <a {...props}>{analysis.status}</a>;
}

function ScriptBodyAnalysis({
	analysis
}: {
	analysis: RiskItemAnalysisSummaryScriptBodyAnalysis;
}) {
	const props = {
		href:
			analysis.status === 'PENDING'
				? 'https://openai.com/chatgpt/'
				: 'https://developers.google.com/safe-browsing',
		style: { color: analysis.status === 'CLEAR' ? 'green' : 'red' },
		target: '_blank'
	};
	return <a {...props}>{analysis.status}</a>;
}

export default function RiskItemDisplay({ url, analysisSummary }: RiskItem) {
	if (!analysisSummary) return <p>No analysis available</p>;

	return (
		<div>
			<a href={url} target="_blank">
				{url}
			</a>
			{analysisSummary ? (
				<>
					<p>
						<b>Javascript Risk Analysis:</b>{' '}
						<JavascriptRiskAnalysis
							analysis={analysisSummary.javascriptRiskAnalysis}
						/>
					</p>
					<p>
						<b>Block List Analysis:</b>{' '}
						<BlockListAnalysis
							analysis={analysisSummary.blockListAnalysis}
						/>
					</p>
					{analysisSummary.scriptBodyAnalysis && (
						<>
							<p>
								<b>
									Script Body Analysis (Powered by ChatGPT):
								</b>{' '}
								<ScriptBodyAnalysis
									analysis={
										analysisSummary.scriptBodyAnalysis
									}
								/>
							</p>
						</>
					)}
				</>
			) : (
				<p>
					<i>No analysis available</i>
				</p>
			)}
		</div>
	);
}
