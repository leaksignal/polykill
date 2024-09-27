import React, { Children, ComponentProps, HTMLAttributes } from 'react';

import {
	RiskItem,
	RiskItemAnalysisSummaryBlockListAnalysis,
	RiskItemAnalysisSummaryJavascriptRiskAnalysis,
	RiskItemAnalysisSummaryScriptBodyAnalysis
} from 'polykill-leakscanner-api-client';
import ReactMarkdown from 'react-markdown';

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
	return (
		<div>
			<blockquote
				style={{
					margin: '1em .5em',
					paddingLeft: '.5em',
					borderLeft: '3px solid grey'
				}}
			>
				<ReactMarkdown children={analysis.status!} />
			</blockquote>
			<p>
				<i>
					ChatGPT can make mistakes, including both false positives
					and false negatives. Always independently verify the
					contents of included scripts.
				</i>
			</p>
		</div>
	);
}

export default function RiskItemDisplay({
	url,
	analysisSummary,
	scriptAnalysis
}: RiskItem & {
	scriptAnalysis?: boolean;
}) {
	if (!analysisSummary) return <p>No analysis available</p>;

	return (
		<div
			style={{
				border: '1px solid black',
				margin: '.5em 0',
				padding: '.5em'
			}}
		>
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
					{scriptAnalysis && analysisSummary.scriptBodyAnalysis && (
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
